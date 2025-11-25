import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: 'class',
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        border: '#1C1D26', // neutral-700
        input: '#1C1D26', // neutral-700
        ring: '#14F195', // primary-500
        background: '#0A0B0D', // neutral-900
        foreground: '#F4F5F7', // neutral-100
        primary: {
          DEFAULT: '#9945FF',
          foreground: '#FFFFFF',
          200: '#F0E5FF',
          300: '#C9A2FF',
          400: '#9945FF',
          500: '#14F195',
          600: '#0FBF78',
        },
        'primary-foreground': '#FFFFFF',
        secondary: {
          DEFAULT: '#13141A', // neutral-800
          foreground: '#F4F5F7', // neutral-100
        },
        'secondary-foreground': '#F4F5F7',
        destructive: {
          DEFAULT: '#FF5252', // error
          foreground: '#FFFFFF',
        },
        'destructive-foreground': '#FFFFFF',
        muted: {
          DEFAULT: '#13141A', // neutral-800
          foreground: '#6B6C76', // neutral-400
        },
        'muted-foreground': '#6B6C76',
        accent: {
          DEFAULT: '#13141A', // neutral-800
          foreground: '#F4F5F7', // neutral-100
        },
        'accent-foreground': '#F4F5F7',
        popover: {
          DEFAULT: '#0A0B0D', // neutral-900
          foreground: '#F4F5F7', // neutral-100
        },
        'popover-foreground': '#F4F5F7',
        card: {
          DEFAULT: '#13141A', // neutral-800
          foreground: '#F4F5F7', // neutral-100
        },
        'card-foreground': '#F4F5F7',
        neutral: {
          900: '#0A0B0D',
          800: '#13141A',
          700: '#1C1D26',
          600: '#2A2B33',
          500: '#4A4B55',
          400: '#6B6C76',
          300: '#9C9DA6',
          200: '#D4D5DB',
          100: '#F4F5F7',
        },
        success: '#14F195',
        warning: '#FFA726',
        error: '#FF5252',
        info: '#64B5F6',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(25,26,35,0.8) 0%, rgba(13,14,20,0.95) 100%)',
      },
      backdropBlur: {
        glass: '12px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 0 20px rgba(153, 69, 255, 0.4), 0 0 40px rgba(20, 241, 149, 0.2)',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'Inter', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        checkmark: 'checkmark 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        checkmark: {
          '0%': { transform: 'scale(0) rotate(45deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(45deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(45deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [forms, animate],
}

export default config
