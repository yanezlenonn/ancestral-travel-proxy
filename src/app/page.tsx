'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  // Mock user state - será substituído pela autenticação real
  const user = null; // ou { name: 'João', email: 'joao@example.com' }

  const handleSignIn = () => {
    // TODO: Implementar autenticação
    console.log('Sign in clicked');
    // Redirect to auth page or trigger modal
  };

  const handleSignOut = () => {
    // TODO: Implementar logout
    console.log('Sign out clicked');
  };

  const handleGetStarted = () => {
    // TODO: Redirect to chat or auth
    console.log('Get started clicked');
  };

  const handleWatchDemo = () => {
    // TODO: Open demo modal or video
    console.log('Watch demo clicked');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection
          onGetStarted={handleGetStarted}
          onWatchDemo={handleWatchDemo}
        />

        {/* Features Section */}
        <FeaturesSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Final CTA Section */}
        <FinalCTASection onGetStarted={handleGetStarted} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// How It Works Section
const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '1',
      title: 'Escolha seu Modo',
      description: 'DNA para viagens ancestrais ou Tradicional para qualquer destino',
      icon: '🎯',
    },
    {
      number: '2',
      title: 'Upload & Chat',
      description: 'Faça upload do DNA (opcional) e converse com nossa IA especializada',
      icon: '🤖',
    },
    {
      number: '3',
      title: 'Receba seu Roteiro',
      description: 'Roteiro personalizado com destinos, atividades e dicas culturais',
      icon: '✈️',
    },
  ];

  return (
    <section className="section-padding bg-white" id="how-it-works">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Como funciona em{' '}
            <span className="text-gradient">3 passos simples</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Da ideia à viagem dos sonhos em menos de 5 minutos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-1/2 w-full h-0.5 bg-gradient-primary transform translate-x-1/2 z-0" />
              )}
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                  {step.icon}
                </div>
                <div className="w-8 h-8 bg-white border-4 border-primary-500 rounded-full flex items-center justify-center mx-auto -mt-4 mb-6 font-bold text-primary-500">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing Section
const PricingSection: React.FC = () => {
  return (
    <section className="section-padding bg-gray-50" id="pricing">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Preços{' '}
            <span className="text-gradient">transparentes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comece grátis e faça upgrade quando precisar de mais
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="card text-center p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Gratuito</h3>
            <div className="text-5xl font-bold text-gray-900 mb-2">R$ 0</div>
            <p className="text-gray-600 mb-8">Para sempre</p>
            
            <ul className="space-y-4 mb-8 text-left">
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>5 consultas por dia</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Ambos os modos (DNA + Tradicional)</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Upload de DNA</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Suporte por email</span>
              </li>
            </ul>

            <button className="btn-secondary w-full">
              Começar Grátis
            </button>
          </div>

          {/* Premium Plan */}
          <div className="card text-center p-8 relative border-2 border-primary-500">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-primary text-white px-6 py-2 rounded-full text-sm font-semibold">
                Mais Popular
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium</h3>
            <div className="text-5xl font-bold text-gray-900 mb-2">R$ 29</div>
            <p className="text-gray-600 mb-8">por mês</p>
            
            <ul className="space-y-4 mb-8 text-left">
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Consultas ilimitadas</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Export PDF profissional</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Histórico completo salvo</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Suporte prioritário</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Novos recursos em primeiro lugar</span>
              </li>
            </ul>

            <button className="btn-primary w-full">
              Começar Teste Grátis
            </button>
            <p className="text-xs text-gray-500 mt-2">7 dias grátis, cancele quando quiser</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// FAQ Section
const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: 'Como funciona a análise de DNA?',
      answer: 'Aceitamos arquivos de testes de DNA das principais empresas como 23andMe, MyHeritage, AncestryDNA. Nossa IA analisa os dados de ancestralidade e cria roteiros personalizados baseados nas regiões onde seus antepassados viveram.',
    },
    {
      question: 'Meus dados de DNA estão seguros?',
      answer: 'Sim! Seguimos os mais altos padrões de segurança. Seus dados são criptografados e nunca compartilhados. Você pode deletar seus dados a qualquer momento.',
    },
    {
      question: 'Posso usar sem fazer teste de DNA?',
      answer: 'Claro! O Modo Tradicional funciona como um planejador de viagens inteligente para qualquer destino, sem necessidade de DNA.',
    },
    {
      question: 'Quantas consultas posso fazer?',
      answer: 'No plano gratuito: 5 consultas por dia. No Premium: ilimitadas. Cada conversa com a IA conta como uma consulta.',
    },
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim, você pode cancelar sua assinatura a qualquer momento. Não há contratos ou taxas de cancelamento.',
    },
  ];

  return (
    <section className="section-padding bg-white" id="faq">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Perguntas{' '}
            <span className="text-gradient">frequentes</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Final CTA Section
const FinalCTASection: React.FC<{ onGetStarted?: () => void }> = ({ onGetStarted }) => {
  return (
    <section className="section-padding bg-gradient-primary text-white">
      <div className="container-custom text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Pronto para descobrir suas origens?
        </h2>
        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
          Junte-se a milhares de viajantes que já descobriram suas raízes 
          e criaram memórias inesquecíveis.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button onClick={onGetStarted} className="btn-secondary bg-white text-primary-500 hover:bg-gray-50">
            Começar Grátis Agora
          </button>
          <span className="text-white/80">
            5 consultas grátis • Sem cartão de crédito
          </span>
        </div>

        <div className="flex items-center justify-center space-x-8 text-sm opacity-80">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>10,000+ usuários satisfeitos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>4.9/5 estrelas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Suporte 24/7</span>
          </div>
        </div>
      </div>
    </section>
  );
};
