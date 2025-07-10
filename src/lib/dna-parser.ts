// src/lib/dna-parser.ts
// Parser para PDFs de testes de DNA (VERSÃO FUNCIONAL)

export interface DNAData {
  ancestry: {
    region: string;
    percentage: number;
    countries: string[];
  }[];
  ethnicGroups: string[];
  haplogroups?: {
    paternal?: string;
    maternal?: string;
  };
  testProvider: 'genera' | 'myheritage' | '23andme' | 'unknown';
  confidence: number; // 0-1 score de confiança na extração
}

export interface ParseResult {
  success: boolean;
  data?: DNAData;
  error?: string;
  warnings?: string[];
}

export class DNAParser {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly SUPPORTED_FORMATS = ['application/pdf'];

  /**
   * Valida o arquivo antes do processamento
   */
  private static validateFile(file: File): string | null {
    if (!this.SUPPORTED_FORMATS.includes(file.type)) {
      return 'Formato não suportado. Apenas PDFs são aceitos.';
    }
    
    if (file.size > this.MAX_FILE_SIZE) {
      return 'Arquivo muito grande. Máximo 10MB.';
    }
    
    return null;
  }

  /**
   * Simula extração de texto do PDF (para MVP)
   * Em produção, seria substituído por biblioteca real
   */
  private static async simulateTextExtraction(file: File): Promise<string> {
    // Simular baseado no nome do arquivo para demonstração
    const fileName = file.name.toLowerCase();
    
    if (fileName.includes('genera')) {
      return this.getMockGeneraText();
    } else if (fileName.includes('myheritage')) {
      return this.getMockMyHeritageText();
    } else if (fileName.includes('23andme')) {
      return this.getMock23andMeText();
    }
    
    // Texto genérico para demonstração
    return this.getMockGeneraText();
  }

  /**
   * Mock de texto do Genera para demonstração
   */
  private static getMockGeneraText(): string {
    return `
    RELATÓRIO DE ANCESTRALIDADE GENERA
    
    Composição Ancestral:
    Ibérica: 45.2%
    Italiana: 25.1%
    Alemã: 15.5%
    Africana: 8.9%
    Indígena Americana: 5.3%
    
    Grupos Étnicos:
    Português, Italiano, Alemão
    
    Regiões Detalhadas:
    Portugal: 30.1%
    Espanha: 15.1%
    Itália: 25.1%
    Alemanha: 15.5%
    África Subsaariana: 8.9%
    Povos Indígenas das Américas: 5.3%
    `;
  }

  /**
   * Mock de texto do MyHeritage para demonstração
   */
  private static getMockMyHeritageText(): string {
    return `
    MyHeritage DNA Results
    
    Ethnicity Breakdown:
    Iberian Peninsula: 40.5%
    Italian: 28.3%
    Germanic Europe: 18.2%
    Sub-Saharan Africa: 7.8%
    Native American: 5.2%
    
    Detailed Regions:
    Portugal: 25.3%
    Spain: 15.2%
    Southern Italy: 28.3%
    Germany: 18.2%
    West Africa: 7.8%
    Indigenous Americas: 5.2%
    `;
  }

  /**
   * Mock de texto do 23andMe para demonstração
   */
  private static getMock23andMeText(): string {
    return `
    23andMe Ancestry Composition
    
    Recent Ancestry in the Americas:
    Spanish & Portuguese: 42.1%
    Italian: 26.7%
    German & French: 16.4%
    Sub-Saharan African: 8.5%
    Native American: 6.3%
    
    Country Breakdown:
    Portugal: 28.9%
    Spain: 13.2%
    Italy: 26.7%
    Germany: 16.4%
    Nigeria: 8.5%
    Mexico: 6.3%
    `;
  }

  /**
   * Identifica o provedor do teste baseado no conteúdo
   */
  private static identifyProvider(text: string): DNAData['testProvider'] {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('genera') || lowerText.includes('laboratório genera')) {
      return 'genera';
    }
    
    if (lowerText.includes('myheritage') || lowerText.includes('my heritage')) {
      return 'myheritage';
    }
    
    if (lowerText.includes('23andme') || lowerText.includes('23 and me')) {
      return '23andme';
    }
    
    return 'unknown';
  }

  /**
   * Parser genérico que funciona para todos os formatos
   */
  private static parseAncestryData(text: string): Partial<DNAData> {
    const ancestry: DNAData['ancestry'] = [];
    const ethnicGroups: string[] = [];
    
    // Regex para capturar percentuais de ancestralidade
    const ancestryPatterns = [
      /([A-Za-zÀ-ÿ\s&]+)[\s:]+(\d+(?:\.\d+)?)\s*%/g,
      /(\d+(?:\.\d+)?)\s*%\s*([A-Za-zÀ-ÿ\s&]+)/g
    ];
    
    let totalPercentage = 0;
    const foundRegions = new Set<string>();
    
    for (const pattern of ancestryPatterns) {
      let match;
      pattern.lastIndex = 0; // Reset regex
      
      while ((match = pattern.exec(text)) !== null) {
        let region: string;
        let percentage: number;
        
        // Verificar ordem dos grupos (região-percentual vs percentual-região)
        if (isNaN(Number(match[1]))) {
          region = match[1].trim();
          percentage = parseFloat(match[2]);
        } else {
          percentage = parseFloat(match[1]);
          region = match[2].trim();
        }
        
        // Limpar e validar
        region = this.cleanRegionName(region);
        
        if (percentage > 0 && percentage <= 100 && region.length > 2) {
          const regionKey = region.toLowerCase();
          
          if (!foundRegions.has(regionKey)) {
            foundRegions.add(regionKey);
            const countries = this.mapRegionToCountries(region);
            ancestry.push({ region, percentage, countries });
            totalPercentage += percentage;
          }
        }
      }
    }
    
    // Extrair grupos étnicos
    const ethnicPatterns = [
      /(?:grupos?\s*étnicos?|ethnic\s*groups?)[\s:]+([A-Za-zÀ-ÿ\s,]+)/gi,
      /(?:etnia|ethnicity)[\s:]+([A-Za-zÀ-ÿ\s,]+)/gi
    ];
    
    for (const pattern of ethnicPatterns) {
      const match = pattern.exec(text);
      if (match) {
        const groups = match[1].split(',').map(g => g.trim()).filter(g => g.length > 2);
        ethnicGroups.push(...groups);
      }
    }
    
    return {
      ancestry: ancestry.sort((a, b) => b.percentage - a.percentage),
      ethnicGroups: [...new Set(ethnicGroups)] // Remove duplicatas
    };
  }

  /**
   * Limpa nomes de regiões
   */
  private static cleanRegionName(region: string): string {
    return region
      .replace(/^[:\-\s]+|[:\-\s]+$/g, '') // Remove pontuação no início/fim
      .replace(/\s+/g, ' ') // Normaliza espaços
      .replace(/peninsula/i, '') // Remove "Peninsula"
      .replace(/europe/i, '') // Remove "Europe"
      .trim();
  }

  /**
   * Mapeia regiões para países específicos
   */
  private static mapRegionToCountries(region: string): string[] {
    const regionMap: Record<string, string[]> = {
      // Português/Espanhol
      'ibérica': ['Portugal', 'Espanha'],
      'iberian': ['Portugal', 'Espanha'],
      'spanish': ['Espanha'],
      'portuguese': ['Portugal'],
      'portuguesa': ['Portugal'],
      'espanhola': ['Espanha'],
      
      // Italiano
      'italiana': ['Itália'],
      'italian': ['Itália'],
      'italy': ['Itália'],
      
      // Alemão/Germânico
      'alemã': ['Alemanha'],
      'german': ['Alemanha'],
      'germanic': ['Alemanha'],
      'deutschland': ['Alemanha'],
      
      // Francês
      'francesa': ['França'],
      'french': ['França'],
      'france': ['França'],
      
      // Africano
      'africana': ['Nigéria', 'Gana', 'Angola'],
      'african': ['Nigéria', 'Gana', 'Angola'],
      'sub-saharan': ['Nigéria', 'Gana', 'Senegal'],
      'west africa': ['Nigéria', 'Gana', 'Senegal'],
      
      // Indígena
      'indígena': ['Brasil', 'México', 'Peru'],
      'indigenous': ['Brasil', 'México', 'Peru'],
      'native american': ['Brasil', 'México', 'Estados Unidos'],
      'ameríndio': ['Brasil', 'México', 'Peru'],
      
      // Outros
      'irlandesa': ['Irlanda'],
      'irish': ['Irlanda'],
      'inglesa': ['Inglaterra'],
      'english': ['Inglaterra'],
      'escocesa': ['Escócia'],
      'scottish': ['Escócia'],
      'judaica': ['Israel'],
      'jewish': ['Israel'],
      'árabe': ['Líbano', 'Síria'],
      'arab': ['Líbano', 'Síria'],
      'asiática': ['China', 'Japão'],
      'asian': ['China', 'Japão']
    };
    
    const lowerRegion = region.toLowerCase();
    
    // Busca exata primeiro
    for (const [key, countries] of Object.entries(regionMap)) {
      if (lowerRegion.includes(key)) {
        return countries;
      }
    }
    
    // Fallback: usar o nome da região como país
    return [region];
  }

  /**
   * Calcula score de confiança baseado na qualidade dos dados extraídos
   */
  private static calculateConfidence(data: Partial<DNAData>): number {
    let score = 0;
    
    // Tem ancestralidade?
    if (data.ancestry && data.ancestry.length > 0) {
      score += 0.4;
      
      // Percentuais somam próximo de 100%?
      const totalPercentage = data.ancestry.reduce((sum, a) => sum + a.percentage, 0);
      if (totalPercentage >= 90 && totalPercentage <= 110) {
        score += 0.3;
      }
      
      // Tem regiões diversificadas?
      if (data.ancestry.length >= 3) {
        score += 0.1;
      }
    }
    
    // Tem grupos étnicos?
    if (data.ethnicGroups && data.ethnicGroups.length > 0) {
      score += 0.1;
    }
    
    // Provedor identificado?
    if (data.testProvider && data.testProvider !== 'unknown') {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Método principal para processar PDF de DNA
   */
  static async parseDNAPDF(file: File): Promise<ParseResult> {
    const warnings: string[] = [];
    
    try {
      // Validar arquivo
      const validationError = this.validateFile(file);
      if (validationError) {
        return { success: false, error: validationError };
      }
      
      // Extrair texto (simulado para MVP)
      const text = await this.simulateTextExtraction(file);
      
      if (!text || text.length < 50) {
        return { 
          success: false, 
          error: 'PDF parece estar vazio ou não contém dados de ancestralidade' 
        };
      }
      
      // Identificar provedor
      const provider = this.identifyProvider(text);
      
      // Processar dados
      const parsedData = this.parseAncestryData(text);
      
      if (!parsedData.ancestry || parsedData.ancestry.length === 0) {
        return {
          success: false,
          error: 'Não foi possível extrair dados de ancestralidade do PDF'
        };
      }
      
      // Calcular confiança
      const confidence = this.calculateConfidence({ ...parsedData, testProvider: provider });
      
      if (confidence < 0.3) {
        warnings.push('Baixa confiança na extração dos dados. Verifique se o PDF contém dados de ancestralidade.');
      }
      
      if (provider === 'unknown') {
        warnings.push('Provedor do teste não identificado automaticamente.');
      }
      
      // Para MVP, adicionar aviso sobre simulação
      warnings.push('MVP: Usando processamento simulado para demonstração');
      
      const finalData: DNAData = {
        ancestry: parsedData.ancestry || [],
        ethnicGroups: parsedData.ethnicGroups || [],
        haplogroups: parsedData.haplogroups,
        testProvider: provider,
        confidence
      };
      
      return {
        success: true,
        data: finalData,
        warnings: warnings.length > 0 ? warnings : undefined
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao processar PDF'
      };
    }
  }

  /**
   * Gera resumo textual dos dados de DNA para o agente de IA
   */
  static generateSummaryForAI(data: DNAData): string {
    const { ancestry, ethnicGroups, testProvider, confidence } = data;
    
    let summary = `DADOS DE ANCESTRALIDADE (${testProvider.toUpperCase()}, confiança: ${Math.round(confidence * 100)}%)\n\n`;
    
    // Ancestralidade principal (top 5)
    if (ancestry.length > 0) {
      summary += "COMPOSIÇÃO ANCESTRAL:\n";
      ancestry
        .slice(0, 5) // Pegar apenas os 5 principais
        .forEach(item => {
          summary += `• ${item.region}: ${item.percentage}%`;
          if (item.countries.length > 0) {
            summary += ` (${item.countries.slice(0, 3).join(', ')})`;
          }
          summary += "\n";
        });
    }
    
    // Grupos étnicos
    if (ethnicGroups.length > 0) {
      summary += `\nGRUPOS ÉTNICOS: ${ethnicGroups.slice(0, 5).join(', ')}\n`;
    }
    
    // Países prioritários para turismo (top 3 regiões)
    const topCountries = ancestry
      .slice(0, 3)
      .map(item => item.countries)
      .flat()
      .slice(0, 5);
    
    if (topCountries.length > 0) {
      summary += `\nPAÍSES PRIORITÁRIOS PARA TURISMO ANCESTRAL: ${topCountries.join(', ')}\n`;
    }
    
    // Dicas para o agente
    summary += `\nCRIE ROTEIROS que conectem o usuário com suas origens ${ancestry[0]?.region || 'ancestrais'}, priorizando experiências culturais autênticas.`;
    
    return summary;
  }

  /**
   * Valida se um objeto é um DNAData válido
   */
  static validateDNAData(data: any): data is DNAData {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.ancestry) &&
      Array.isArray(data.ethnicGroups) &&
      typeof data.testProvider === 'string' &&
      typeof data.confidence === 'number' &&
      data.confidence >= 0 && data.confidence <= 1
    );
  }
}
