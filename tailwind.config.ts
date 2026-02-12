import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-pretendard)',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          primary: '#FF3C42',
          'primary-dark': '#E02B31',
          'primary-light': '#FF6D72',
          dark: '#1A1A1A',
          black: '#0A0A0A',
        },
        // shadcn/ui semantic colors (CSS variable-based)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'accordion-down': {
          from: { opacity: '0', maxHeight: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', maxHeight: '2000px', transform: 'translateY(0)' },
        },
        'accordion-up': {
          from: { opacity: '1', maxHeight: '1000px', transform: 'translateY(0)' },
          to: { opacity: '0', maxHeight: '0', transform: 'translateY(-8px)' },
        },
        'shimmer-text': {
          '0%': { backgroundPosition: '100% 0' },
          '100%': { backgroundPosition: '-100% 0' },
        },
        'text-fade-in': {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'text-appear': {
          from: { opacity: '0.6' },
          to: { opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'skeleton-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'accordion-down': 'accordion-down 0.2s ease-out forwards',
        'accordion-up': 'accordion-up 0.2s ease-out forwards',
        'fade-in': 'fade-in 0.2s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.2s ease-out forwards',
        'text-fade-in': 'text-fade-in 0.3s ease-out forwards',
        'text-appear': 'text-appear 0.3s ease-out',
        'shimmer-text': 'shimmer-text 1.5s linear infinite',
        'skeleton-shimmer': 'skeleton-shimmer 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
