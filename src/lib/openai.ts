import OpenAI from 'openai';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
  responseTime?: number;
}

export interface AIStreamResponse {
  stream: ReadableStream;
  usage?: AIResponse['usage'];
}

export class OpenAIService {
  private static client: OpenAI;
  private static readonly MODEL = 'gpt-4o-mini'; // Otimizado para custo
  private static readonly MAX_TOKENS = 2000;
  private static readonly TIMEOUT = 30000; // 30 segundos
  
  // Preços por 1K tokens (valores aproximados)
  private static readonly PRICING = {
    'gpt-4o-mini': {
      prompt: 0.000150,
      completion: 0.000600
    }
  };

  /**
   * Inicializa o cliente OpenAI
   */
  private static getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key não configurada');
      }
      
      this.client = new OpenAI({
        apiKey,
        timeout: this.TIMEOUT,
      });
    }
    
    return this.client;
  }

  /**
   * Calcula custo estimado baseado no uso de tokens
   */
  private static calculateCost(usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  }): number {
    const pricing = this.PRICING[this.MODEL];
    
    const promptCost = (usage.prompt_tokens / 1000) * pricing.prompt;
    const completionCost = (usage.completion_tokens / 1000) * pricing.completion;
    
    return promptCost + completionCost;
  }

  /**
   * Registra uso de tokens no banco para monitoramento
   */
  private static async logTokenUsage(
    userId: string,
    sessionId: string,
    usage: AIResponse['usage']
  ): Promise<void> {
    if (!usage) return;
    
    const supabase = createServerComponentClient({ cookies });
    
    try {
      await supabase
        .from('token_usage')
        .insert({
          user_id: userId,
          session_id: sessionId,
          model: this.MODEL,
          prompt_tokens: usage.promptTokens,
          completion_tokens: usage.completionTokens,
          total_tokens: usage.totalTokens,
          estimated_cost: usage.estimatedCost,
        });
    } catch (error) {
      console.error('Erro ao registrar uso de tokens:', error);
    }
  }

  /**
   * Verifica se o orçamento mensal foi atingido
   */
  private static async checkMonthlyBudget(userId: string): Promise<boolean> {
    const supabase = createServerComponentClient({ cookies });
    
    try {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const { data } = await supabase
        .from('token_usage')
        .select('estimated_cost')
        .eq('user_id', userId)
        .gte('created_at', currentMonth.toISOString());
      
      const monthlySpent = data?.reduce((sum, row) => sum + (row.estimated_cost || 0), 0) || 0;
      const MONTHLY_LIMIT = 100; // $100 por mês
      
      return monthlySpent < MONTHLY_LIMIT;
    } catch (error) {
      console.error('Erro ao verificar orçamento:', error);
      return true; // Em caso de erro, permite o uso
    }
  }

  /**
   * Gera resposta simples (não streaming)
   */
  static async generateResponse(
    prompt: string,
    userId: string,
    sessionId: string,
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      // Verificar orçamento
      const withinBudget = await this.checkMonthlyBudget(userId);
      if (!withinBudget) {
        return {
          success: false,
          error: 'Orçamento mensal atingido. Entre em contato com o suporte.'
        };
      }
      
      const client = this.getClient();
      
      const response = await client.chat.completions.create({
        model: this.MODEL,
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em planejamento de viagens.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || this.MAX_TOKENS,
        temperature: options.temperature || 0.7,
        stream: false,
      });

      const usage = response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
        estimatedCost: this.calculateCost(response.usage)
      } : undefined;

      const responseTime = Date.now() - startTime;
      
      // Registrar uso
      if (usage) {
        await this.logTokenUsage(userId, sessionId, usage);
      }
      
      return {
        success: true,
        content: response.choices[0]?.message?.content || '',
        usage,
        responseTime
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      console.error('Erro na API OpenAI:', error);
      
      return {
        success: false,
        error: this.handleOpenAIError(error),
        responseTime
      };
    }
  }

  /**
   * Gera resposta com streaming para melhor UX
   */
  static async generateStreamResponse(
    prompt: string,
    userId: string,
    sessionId: string,
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<AIStreamResponse> {
    try {
      // Verificar orçamento
      const withinBudget = await this.checkMonthlyBudget(userId);
      if (!withinBudget) {
        throw new Error('Orçamento mensal atingido');
      }
      
      const client = this.getClient();
      
      const stream = await client.chat.completions.create({
        model: this.MODEL,
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em planejamento de viagens. Responda de forma natural, amigável e detalhada.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || this.MAX_TOKENS,
        temperature: options.temperature || 0.7,
        stream: true,
      });

      // Criar stream personalizado para o navegador
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            let totalTokens = 0;
            let completionTokens = 0;
            let fullContent = '';
            
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              
              if (content) {
                fullContent += content;
                completionTokens += 1; // Estimativa aproximada
                
                // Enviar chunk para o cliente
                const data = {
                  type: 'content',
                  content: content
                };
                
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
                );
              }
              
              // Verificar se terminou
              if (chunk.choices[0]?.finish_reason) {
                // Estimar tokens do prompt (aproximadamente)
                const promptTokens = Math.ceil(prompt.length / 4);
                totalTokens = promptTokens + completionTokens;
                
                const usage = {
                  promptTokens,
                  completionTokens,
                  totalTokens,
                  estimatedCost: this.calculateCost({
                    prompt_tokens: promptTokens,
                    completion_tokens: completionTokens,
                    total_tokens: totalTokens
                  })
                };
                
                // Registrar uso
                await this.logTokenUsage(userId, sessionId, usage);
                
                // Enviar dados finais
                const finalData = {
                  type: 'done',
                  usage
                };
                
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify(finalData)}\n\n`)
                );
                
                controller.close();
                break;
              }
            }
          } catch (error) {
            const errorData = {
              type: 'error',
              error: this.handleOpenAIError(error)
            };
            
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify(errorData)}\n\n`)
            );
            
            controller.close();
          }
        }
      });

      return { stream: readableStream };
      
    } catch (error) {
      // Criar stream de erro
      const errorStream = new ReadableStream({
        start(controller) {
          const errorData = {
            type: 'error',
            error: this.handleOpenAIError(error)
          };
          
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(errorData)}\n\n`)
          );
          
          controller.close();
        }
      });
      
      return { stream: errorStream };
    }
  }

  /**
   * Trata erros da OpenAI de forma amigável
   */
  private static handleOpenAIError(error: any): string {
    if (error?.code === 'insufficient_quota') {
      return 'Limite de uso da IA atingido. Tente novamente mais tarde.';
    }
    
    if (error?.code === 'rate_limit_exceeded') {
      return 'Muitas solicitações. Aguarde alguns segundos e tente novamente.';
    }
    
    if (error?.code === 'invalid_api_key') {
      return 'Erro de configuração. Entre em contato com o suporte.';
    }
    
    if (error?.code === 'model_not_found') {
      return 'Modelo de IA não disponível. Tente novamente mais tarde.';
    }
    
    if (error?.message?.includes('timeout')) {
      return 'Timeout na resposta da IA. Tente novamente.';
    }
    
    if (error?.message?.includes('network')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    return 'Erro temporário na IA. Tente novamente em alguns minutos.';
  }

  /**
   * Valida se o prompt está dentro dos limites
   */
  static validatePrompt(prompt: string): { valid: boolean; error?: string } {
    const MAX_PROMPT_LENGTH = 10000; // Aproximadamente 2500 tokens
    
    if (!prompt || prompt.trim().length === 0) {
      return { valid: false, error: 'Prompt não pode estar vazio' };
    }
    
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return { 
        valid: false, 
        error: 'Prompt muito longo. Reduza o tamanho da sua mensagem.' 
      };
    }
    
    return { valid: true };
  }

  /**
   * Otimiza o prompt para reduzir tokens
   */
  static optimizePrompt(prompt: string): string {
    return prompt
      .replace(/\s+/g, ' ') // Remove espaços extras
      .replace(/\n\s*\n/g, '\n') // Remove linhas vazias extras
      .trim();
  }

  /**
   * Estatísticas de uso para admin/monitoring
   */
  static async getUsageStats(userId?: string): Promise<{
    totalTokens: number;
    totalCost: number;
    requestsCount: number;
    avgTokensPerRequest: number;
  }> {
    const supabase = createServerComponentClient({ cookies });
    
    try {
      let query = supabase
        .from('token_usage')
        .select('total_tokens, estimated_cost');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data } = await query;
      
      if (!data || data.length === 0) {
        return {
          totalTokens: 0,
          totalCost: 0,
          requestsCount: 0,
          avgTokensPerRequest: 0
        };
      }
      
      const totalTokens = data.reduce((sum, row) => sum + (row.total_tokens || 0), 0);
      const totalCost = data.reduce((sum, row) => sum + (row.estimated_cost || 0), 0);
      const requestsCount = data.length;
      const avgTokensPerRequest = requestsCount > 0 ? totalTokens / requestsCount : 0;
      
      return {
        totalTokens,
        totalCost,
        requestsCount,
        avgTokensPerRequest: Math.round(avgTokensPerRequest)
      };
      
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        totalTokens: 0,
        totalCost: 0,
        requestsCount: 0,
        avgTokensPerRequest: 0
      };
    }
  }
}
