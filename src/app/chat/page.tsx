'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Compass,
  User,
  Settings,
  LogOut,
  Upload,
  Send,
  DNA,
  Globe,
  Menu,
  X,
  Plus,
  Clock,
  Download,
  Star
} from 'lucide-react';

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [agentMode, setAgentMode] = useState<'dna' | 'traditional'>('traditional');
  const [message, setMessage] = useState('');
  const [hasDNA, setHasDNA] = useState(false);

  // Mock data
  const user = {
    name: 'João Silva',
    email: 'joao@example.com',
    queries_used: 2,
    queries_limit: 5,
    subscription: 'free' as const,
  };

  const chatHistory = [
    { id: '1', title: 'Viagem para Europa', agent: 'traditional', date: '2024-01-15' },
    { id: '2', title: 'Minhas Origens Italianas', agent: 'dna', date: '2024-01-14' },
    { id: '3', title: 'Roteiro Ásia', agent: 'traditional', date: '2024-01-13' },
  ];

  const messages = [
    {
      id: '1',
      role: 'assistant' as const,
      content: 'Olá! Sou seu assistente de viagens com IA. Como posso ajudá-lo a planejar sua próxima aventura?',
      timestamp: '10:30',
    },
    {
      id: '2',
      role: 'user' as const,
      content: 'Quero planejar uma viagem de 10 dias para a Europa com foco em história e cultura.',
      timestamp: '10:31',
    },
    {
      id: '3',
      role: 'assistant' as const,
      content: 'Excelente escolha! Para criar o roteiro perfeito, preciso de algumas informações: Qual é seu orçamento aproximado? Você prefere grandes cidades ou também cidades menores? Tem algum período específico em mente?',
      timestamp: '10:31',
