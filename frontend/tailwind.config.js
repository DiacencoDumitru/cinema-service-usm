/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cinema: {
          dark: '#0f172a',
          accent: '#e11d48',
          muted: '#64748b',
        },
      },
    },
  },
  plugins: [],
};
