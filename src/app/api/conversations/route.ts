import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/conversations - Lista conversas do usuário
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar conversas do usuário
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        has_dna_data,
        messages (
          id,
          content,
          role,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar conversas:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar conversas' },
        { status: 500 }
      );
    }

    // Processar conversas para incluir informações agregadas
    const processedConversations = conversations?.map(conversation => {
      const messages = conversation.messages || [];
      const lastMessage = messages.length > 0 
        ? new Date(messages[messages.length - 1].created_at)
        : new Date(conversation.created_at);
      
      const preview = messages.length > 0
        ? messages[0].content.substring(0, 100)
        : 'Nova conversa';

      return {
        id: conversation.id,
        title: conversation.title,
        preview,
        lastMessage,
        messageCount: messages.length,
        hasDnaData: conversation.has_dna_data,
        userId,
        createdAt: new Date(conversation.created_at)
      };
    }) || [];

    return NextResponse.json({
      conversations: processedConversations
    });

  } catch (error) {
    console.error('Erro na API de conversas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Criar nova conversa
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { userId, title, hasDnaData } = await request.json();

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'userId e title são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Criar nova conversa
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: title.substring(0, 100), // Limitar título
        has_dna_data: hasDnaData || false
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar conversa:', error);
      return NextResponse.json(
        { error: 'Erro ao criar conversa' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        preview: 'Nova conversa',
        lastMessage: new Date(conversation.created_at),
        messageCount: 0,
        hasDnaData: conversation.has_dna_data,
        userId,
        createdAt: new Date(conversation.created_at)
      }
    });

  } catch (error) {
    console.error('Erro na API de conversas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
