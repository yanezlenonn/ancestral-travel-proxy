// app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { IntelligentAgent, AgentRequest } from '@/lib/intelligent-agent';
import { ContextManager } from '@/lib/context-manager';

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // 2. Processar request body
    const body = await request.json();
    const { message, sessionId, useStreaming = false } = body;

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Mensagem e sessionId são obrigatórios' },
        { status: 400 }
      );
    }

    // 3. Validar mensagem
    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Mensagem muito longa. Máximo 5000 caracteres.' },
        { status: 400 }
      );
    }

    // 4. Verificar rate limiting
    const limitCheck = await ContextManager.canSendMessage(user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: limitCheck.reason,
          usage: limitCheck.usage
        },
        { status: 429 }
      );
    }

    // 5. Preparar request para o agente
    const agentRequest: AgentRequest = {
      message,
      sessionId,
      userId: user.id,
      useStreaming
    };

    // 6. Processar com agente inteligente
    const agentResponse = await IntelligentAgent.processRequest(agentRequest);

    if (!agentResponse.success) {
      return NextResponse.json(
        { error: agentResponse.error },
        { status: 500 }
      );
    }

    // 7. Retornar resposta
    if (useStreaming && agentResponse.stream) {
      // Para streaming, retornar o stream diretamente
      return new Response(agentResponse.stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } else {
      // Para resposta simples
      return NextResponse.json({
        success: true,
        content: agentResponse.content,
        context: agentResponse.context,
        usage: agentResponse.usage
      });
    }

  } catch (error) {
    console.error('Erro na API chat:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Buscar histórico de conversas
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar mensagens da sessão
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(Math.min(limit, 100)); // Máximo 100 mensagens

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar histórico' },
        { status: 500 }
      );
    }

    // Buscar contexto adicional
    const context = await ContextManager.getConversationContext(sessionId);

    return NextResponse.json({
      success: true,
      messages: messages || [],
      context: context ? {
        agentMode: context.agentMode,
        usage: context.usage,
        dnaData: context.dnaData ? {
          testProvider: context.dnaData.testProvider,
          confidence: context.dnaData.confidence,
          ancestryCount: context.dnaData.ancestry.length
        } : null
      } : null
    });

  } catch (error) {
    console.error('Erro na API GET chat:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Deletar sessão de conversa
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId é obrigatório' },
        { status: 400 }
      );
    }

    // Deletar todas as mensagens da sessão
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', user.id)
      .eq('session_id', sessionId);

    if (messagesError) {
      console.error('Erro ao deletar mensagens:', messagesError);
      return NextResponse.json(
        { error: 'Erro ao deletar conversa' },
        { status: 500 }
      );
    }

    // Deletar uploads de DNA da sessão (opcional)
    await supabase
      .from('dna_uploads')
      .delete()
      .eq('user_id', user.id)
      .eq('session_id', sessionId);

    return NextResponse.json({
      success: true,
      message: 'Conversa deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro na API DELETE chat:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
