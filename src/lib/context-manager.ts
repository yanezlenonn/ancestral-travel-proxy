import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { DNAData } from './pdf-parser';

export interface ConversationMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  session_id: string;
  agent_mode: 'DNA_SPECIALIST' | 'TRADITIONAL_PLANNER';
  metadata?: {
    dna_data_id?: string;
    tokens_used?: number;
    response_time?: number;
  };
}

export interface ConversationContext {
  sessionId: string;
  userId: string;
  agentMode: 'DNA_SPECIALIST' | 'TRADITIONAL_PLANNER';
  dnaData?: DNAData;
  messages: ConversationMessage[];
  userPreferences: {
    budget?: string;
    travelStyle?: string;
    interests?: string[];
    previousDestinations?: string[];
  };
  usage: {
    messagesCount: number;
    isFreeTier: boolean;
    dailyLimit: number;
    monthlyTokens: number;
  };
}

export class ContextManager {
  private static readonly MAX_CONTEXT_MESSAGES = 20; // Manter só as últimas 20 mensagens
  private static readonly FREE_TIER_DAILY_LIMIT = 5;
  private static readonly MAX_MONTHLY_TOKENS = 100000; // ~$100 em tokens

  /**
   * Cria ou recupera o contexto da conversa
   */
  static async getConversationContext(sessionId: string): Promise<ConversationContext | null> {
    const supabase = createServerComponentClient({ cookies });
    
    try {
      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Buscar mensagens da sessão
      const { data: messages } = await supabase
        .from('chat_messages')
        .select(`
          *,
          dna_data:dna_uploads(*)
        `)
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(this.MAX_CONTEXT_MESSAGES);

      // Buscar dados de DNA se existir
      const { data: dnaUpload } = await supabase
        .from('dna_uploads')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Calcular uso diário
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: dailyMessages } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('role', 'user')
        .gte('created_at', today.toISOString());

      // Verificar se é usuário premium
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const isFreeTier = !subscription;
      
      // Determinar modo do agente
      const agentMode: ConversationContext['agentMode'] = dnaUpload 
        ? 'DNA_SPECIALIST' 
        : 'TRADITIONAL_PLANNER';

      return {
        sessionId,
        userId: user.id,
        agentMode,
        dnaData: dnaUpload?.parsed_data || undefined,
        messages: messages || [],
        userPreferences: {
          budget: user.user_metadata?.budget,
          travelStyle: user.user_metadata?.travel_style,
          interests: user.user_metadata?.interests || [],
          previousDestinations: user.user_metadata?.previous_destinations || []
        },
        usage: {
          messagesCount: dailyMessages || 0,
          isFreeTier,
          dailyLimit: this.FREE_TIER_DAILY_LIMIT,
          monthlyTokens: 0 // TODO: Implementar tracking de tokens
        }
      };

    } catch (error) {
      console.error('Erro ao buscar contexto:', error);
      return null;
    }
  }

  /**
   * Salva uma nova mensagem no contexto
   */
  static async saveMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata?: ConversationMessage['metadata']
  ): Promise<boolean> {
    const supabase = createServerComponentClient({ cookies });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Determinar modo do agente
      const context = await this.getConversationContext(sessionId);
      const agentMode = context?.agentMode || 'TRADITIONAL_PLANNER';

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          role,
          content,
          agent_mode: agentMode,
          metadata
        });

      return !error;
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      return false;
    }
  }

  /**
   * Verifica se o usuário pode enviar mais mensagens
   */
  static async canSendMessage(userId: string): Promise<{ 
    allowed: boolean, 
    reason?: string,
    usage?: ConversationContext['usage']
  }> {
    const supabase = createServerComponentClient({ cookies });
    
    try {
      // Verificar se é usuário premium
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      const isFreeTier = !subscription;
      
      if (!isFreeTier) {
        return { allowed: true }; // Usuários premium têm acesso ilimitado
      }

      // Contar mensagens de hoje para usuários gratuitos
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: dailyMessages } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('role', 'user')
        .gte('created_at', today.toISOString());

      const usage = {
        messagesCount: dailyMessages || 0,
        isFreeTier,
        dailyLimit: this.FREE_TIER_DAILY_LIMIT,
        monthlyTokens: 0
      };

      if ((dailyMessages || 0) >= this.FREE_TIER_DAILY_LIMIT) {
        return { 
          allowed: false, 
          reason: 'Limite diário de mensagens atingido. Faça upgrade para acesso ilimitado.',
          usage
        };
      }

      return { allowed: true, usage };
      
    } catch (error) {
      console.error('Erro ao verificar limite:', error);
      return { allowed: false, reason: 'Erro interno' };
    }
  }

  /**
   * Gera prompt contextualizado para o agente
   */
  static buildContextualPrompt(context: ConversationContext): string {
    const { agentMode, dnaData, messages, userPreferences } = context;
    
    let prompt = '';
    
    // Prompt base baseado no modo
    if (agentMode === 'DNA_SPECIALIST') {
      prompt = `Você é um especialista em turismo ancestral. Ajude o usuário a planejar viagens que conectem com suas origens genéticas.

DADOS DE ANCESTRALIDADE:
${dnaData ? this.formatDNAForPrompt(dnaData) : 'Nenhum dado de DNA disponível'}

INSTRUÇÕES:
- Crie roteiros que explorem a herança cultural do usuário
- Sugira locais históricos, museus, festivais e experiências autênticas
- Inclua gastronomia tradicional e tradições locais
- Explique as conexões entre os destinos e a ancestralidade
- Seja específico sobre datas, custos e logística`;
    } else {
      prompt = `Você é um planejador de viagens especialista. Crie roteiros personalizados e detalhados.

INSTRUÇÕES:
- Forneça roteiros completos com cronograma
- Inclua custos estimados, hospedagem e transporte
- Sugira atividades baseadas nos interesses do usuário
- Dê dicas práticas sobre documentação, clima e cultura local
- Seja específico sobre datas, horários e reservas necessárias`;
    }
    
    // Adicionar preferências do usuário
    if (userPreferences.budget) {
      prompt += `\n\nORÇAMENTO: ${userPreferences.budget}`;
    }
    
    if (userPreferences.travelStyle) {
      prompt += `\nESTILO DE VIAGEM: ${userPreferences.travelStyle}`;
    }
    
    if (userPreferences.interests?.length) {
      prompt += `\nINTERESSES: ${userPreferences.interests.join(', ')}`;
    }
    
    if (userPreferences.previousDestinations?.length) {
      prompt += `\nDESTINOS ANTERIORES: ${userPreferences.previousDestinations.join(', ')}`;
    }
    
    // Adicionar histórico de conversa (últimas 10 mensagens)
    if (messages.length > 0) {
      prompt += '\n\nHISTÓRICO DA CONVERSA:';
      const recentMessages = messages.slice(-10);
      
      recentMessages.forEach(msg => {
        const role = msg.role === 'user' ? 'USUÁRIO' : 'ASSISTENTE';
        prompt += `\n${role}: ${msg.content}`;
      });
    }
    
    prompt += '\n\nRESPONDA DE FORMA NATURAL, AMIGÁVEL E DETALHADA.';
    
    return prompt;
  }

  /**
   * Formata dados de DNA para inclusão no prompt
   */
  private static formatDNAForPrompt(dnaData: DNAData): string {
    let formatted = '';
    
    if (dnaData.ancestry.length > 0) {
      formatted += 'Composição ancestral:\n';
      dnaData.ancestry
        .sort((a, b) => b.percentage - a.percentage)
        .forEach(item => {
          formatted += `- ${item.region}: ${item.percentage}%`;
          if (item.countries.length > 0) {
            formatted += ` (${item.countries.join(', ')})`;
          }
          formatted += '\n';
        });
    }
    
    if (dnaData.ethnicGroups.length > 0) {
      formatted += `\nGrupos étnicos: ${dnaData.ethnicGroups.join(', ')}`;
    }
    
    const topCountries = dnaData.ancestry
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)
      .map(item => item.countries)
      .flat();
    
    if (topCountries.length > 0) {
      formatted += `\nPaíses prioritários: ${topCountries.join(', ')}`;
    }
    
    return formatted;
  }

  /**
   * Limpa mensagens antigas para otimizar contexto
   */
  static async cleanupOldMessages(sessionId: string): Promise<void> {
    const supabase = createServerComponentClient({ cookies });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Manter apenas as últimas 50 mensagens por sessão
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (messages && messages.length === 50) {
        const oldestKeptId = messages[messages.length - 1].id;
        
        await supabase
          .from('chat_messages')
          .delete()
          .eq('session_id', sessionId)
          .eq('user_id', user.id)
          .lt('id', oldestKeptId);
      }
    } catch (error) {
      console.error('Erro ao limpar mensagens antigas:', error);
    }
  }

  /**
   * Gera ID único para nova sessão
   */
  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Atualiza preferências do usuário baseado na conversa
   */
  static async updateUserPreferences(
    userId: string, 
    preferences: Partial<ConversationContext['userPreferences']>
  ): Promise<void> {
    const supabase = createServerComponentClient({ cookies });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentMetadata = user.user_metadata || {};
      const updatedMetadata = { ...currentMetadata, ...preferences };

      await supabase.auth.updateUser({
        data: updatedMetadata
      });
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
    }
  }
}
