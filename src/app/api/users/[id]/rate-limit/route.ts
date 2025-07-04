import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/conversations/[id] - Buscar conversa específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const conversationId = params.id;

    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar conversa e verificar se pertence ao usuário
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        user_id,
        has_dna_data,
        created_at,
        updated_at
      `)
      .eq('id', conversationId)
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a conversa pertence ao usuário autenticado
    if (conversation.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    // Buscar mensagens da conversa
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Erro ao buscar mensagens:', messagesError);
      return NextResponse.json(
        { error: 'Erro ao buscar mensagens' },
        { status: 500 }
      );
    }

    // Processar mensagens
    const processedMessages = messages?.map(message => ({
      id: message.id,
      content: message.content,
      role: message.role,
      timestamp: new Date(message.created_at),
      conversationId: message.conversation_id
    })) || [];

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        hasDnaData: conversation.has_dna_data,
        createdAt: new Date(conversation.created_at),
        updatedAt: new Date(conversation.updated_at)
      },
      messages: processedMessages
    });

  } catch (error) {
    console.error('Erro na API de conversa individual:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id] - Deletar conversa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const conversationId = params.id;

    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se a conversa pertence ao usuário
    const { data: conversation, error: checkError } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();

    if (checkError || !conversation) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    if (conversation.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    // Deletar mensagens primeiro (devido à foreign key)
    const { error: deleteMessagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (deleteMessagesError) {
      console.error('Erro ao deletar mensagens:', deleteMessagesError);
      return NextResponse.json(
        { error: 'Erro ao deletar mensagens' },
        { status: 500 }
      );
    }

    // Deletar conversa
    const { error: deleteConversationError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (deleteConversationError) {
      console.error('Erro ao deletar conversa:', deleteConversationError);
      return NextResponse.json(
        { error: 'Erro ao deletar conversa' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Conversa deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro na API de deleção de conversa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/conversations/[id] - Atualizar conversa
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const conversationId = params.id;
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'title é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se a conversa pertence ao usuário
    const { data: conversation, error: checkError } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();

    if (checkError || !conversation) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    if (conversation.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    // Atualizar conversa
    const { data: updatedConversation, error: updateError } = await supabase
      .from('conversations')
      .update({ 
        title: title.substring(0, 100),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar conversa:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar conversa' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      conversation: {
        id: updatedConversation.id,
        title: updatedConversation.title,
        updatedAt: new Date(updatedConversation.updated_at)
      }
    });

  } catch (error) {
    console.error('Erro na API de atualização de conversa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
