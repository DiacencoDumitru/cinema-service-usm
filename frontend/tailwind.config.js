import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        cinema: {
          dark: '#0f172a',
          accent: '#e11d48',
          muted: '#64748b',
        },
      },
      keyframes: {
        schedulePanelIn: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'schedule-panel-in': 'schedulePanelIn 0.22s ease-out both',
      },
    },
  },
  plugins: [],
};
