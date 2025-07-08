// ARQUIVO: src/components/chat/TypingIndicator.tsx
// FUNÇÃO: Indicador visual quando IA está processando
// DEPENDÊNCIAS: Nenhuma

'use client';

export default function TypingIndicator() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      marginBottom: '16px',
      padding: '0 16px'
    }}>
      <div style={{
        maxWidth: '70%'
      }}>
        {/* Avatar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '4px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            marginRight: '8px'
          }}>
            IA
          </div>
          
          <span style={{
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            Especialista em Viagens
          </span>
        </div>

        {/* Typing Bubble */}
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '12px 16px',
          borderRadius: '20px 20px 20px 4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#6b7280',
            marginRight: '8px'
          }}>
            Pensando
          </span>
          
          {/* Animated dots */}
          <div style={{
            display: 'flex',
            gap: '2px'
          }}>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#9ca3af',
                  borderRadius: '50%',
                  animation: `typing-dot 1.4s infinite ease-in-out both`,
                  animationDelay: `${index * 0.16}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes typing-dot {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
