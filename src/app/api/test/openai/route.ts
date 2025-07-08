// src/app/api/test/openai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/openai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { test } = body;

    if (test === 'health-check') {
      const result = await OpenAIService.healthCheck();
      
      return NextResponse.json({
        success: result.healthy,
        data: result,
        message: result.healthy ? 'OpenAI conectado e funcionando' : 'Erro na conexão OpenAI'
      });
    }

    if (test === 'simple-request') {
      const result = await OpenAIService.generateResponse(
        'Responda apenas "Teste OK" se estiver funcionando',
        'Você é um assistente de teste. Responda exatamente o que é pedido.',
        { maxTokens: 10, temperature: 0 }
      );

      return NextResponse.json({
        success: result.success,
        data: {
          content: result.content,
          usage: result.usage,
          responseTime: result.responseTime
        },
        message: result.success ? 'Resposta gerada com sucesso' : result.error
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Tipo de teste não reconhecido'
    });

  } catch (error) {
    console.error('Erro no teste OpenAI:', error);
    return NextResponse.json({
      success: false,
      error: `Erro ao testar OpenAI: ${error}`
    });
  }
}
