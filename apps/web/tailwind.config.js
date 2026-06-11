/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#111111",
        "surface-raised": "#1a1a1a",
        border: "#222222",
        "border-subtle": "#1a1a1a",
        "text-primary": "#ededed",
        "text-secondary": "#888888",
        "text-tertiary": "#555555",
        accent: {
          DEFAULT: "#4f46e5",
          hover: "#4338ca",
          muted: "rgba(79,70,229,0.12)",
          foreground: "#ffffff",
        },
        success: { DEFAULT: "#22c55e", muted: "rgba(34,197,94,0.1)", text: "#4ade80" },
        warning: { DEFAULT: "#f59e0b", muted: "rgba(245,158,11,0.1)", text: "#fbbf24" },
        danger:  { DEFAULT: "#ef4444", muted: "rgba(239,68,68,0.1)",  text: "#f87171" },
        info:    { DEFAULT: "#3b82f6", muted: "rgba(59,130,246,0.1)", text: "#60a5fa" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.625rem",
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        sm:   "0 1px 2px rgba(0,0,0,0.5)",
        DEFAULT: "0 2px 8px rgba(0,0,0,0.6)",
        lg:   "0 8px 24px rgba(0,0,0,0.8)",
        glow: "0 0 20px rgba(79,70,229,0.25)",
      },
      animation: {
        "fade-in":  "fadeIn 0.15s ease-in-out",
        "slide-up": "slideUp 0.2s ease-out",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
