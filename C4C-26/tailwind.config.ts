import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        aqua: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        ocean: {
          800: '#0c2340',
          900: '#071428',
          950: '#030a14',
        },
        'risk-low': '#10b981',
        'risk-med': '#f59e0b',
        'risk-crit': '#ef4444',
      },
    },
  },
  plugins: [],
};
export default config;

