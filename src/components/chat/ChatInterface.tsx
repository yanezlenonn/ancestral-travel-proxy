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
  conversationId: string;
}

interface ChatInterfaceProps {
  userId: string;
  conversationId: string;
  dnaData?: any;
  onNewConversation?: (conversationId: string) => void;
}

export default function ChatInterface({ 
  userId, 
  conversationId, 
  dnaData, 
  onNewConversation 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingQueries, setRemainingQueries] = useState(5);
  const [resetTime, setResetTime] = useState<Date | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll para novas mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carregar mensagens da conversa
  useEffect(() => {
    loadConversation();
    checkRateLimit();
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      setError('Erro ao carregar conversa');
    } finally {
      setIsLoading(false);
    }
  };

  const checkRateLimit = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/rate-limit`);
      if (response.ok) {
        const data = await response.json();
        setRemainingQueries(data.remaining);
        setResetTime(data.resetTime ? new Date(data.resetTime) : null);
      }
    } catch (err) {
      console.error('Erro ao verificar rate limit:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || remainingQueries <= 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date(),
      conversationId
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage.trim(),
          conversationId,
          userId,
          dnaData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na resposta da IA');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        conversationId
      };

      setMessages(prev => [...prev, assistantMessage]);
      setRemainingQueries(prev => prev - 1);
      
      // Atualizar reset time se fornecido
      if (data.resetTime) {
        setResetTime(new Date(data.resetTime));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
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
