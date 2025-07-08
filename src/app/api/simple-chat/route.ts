// src/app/api/simple-chat/route.ts
// API simples que chama OpenAI direto, sem abstrações

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // 2. Processar request
    const { message, sessionId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    // 3. Chamar OpenAI direto
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em planejamento de viagens. Crie roteiros personalizados e detalhados.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const data = await openaiResponse.json();
    const aiMessage = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

    // 4. Salvar mensagens no Supabase
    try {
      // Salvar mensagem do usuário
      await supabase.from('chat_messages').insert({
        user_id: session.user.id,
        session_id: sessionId || `session_${Date.now()}`,
        role: 'user',
        content: message,
        agent_mode: 'TRADITIONAL_PLANNER'
      });

      // Salvar resposta da IA
      await supabase.from('chat_messages').insert({
        user_id: session.user.id,
        session_id: sessionId || `session_${Date.now()}`,
        role: 'assistant',
        content: aiMessage,
        agent_mode: 'TRADITIONAL_PLANNER'
      });
    } catch (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
      // Continua mesmo se falhar ao salvar (não bloqueia o chat)
    }

    return NextResponse.json({
      success: true,
      message: aiMessage,
      sessionId: sessionId || `session_${Date.now()}`
    });

  } catch (error) {
    console.error('Erro na API simple-chat:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Buscar histórico de mensagens
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId é obrigatório' },
        { status: 400 }
      );
    }

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      messages: messages || []
    });

  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
