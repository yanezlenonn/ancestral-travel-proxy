'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Star, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Designer',
      location: 'São Paulo, BR',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612e4b1?w=100&h=100&fit=crop&crop=face',
      content: 'Descobri que tenho 60% de origem italiana e o Ancestral Travel me criou um roteiro incrível pela Toscana. Visitei exatamente as cidades onde meus bisavós nasceram. Foi emocionante!',
      rating: 5,
      journey: 'DNA Mode',
      verified: true,
    },
    {
      name: 'Carlos Mendoza',
      role: 'Engenheiro',
      location: 'Lisboa, PT',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      content: 'Usei o modo tradicional para planejar uma viagem de 3 semanas pela Ásia. A IA entendeu perfeitamente meu estilo de viagem e orçamento. Economizei horas de pesquisa!',
      rating: 5,
      journey: 'Traditional Mode',
      verified: true,
    },
    {
      name: 'Ana Rodriguez',
      role: 'Professora',
      location: 'Barcelona, ES',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      content: 'Como descendente de alemães, sempre quis conhecer a Alemanha. O roteiro baseado no meu DNA me levou a pequenas vilas que nem sabia que existiam. Encontrei até parentes distantes!',
      rating: 5,
      journey: 'DNA Mode',
      verified: true,
    },
    {
      name: 'João Santos',
      role: 'Médico',
      location: 'Rio de Janeiro, BR',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      content: 'Fantástico! A plataforma analisou meu DNA e descobriu origens japonesas que eu nem sabia que tinha. Minha viagem ao Japão foi muito mais significativa conhecendo minha história.',
      rating: 5,
      journey: 'DNA Mode',
      verified: true,
    },
    {
      name: 'Patricia Costa',
      role: 'Arquiteta',
      location: 'Porto, PT',
      avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
      content: 'Uso tanto o modo DNA quanto o tradicional. Para viagens familiares uso o tradicional, para aventuras pessoais uso o DNA. Ambos são perfeitos para diferentes ocasiões.',
      rating: 5,
      journey: 'Both Modes',
      verified: true,
    },
    {
      name: 'Roberto Lima',
      role: 'Empresário',
      location: 'Belo Horizonte, BR',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      content: 'A qualidade dos roteiros é impressionante. Cada sugestão é pensada nos mínimos detalhes. Já usei outras IAs de viagem, mas nenhuma chega perto desta personalização.',
      rating: 5,
      journey: 'Traditional Mode',
      verified: true,
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Viajantes Ativos' },
    { number: '195', label: 'Países Cobertos' },
    { number: '4.9/5', label: 'Avaliação Média' },
    { number: '50+', label: 'Origens Genéticas' },
  ];

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="success" size="lg" className="mb-4">
            ⭐ Avaliado com 4.9/5
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Amado por{' '}
            <span className="text-gradient">viajantes do mundo todo</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mais de 10,000 pessoas já descobriram suas origens e criaram memórias 
            inesquecíveis usando nossa plataforma.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-500 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} hover className="relative">
              <div className="absolute top-4 right-4">
                <Quote className="w-8 h-8 text-primary-200" />
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    {testimonial.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {testimonial.role} • {testimonial.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">
                "{testimonial.content}"
              </p>

              <div className="flex items-center justify-between">
                <Badge 
                  variant={testimonial.journey.includes('DNA') ? 'primary' : 'secondary'}
                  size="sm"
                >
                  {testimonial.journey}
                </Badge>
                <span className="text-xs text-gray-400">Verificado</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Card variant="gradient" className="max-w-2xl mx-auto p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Junte-se a milhares de viajantes satisfeitos
            </h3>
            <p className="text-gray-600 mb-6">
              Comece gratuitamente e descubra o poder de viajar com propósito.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-600">
                  4.9/5 (2,847 reviews)
                </span>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>✓ 5 consultas grátis</span>
              <span>✓ Sem cartão de crédito</span>
              <span>✓ Suporte 24/7</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
