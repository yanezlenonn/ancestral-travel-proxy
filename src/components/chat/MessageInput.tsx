// ARQUIVO: src/components/chat/MessageInput.tsx
// FUNÇÃO: Input de mensagens com envio para API
// DEPENDÊNCIAS: React hooks, API /api/simple-chat

'use client';

import { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  remainingQueries?: number;
}

export default function MessageInput({ 
  onSendMessage, 
  isLoading, 
  disabled = false,
  remainingQueries = 5
}: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading || disabled) return;
    
    onSendMessage(message.trim());
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      padding: '16px',
      zIndex: 1000
    }}>
      {/* Rate Limiting Display */}
      <div style={{
        marginBottom: '8px',
        fontSize: '12px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        {remainingQueries > 0 ? (
          `Consultas restantes: ${remainingQueries}/5`
        ) : (
          <span style={{ color: '#ef4444' }}>
            Limite atingido. Faça upgrade para continuar.
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        gap: '8px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            disabled || remainingQueries === 0 
              ? "Limite de consultas atingido..." 
              : "Digite sua pergunta sobre viagens..."
          }
          disabled={disabled || isLoading || remainingQueries === 0}
          rows={1}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '24px',
            fontSize: '14px',
            outline: 'none',
            resize: 'none',
            minHeight: '48px',
            maxHeight: '120px',
            backgroundColor: disabled || remainingQueries === 0 ? '#f9fafb' : '#ffffff',
            color: disabled || remainingQueries === 0 ? '#9ca3af' : '#1f2937'
          }}
        />
        
        <button
          type="submit"
          disabled={!message.trim() || isLoading || disabled || remainingQueries === 0}
          style={{
            padding: '12px 20px',
            backgroundColor: (!message.trim() || isLoading || disabled || remainingQueries === 0) 
              ? '#d1d5db' 
              : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: (!message.trim() || isLoading || disabled || remainingQueries === 0) 
              ? 'not-allowed' 
              : 'pointer',
            minWidth: '80px',
            transition: 'all 0.2s ease'
          }}
        >
          {isLoading ? '...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
