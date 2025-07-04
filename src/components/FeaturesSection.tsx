'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  DNA, 
  Globe, 
  Brain, 
  MapPin, 
  Clock, 
  Shield, 
  Download, 
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const dnaFeatures = [
    {
      icon: DNA,
      title: 'Análise de DNA Avançada',
      description: 'Suporte para testes de todas as principais empresas: 23andMe, MyHeritage, AncestryDNA e mais.',
    },
    {
      icon: MapPin,
      title: 'Regiões Específicas',
      description: 'Não apenas países, mas regiões específicas onde seus antepassados viveram.',
    },
    {
      icon: Clock,
      title: 'Contexto Histórico',
      description: 'Entenda os períodos históricos e eventos que seus ancestrais vivenciaram.',
    },
  ];

  const aiFeatures = [
    {
      icon: Brain,
      title: 'IA Especializada',
      description: 'Dois agentes especializados: um para DNA e outro para planejamento tradicional.',
    },
    {
      icon: Globe,
      title: 'Cobertura Global',
      description: 'Roteiros para mais de 195 países com informações culturais detalhadas.',
    },
    {
      icon: Sparkles,
      title: 'Personalização Total',
      description: 'Cada roteiro é único, considerando suas preferências e estilo de viagem.',
    },
  ];

  const premiumFeatures = [
    {
      icon: Download,
      title: 'Export PDF',
      description: 'Baixe seus roteiros em PDF profissional para levar em qualquer lugar.',
    },
    {
      icon: Users,
      title: 'Consultas Ilimitadas',
      description: 'Sem limites diários. Refine seus roteiros quantas vezes quiser.',
    },
    {
      icon: Shield,
      title: 'Histórico Seguro',
      description: 'Suas conversas e dados são salvos com segurança na nuvem.',
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <Badge variant="primary" size="lg" className="mb-4">
            Recursos Únicos
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Tecnologia que conecta{' '}
            <span className="text-gradient">passado e futuro</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Combinamos ciência genética, inteligência artificial e décadas de conhecimento 
            em turismo para criar a experiência de viagem mais personalizada do mundo.
          </p>
        </div>

        {/* DNA Features */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-primary text-white px-6 py-3 rounded-full mb-4">
              <DNA className="w-5 h-5" />
              <span className="font-semibold">Modo DNA</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Viagens Baseadas na Sua Genética
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A primeira plataforma do mundo que usa dados de DNA para criar roteiros 
              de viagem personalizados baseados na sua ancestralidade real.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {dnaFeatures.map((feature, index) => (
              <Card key={index} hover className="text-center">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* DNA Demo */}
          <div className="mt-12 max-w-4xl mx-auto">
            <Card variant="gradient" className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">
                    Como funciona o Modo DNA?
                  </h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                      <span>Faça upload do seu arquivo de teste de DNA</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                      <span>Nossa IA analisa suas origens e percentuais</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                      <span>Receba roteiros personalizados para suas regiões ancestrais</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <h5 className="font-semibold text-gray-900 mb-4">Exemplo de Análise:</h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">🇮🇹 Itália (Toscana)</span>
                      <Badge variant="primary" size="sm">45%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">🇵🇹 Portugal (Norte)</span>
                      <Badge variant="primary" size="sm">30%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">🇩🇪 Alemanha (Baviera)</span>
                      <Badge variant="primary" size="sm">25%</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-4">
                    Ver Roteiro Completo
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* AI Features */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-secondary text-white px-6 py-3 rounded-full mb-4">
              <Brain className="w-5 h-5" />
              <span className="font-semibold">Inteligência Artificial</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Powered by Advanced AI
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nossa IA foi treinada com dados de milhões de viagens e informações 
              culturais para criar os roteiros mais precisos e envolventes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {aiFeatures.map((feature, index) => (
              <Card key={index} hover className="text-center">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Premium Features */}
        <div>
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-accent text-white px-6 py-3 rounded-full mb-4">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Premium</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Recursos Premium
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Desbloqueie todo o potencial da plataforma com recursos exclusivos 
              para viajantes sérios.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {premiumFeatures.map((feature, index) => (
              <Card key={index} hover className="text-center">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Card variant="outlined" className="max-w-md mx-auto p-8">
              <div className="text-center">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  Pronto para começar?
                </h4>
                <p className="text-gray-600 mb-6">
                  5 consultas gratuitas. Sem cartão de crédito.
                </p>
                <Button size="lg" className="w-full">
                  Começar Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
