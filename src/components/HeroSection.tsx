'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Play, DNA, Globe, Star } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onWatchDemo?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onWatchDemo,
}) => {
  return (
    <section className="relative hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="7"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
      
      <div className="relative container-custom section-padding">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="animate-fade-in">
              <Badge variant="primary" size="lg" icon={<Star className="w-4 h-4" />}>
                ✨ Novo: Baseado em DNA
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="space-y-6 animate-slide-up">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Descubra suas{' '}
                <span className="text-gradient">origens</span>
                <br />
                através de{' '}
                <span className="text-gradient">viagens épicas</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                O primeiro planejador de viagens do mundo que usa seu DNA para criar 
                roteiros personalizados baseados na sua ancestralidade. 
                <strong className="text-gray-800"> Conecte-se com suas raízes.</strong>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <Button
                size="lg"
                onClick={onGetStarted}
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                className="min-w-[200px]"
              >
                Começar Grátis
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={onWatchDemo}
                icon={<Play className="w-5 h-5" />}
                className="min-w-[180px]"
              >
                Ver Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-8 animate-fade-in">
              <p className="text-sm text-gray-500 mb-4">
                Mais de 10,000 viajantes já descobriram suas origens
              </p>
              <div className="flex items-center justify-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm font-medium text-gray-600 ml-2">
                  4.9/5 (2,847 avaliações)
                </span>
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-20 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* DNA Mode */}
            <div className="relative group animate-slide-up">
              <div className="card card-hover p-8 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <DNA className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Modo DNA
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Faça upload do seu teste de DNA e descubra roteiros únicos 
                  baseados na sua herança genética. Visite os países dos seus antepassados.
                </p>
                <div className="mt-6">
                  <Badge variant="success" dot>
                    Exclusivo
                  </Badge>
                </div>
              </div>
            </div>

            {/* Traditional Mode */}
            <div className="relative group animate-slide-up">
              <div className="card card-hover p-8 text-center">
                <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Modo Tradicional
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Planejamento inteligente de viagens com IA. Conte suas preferências 
                  e receba roteiros personalizados para qualquer destino do mundo.
                </p>
                <div className="mt-6">
                  <Badge variant="primary" dot>
                    Popular
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Preview */}
          <div className="mt-20 animate-fade-in">
            <div className="relative max-w-4xl mx-auto">
              <div className="card p-2 bg-gray-900">
                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden">
                  {/* Mock Chat Interface */}
                  <div className="absolute inset-4 bg-white rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Ancestral Travel AI</h4>
                      <Badge variant="success" size="sm">DNA Mode</Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <div className="bg-primary-500 text-white rounded-lg px-4 py-2 max-w-xs">
                          Olá! Fiz upload do meu teste de DNA. Pode criar um roteiro baseado nas minhas origens?
                        </div>
                      </div>
                      
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2 max-w-md">
                          Perfeito! Vejo que você tem 45% de origem italiana, 30% portuguesa e 25% alemã. Vou criar um roteiro de 15 dias visitando as regiões específicas dos seus antepassados...
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>IA analisando seu DNA...</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Play Button Overlay */}
                  <button
                    onClick={onWatchDemo}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors duration-300 group"
                  >
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-gray-900 ml-1" />
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C200,100 400,40 600,60 C800,80 1000,20 1200,60 L1200,120 L0,120 Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
