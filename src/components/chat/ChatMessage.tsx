// ARQUIVO: src/components/chat/ChatMessage.tsx
// FUNÇÃO: Exibir mensagens individuais (user vs assistant)
// DEPENDÊNCIAS: Nenhuma

'use client';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '16px',
      padding: '0 16px'
    }}>
      <div style={{
        maxWidth: '70%',
        minWidth: '200px'
      }}>
        {/* Avatar e Nome */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '4px',
          flexDirection: isUser ? 'row-reverse' : 'row'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: isUser ? '#3b82f6' : '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            marginLeft: isUser ? '8px' : '0',
            marginRight: isUser ? '0' : '8px'
          }}>
            {isUser ? 'U' : 'IA'}
          </div>
          
          <span style={{
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            {isUser ? 'Você' : 'Especialista em Viagens'}
          </span>
        </div>

        {/* Bubble de Mensagem */}
        <div style={{
          backgroundColor: isUser ? '#3b82f6' : '#f3f4f6',
          color: isUser ? 'white' : '#1f2937',
          padding: '12px 16px',
          borderRadius: isUser 
            ? '20px 20px 4px 20px' 
            : '20px 20px 20px 4px',
          fontSize: '14px',
          lineHeight: '1.5',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap'
        }}>
          {content}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div style={{
            fontSize: '11px',
            color: '#9ca3af',
            marginTop: '4px',
            textAlign: isUser ? 'right' : 'left'
          }}>
            {new Date(timestamp).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </div>
  );
}
