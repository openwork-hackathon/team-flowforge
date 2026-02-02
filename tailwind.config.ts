import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forge: {
          // Backgrounds
          bg: "#050508",
          "bg-subtle": "#0a0a12",
          card: "rgba(15, 15, 25, 0.7)",
          "card-solid": "#0f0f19",

          // Borders
          border: "rgba(100, 120, 255, 0.08)",
          "border-hover": "rgba(100, 120, 255, 0.2)",
          "border-active": "rgba(100, 120, 255, 0.35)",

          // Accent palette
          blue: "#3b82f6",
          "blue-light": "#60a5fa",
          violet: "#8b5cf6",
          "violet-light": "#a78bfa",
          cyan: "#06b6d4",
          "cyan-light": "#22d3ee",

          // Semantic
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",

          // Text
          "text-primary": "#f1f5f9",
          "text-secondary": "#94a3b8",
          "text-muted": "#475569",
          "text-dim": "#334155",
        },
      },
      backgroundImage: {
        // Gradient presets
        "gradient-blue": "linear-gradient(135deg, #3b82f6, #60a5fa)",
        "gradient-violet": "linear-gradient(135deg, #8b5cf6, #a78bfa)",
        "gradient-cyan": "linear-gradient(135deg, #06b6d4, #22d3ee)",
        "gradient-blue-violet": "linear-gradient(135deg, #3b82f6, #8b5cf6)",
        "gradient-blue-cyan": "linear-gradient(135deg, #3b82f6, #06b6d4)",
        "gradient-radial": "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
        "gradient-mesh":
          "conic-gradient(from 180deg at 50% 50%, #3b82f610 0deg, #8b5cf610 120deg, #06b6d410 240deg, #3b82f610 360deg)",
      },
      boxShadow: {
        // Glass shadows
        glass: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
        "glass-hover":
          "0 8px 32px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        "glass-active":
          "0 8px 32px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06)",

        // Neon glows
        "neon-blue": "0 0 20px rgba(59, 130, 246, 0.3)",
        "neon-blue-strong": "0 0 30px rgba(59, 130, 246, 0.5)",
        "neon-violet": "0 0 20px rgba(139, 92, 246, 0.3)",
        "neon-violet-strong": "0 0 30px rgba(139, 92, 246, 0.5)",
        "neon-cyan": "0 0 20px rgba(6, 182, 212, 0.3)",
        "neon-cyan-strong": "0 0 30px rgba(6, 182, 212, 0.5)",
        "neon-green": "0 0 20px rgba(16, 185, 129, 0.3)",
        "neon-amber": "0 0 20px rgba(245, 158, 11, 0.3)",
        "neon-red": "0 0 20px rgba(239, 68, 68, 0.3)",

        // Card depth
        "card-depth":
          "0 4px 24px rgba(0, 0, 0, 0.5), 0 1px 4px rgba(0, 0, 0, 0.3)",
        "card-float":
          "0 12px 40px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "energy-flow": "energy-flow 2s linear infinite",
        "particle-drift": "particle-drift 8s linear infinite",
        heartbeat: "heartbeat 2s ease-in-out infinite",
        "live-pulse": "live-pulse 1.5s ease-in-out infinite",
        "slide-up": "slide-up 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.2s ease-out",
        "slide-in-left": "slide-in-left 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        twinkle: "twinkle 4s ease-in-out infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(59, 130, 246, 0.5)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "energy-flow": {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
        "particle-drift": {
          "0%": { transform: "translate(0, 0) scale(1)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translate(100px, -50px) scale(0)", opacity: "0" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
        },
        "live-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.8" },
        },
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px",
      },
    },
  },
  plugins: [],
};
export default config;
