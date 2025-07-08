// src/app/api/test/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'API de teste ativa',
    tests: [
      'openai',
      'dna-parser', 
      'context-manager',
      'intelligent-agent'
    ]
  });
}

// src/app/api/test/openai/route.ts
export async function POST() {
  try {
    const { OpenAIService } = await import('@/lib/openai-service');
    
    const result = await OpenAIService.healthCheck();
    
    return NextResponse.json({
      success: result.healthy,
      data: result,
      message: result.healthy ? 'OpenAI conectado' : 'Erro na conexão'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Erro ao testar OpenAI: ${error}`
    });
  }
}
