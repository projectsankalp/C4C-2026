/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a',
        danger: '#dc2626',
        warning: '#d97706',
      }
    }
  },
  plugins: []
};
