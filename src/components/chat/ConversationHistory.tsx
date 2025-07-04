'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Trash2, 
  Calendar,
  MapPin,
  Dna,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Conversation {
  id: string;
  title: string;
  preview: string;
  lastMessage: Date;
  messageCount: number;
  hasDnaData: boolean;
  userId: string;
  createdAt: Date;
}

interface ConversationHistoryProps {
  userId: string;
  currentConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  className?: string;
}

export default function ConversationHistory({
  userId,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  className = ''
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  // Carregar conversas do usuário
  useEffect(() => {
    loadConversations();
  }, [userId]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/conversations?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        
        // Se deletou a conversa atual, criar uma nova
        if (currentConversationId === conversationId) {
          onNewConversation();
        }
      }
    } catch (err) {
      console.error('Erro ao deletar conversa:', err);
    }
  };

  const confirmDelete = (conversationId: string) => {
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const executeDelete = () => {
    if (conversationToDelete) {
      handleDeleteConversation(conversationToDelete);
      setConversationToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;
    if (days < 30) return `${Math.floor(days / 7)} semanas atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Conversas</h2>
          <Button
            onClick={onNewConversation}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`p-3 mb-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                  currentConversationId === conversation.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200'
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Title and Badge */}
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-sm text-gray-800 truncate">
                        {conversation.title}
                      </h3>
                      {conversation.hasDnaData && (
                        <Badge variant="outline" className="text-xs">
                          <Dna className="h-3 w-3 mr-1" />
                          DNA
                        </Badge>
                      )}
                    </div>
                    
                    {/* Preview */}
                    <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                      {truncateText(conversation.preview, 80)}
                    </p>
                    
                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(conversation.lastMessage)}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {conversation.messageCount}
                        </span>
                      </div>
                      {currentConversationId === conversation.id && (
                        <ChevronRight className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(conversation.id);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Deletar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Stats Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 text-center">
          {conversations.length} conversas • {conversations.filter(c => c.hasDnaData).length} com DNA
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar conversa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta conversa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
