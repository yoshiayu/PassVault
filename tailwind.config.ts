import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "neon-blue": "#79d5ff",
        "neon-blue-strong": "#4cc3ff",
        "candy-blue": "#2ea3ff",
        "candy-blue-deep": "#0b5bff",
        "candy-blue-glow": "#7de7ff",
        "glass-border": "rgba(255, 255, 255, 0.3)",
        "glass-fill": "rgba(255, 255, 255, 0.08)"
      },
      boxShadow: {
        glow:
          "0 0 60px rgba(46, 163, 255, 0.55), 0 0 24px rgba(125, 231, 255, 0.6), 0 0 6px rgba(255, 255, 255, 0.7)",
        inset: "inset 0 0 0 1px rgba(255, 255, 255, 0.15)"
      },
      backdropBlur: {
        glass: "18px"
      }
    }
  },
  plugins: []
};

export default config;
