/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#14b8a6",
          DEFAULT: "#0D9488", // teal
          dark: "#0f766e",
        },
        secondary: {
          light: "#3b82f6",
          DEFAULT: "#1D4ED8", // navy
          dark: "#1e40af",
        },
        accent: {
          light: "#f59e0b",
          DEFAULT: "#D97706", // amber
          dark: "#b45309",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
