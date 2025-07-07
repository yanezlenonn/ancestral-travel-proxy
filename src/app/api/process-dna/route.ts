// src/app/api/process-dna/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { DNAParser } from '@/lib/dna-parser';

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

    // 2. Verificar rate limiting
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: dailyUploads } = await supabase
      .from('dna_uploads')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .gte('created_at', today.toISOString());

    const MAX_DAILY_UPLOADS = 3; // Máximo 3 uploads por dia
    
    if ((dailyUploads || 0) >= MAX_DAILY_UPLOADS) {
      return NextResponse.json(
        { error: 'Limite diário de uploads atingido (3/dia)' },
        { status: 429 }
      );
    }

    // 3. Processar FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID obrigatório' },
        { status: 400 }
      );
    }

    // 4. Validar arquivo
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Apenas arquivos PDF são aceitos' },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB' },
        { status: 400 }
      );
    }

    // 5. Processar DNA
    const parseResult = await DNAParser.parseDNAPDF(file);
    
    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json(
        { 
          error: parseResult.error || 'Erro ao processar arquivo de DNA',
          warnings: parseResult.warnings 
        },
        { status: 400 }
      );
    }

    // 6. Salvar no banco
    const { data: dnaUpload, error: saveError } = await supabase
      .from('dna_uploads')
      .insert({
        user_id: session.user.id,
        session_id: sessionId,
        file_name: file.name,
        file_size: file.size,
        parsed_data: parseResult.data,
        test_provider: parseResult.data.testProvider,
        confidence_score: parseResult.data.confidence
      })
      .select()
      .single();

    if (saveError) {
      console.error('Erro ao salvar DNA:', saveError);
      return NextResponse.json(
        { error: 'Erro ao salvar dados processados' },
        { status: 500 }
      );
    }

    // 7. Retornar sucesso com summary para IA
    const summary = DNAParser.generateSummaryForAI(parseResult.data);
    
    return NextResponse.json({
      success: true,
      data: {
        id: dnaUpload.id,
        ancestry: parseResult.data.ancestry,
        ethnicGroups: parseResult.data.ethnicGroups,
        testProvider: parseResult.data.testProvider,
        confidence: parseResult.data.confidence,
        summary // Para uso no prompt da IA
      },
      warnings: parseResult.warnings,
      message: 'DNA processado com sucesso! Agora posso criar roteiros baseados na sua ancestralidade.'
    });

  } catch (error) {
    console.error('Erro na API process-dna:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Buscar uploads de DNA do usuário
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

    let query = supabase
      .from('dna_uploads')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data: uploads, error } = await query;

    if (error) {
      console.error('Erro ao buscar uploads:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar uploads' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      uploads: uploads || []
    });

  } catch (error) {
    console.error('Erro na API GET process-dna:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Deletar upload de DNA
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { uploadId } = await request.json();

    if (!uploadId) {
      return NextResponse.json(
        { error: 'ID do upload obrigatório' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('dna_uploads')
      .delete()
      .eq('id', uploadId)
      .eq('user_id', session.user.id); // Garantir que só pode deletar próprios uploads

    if (error) {
      console.error('Erro ao deletar upload:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar upload' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Upload deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro na API DELETE process-dna:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
