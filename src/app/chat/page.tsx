'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  Settings,
  Crown,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import ChatInterface from '@/components/chat/ChatInterface';
import ConversationHistory from '@/components/chat/ConversationHistory';
import DNAStatusBanner from '@/components/chat/DNAStatusBanner';
import DNAUploadModal from '@/components/dna/DNAUploadModal';

interface DNAData {
  id: string;
  fileName: string;
  uploadDate: Date;
  ancestries: Array<{
    region: string;
    percentage: number;
    countries: string[];
  }>;
  totalRegions: number;
  primaryAncestry: string;
}

export default function ChatPage() {
  const { user, loading, signOut } = useUser();
  const router = useRouter();
  
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dnaData, setDnaData] = useState<DNAData | null>(null);
  const [chatMode, setChatMode] = useState<'dna' | 'traditional'>('traditional');
  const [showDNAUpload, setShowDNAUpload] = useState(false);
  const [showDNABanner, setShowDNABanner] = useState(true);

  // Redirect se não autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Gerar novo ID de conversa
  const generateConversationId = () => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Inicializar conversa ao carregar página
  useEffect(() => {
    if (user && !currentConversationId) {
      setCurrentConversationId(generateConversationId());
    }
  }, [user]);

  // Carregar dados do DNA do usuário
  useEffect(() => {
    if (user?.id) {
      loadUserDNAData();
    }
  }, [user?.id]);

  const loadUserDNAData = async () => {
    try {
      const response = await fetch(`/api/users/${user?.id}/dna`);
      if (response.ok) {
        const data = await response.json();
        if (data.dnaData) {
          setDnaData(data.dnaData);
          setChatMode('dna'); // Automaticamente mudar para modo DNA se existir
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados do DNA:', err);
    }
  };

  const handleNewConversation = () => {
    const newConversationId = generateConversationId();
    setCurrentConversationId(newConversationId);
    setSidebarOpen(false); // Fechar sidebar no mobile
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setSidebarOpen(false); // Fechar sidebar no mobile
  };

  const handleModeChange = (mode: 'dna' | 'traditional') => {
    setChatMode(mode);
  };

  const handleDNAUploadSuccess = (newDnaData: DNAData) => {
    setDnaData(newDnaData);
    setChatMode('dna');
    setShowDNAUpload(false);
    setShowDNABanner(true);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect será feito pelo useEffect
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AT</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
              Ancestral Travel
            </h1>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          {/* Premium Badge (futuro) */}
          <Badge variant="outline" className="hidden sm:flex">
            Plano Gratuito
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url} alt={user.full_name} />
                  <AvatarFallback>
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.full_name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Crown className="mr-2 h-4 w-4" />
                <span>Upgrade Premium</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Ajuda</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversation History */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 transition-transform duration-300 ease-in-out
          fixed md:relative z-30 h-full w-80 md:w-80
        `}>
          <ConversationHistory
            userId={user.id}
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            className="h-full"
          />
        </div>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* DNA Status Banner */}
          {showDNABanner && (
            <div className="p-4 pb-0">
              <DNAStatusBanner
                dnaData={dnaData}
                currentMode={chatMode}
                onModeChange={handleModeChange}
                onUploadClick={() => setShowDNAUpload(true)}
                onDismiss={() => setShowDNABanner(false)}
              />
            </div>
          )}

          {/* Chat Interface */}
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              userId={user.id}
              conversationId={currentConversationId}
              dnaData={chatMode === 'dna' ? dnaData : undefined}
              onNewConversation={handleNewConversation}
            />
          </div>
        </div>
      </div>

      {/* DNA Upload Modal */}
      <DNAUploadModal
        isOpen={showDNAUpload}
        onClose={() => setShowDNAUpload(false)}
        onSuccess={handleDNAUploadSuccess}
        userId={user.id}
      />
    </div>
  );
}
