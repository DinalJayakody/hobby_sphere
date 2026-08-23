/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        },
        // Neutral scale used for chrome/surfaces/text so the whole app can
        // flip themes by swapping the CSS variables these map to, instead of
        // sprinkling `dark:` variants on every single element.
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          muted: 'rgb(var(--surface-muted) / <alpha-value>)',
          raised: 'rgb(var(--surface-raised) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--border) / <alpha-value>)',
          strong: 'rgb(var(--border-strong) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--text-primary) / <alpha-value>)',
          muted: 'rgb(var(--text-secondary) / <alpha-value>)',
          faint: 'rgb(var(--text-faint) / <alpha-value>)',
        },
        // A warmer accent used sparingly for highlights/CTAs alongside the
        // existing navy/sky brand pair, per the "add whatever's needed" brief.
        coral: {
          50: '#fff1ef',
          100: '#ffe1dc',
          200: '#ffc2b8',
          300: '#ff9c8a',
          400: '#fb7259',
          500: '#f0522f',
          600: '#d43c1c',
          700: '#ad2f16',
          800: '#812518',
          900: '#5c1c14',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(15 23 42 / 0.04), 0 4px 12px rgb(15 23 42 / 0.06)',
        'soft-lg': '0 4px 8px rgb(15 23 42 / 0.04), 0 12px 32px rgb(15 23 42 / 0.10)',
      },
    },
  },
  plugins: [],
};