// ARQUIVO: src/components/chat/ChatInterface.tsx
// FUNÇÃO: Interface principal adaptada para APIs existentes
// DEPENDÊNCIAS: shadcn/ui (existente), lucide-react (instalado), APIs do Chat 1+2

'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  session_id: string;
}

interface ChatInterfaceProps {
  userId: string;
  dnaData?: any;
}

export default function ChatInterface({ 
  userId, 
  dnaData
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingQueries, setRemainingQueries] = useState(5);
  const [resetTime, setResetTime] = useState<Date | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Gerar sessionId único
  useEffect(() => {
    if (!sessionId) {
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [sessionId]);

  // Auto-scroll para novas mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carregar dados iniciais
  useEffect(() => {
    if (sessionId) {
      loadConversation();
      checkRateLimit();
    }
  }, [sessionId]);

  const loadConversation = async () => {
    try {
      setIsLoading(true);
      // Usar API simple-chat para carregar histórico
      const response = await fetch(`/api/simple-chat?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.messages) {
          const formattedMessages = data.messages.map((msg: any) => ({
            id: msg.id || `${msg.role}_${msg.created_at}`,
            content: msg.content,
            role: msg.role,
            timestamp: new Date(msg.created_at),
            session_id: msg.session_id
          }));
          setMessages(formattedMessages);
          
          // Calcular queries restantes baseado no histórico
          const userMessages = formattedMessages.filter((m: Message) => m.role === 'user');
          setRemainingQueries(Math.max(0, 5 - userMessages.length));
        }
      }
    } catch (err) {
      console.error('Erro ao carregar conversa:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkRateLimit = async () => {
    try {
      // Usar API do Chat 1 se disponível
      const response = await fetch(`/api/users/${userId}/rate-limit`);
      if (response.ok) {
        const data = await response.json();
        setRemainingQueries(data.remaining || remainingQueries);
        setResetTime(data.resetTime ? new Date(data.resetTime) : null);
      }
    } catch (err) {
      console.error('Rate limit API não disponível, usando fallback');
      // Usar fallback baseado em mensagens locais
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || remainingQueries <= 0) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date(),
      session_id: sessionId
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      // Usar API simple-chat (confirmada funcionando)
      const response = await fetch('/api/simple-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage.trim(),
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na resposta da IA');
      }

      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: Message = {
          id: `assistant_${Date.now()}`,
          content: data.message,
          role: 'assistant',
          timestamp: new Date(),
          session_id: sessionId
        };

        setMessages(prev => [...prev, assistantMessage]);
        setRemainingQueries(prev => Math.max(0, prev - 1));
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
      // Remover mensagem do usuário em caso de erro
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatResetTime = () => {
    if (!resetTime) return '';
    const now = new Date();
    const diff = resetTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h${minutes}min`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ancestral Travel</h1>
            <p className="text-sm text-gray-600">Seu especialista em viagens personalizada</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>Sessão: {sessionId.slice(-8)}</div>
          </div>
        </div>
      </div>

      {/* Rate Limiting Banner */}
      {remainingQueries <= 2 && (
        <div className="bg-amber-50 border-b border-amber-200 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-amber-800">
              {remainingQueries > 0 
                ? `${remainingQueries} consultas restantes`
                : 'Limite de consultas atingido'
              }
            </span>
            {resetTime && (
              <span className="text-amber-600">
                Renova em {formatResetTime()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Carregando conversa...</span>
          </div>
        )}

        {/* Welcome Message */}
        {messages.length === 0 && !isLoading && (
          <Card className="p-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              👋 Olá! Como posso ajudar?
            </h2>
            <p className="text-gray-600 mb-4">
              Sou seu especialista em viagens. Posso criar roteiros personalizados!
            </p>
            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <p className="font-medium text-blue-900 mb-2">💡 Exemplos:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Criar roteiro de 7 dias para Paris</li>
                <li>• Sugerir destinos para lua de mel</li>
                <li>• Planejar viagem com orçamento limitado</li>
                <li>• Encontrar atividades para crianças</li>
              </ul>
            </div>
          </Card>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.role === 'assistant' && (
                  <Bot className="h-4 w-4 mt-1 text-blue-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
                {message.role === 'user' && (
                  <User className="h-4 w-4 mt-1 text-white flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-lg border border-gray-200 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-blue-500" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
                </div>
                <span className="text-sm text-gray-600">IA está pensando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                remainingQueries <= 0 
                  ? 'Limite de consultas atingido'
                  : dnaData 
                    ? 'Pergunte sobre suas origens ancestrais...'
                    : 'Planeje sua próxima viagem...'
              }
              disabled={isLoading || remainingQueries <= 0}
              className="min-h-[44px] max-h-32 resize-none pr-12"
              rows={1}
            />
            {inputMessage.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {inputMessage.length}/500
              </div>
            )}
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || remainingQueries <= 0}
            size="sm"
            className="h-11 px-3"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Quick Stats */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>
            {dnaData ? (
              <Badge variant="outline" className="text-xs">
                Modo DNA Ativo
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                Modo Tradicional
              </Badge>
            )}
          </span>
          <span>
            {remainingQueries}/5 consultas restantes
          </span>
        </div>
      </div>
    </div>
  );
}
