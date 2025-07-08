// src/app/api/test/context-manager/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ContextManager } from '@/lib/context-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { test } = body;

    if (test === 'rate-limit') {
      // Testar verificação de rate limit (sem usuário real)
      const mockUserId = 'test_user_' + Date.now();
      
      // Como não temos usuário real, vamos simular o retorno
      const mockResult = {
        allowed: true,
        usage: {
          messagesCount: 2,
          isFreeTier: true,
          dailyLimit: 5,
          remainingMessages: 3,
          monthlyTokens: 0
        }
      };

      return NextResponse.json({
        success: true,
        data: mockResult,
        message: `Rate limiting simulado: ${mockResult.usage.remainingMessages} mensagens restantes`
      });
    }

    if (test === 'intent-detection') {
      // Testar detecção de intenções
      const testMessages = [
        'Quero planejar uma viagem para Portugal com 5 mil reais',
        'Quanto custa uma viagem para a Itália?',
        'Me fale sobre turismo em Lisboa',
        'Quero alterar meu roteiro',
        'Olá, como vai?'
      ];

      const results = testMessages.map(message => {
        const intent = ContextManager.detectUserIntent(message);
        return {
          message,
          intent: intent.intent,
          entities: intent.entities,
          confidence: intent.confidence
        };
      });

      return NextResponse.json({
        success: true,
        data: { results },
        message: `Testou ${results.length} detecções de intenção`
      });
    }

    if (test === 'preferences-extraction') {
      // Testar extração de preferências
      const testMessages = [
        'Meu orçamento é de 8 mil reais',
        'Prefiro viagens mais relaxantes',
        'Gosto de cultura e gastronomia',
        'Já visitei França e Espanha'
      ];

      const results = testMessages.map(message => {
        const prefs = ContextManager.extractUserPreferences(message);
        return {
          message,
          extractedPreferences: prefs
        };
      });

      return NextResponse.json({
        success: true,
        data: { results },
        message: `Testou extração de preferências em ${results.length} mensagens`
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Tipo de teste não reconhecido'
    });

  } catch (error) {
    console.error('Erro no teste Context Manager:', error);
    return NextResponse.json({
      success: false,
      error: `Erro ao testar Context Manager: ${error}`
    });
  }
}
