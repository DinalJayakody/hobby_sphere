/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#d1dce8',
          200: '#a3b9d1',
          300: '#7597ba',
          400: '#4774a3',
          500: '#345780',
          600: '#1a3a5c', // Primary navy blue
          700: '#132b46',
          800: '#0c1c2f',
          900: '#060e19',
        },
        sky: {
          50: '#f0f7ff', // Light blue background
          100: '#e0f1fe',
          200: '#bae3fd',
          300: '#7cccfd',
          400: '#47b4f9',
          500: '#2798ea',
          600: '#127ac8',
          700: '#0e5c99',
          800: '#0d4674',
          900: '#0c345a',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};