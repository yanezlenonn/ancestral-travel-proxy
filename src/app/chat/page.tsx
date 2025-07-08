// ARQUIVO: src/app/chat/page.tsx
// FUNÇÃO: Página principal do chat com autenticação
// DEPENDÊNCIAS: ChatInterface, Supabase Auth

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';

export default async function ChatPage() {
  // Verificar autenticação
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  // Redirecionar para login se não autenticado
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff'
    }}>
      <ChatInterface />
    </div>
  );
}
