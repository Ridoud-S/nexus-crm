/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './app/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { display: ['"Plus Jakarta Sans"', 'sans-serif'], sans: ['Inter', 'sans-serif'] },
      colors: { ink: '#1E293B', deep: '#0F172A', accent: '#F97316', accentd: '#EA580C', smoke: '#F8FAFC', line: '#E2E8F0' },
    },
  },
  plugins: [],
};
