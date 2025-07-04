// test-imports.tsx
// Coloque este arquivo em src/app/test/ para testar todos os imports

import React from 'react';

// Teste 1: Imports das bibliotecas (src/lib/)
import { IntelligentAgent } from '@/lib/intelligent-agent';
import { openaiClient } from '@/lib/openai';
import { parseAncestryDNA } from '@/lib/pdf-parser';
import { ContextManager } from '@/lib/context-manager';
import { cn } from '@/lib/utils';
import { useUser } from '@/lib/hooks/useUser';

// Teste 2: Imports dos componentes UI
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

// Teste 3: Imports dos componentes de layout
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Teste 4: Imports dos componentes de chat
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ConversationHistory } from '@/components/chat/ConversationHistory';
import { DNAStatusBanner } from '@/components/chat/DNAStatusBanner';

// Teste 5: Imports dos componentes principais
import { DNAUploader } from '@/components/DNAUploader';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';

export default function TestImports() {
  console.log('🧪 TESTANDO TODOS OS IMPORTS...');
  
  // Verificar se todas as importações funcionaram
  const imports = {
    // Bibliotecas
    IntelligentAgent: !!IntelligentAgent,
    openaiClient: !!openaiClient,
    parseAncestryDNA: !!parseAncestryDNA,
    ContextManager: !!ContextManager,
    cn: !!cn,
    useUser: !!useUser,
    
    // Componentes UI
    Button: !!Button,
    Card: !!Card,
    Input: !!Input,
    Badge: !!Badge,
    
    // Layout
    Header: !!Header,
    Footer: !!Footer,
    
    // Chat
    ChatInterface: !!ChatInterface,
    ConversationHistory: !!ConversationHistory,
    DNAStatusBanner: !!DNAStatusBanner,
    
    // Principais
    DNAUploader: !!DNAUploader,
    HeroSection: !!HeroSection,
    FeaturesSection: !!FeaturesSection,
    TestimonialsSection: !!TestimonialsSection,
  };

  const failed = Object.entries(imports).filter(([_, success]) => !success);
  const passed = Object.entries(imports).filter(([_, success]) => success);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧪 Teste de Imports</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Imports que funcionaram */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            ✅ Imports Funcionando ({passed.length})
          </h2>
          <ul className="space-y-2">
            {passed.map(([name]) => (
              <li key={name} className="text-green-700 text-sm">
                ✅ {name}
              </li>
            ))}
          </ul>
        </div>

        {/* Imports que falharam */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-4">
            ❌ Imports com Problema ({failed.length})
          </h2>
          {failed.length > 0 ? (
            <ul className="space-y-2">
              {failed.map(([name]) => (
                <li key={name} className="text-red-700 text-sm">
                  ❌ {name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-green-700">🎉 Todos os imports funcionando!</p>
          )}
        </div>
      </div>

      {/* Teste visual dos componentes */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🎨 Teste Visual dos Componentes</h2>
        <div className="space-y-4">
          <Button>Teste do Button</Button>
          <Card className="p-4">
            <p>Teste do Card</p>
          </Card>
          <Input placeholder="Teste do Input" />
          <Badge>Teste do Badge</Badge>
        </div>
      </div>

      {/* Instruções */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">📋 Como Usar Este Teste</h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-700">
          <li>Crie a pasta: <code>src/app/test/</code></li>
          <li>Salve este arquivo como: <code>src/app/test/page.tsx</code></li>
          <li>Execute: <code>npm run dev</code></li>
          <li>Acesse: <code>http://localhost:3000/test</code></li>
          <li>Veja quais imports estão funcionando</li>
        </ol>
      </div>
    </div>
  );
}
