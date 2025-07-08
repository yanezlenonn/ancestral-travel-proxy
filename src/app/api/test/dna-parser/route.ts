// src/app/api/test/dna-parser/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DNAParser } from '@/lib/dna-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { test } = body;

    if (test === 'mock-data') {
      // Criar um mock file para teste
      const mockContent = `
        RELATÓRIO DE ANCESTRALIDADE GENERA
        
        Composição Ancestral:
        Ibérica: 45.2%
        Italiana: 25.1%
        Alemã: 15.5%
        Africana: 8.9%
        Indígena Americana: 5.3%
        
        Grupos Étnicos:
        Português, Italiano, Alemão
      `;
      
      const mockFile = new File([mockContent], 'genera_test.pdf', { 
        type: 'application/pdf' 
      });

      const result = await DNAParser.parseDNAPDF(mockFile);

      return NextResponse.json({
        success: result.success,
        data: result.data,
        warnings: result.warnings,
        message: result.success 
          ? `Parser funcionando: ${result.data?.ancestry.length || 0} regiões extraídas`
          : result.error
      });
    }

    if (test === 'validation') {
      // Testar validações
      const tests = [];
      
      // Teste 1: Arquivo muito grande
      const bigFile = new File(['x'.repeat(15 * 1024 * 1024)], 'big.pdf', { 
        type: 'application/pdf' 
      });
      const bigResult = await DNAParser.parseDNAPDF(bigFile);
      tests.push({
        name: 'Arquivo grande (>10MB)',
        passed: !bigResult.success && bigResult.error?.includes('muito grande')
      });

      // Teste 2: Formato inválido
      const txtFile = new File(['texto'], 'test.txt', { 
        type: 'text/plain' 
      });
      const txtResult = await DNAParser.parseDNAPDF(txtFile);
      tests.push({
        name: 'Formato inválido',
        passed: !txtResult.success && txtResult.error?.includes('PDF')
      });

      return NextResponse.json({
        success: true,
        data: { tests },
        message: `Validações testadas: ${tests.filter(t => t.passed).length}/${tests.length} passaram`
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Tipo de teste não reconhecido'
    });

  } catch (error) {
    console.error('Erro no teste DNA Parser:', error);
    return NextResponse.json({
      success: false,
      error: `Erro ao testar DNA Parser: ${error}`
    });
  }
}
