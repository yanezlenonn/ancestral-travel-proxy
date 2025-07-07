// ADICIONAR estas linhas no AgentResponse interface (linha ~15):

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
    intent?: string;                    // ← ADICIONAR
    followUpQuestions?: string[];       // ← ADICIONAR
  };
  usage?: {
    tokensUsed: number;
    estimatedCost: number;
    responseTime: number;
  };
}

// ADICIONAR estes métodos no final da classe IntelligentAgent (após generateFollowUpQuestions):

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

// SUBSTITUIR o método processRequest por esta versão melhorada:

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
            messageCount: limitCheck.usage.messagesCount,
            remainingMessages: limitCheck.usage.remainingMessages
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
