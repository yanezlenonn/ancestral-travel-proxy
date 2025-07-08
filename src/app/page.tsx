'use client';

import React from 'react';

export default function HomePage() {
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: 'white',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    },
    header: {
      position: 'sticky' as const,
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid #e5e7eb',
    },
    nav: {
      maxWidth: '80rem',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '4rem',
      padding: '0 1.5rem',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    logoIcon: {
      width: '2rem',
      height: '2rem',
      background: 'linear-gradient(135deg, #2563eb, #9333ea)',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
    },
    logoText: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#111827',
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
    },
    navLink: {
      color: '#4b5563',
      fontWeight: '500',
      textDecoration: 'none',
      transition: 'color 0.2s',
    },
    button: {
      padding: '0.5rem 1.5rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    buttonPrimary: {
      background: 'linear-gradient(135deg, #2563eb, #9333ea)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
    },
    buttonSecondary: {
      backgroundColor: 'white',
      color: '#4b5563',
      border: '2px solid #e5e7eb',
    },
    hero: {
      background: 'linear-gradient(135deg, #dbeafe, #ffffff, #f3e8ff)',
      padding: '5rem 1.5rem',
      textAlign: 'center' as const,
    },
    heroContainer: {
      maxWidth: '80rem',
      margin: '0 auto',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '2rem',
    },
    heroTitle: {
      fontSize: 'clamp(2rem, 8vw, 4rem)',
      fontWeight: 'bold',
      color: '#111827',
      lineHeight: '1.1',
      marginBottom: '1.5rem',
    },
    gradient: {
      background: 'linear-gradient(135deg, #2563eb, #9333ea)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    heroText: {
      fontSize: '1.25rem',
      color: '#4b5563',
      maxWidth: '48rem',
      margin: '0 auto 2rem auto',
      lineHeight: '1.6',
    },
    heroButtons: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    heroButtonsDesktop: {
      display: 'flex',
      flexDirection: 'row' as const,
      gap: '1rem',
      alignItems: 'center',
    },
    heroStats: {
      paddingTop: '2rem',
    },
    section: {
      padding: '5rem 1.5rem',
    },
    sectionWhite: {
      backgroundColor: 'white',
    },
    sectionGray: {
      backgroundColor: '#f9fafb',
    },
    sectionContainer: {
      maxWidth: '80rem',
      margin: '0 auto',
    },
    sectionHeader: {
      textAlign: 'center' as const,
      marginBottom: '4rem',
    },
    sectionTitle: {
      fontSize: 'clamp(2rem, 6vw, 3rem)',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1.5rem',
    },
    sectionText: {
      fontSize: '1.25rem',
      color: '#4b5563',
      maxWidth: '48rem',
      margin: '0 auto',
    },
    grid: {
      display: 'grid',
      gap: '2rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    },
    card: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '2rem',
      textAlign: 'center' as const,
      transition: 'all 0.3s',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    cardIcon: {
      fontSize: '3rem',
      marginBottom: '1.5rem',
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem',
    },
    cardText: {
      color: '#4b5563',
      lineHeight: '1.6',
      marginBottom: '1.5rem',
    },
    cardBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.75rem',
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      marginBottom: '4rem',
    },
    stat: {
      textAlign: 'center' as const,
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#2563eb',
      marginBottom: '0.5rem',
    },
    statLabel: {
      color: '#4b5563',
      fontWeight: '500',
    },
    testimonialCard: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      transition: 'all 0.3s',
    },
    testimonialHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    avatar: {
      width: '3rem',
      height: '3rem',
      background: 'linear-gradient(135deg, #2563eb, #9333ea)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
    },
    testimonialName: {
      fontWeight: '600',
      color: '#111827',
    },
    testimonialRole: {
      fontSize: '0.875rem',
      color: '#4b5563',
    },
    stars: {
      display: 'flex',
      gap: '0.25rem',
      marginBottom: '1rem',
    },
    testimonialText: {
      color: '#374151',
      lineHeight: '1.6',
      marginBottom: '1rem',
    },
    footer: {
      backgroundColor: '#111827',
      color: 'white',
      padding: '4rem 1.5rem',
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
      marginBottom: '3rem',
    },
    footerTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '1rem',
    },
    footerLink: {
      color: '#9ca3af',
      textDecoration: 'none',
      transition: 'color 0.2s',
      display: 'block',
      marginBottom: '0.75rem',
    },
    footerBottom: {
      borderTop: '1px solid #374151',
      paddingTop: '2rem',
      textAlign: 'center' as const,
      color: '#9ca3af',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <nav style={styles.nav}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>🧭</div>
            <span style={styles.logoText}>Ancestral Travel</span>
          </div>

          <div style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>Como Funciona</a>
            <a href="#testimonials" style={styles.navLink}>Avaliações</a>
            <a href="#pricing" style={styles.navLink}>Preços</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{ ...styles.button, ...styles.buttonSecondary }}>
              Entrar
            </button>
            <button style={{ ...styles.button, ...styles.buttonPrimary }}>
              Começar Grátis
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContainer}>
          <div style={styles.badge}>
            ✨ Novo: Baseado em DNA
          </div>

          <h1 style={styles.heroTitle}>
            Descubra suas{' '}
            <span style={styles.gradient}>origens</span>
            <br />
            através de{' '}
            <span style={styles.gradient}>viagens épicas</span>
          </h1>
          
          <p style={styles.heroText}>
            O primeiro planejador de viagens do mundo que usa seu DNA para criar 
            roteiros personalizados baseados na sua ancestralidade. 
            <strong> Conecte-se com suas raízes.</strong>
          </p>

          <div style={window.innerWidth > 640 ? styles.heroButtonsDesktop : styles.heroButtons}>
            <button style={{ ...styles.button, ...styles.buttonPrimary, minWidth: '200px', padding: '0.75rem 1.5rem' }}>
              Começar Grátis
            </button>
            <button style={{ ...styles.button, ...styles.buttonSecondary, minWidth: '180px', padding: '0.75rem 1.5rem' }}>
              Ver Demo
            </button>
          </div>

          <div style={styles.heroStats}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Mais de 10,000 viajantes já descobriram suas origens
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {'⭐'.repeat(5)}
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginLeft: '0.5rem' }}>
                4.9/5 (2,847 avaliações)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ ...styles.section, ...styles.sectionWhite }}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <div style={{ ...styles.badge, backgroundColor: '#dcfce7', color: '#166534' }}>
              Recursos Únicos
            </div>
            <h2 style={styles.sectionTitle}>
              Tecnologia que conecta{' '}
              <span style={styles.gradient}>passado e futuro</span>
            </h2>
            <p style={styles.sectionText}>
              Combinamos ciência genética, inteligência artificial e décadas de conhecimento 
              em turismo para criar a experiência de viagem mais personalizada do mundo.
            </p>
          </div>

          <div style={styles.grid}>
            {[
              {
                icon: '🧬',
                title: 'Modo DNA',
                description: 'Faça upload do seu teste de DNA e descubra roteiros únicos baseados na sua herança genética.',
                badge: 'Exclusivo'
              },
              {
                icon: '🌍',
                title: 'Modo Tradicional',
                description: 'Planejamento inteligente de viagens com IA para qualquer destino do mundo.',
                badge: 'Popular'
              },
              {
                icon: '🤖',
                title: 'IA Especializada',
                description: 'Dois agentes especializados criando roteiros personalizados para você.',
                badge: 'Avançado'
              }
            ].map((feature, index) => (
              <div key={index} style={styles.card}>
                <div style={styles.cardIcon}>{feature.icon}</div>
                <h3 style={styles.cardTitle}>{feature.title}</h3>
                <p style={styles.cardText}>{feature.description}</p>
                <div style={styles.cardBadge}>{feature.badge}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" style={{ ...styles.section, ...styles.sectionGray }}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <div style={{ ...styles.badge, backgroundColor: '#fef3c7', color: '#92400e' }}>
              ⭐ Avaliado com 4.9/5
            </div>
            <h2 style={styles.sectionTitle}>
              Amado por{' '}
              <span style={styles.gradient}>viajantes do mundo todo</span>
            </h2>
          </div>

          <div style={styles.statsGrid}>
            {[
              { number: '10,000+', label: 'Viajantes Ativos' },
              { number: '195', label: 'Países Cobertos' },
              { number: '4.9/5', label: 'Avaliação Média' },
              { number: '50+', label: 'Origens Genéticas' },
            ].map((stat, index) => (
              <div key={index} style={styles.stat}>
                <div style={styles.statNumber}>{stat.number}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={styles.grid}>
            {[
              {
                name: 'Maria Silva',
                role: 'Designer • São Paulo, BR',
                content: 'Descobri que tenho 60% de origem italiana e o Ancestral Travel me criou um roteiro incrível pela Toscana.',
              },
              {
                name: 'Carlos Mendoza',
                role: 'Engenheiro • Lisboa, PT',
                content: 'Usei o modo tradicional para planejar uma viagem de 3 semanas pela Ásia. A IA entendeu perfeitamente meu estilo.',
              },
              {
                name: 'Ana Rodriguez',
                role: 'Professora • Barcelona, ES',
                content: 'O roteiro baseado no meu DNA me levou a pequenas vilas que nem sabia que existiam. Encontrei até parentes!',
              },
            ].map((testimonial, index) => (
              <div key={index} style={styles.testimonialCard}>
                <div style={styles.testimonialHeader}>
                  <div style={styles.avatar}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div style={styles.testimonialName}>{testimonial.name}</div>
                    <div style={styles.testimonialRole}>{testimonial.role}</div>
                  </div>
                </div>
                <div style={styles.stars}>
                  {'⭐'.repeat(5)}
                </div>
                <p style={styles.testimonialText}>"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.sectionContainer}>
          <div style={styles.footerGrid}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ ...styles.logoIcon, backgroundColor: '#2563eb' }}>🧭</div>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Ancestral Travel</span>
              </div>
              <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
                A primeira plataforma do mundo que usa DNA para criar roteiros 
                de viagem personalizados.
              </p>
            </div>

            <div>
              <h4 style={styles.footerTitle}>Produto</h4>
              <a href="#" style={styles.footerLink}>Como Funciona</a>
              <a href="#" style={styles.footerLink}>Modo DNA</a>
              <a href="#" style={styles.footerLink}>Preços</a>
            </div>

            <div>
              <h4 style={styles.footerTitle}>Recursos</h4>
              <a href="#" style={styles.footerLink}>Blog</a>
              <a href="#" style={styles.footerLink}>Guias</a>
              <a href="#" style={styles.footerLink}>Suporte</a>
            </div>

            <div>
              <h4 style={styles.footerTitle}>Empresa</h4>
              <a href="#" style={styles.footerLink}>Sobre Nós</a>
              <a href="#" style={styles.footerLink}>Carreiras</a>
              <a href="#" style={styles.footerLink}>Contato</a>
            </div>
          </div>

          <div style={styles.footerBottom}>
            <p>© 2024 Ancestral Travel. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
