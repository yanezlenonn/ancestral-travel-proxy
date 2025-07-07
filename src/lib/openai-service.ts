// src/lib/openai-service.ts
// Integração segura com OpenAI + controle de custos

interface OpenAIResponse {
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

interface StreamResponse {
  success: boolean;
  stream?: ReadableStream;
  error?: string;
}

export class OpenAIService {
  private static readonly API_URL = 'https://api.openai.com/v1/chat/completions';
  private static readonly MODEL = 'gpt-4o-mini'; // Otimizado para custo
  private static readonly MAX_TOKENS = 2000;
  private static readonly TIMEOUT = 30000; // 30 segundos
  
  // Preços por 1K tokens (GPT-4o-mini)
  private static readonly PRICING = {
    prompt: 0.000150,    // $0.15 per 1K tokens
    completion: 0.000600 // $0.60 per 1K tokens
  };

  /**
   * Valida se a API key está configurada
   */
  private static getApiKey(): string {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }
    return apiKey;
  }

  /**
   * Calcula custo estimado baseado no uso de tokens
   */
  private static calculateCost(promptTokens: number, completionTokens: number): number {
    const promptCost = (promptTokens / 1000) * this.PRICING.prompt;
    const completionCost = (completionTokens / 1000) * this.PRICING.completion;
    return promptCost + completionCost;
  }

  /**
   * Valida o prompt antes de enviar
   */
  static validatePrompt(prompt: string): { valid: boolean; error?: string } {
    if (!prompt || prompt.trim().length === 0) {
      return { valid: false, error: 'Prompt não pode estar vazio' };
    }
    
    if (prompt.length > 10000) {
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
   * Gera resposta simples (não streaming)
   */
  static async generateResponse(
    prompt: string,
    systemPrompt: string = 'Você é um assistente especializado em planejamento de viagens.',
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<OpenAIResponse> {
    const startTime = Date.now();
    
    try {
      // Validar prompt
      const validation = this.validatePrompt(prompt);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Otimizar prompt
      const optimizedPrompt = this.optimizePrompt(prompt);
      const apiKey = this.getApiKey();

      const requestBody = {
        model: this.MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: optimizedPrompt
          }
        ],
        max_tokens: options.maxTokens || this.MAX_TOKENS,
        temperature: options.temperature || 0.7,
        stream: false,
      };

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.TIMEOUT)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(this.handleAPIError(response.status, errorData));
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      // Calcular uso e custo
      const usage = data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
        estimatedCost: this.calculateCost(data.usage.prompt_tokens, data.usage.completion_tokens)
      } : undefined;

      return {
        success: true,
        content: data.choices[0]?.message?.content || '',
        usage,
        responseTime
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: this.handleError(error),
        responseTime
      };
    }
  }

  /**
   * Gera resposta com streaming para melhor UX
   */
  static async generateStreamResponse(
    prompt: string,
    systemPrompt: string = 'Você é um assistente especializado em planejamento de viagens.',
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<StreamResponse> {
    try {
      // Validar prompt
      const validation = this.validatePrompt(prompt);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      const optimizedPrompt = this.optimizePrompt(prompt);
      const apiKey = this.getApiKey();

      const requestBody = {
        model: this.MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: optimizedPrompt
          }
        ],
        max_tokens: options.maxTokens || this.MAX_TOKENS,
        temperature: options.temperature || 0.7,
        stream: true,
      };

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.TIMEOUT)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(this.handleAPIError(response.status, errorData));
      }

      // Criar stream personalizado para o cliente
      const readableStream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.error(new Error('No response body'));
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  
                  if (data === '[DONE]') {
                    controller.close();
                    return;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices[0]?.delta?.content || '';
                    
                    if (content) {
                      const chunk = {
                        type: 'content',
                        content: content
                      };
                      
                      controller.enqueue(
                        new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`)
                      );
                    }
                  } catch (parseError) {
                    // Ignorar erros de parse de chunks individuais
                  }
                }
              }
            }
          } catch (error) {
            const errorData = {
              type: 'error',
              error: 'Erro durante streaming'
            };
            
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify(errorData)}\n\n`)
            );
          } finally {
            controller.close();
          }
        }
      });

      return {
        success: true,
        stream: readableStream
      };
      
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      };
    }
  }

  /**
   * Trata erros de API da OpenAI
   */
  private static handleAPIError(status: number, errorData: any): string {
    const errorCode = errorData?.error?.code;
    const errorMessage = errorData?.error?.message;

    switch (status) {
      case 401:
        return 'API key inválida. Verifique a configuração.';
      case 403:
        return 'Acesso negado. Verifique as permissões da API key.';
      case 429:
        if (errorCode === 'insufficient_quota') {
          return 'Limite de uso da IA atingido. Tente novamente mais tarde.';
        }
        return 'Muitas solicitações. Aguarde alguns segundos e tente novamente.';
      case 500:
        return 'Erro interno da OpenAI. Tente novamente em alguns minutos.';
      case 503:
        return 'Serviço temporariamente indisponível. Tente novamente.';
      default:
        return errorMessage || `Erro da API OpenAI (${status})`;
    }
  }

  /**
   * Trata erros gerais
   */
  private static handleError(error: any): string {
    if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
      return 'Timeout na resposta da IA. Tente novamente.';
    }
    
    if (error?.message?.includes('fetch')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    if (error?.message?.includes('API key')) {
      return 'Erro de configuração da API. Entre em contato com o suporte.';
    }
    
    return error?.message || 'Erro temporário na IA. Tente novamente em alguns minutos.';
  }

  /**
   * Verifica se a API está funcionando
   */
  static async healthCheck(): Promise<{ healthy: boolean; error?: string }> {
    try {
      const response = await this.generateResponse(
        'Teste de conectividade',
        'Responda apenas "OK"',
        { maxTokens: 10, temperature: 0 }
      );
      
      return {
        healthy: response.success && response.content?.toLowerCase().includes('ok'),
        error: response.error
      };
    } catch (error) {
      return {
        healthy: false,
        error: this.handleError(error)
      };
    }
  }
}
