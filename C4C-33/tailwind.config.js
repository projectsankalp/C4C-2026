/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#18181B',
          100: '#0F0F11',
          200: '#1E1E22',
          300: '#27272A',
          400: '#3F3F46',
          DEFAULT: '#09090B',
        },
        charcoal: {
          50: '#1E1E1F',
          100: '#27272A',
          400: '#A1A1AA',
          700: '#E4E4E7',
          800: '#F4F4F5',
          900: '#FAFAFA',
          DEFAULT: '#F4F4F5',
        },
        terracotta: {
          50: '#1D1311',
          100: '#341B15',
          500: '#E05D3D',
          600: '#C74A2C',
          700: '#A3371E',
          DEFAULT: '#E05D3D',
        },
        gold: {
          100: '#231E17',
          400: '#EAB308',
          500: '#D97706',
          600: '#B45309',
          DEFAULT: '#D97706',
        }
      },
      fontFamily: {
        serif: ['"Outfit"', '"Inter"', 'system-ui', 'sans-serif'],
        sans: ['"Outfit"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
        'shimmer': 'shimmer 2.5s infinite linear',
        'draw-line': 'drawLine 2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        drawLine: {
          '0%': { strokeDashoffset: '100%' },
          '100%': { strokeDashoffset: '0%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      boxShadow: {
        'premium': '0 4px 30px rgba(0, 0, 0, 0.03)',
        'luxury': '0 20px 40px rgba(0, 0, 0, 0.06)',
        'glow-terracotta': '0 0 20px rgba(212, 91, 52, 0.25)',
        'glow-gold': '0 0 20px rgba(197, 168, 128, 0.25)',
      }
    },
  },
  plugins: [],
}
