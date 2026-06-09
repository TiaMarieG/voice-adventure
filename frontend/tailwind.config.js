/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dungeon: {
          void:     '#080705',
          stone:    '#100e0b',
          surface:  '#1a1712',
          border:   '#2e261c',
          muted:    '#4a3d2e',
          ink:      '#7a6a55',
          parchment:'#e8d9c0',
          faded:    '#b0a090',
          torch:    '#c8763a',
          'torch-glow': '#e8952a',
          crimson:  '#8b1a1a',
          'crimson-bright': '#c42020',
          moss:     '#2d5a35',
          'moss-bright': '#3d7a45',
        },
      },
      fontFamily: {
        cinzel: ['"Cinzel"', 'serif'],
        lora:   ['"Lora"', 'serif'],
      },
      animation: {
        'pulse-torch':  'pulseTorch 2s ease-in-out infinite',
        'flicker':      'flicker 3s ease-in-out infinite',
        'fade-in':      'fadeIn 0.8s ease-out forwards',
        'slide-up':     'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        pulseTorch: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.8', transform: 'scale(1.05)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '33%':      { opacity: '0.9' },
          '66%':      { opacity: '0.95' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};