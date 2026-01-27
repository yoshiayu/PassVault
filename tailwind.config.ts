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
        "glass-border": "rgba(255, 255, 255, 0.45)",
        "glass-fill": "rgba(255, 255, 255, 0.14)"
      },
      boxShadow: {
        glow:
          "0 0 80px rgba(46, 163, 255, 0.7), 0 0 36px rgba(125, 231, 255, 0.75), 0 0 12px rgba(255, 255, 255, 0.85)",
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
