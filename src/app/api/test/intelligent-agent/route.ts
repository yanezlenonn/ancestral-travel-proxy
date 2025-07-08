// src/app/api/test/intelligent-agent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { IntelligentAgent } from '@/lib/intelligent-agent';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { test, message } = body;

    if (test === 'process-request') {
      // Verificar autenticação para teste real
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Retornar mock se não estiver autenticado
        return NextResponse.json({
          success: true,
          data: {
            mockResult: true,
            message: 'Teste simulado - usuário não autenticado',
            agentMode: 'TRADITIONAL_PLANNER',
            intentDetected: 'planning'
          },
          message: 'Agente simulado funcionando (necessita autenticação para teste real)'
        });
      }

      // Teste real com usuário autenticado
      const agentRequest = {
        message: message || 'Teste do agente inteligente',
        sessionId: 'test_session_' + Date.now(),
        userId: session.user.id,
        useStreaming: false
      };

      const result = await IntelligentAgent.processRequest(agentRequest);

      return NextResponse.json({
        success: result.success,
        data: {
          content: result.content?.slice(0, 200) + '...', // Truncar para teste
          context: result.context,
          usage: result.usage
        },
        message: result.success 
          ? 'Agente processou requisição com sucesso'
          : result.error
      });
    }

    if (test === 'health-check') {
      const health = await IntelligentAgent.healthCheck();
      
      return NextResponse.json({
        success: health.healthy,
        data: health,
        message: health.healthy 
          ? 'Todos os serviços do agente estão funcionando'
          : 'Alguns serviços do agente têm problemas'
      });
    }

    if (test === 'session-validation') {
      const testSessionId = 'test_session_' + Date.now();
      const testUserId = 'test_user_123';
      
      // Como é teste, vamos simular
      const isValid = await IntelligentAgent.validateSession(testSessionId, testUserId);
      
      return NextResponse.json({
        success: true,
        data: { isValid, sessionId: testSessionId },
        message: `Validação de sessão: ${isValid ? 'válida' : 'inválida'}`
      });
    }

    return NextResponse.json({
      success: false,
      error: `Erro ao testar Intelligent Agent: ${error}`
    });
  }
}: false,
      error: 'Tipo de teste não reconhecido'
    });

  } catch (error) {
    console.error('Erro no teste Intelligent Agent:', error);
    return NextResponse.json({
      success
