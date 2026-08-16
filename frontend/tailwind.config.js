/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Barlow Condensed', 'Arial Narrow', 'sans-serif'],
      },
      colors: {
        ink: '#1E211C',
        paper: '#F5F1E8',
        'paper-bright': '#FFFDF7',
        lime: '#C8F135',
        cobalt: '#275DCE',
        mango: '#FFB000',
        coral: '#E95D4F',
        muted: '#5B6057',
        brand: { DEFAULT: '#275DCE', dark: '#1E47A8' },
      },
      animation: {
        'in': 'fadeIn 0.15s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in-from-top-2': 'slideInFromTop 0.15s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideInFromTop: { from: { transform: 'translateY(-8px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
      },
      boxShadow: {
        'card': '0 8px 20px -14px rgb(30 33 28 / 0.42)',
        'card-hover': '0 16px 34px -20px rgb(30 33 28 / 0.55)',
      },
    },
  },
  plugins: [],
};
