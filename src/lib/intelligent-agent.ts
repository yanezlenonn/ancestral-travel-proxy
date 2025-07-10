// src/lib/intelligent-agent.ts - AGENTE INTELIGENTE COMPLETO
import { ContextManager, ConversationContext } from './context-manager';
import { DNAParser, DNAData } from './dna-parser';
import { OpenAIService } from './openai-service';

export interface AgentRequest {
  message: string;
  sessionId: string;
  userId: string;
  useStreaming?: boolean;
  dnaFile?: File;
}

export interface AgentResponse {
  success: boolean;
  content?: string;
  stream?: ReadableStream;
  error?: string;
  context?: {
    agentMode: 'DNA_SPECIALIST' | 'TRADITIONAL_PLANNER';
    messageCount: number;
    remainingMessages?: number;
    dnaProcessed?: boolean;
    intent?: string;
    followUpQuestions?: string[];
  };
  usage?: {
    tokensUsed: number;
    estimatedCost: number;
    responseTime: number;
  };
}

export class IntelligentAgent {
  private static readonly DNA_UPLOAD_LIMIT = 3; // uploads por dia
  private static readonly MESSAGE_LIMIT_FREE = 5; // mensagens por dia

  /**
   * Processa requisição do usuário com agente inteligente
   */
  static async processRequest(request: AgentRequest): Promise<AgentResponse> {
    try {
      // 1. Verificar se usuário pode enviar mensagens
      const limitCheck = await ContextManager.canSendMessage(request.userId);
      if (!limitCheck.allowed) {
        return {
          success: false,
          error: limitCheck.reason || 'Limite de mensagens atingido',
          context: {
            agentMode: 'TRADITIONAL_PLANNER',
            messageCount: limitCheck.usage?.messagesCount || 0,
            remainingMessages: limitCheck.usage?.remainingMessages || 0
          }
        };
      }

      // 2. Processar upload de DNA se presente
      let dnaProcessed = false;
      if (request.dnaFile) {
        const dnaResult = await this.processDNAUpload(request.dnaFile, request.userId, request.sessionId);
        if (!dnaResult.success) {
          return {
            success: false,
            error: `Erro ao processar DNA: ${dnaResult.error}`
          };
        }
        dnaProcessed = true;
      }

      // 3. Obter contexto da conversa
      let context = await ContextManager.getConversationContext(request.sessionId);
      if (!context) {
        context = await this.createNewContext(request.userId, request.sessionId);
      }

      // 4. Detectar intenções do usuário
      const intent = ContextManager.detectUserIntent(request.message);

      // 5. Extrair e atualizar preferências automaticamente
      const newPreferences = ContextManager.extractUserPreferences(request.message);
      if (Object.keys(newPreferences).length > 0) {
        await ContextManager.updateUserPreferences(request.userId, newPreferences);
        context.userPreferences = { ...context.userPreferences, ...newPreferences };
      }

      // 6. Salvar mensagem do usuário
      await ContextManager.saveMessage(request.sessionId, 'user', request.message);

      // 7. Gerar prompt contextualizado
      const systemPrompt = this.getSystemPrompt(context.agentMode);
      const contextualPrompt = ContextManager.buildContextualPrompt(context, request.message);

      // 8. Gerar resposta da IA
      const startTime = Date.now();
      
      if (request.useStreaming) {
        const aiResponse = await OpenAIService.generateStreamResponse(contextualPrompt, systemPrompt);
        
        if (!aiResponse.success || !aiResponse.stream) {
          return {
            success: false,
            error: aiResponse.error || 'Erro ao gerar resposta streaming'
          };
        }

        const followUpQuestions = ContextManager.generateFollowUpQuestions(context, '');

        return {
          success: true,
          stream: aiResponse.stream,
          context: {
            agentMode: context.agentMode,
            messageCount: context.usage.messagesCount + 1,
            remainingMessages: Math.max(0, context.usage.remainingMessages - 1),
            dnaProcessed,
            intent: intent.intent,
            followUpQuestions
          }
        };
      } else {
        const aiResponse = await OpenAIService.generateResponse(contextualPrompt, systemPrompt);
        
        if (!aiResponse.success) {
          return {
            success: false,
            error: aiResponse.error
          };
        }

        const responseTime = Date.now() - startTime;

        // Salvar resposta do assistente
        await ContextManager.saveMessage(
          request.sessionId,
          'assistant',
          aiResponse.content || '',
          {
            tokens_used: aiResponse.usage?.totalTokens,
            response_time: responseTime
          }
        );

        const followUpQuestions = ContextManager.generateFollowUpQuestions(context, aiResponse.content || '');

        return {
          success: true,
          content: aiResponse.content,
          context: {
            agentMode: context.agentMode,
            messageCount: context.usage.messagesCount + 1,
            remainingMessages: Math.max(0, context.usage.remainingMessages - 1),
            dnaProcessed,
            intent: intent.intent,
            followUpQuestions
          },
          usage: aiResponse.usage ? {
            tokensUsed: aiResponse.usage.totalTokens,
            estimatedCost: aiResponse.usage.estimatedCost,
            responseTime
          } : undefined
        };
      }

    } catch (error) {
      console.error('Erro no agente inteligente:', error);
      return {
        success: false,
        error: 'Erro interno do sistema. Tente novamente.'
      };
    }
  }

  /**
   * MÉTODO FALTANTE: Cria novo contexto para sessão
   */
  private static async createNewContext(userId: string, sessionId: string): Promise<ConversationContext> {
    return {
      sessionId,
      userId,
      agentMode: 'TRADITIONAL_PLANNER', // Padrão inicial
      messages: [],
      userPreferences: {},
      usage: {
        messagesCount: 0,
        isFreeTier: true,
        dailyLimit: this.MESSAGE_LIMIT_FREE,
        remainingMessages: this.MESSAGE_LIMIT_FREE,
        monthlyTokens: 0
      }
    };
  }

  /**
   * Processa upload de DNA
   */
  private static async processDNAUpload(file: File, userId: string, sessionId: string): Promise<{
    success: boolean;
    data?: DNAData;
    error?: string;
  }> {
    try {
      // Validar arquivo
      if (file.size > 10 * 1024 * 1024) { // 10MB
        return { success: false, error: 'Arquivo muito grande. Máximo 10MB.' };
      }

      if (file.type !== 'application/pdf') {
        return { success: false, error: 'Apenas arquivos PDF são aceitos.' };
      }

      // Processar DNA
      const parseResult = await DNAParser.parseDNAPDF(file);
      
      if (!parseResult.success || !parseResult.data) {
        return { 
          success: false, 
          error: parseResult.error || 'Erro ao processar arquivo de DNA' 
        };
      }

      return {
        success: true,
        data: parseResult.data
      };

    } catch (error) {
      return {
        success: false,
        error: 'Erro interno ao processar DNA'
      };
    }
  }

  /**
   * Gera prompt de sistema baseado no modo do agente
   */
  private static getSystemPrompt(agentMode: 'DNA_SPECIALIST' | 'TRADITIONAL_PLANNER'): string {
    if (agentMode === 'DNA_SPECIALIST') {
      return `Você é um especialista em turismo ancestral da Ancestral Travel. Sua especialidade é criar roteiros de viagem baseados na ancestralidade genética dos usuários.

SUAS RESPONSABILIDADES:
- Criar roteiros que conectem o usuário com suas origens ancestrais
- Sugerir experiências autênticas relacionadas à herança cultural
- Incluir locais históricos, museus, festivais e tradições locais
- Explicar as conexões entre destinos e ancestralidade
- Fornecer informações sobre gastronomia tradicional

ESTILO DE RESPOSTA:
- Natural, amigável e entusiasmado sobre as origens do usuário
- Específico com datas, custos e logística
- Educativo sobre história e cultura
- Personalizado baseado nos dados de DNA fornecidos

FORMATO DOS ROTEIROS:
*DIA X – [Cidade/Região]*
Manhã: [Atividade ancestral] (R$ valor)
Tarde: [Experiência cultural] (R$ valor)  
Noite: [Tradição local] (R$ valor)
💡 **Conexão ancestral:** [Explicação da ligação com a herança genética]

IMPORTANTE: Sempre relacione as sugestões com a ancestralidade específica do usuário.`;
    }

    return `Você é um planejador de viagens especialista da Ancestral Travel. Crie roteiros personalizados e detalhados para qualquer destino do mundo.

SUAS RESPONSABILIDADES:
- Criar roteiros completos com cronograma detalhado
- Incluir custos estimados, hospedagem e transporte
- Sugerir atividades baseadas nos interesses do usuário
- Fornecer dicas práticas sobre documentação, clima e cultura local
- Otimizar tempo e orçamento

ESTILO DE RESPOSTA:
- Profissional, mas amigável e acessível
- Específico com datas, horários e reservas necessárias
- Prático e orientado a resultados
- Personalizado baseado nas preferências do usuário

FORMATO DOS ROTEIROS:
*DIA X – [Cidade]*
Manhã: [Atividade] (R$ valor)
Tarde: [Atividade] (R$ valor)  
Noite: [Atividade] (R$ valor)
💡 **Dica local:** [Experiência autêntica ou economia]

IMPORTANTE: Sempre pergunte sobre orçamento, datas e preferências para personalizar melhor.`;
  }

  /**
   * Health check do agente
   */
  static async healthCheck(): Promise<{ healthy: boolean; services: any }> {
    try {
      const openaiHealth = await OpenAIService.healthCheck();
      
      return {
        healthy: openaiHealth.healthy,
        services: {
          openai: openaiHealth,
          contextManager: { healthy: true },
          dnaParser: { healthy: true }
        }
      };
    } catch (error) {
      return {
        healthy: false,
        services: {
          openai: { healthy: false, error: 'Não testado' },
          contextManager: { healthy: false },
          dnaParser: { healthy: false }
        }
      };
    }
  }

  /**
   * Valida se uma sessão existe e é válida
   */
  static async validateSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const context = await ContextManager.getConversationContext(sessionId);
      return context !== null && context.userId === userId;
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      return false;
    }
  }

  /**
   * Gera ID de sessão único
   */
  static generateSessionId(): string {
    return ContextManager.generateSessionId();
  }

  /**
   * MÉTODO FALTANTE: Detecta intenção do usuário (delegado para ContextManager)
   */
  static detectUserIntent(message: string): {
    intent: string;
    entities: any;
    confidence: number;
  } {
    return ContextManager.detectUserIntent(message);
  }

  /**
   * Extrai entidades da mensagem (países, datas, orçamento, etc.)
   */
  static extractEntities(message: string): {
    countries?: string[];
    budget?: string;
    dates?: string[];
    travelers?: number;
    interests?: string[];
  } {
    const entities: any = {};
    const lowerMessage = message.toLowerCase();
    
    // Países
    const countries = ['portugal', 'espanha', 'itália', 'alemanha', 'frança', 'brasil', 'argentina'];
    const foundCountries = countries.filter(country => lowerMessage.includes(country));
    if (foundCountries.length > 0) {
      entities.countries = foundCountries;
    }
    
    // Orçamento
    const budgetMatch = lowerMessage.match(/(\d+(?:\.\d+)?)\s*(mil|reais|r\$)/);
    if (budgetMatch) {
      entities.budget = `${budgetMatch[1]} ${budgetMatch[2]}`;
    }
    
    // Número de pessoas
    const travelersMatch = lowerMessage.match(/(\d+)\s*(pessoas?|viajantes?)/);
    if (travelersMatch) {
      entities.travelers = parseInt(travelersMatch[1]);
    }
    
    // Interesses
    const interests = [];
    if (lowerMessage.includes('praia')) interests.push('praias');
    if (lowerMessage.includes('montanha')) interests.push('montanhas');
    if (lowerMessage.includes('cultura')) interests.push('cultura');
    if (lowerMessage.includes('gastronomia')) interests.push('gastronomia');
    if (lowerMessage.includes('história')) interests.push('história');
    
    if (interests.length > 0) {
      entities.interests = interests;
    }
    
    return entities;
  }

  /**
   * Otimiza prompt para reduzir tokens
   */
  static optimizePrompt(prompt: string): string {
    return prompt
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  /**
   * Calcula prioridade da mensagem baseada na intenção
   */
  static calculateMessagePriority(intent: string): 'high' | 'medium' | 'low' {
    const highPriorityIntents = ['planning', 'budget_question'];
    const mediumPriorityIntents = ['destination_info', 'modify_itinerary'];
    
    if (highPriorityIntents.includes(intent)) return 'high';
    if (mediumPriorityIntents.includes(intent)) return 'medium';
    return 'low';
  }
}
