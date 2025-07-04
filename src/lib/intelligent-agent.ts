import { OpenAIService, AIResponse, AIStreamResponse } from './openai';
import { ContextManager, ConversationContext } from './context-manager';
import { DNAData, DNAParser } from './pdf-parser';

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
  };
  usage?: {
    tokensUsed: number;
    estimatedCost: number;
    responseTime: number;
  };
}

export class IntelligentAgent {
  private static readonly DNA_SPECIALIST_SYSTEM_PROMPT = `Você é um especialista mundial em turismo ancestral e genealogia. Sua missão é criar experiências de viagem únicas que conectem pessoas às suas raízes genéticas e culturais.

ESPECIALIDADES:
• Roteiros baseados em ancestralidade e DNA
• História familiar e genealogia aplicada ao turismo
• Cultura, tradições e costumes ancestrais
• Patrimônios históricos e sítios arqueológicos
• Gastronomia tradicional e receitas familiares
• Festivais e celebrações culturais autênticas

DIRETRIZES PARA ROTEIROS ANCESTRAIS:
1. SEMPRE conecte cada sugestão à ancestralidade específica do usuário
2. Priorize países com maior percentual genético
3. Inclua locais de significado histórico para os grupos étnicos
4. Sugira experiências culturais imersivas (culinária, música, dança)
5. Recomende museus, arquivos e centros genealógicos
6. Mencione festivais e eventos tradicionais por época do ano
7. Forneça contexto histórico sobre as migrações ancestrais

FORMATO DE RESPOSTA:
• Itinerário detalhado por dias
• Custos estimados em USD e BRL
• Melhor época para visitar
• Hospedagens temáticas quando possível
• Experiências culturais autênticas
• Dicas sobre documentação e preparação
• Conexões genealógicas dos locais sugeridos

Seja caloroso, culturalmente sensível e educativo. Trate cada ancestralidade com respeito e profundidade histórica.`;

  private static readonly TRADITIONAL_PLANNER_SYSTEM_PROMPT = `Você é um planejador de viagens profissional especializado em criar roteiros personalizados excepcionais. Você trabalha como se fosse uma agência de viagens premium.

ESPECIALIDADES:
• Roteiros completamente personalizados
• Análise de orçamento e otimização de custos
• Logística de viagens complexas
• Experiências únicas e autênticas
• Hospedagens e transporte estratégicos
• Atividades baseadas em interesses específicos

DIRETRIZES PARA ROTEIROS:
1. SEMPRE pergunte sobre orçamento, datas e preferências específicas
2. Crie cronogramas realistas com tempo adequado entre atividades
3. Inclua mix equilibrado: cultura, natureza, gastronomia, entretenimento
4. Forneça alternativas para diferentes budgets
5. Considere logística (distâncias, transporte, reservas necessárias)
6. Sugira experiências locais autênticas, não só pontos turísticos
7. Adapte-se às idades, interesses e limitações físicas do grupo

FORMATO DE RESPOSTA:
• Itinerário dia a dia com horários sugeridos
• Orçamento detalhado (hospedagem, transporte, atividades, alimentação)
• Dicas de reservas antecipadas necessárias
• Alternativas para diferentes climas/estações
• Informações práticas (documentos, vacinas, moeda, cultura local)
• Sugestões de compras e souvenirs únicos

Seja prático, detalhista e sempre focado na melhor experiência possível dentro do orçamento disponível.`;

  /**
   * Processa requisição completa do usuário
   */
  static async processRequest(request: AgentRequest): Promise<AgentResponse> {
    try {
      // 1. Verificar se usuário pode enviar mensagens
      const limitCheck = await ContextManager.canSendMessage(request.userId);
      if (!limitCheck.allowed) {
        return {
          success: false,
          error: limitCheck.reason || 'Limite de mensagens atingido'
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

      // 3. Obter ou criar contexto da conversa
      let context = await ContextManager.getConversationContext(request.sessionId);
      if (!context) {
        // Criar novo contexto se não existir
        context = await this.createNewContext(request.userId, request.sessionId);
      }

      // 4. Salvar mensagem do usuário
      await ContextManager.saveMessage(request.sessionId, 'user', request.message);

      // 5. Gerar prompt contextualizado
      const prompt = ContextManager.buildContextualPrompt(context);
      const fullPrompt = `${this.getSystemPrompt(context.agentMode)}\n\n${prompt}\n\nUSUÁRIO: ${request.message}`;

      // 6. Gerar resposta da IA
      const startTime = Date.now();
      let aiResponse: AIResponse | AIStreamResponse;

      if (request.useStreaming) {
        aiResponse = await OpenAIService.generateStreamResponse(
          fullPrompt,
          request.userId,
          request.sessionId
        );
      } else {
        aiResponse = await OpenAIService.generateResponse(
          fullPrompt,
          request.userId,
          request.sessionId
        );
      }

      const responseTime = Date.now() - startTime;

      // 7. Processar resposta
      if (request.useStreaming) {
        const streamResponse = aiResponse as AIStreamResponse;
        return {
          success: true,
          stream: streamResponse.stream,
          context: {
            agentMode: context.agentMode,
            messageCount: context.usage.messagesCount + 1,
            remainingMessages: context.usage.isFreeTier 
              ? Math.max(0, context.usage.dailyLimit - context.usage.messagesCount - 1)
              : undefined,
            dnaProcessed
          },
          usage: streamResponse.usage ? {
            tokensUsed: streamResponse.usage.totalTokens,
            estimatedCost: streamResponse.usage.estimatedCost,
            responseTime
          } : undefined
        };
      } else {
        const simpleResponse = aiResponse as AIResponse;
        
        if (!simpleResponse.success) {
          return {
            success: false,
            error: simpleResponse.error
          };
        }

        // 8. Salvar resposta do assistente
        await ContextManager.saveMessage(
          request.sessionId, 
          'assistant', 
          simpleResponse.content || '',
          {
            tokens_used: simpleResponse.usage?.totalTokens,
            response_time: responseTime
          }
        );

        return {
          success: true,
          content: simpleResponse.content,
          context: {
            agentMode: context.agentMode,
            messageCount: context.usage.messagesCount + 1,
            remainingMessages: context.usage.isFreeTier 
              ? Math.max(0, context.usage.dailyLimit - context.usage.messagesCount - 1)
              : undefined,
            dnaProcessed
          },
          usage: simpleResponse.usage ? {
            tokensUsed: simpleResponse.usage.totalTokens,
            estimatedCost: simpleResponse.usage.estimatedCost,
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
   * Processa upload de arquivo de DNA
   */
  private static async processDNAUpload(
    file: File, 
    userId: string, 
    sessionId: string
  ): Promise<{ success: boolean; error?: string; data?: DNAData }> {
    try {
      // 1. Parse do PDF
      const parseResult = await DNAParser.parseDNAPDF(file);
      
      if (!parseResult.success || !parseResult.data) {
        return {
          success: false,
          error: parseResult.error || 'Erro ao processar arquivo de DNA'
        };
      }

      // 2. Salvar no Supabase
      const saved = await this.saveDNAData(parseResult.data, userId, sessionId);
      if (!saved) {
        return {
          success: false,
          error: 'Erro ao salvar dados de DNA'
        };
      }

      return {
        success: true,
        data: parseResult.data
      };

    } catch (error) {
      console.error('Erro ao processar DNA:', error);
      return {
        success: false,
        error: 'Erro interno ao processar DNA'
      };
    }
  }

  /**
   * Salva dados de DNA no banco
   */
  private static async saveDNAData(
    dnaData: DNAData, 
    userId: string, 
    sessionId: string
  ): Promise<boolean> {
    try {
      const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs');
      const { cookies } = await import('next/headers');
      const supabase = createServerComponentClient({ cookies });

      const { error } = await supabase
        .from('dna_uploads')
        .insert({
          user_id: userId,
          session_id: sessionId,
          parsed_data: dnaData,
          test_provider: dnaData.testProvider,
          confidence_score: dnaData.confidence
        });

      return !error;
    } catch (error) {
      console.error('Erro ao salvar DNA:', error);
      return false;
    }
  }

  /**
   * Cria novo contexto de conversa
   */
  private static async createNewContext(
    userId: string, 
    sessionId: string
  ): Promise<ConversationContext> {
    return {
      sessionId,
      userId,
      agentMode: 'TRADITIONAL_PLANNER', // Padrão, muda se tiver DNA
      messages: [],
      userPreferences: {},
      usage: {
        messagesCount: 0,
        isFreeTier: true,
        dailyLimit: 5,
        monthlyTokens: 0
      }
    };
  }

  /**
   * Retorna prompt do sistema baseado no modo do agente
   */
  private static getSystemPrompt(mode: 'DNA_SPECIALIST' | 'TRADITIONAL_PLANNER'): string {
    return mode === 'DNA_SPECIALIST' 
      ? this.DNA_SPECIALIST_SYSTEM_PROMPT 
      : this.TRADITIONAL_PLANNER_SYSTEM_PROMPT;
  }

  /**
   * Detecta intenções do usuário para melhorar respostas
   */
  static detectUserIntent(message: string): {
    intent: 'planning' | 'budget_question' | 'destination_info' | 'itinerary_change' | 'general_chat';
    entities: {
      destinations?: string[];
      budget?: string;
      dates?: string;
      travelers?: number;
      interests?: string[];
    };
  } {
    const lowerMessage = message.toLowerCase();
    
    // Detectar destinos
    const destinations: string[] = [];
    const destinationPatterns = [
      /(?:para|em|no|na|nos|nas)\s+([A-Za-zÀ-ÿ\s]+)/g,
      /(?:visitar|conhecer|ir\s+para)\s+([A-Za-zÀ-ÿ\s]+)/g
    ];
    
    destinationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(lowerMessage)) !== null) {
        destinations.push(match[1].trim());
      }
    });

    // Detectar orçamento
    let budget: string | undefined;
    const budgetPatterns = [
      /orçamento.*?(\d+(?:\.\d+)?)\s*(?:mil|k|reais?|r\$)/i,
      /(?:até|máximo).*?(\d+(?:\.\d+)?)\s*(?:mil|k|reais?|r\$)/i,
      /(\d+(?:\.\d+)?)\s*(?:mil|k)\s*(?:reais?|r\$)/i
    ];
    
    for (const pattern of budgetPatterns) {
      const match = pattern.exec(message);
      if (match) {
        budget = match[1];
        break;
      }
    }

    // Detectar número de viajantes
    let travelers: number | undefined;
    const travelerPatterns = [
      /(?:somos|vamos)\s+(\d+)/i,
      /(\d+)\s+pessoas?/i,
      /grupo\s+de\s+(\d+)/i
    ];
    
    for (const pattern of travelerPatterns) {
      const match = pattern.exec(message);
      if (match) {
        travelers = parseInt(match[1]);
        break;
      }
    }

    // Detectar intenção
    let intent: ReturnType<typeof IntelligentAgent.detectUserIntent>['intent'] = 'general_chat';
    
    if (lowerMessage.includes('orçamento') || lowerMessage.includes('quanto custa') || lowerMessage.includes('preço')) {
      intent = 'budget_question';
    } else if (lowerMessage.includes('roteiro') || lowerMessage.includes('viagem') || lowerMessage.includes('planejar')) {
      intent = 'planning';
    } else if (lowerMessage.includes('alterar') || lowerMessage.includes('mudar') || lowerMessage.includes('trocar')) {
      intent = 'itinerary_change';
    } else if (destinations.length > 0) {
      intent = 'destination_info';
    }

    return {
      intent,
      entities: {
        destinations: destinations.length > 0 ? destinations : undefined,
        budget,
        travelers,
      }
    };
  }

  /**
   * Sugere perguntas de acompanhamento baseadas no contexto
   */
  static generateFollowUpQuestions(
    context: ConversationContext,
    lastResponse: string
  ): string[] {
    const questions: string[] = [];
    
    if (context.agentMode === 'DNA_SPECIALIST') {
      questions.push(
        'Gostaria de explorar outros países da sua ancestralidade?',
        'Quer saber sobre festivais tradicionais nessas regiões?',
        'Interessado em experiências gastronômicas ancestrais?'
      );
    } else {
      questions.push(
        'Precisa de ajuda com orçamento e hospedagem?',
        'Quer sugestões de atividades específicas?',
        'Gostaria de um roteiro alternativo?'
      );
    }
    
    // Perguntas baseadas no que ainda não foi perguntado
    if (!context.userPreferences.budget) {
      questions.push('Qual seu orçamento aproximado para a viagem?');
    }
    
    if (!context.userPreferences.travelStyle) {
      questions.push('Prefere viagens mais aventureiras ou relaxantes?');
    }

    return questions.slice(0, 3); // Máximo 3 perguntas
  }
}
