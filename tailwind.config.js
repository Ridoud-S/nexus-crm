/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nexus: {
          primary: '#1B3F60',
          dark: '#163D60',
          ink: '#1E293B',
          orange: '#F37324',
          soft: '#F4F7FA',
          line: '#E7EDF3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 12px 38px rgba(21, 49, 72, 0.07)',
        float: '0 28px 75px rgba(15, 43, 66, 0.14)',
      },
    },
  },
  plugins: [],
}
