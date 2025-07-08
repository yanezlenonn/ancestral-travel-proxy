// src/app/chat/page.tsx - USAR ESTE CÓDIGO
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';

export default async function ChatPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ChatInterface userId={session.user.id} />
    </div>
  );
}
