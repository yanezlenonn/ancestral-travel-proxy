// lib/tests/agent-tests.ts

import { DNAParser, DNAData } from '../pdf-parser';
import { OpenAIService } from '../openai';
import { ContextManager } from '../context-manager';
import { IntelligentAgent } from '../intelligent-agent';

/**
 * Suite de testes para validar o agente inteligente
 */
export class AgentTests {
  
  /**
   * Testa o parser de DNA com dados mockados
   */
  static async testDNAParser(): Promise<{ success: boolean; results: any[] }> {
    const results: any[] = [];
    
    try {
      // Mock de dados de DNA para teste
      const mockDNAData: DNAData = {
        ancestry: [
          { region: 'Ibérica', percentage: 45.2, countries: ['Portugal', 'Espanha'] },
          { region: 'Italiana', percentage: 25.1, countries: ['Itália'] },
          { region: 'Alemã', percentage: 15.5, countries: ['Alemanha'] },
          { region: 'Africana', percentage: 8.9, countries: ['África do Sul', 'Nigéria'] },
          { region: 'Indígena', percentage: 5.3, countries: ['Brasil'] }
        ],
        ethnicGroups: ['Português', 'Italiano', 'Alemão'],
        testProvider: 'genera',
        confidence: 0.92
      };

      // Teste 1: Gerar resumo para IA
      const summary = DNAParser.generateSummaryForAI(mockDNAData);
      results.push({
        test: 'DNA Summary Generation',
        success: summary.includes('Ibérica: 45.2%') && summary.includes('Portugal, Espanha'),
        data: { summaryLength: summary.length, preview: summary.slice(0, 100) }
      });

      // Teste 2: Validar mapeamento de regiões
      const ibericaEntry = mockDNAData.ancestry.find(a => a.region === 'Ibérica');
      results.push({
        test: 'Region Mapping',
        success: ibericaEntry?.countries.includes('Portugal') && ibericaEntry?.countries.includes('Espanha'),
        data: { countries: ibericaEntry?.countries }
      });

      // Teste 3: Validar confiança
      results.push({
        test: 'Confidence Score',
        success: mockDNAData.confidence >= 0.8,
        data: { confidence: mockDNAData.confidence }
      });

      return { success: true, results };

    } catch (error) {
      results.push({
        test: 'DNA Parser Error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { success: false, results };
    }
  }

  /**
   * Testa a geração de prompts contextualizados
   */
  static async testPromptGeneration(): Promise<{ success: boolean; results: any[] }> {
    const results: any[] = [];

    try {
      // Mock de contexto com DNA
      const mockContextDNA = {
        sessionId: 'test-session-dna',
        userId: 'test-user',
        agentMode: 'DNA_SPECIALIST' as const,
        dnaData: {
          ancestry: [
            { region: 'Portuguesa', percentage: 60, countries: ['Portugal'] },
            { region: 'Italiana', percentage: 40, countries: ['Itália'] }
          ],
          ethnicGroups: ['Português', 'Italiano'],
          testProvider: 'genera' as const,
          confidence: 0.9
        },
        messages: [
          {
            id: '1',
            user_id: 'test-user',
            role: 'user' as const,
            content: 'Quero conhecer meus países ancestrais',
            timestamp: new Date(),
            session_id: 'test-session-dna',
            agent_mode: 'DNA_SPECIALIST' as const
          }
        ],
        userPreferences: {
          budget: '5000 reais',
          travelStyle: 'cultural'
        },
        usage: {
          messagesCount: 1,
          isFreeTier: true,
          dailyLimit: 5,
          monthlyTokens: 0
        }
      };

      // Teste 1: Prompt DNA mode
      const dnaPrompt = ContextManager.buildContextualPrompt(mockContextDNA);
      results.push({
        test: 'DNA Specialist Prompt',
        success: dnaPrompt.includes('Portuguesa: 60%') && dnaPrompt.includes('Portugal'),
        data: { promptLength: dnaPrompt.length, containsAncestry: dnaPrompt.includes('ancestralidade') }
      });

      // Mock de contexto tradicional
      const mockContextTraditional = {
        ...mockContextDNA,
        agentMode: 'TRADITIONAL_PLANNER' as const,
        dnaData: undefined
      };

      // Teste 2: Prompt Traditional mode
      const traditionalPrompt = ContextManager.buildContextualPrompt(mockContextTraditional);
      results.push({
        test: 'Traditional Planner Prompt',
        success: !traditionalPrompt.includes('ancestralidade') && traditionalPrompt.includes('5000 reais'),
        data: { promptLength: traditionalPrompt.length, containsBudget: traditionalPrompt.includes('5000') }
      });

      return { success: true, results };

    } catch (error) {
      results.push({
        test: 'Prompt Generation Error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { success: false, results };
    }
  }

  /**
   * Testa a detecção de intenções do usuário
   */
  static async testIntentDetection(): Promise<{ success: boolean; results: any[] }> {
    const results: any[] = [];

    try {
      // Teste 1: Intenção de planejamento
      const planningIntent = IntelligentAgent.detectUserIntent(
        'Quero planejar uma viagem para Portugal com orçamento de 5 mil reais para 2 pessoas'
      );
      
      results.push({
        test: 'Planning Intent Detection',
        success: planningIntent.intent === 'planning' && 
                planningIntent.entities.budget === '5' &&
                planningIntent.entities.travelers === 2,
        data: planningIntent
      });

      // Teste 2: Pergunta sobre orçamento
      const budgetIntent = IntelligentAgent.detectUserIntent(
        'Quanto custa uma viagem para a Itália?'
      );

      results.push({
        test: 'Budget Intent Detection',
        success: budgetIntent.intent === 'budget_question',
        data: budgetIntent
      });

      // Teste 3: Informação sobre destino
      const destinationIntent = IntelligentAgent.detectUserIntent(
        'Me fale sobre turismo em Lisboa'
      );

      results.push({
        test: 'Destination Intent Detection',
        success: destinationIntent.intent === 'destination_info',
        data: destinationIntent
      });

      return { success: true, results };

    } catch (error) {
      results.push({
        test: 'Intent Detection Error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { success: false, results };
    }
  }

  /**
   * Testa validação de prompt da OpenAI
   */
  static async testOpenAIValidation(): Promise<{ success: boolean; results: any[] }> {
    const results: any[] = [];

    try {
      // Teste 1: Prompt válido
      const validPrompt = 'Crie um roteiro de viagem para Portugal';
      const validResult = OpenAIService.validatePrompt(validPrompt);
      
      results.push({
        test: 'Valid Prompt',
        success: validResult.valid === true,
        data: validResult
      });

      // Teste 2: Prompt vazio
      const emptyPrompt = '';
      const emptyResult = OpenAIService.validatePrompt(emptyPrompt);
      
      results.push({
        test: 'Empty Prompt',
        success: emptyResult.valid === false && emptyResult.error?.includes('vazio'),
        data: emptyResult
      });

      // Teste 3: Prompt muito longo
      const longPrompt = 'A'.repeat(15000);
      const longResult = OpenAIService.validatePrompt(longPrompt);
      
      results.push({
        test: 'Long Prompt',
        success: longResult.valid === false && longResult.error?.includes('longo'),
        data: { valid: longResult.valid, promptLength: longPrompt.length }
      });

      // Teste 4: Otimização de prompt
      const messyPrompt = 'Teste    com   muitos      espaços\n\n\nE linhas\n\n\nvazias';
      const optimized = OpenAIService.optimizePrompt(messyPrompt);
      
      results.push({
        test: 'Prompt Optimization',
        success: optimized.length < messyPrompt.length && !optimized.includes('    '),
        data: { 
          originalLength: messyPrompt.length, 
          optimizedLength: optimized.length,
          optimized: optimized
        }
      });

      return { success: true, results };

    } catch (error) {
      results.push({
        test: 'OpenAI Validation Error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { success: false, results };
    }
  }

  /**
   * Executa todos os testes
   */
  static async runAllTests(): Promise<{
    success: boolean;
    summary: {
      total: number;
      passed: number;
      failed: number;
    };
    details: any[];
  }> {
    console.log('🧪 Iniciando testes do Agente Inteligente...\n');

    const allResults: any[] = [];
    
    // Executar todos os testes
    const dnaTest = await this.testDNAParser();
    const promptTest = await this.testPromptGeneration();
    const intentTest = await this.testIntentDetection();
    const openaiTest = await this.testOpenAIValidation();

    allResults.push(...dnaTest.results);
    allResults.push(...promptTest.results);
    allResults.push(...intentTest.results);
    allResults.push(...openaiTest.results);

    // Calcular estatísticas
    const passed = allResults.filter(r => r.success).length;
    const failed = allResults.filter(r => !r.success).length;
    const total = allResults.length;

    const summary = {
      total,
      passed,
      failed
    };

    // Log dos resultados
    console.log('📊 Resultados dos Testes:');
    console.log(`✅ Passou: ${passed}/${total}`);
    console.log(`❌ Falhou: ${failed}/${total}`);
    console.log(`📈 Taxa de sucesso: ${Math.round((passed/total) * 100)}%\n`);

    // Detalhar falhas
    const failures = allResults.filter(r => !r.success);
    if (failures.length > 0) {
      console.log('❌ Testes que falharam:');
      failures.forEach(f => {
        console.log(`  - ${f.test}: ${f.error || 'Falha na validação'}`);
      });
      console.log('');
    }

    const success = failed === 0;
    
    if (success) {
      console.log('🎉 Todos os testes passaram! O agente está funcionando corretamente.');
    } else {
      console.log('⚠️ Alguns testes falharam. Verifique os problemas acima.');
    }

    return {
      success,
      summary,
      details: allResults
    };
  }
}

// Função para executar testes via console
export async function runAgentTests() {
  return await AgentTests.runAllTests();
}
