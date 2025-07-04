/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ManyChat Color Palette
        primary: {
          50: '#EBF4FF',
          100: '#D1E7FF',
          200: '#A6D2FF',
          300: '#7BB8FF',
          400: '#5093FF',
          500: '#1B4DFF', // Main ManyChat blue
          600: '#0F2380',
          700: '#0A1A66',
          800: '#06134D',
          900: '#030A33'
        },
        secondary: {
          50: '#F3F1FF',
          100: '#E6E0FF',
          200: '#D4C5FF',
          300: '#B8A0FF',
          400: '#9B7AFF',
          500: '#7C3AED', // Purple accent
          600: '#6B21A8',
          700: '#581C87',
          800: '#4C1D95',
          900: '#3B0764'
        },
        accent: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981', // Success green
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B'
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827'
        },
        warning: '#F59E0B',
        error: '#EF4444',
        success: '#10B981'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      borderRadius: {
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'primary': '0 4px 12px rgba(27, 77, 255, 0.3)',
        'secondary': '0 4px 12px rgba(124, 58, 237, 0.3)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'large': '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1B4DFF 0%, #7C3AED 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #7C3AED 0%, #1B4DFF 100%)',
        'gradient-accent': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
