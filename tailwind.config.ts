import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1D9E75",
          hover: "#0F6E56",
          light: "#E1F5EE",
          text: "#0F6E56",
          50: "#E1F5EE",
          100: "#C3EBD7",
          200: "#8ED8B8",
          300: "#58C498",
          400: "#30B07D",
          500: "#1D9E75",
          600: "#0F6E56",
          700: "#0A5040",
          800: "#06342A",
          900: "#031A15",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "hero": ["48px", { lineHeight: "1.15", fontWeight: "700" }],
        "h1": ["32px", { lineHeight: "1.25", fontWeight: "700" }],
        "h2": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "h3": ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        "body": ["15px", { lineHeight: "1.6" }],
        "small": ["13px", { lineHeight: "1.5" }],
        "tiny": ["11px", { lineHeight: "1.4" }],
      },
      borderRadius: {
        "btn": "8px",
        "card": "12px",
        "input": "8px",
        "pill": "20px",
        "modal": "16px",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "dropdown": "0 4px 16px rgba(0,0,0,0.12)",
        "modal": "0 20px 60px rgba(0,0,0,0.15)",
      },
      maxWidth: {
        "page": "1200px",
      },
    },
  },
  plugins: [],
};
export default config;
