/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#e65000',
        'primary-light': '#fff0eb',
        background: '#f8f6f5',
        card: '#ffffff',
        'text-dark': '#1a1a1a',
        'text-muted': '#888888',
        success: '#22c55e',
        danger: '#ef4444',
      },
      fontFamily: {
        display: ['Work Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
}

