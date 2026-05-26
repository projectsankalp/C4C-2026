import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        teal_new: "var(--teal)",
        cyan: "var(--cyan)",
        sky_new: "var(--sky)",
        lavender: "var(--lavender)",
        mist: "var(--mist)",
        ink: "var(--ink)",
        // Aliases for legacy classes to automatically update UI
        navy: { 900: "var(--foreground)", 800: "var(--card-foreground)", 700: "var(--muted-foreground)" },
        teal: { 500: "var(--primary)", 600: "var(--teal)", 50: "var(--mist)", 100: "var(--lavender)", 300: "var(--cyan)", 400: "var(--teal)" },
        coral: { 500: "var(--accent)", 600: "var(--destructive)" },
        sand: { 50: "var(--background)", 100: "var(--muted)" },
        severity: {
          low: "#16a34a",
          medium: "#eab308",
          high: "#f97316",
          urgent: "#dc2626",
          emergency: "#7f1d1d",
        },
      },
      backgroundImage: {
        "gradient-hero": "var(--gradient-hero)",
        "gradient-aurora": "var(--gradient-aurora)",
        "gradient-card": "var(--gradient-card)",
        "gradient-glow": "var(--gradient-glow)",
        "gradient-teal": "var(--gradient-teal)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
        display: ["Sora", "Inter", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "shadow-soft": "var(--shadow-soft)",
        "shadow-glow": "var(--shadow-glow)",
        "shadow-card": "var(--shadow-card)",
        "shadow-float": "var(--shadow-float)",
      },
    },
  },
  plugins: [],
};

export default config;
