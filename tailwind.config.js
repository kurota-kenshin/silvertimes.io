/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0a0a0a',
          secondary: '#111111',
          tertiary: '#1a1a1a',
        },
        silver: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#c9cdd1',
          300: '#a8adb3',
          400: '#888e95',
          500: '#6c757d',
          600: '#5a6268',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
        accent: {
          blue: '#60a5fa',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-silver': 'linear-gradient(135deg, #c9cdd1 0%, #6c757d 50%, #888e95 100%)',
        'gradient-accent': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
