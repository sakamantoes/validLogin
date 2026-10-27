// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#C9A24B',
          light: '#F0CB6E',
          dark: '#7A6530',
          50: '#FBF6E9',
          100: '#F5EAC9',
          200: '#F0CB6E',
          300: '#E3BD68',
          400: '#D6B057',
          500: '#C9A24B',
          600: '#A9853D',
          700: '#8A6C32',
          800: '#7A6530',
          900: '#5C4A22',
          950: '#3A2E15',
        },
        ink: '#0A0908',
        panel: '#131110',
        'panel-light': '#1C1712',
        cream: '#F5EFE0',
        'stone-muted': '#9B948A',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}