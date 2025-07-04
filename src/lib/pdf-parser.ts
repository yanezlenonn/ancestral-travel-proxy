import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';

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

/**
 * Parser principal para PDFs de testes de DNA
 * Suporta Genera, MyHeritage, 23andMe
 */
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
   * Extrai texto do PDF
   */
  private static async extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
    try {
      const data = await pdfParse(Buffer.from(buffer));
      return data.text;
    } catch (error) {
      throw new Error('Erro ao extrair texto do PDF');
    }
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
   * Parser específico para PDFs do Genera (Brasil)
   */
  private static parseGeneraPDF(text: string): Partial<DNAData> {
    const ancestry: DNAData['ancestry'] = [];
    const ethnicGroups: string[] = [];
    
    // Regex para capturar percentuais de ancestralidade
    const ancestryRegex = /([A-Za-zÀ-ÿ\s]+)[\s:]+(\d+(?:\.\d+)?)\s*%/g;
    let match;
    
    while ((match = ancestryRegex.exec(text)) !== null) {
      const region = match[1].trim();
      const percentage = parseFloat(match[2]);
      
      if (percentage > 0) {
        // Mapear regiões para países conhecidos
        const countries = this.mapRegionToCountries(region);
        ancestry.push({ region, percentage, countries });
      }
    }
    
    // Extrair grupos étnicos
    const ethnicRegex = /(?:etnia|grupo étnico|ancestralidade)[\s:]+([A-Za-zÀ-ÿ\s,]+)/gi;
    const ethnicMatch = ethnicRegex.exec(text);
    if (ethnicMatch) {
      ethnicGroups.push(...ethnicMatch[1].split(',').map(e => e.trim()));
    }
    
    return {
      ancestry,
      ethnicGroups,
      testProvider: 'genera'
    };
  }

  /**
   * Parser específico para PDFs do MyHeritage
   */
  private static parseMyHeritagePDF(text: string): Partial<DNAData> {
    const ancestry: DNAData['ancestry'] = [];
    const ethnicGroups: string[] = [];
    
    // MyHeritage usa formato diferente
    const ancestryRegex = /([A-Za-z\s]+)\s+(\d+(?:\.\d+)?)\s*%/g;
    let match;
    
    while ((match = ancestryRegex.exec(text)) !== null) {
      const region = match[1].trim();
      const percentage = parseFloat(match[2]);
      
      if (percentage > 0) {
        const countries = this.mapRegionToCountries(region);
        ancestry.push({ region, percentage, countries });
      }
    }
    
    return {
      ancestry,
      ethnicGroups,
      testProvider: 'myheritage'
    };
  }

  /**
   * Parser específico para PDFs do 23andMe
   */
  private static parse23andMePDF(text: string): Partial<DNAData> {
    const ancestry: DNAData['ancestry'] = [];
    const ethnicGroups: string[] = [];
    
    // 23andMe format
    const ancestryRegex = /([A-Za-z\s&]+)\s+(\d+(?:\.\d+)?)\s*%/g;
    let match;
    
    while ((match = ancestryRegex.exec(text)) !== null) {
      const region = match[1].trim();
      const percentage = parseFloat(match[2]);
      
      if (percentage > 0) {
        const countries = this.mapRegionToCountries(region);
        ancestry.push({ region, percentage, countries });
      }
    }
    
    return {
      ancestry,
      ethnicGroups,
      testProvider: '23andme'
    };
  }

  /**
   * Mapeia regiões para países específicos
   */
  private static mapRegionToCountries(region: string): string[] {
    const regionMap: Record<string, string[]> = {
      'ibérica': ['Portugal', 'Espanha'],
      'iberian': ['Portugal', 'Spain'],
      'portuguesa': ['Portugal'],
      'portuguese': ['Portugal'],
      'espanhola': ['Espanha'],
      'spanish': ['Spain'],
      'italiana': ['Itália'],
      'italian': ['Italy'],
      'alemã': ['Alemanha'],
      'german': ['Germany'],
      'francesa': ['França'],
      'french': ['France'],
      'africana': ['África do Sul', 'Nigéria', 'Gana'],
      'african': ['South Africa', 'Nigeria', 'Ghana'],
      'indígena': ['Brasil'],
      'indigenous': ['Brazil'],
      'asiática': ['China', 'Japão', 'Coreia'],
      'asian': ['China', 'Japan', 'Korea'],
      'árabe': ['Líbano', 'Síria', 'Jordânia'],
      'arab': ['Lebanon', 'Syria', 'Jordan'],
      'judaica': ['Israel'],
      'jewish': ['Israel'],
      'irlandesa': ['Irlanda'],
      'irish': ['Ireland'],
      'inglesa': ['Inglaterra'],
      'english': ['England'],
      'escocesa': ['Escócia'],
      'scottish': ['Scotland']
    };
    
    const lowerRegion = region.toLowerCase();
    
    for (const [key, countries] of Object.entries(regionMap)) {
      if (lowerRegion.includes(key)) {
        return countries;
      }
    }
    
    return [region]; // Fallback para o próprio nome da região
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
    }
    
    // Tem grupos étnicos?
    if (data.ethnicGroups && data.ethnicGroups.length > 0) {
      score += 0.2;
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
      
      // Extrair texto
      const buffer = await file.arrayBuffer();
      const text = await this.extractTextFromPDF(buffer);
      
      if (!text || text.length < 100) {
        return { 
          success: false, 
          error: 'PDF parece estar vazio ou não contém texto extraível' 
        };
      }
      
      // Identificar provedor
      const provider = this.identifyProvider(text);
      
      // Processar baseado no provedor
      let parsedData: Partial<DNAData>;
      
      switch (provider) {
        case 'genera':
          parsedData = this.parseGeneraPDF(text);
          break;
        case 'myheritage':
          parsedData = this.parseMyHeritagePDF(text);
          break;
        case '23andme':
          parsedData = this.parse23andMePDF(text);
          break;
        default:
          // Tentar parser genérico
          parsedData = this.parseGeneraPDF(text);
          warnings.push('Provedor não identificado, usando parser genérico');
      }
      
      // Calcular confiança
      const confidence = this.calculateConfidence(parsedData);
      
      if (confidence < 0.3) {
        warnings.push('Baixa confiança na extração dos dados');
      }
      
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
    
    let summary = `Dados de ancestralidade (${testProvider}, confiança: ${Math.round(confidence * 100)}%):\n\n`;
    
    // Ancestralidade principal
    if (ancestry.length > 0) {
      summary += "Composição ancestral:\n";
      ancestry
        .sort((a, b) => b.percentage - a.percentage)
        .forEach(item => {
          summary += `- ${item.region}: ${item.percentage}%`;
          if (item.countries.length > 0) {
            summary += ` (${item.countries.join(', ')})`;
          }
          summary += "\n";
        });
    }
    
    // Grupos étnicos
    if (ethnicGroups.length > 0) {
      summary += `\nGrupos étnicos identificados: ${ethnicGroups.join(', ')}\n`;
    }
    
    // Regiões prioritárias para turismo
    const topRegions = ancestry
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)
      .map(item => item.countries)
      .flat();
    
    if (topRegions.length > 0) {
      summary += `\nPaíses prioritários para turismo ancestral: ${topRegions.join(', ')}`;
    }
    
    return summary;
  }
}
