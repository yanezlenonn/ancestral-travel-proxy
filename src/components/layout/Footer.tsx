'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  Compass, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Instagram, 
  Facebook,
  Linkedin,
  Youtube
} from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Produto',
      links: [
        { name: 'Como Funciona', href: '#how-it-works' },
        { name: 'Modo DNA', href: '#dna-mode' },
        { name: 'Modo Tradicional', href: '#traditional-mode' },
        { name: 'Preços', href: '#pricing' },
        { name: 'API', href: '/api-docs' },
      ],
    },
    {
      title: 'Recursos',
      links: [
        { name: 'Blog', href: '/blog' },
        { name: 'Guias de Viagem', href: '/guides' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Centro de Ajuda', href: '/help' },
        { name: 'Status', href: '/status' },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { name: 'Sobre Nós', href: '/about' },
        { name: 'Carreiras', href: '/careers' },
        { name: 'Imprensa', href: '/press' },
        { name: 'Parceiros', href: '/partners' },
        { name: 'Contato', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacidade', href: '/privacy' },
        { name: 'Termos', href: '/terms' },
        { name: 'Cookies', href: '/cookies' },
        { name: 'LGPD', href: '/lgpd' },
        { name: 'Licenças', href: '/licenses' },
      ],
    },
  ];

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/ancestraltravel' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/ancestraltravel' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/ancestraltravel' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/ancestraltravel' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@ancestraltravel' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container-custom px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Receba dicas exclusivas de viagem
            </h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Histórias inspiradoras, destinos únicos e ofertas especiais 
              direto na sua caixa de entrada. Sem spam, apenas conteúdo de qualidade.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu melhor email"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
              <Button className="sm:px-8">
                Inscrever
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Ao se inscrever, você concorda com nossa{' '}
              <Link href="/privacy" className="text-primary-400 hover:text-primary-300">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">
                Ancestral Travel
              </span>
            </Link>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              A primeira plataforma do mundo que usa DNA para criar roteiros 
              de viagem personalizados. Conecte-se com suas origens através de experiências únicas.
            </p>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>São Paulo, Brasil</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:contato@ancestraltravel.com" className="hover:text-primary-400 transition-colors duration-200">
                  contato@ancestraltravel.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+5511999999999" className="hover:text-primary-400 transition-colors duration-200">
                  +55 (11) 99999-9999
                </a>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold text-lg mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container-custom px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © {currentYear} Ancestral Travel. Todos os direitos reservados.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Certifications */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>ISO 27001</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>LGPD Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
