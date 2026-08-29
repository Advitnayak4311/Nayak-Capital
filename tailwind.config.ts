import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07090E",
        foreground: "#F8FAFC",
        charcoal: {
          50: "#F1F3F7",
          100: "#E1E5ED",
          200: "#C2C9D9",
          300: "#98A3BC",
          400: "#6F7C9C",
          500: "#505C7B",
          600: "#3B445D",
          700: "#272E3F",
          800: "#161B26",
          850: "#10141D",
          900: "#0B0E14",
          950: "#06070B",
        },
        gold: {
          50: "#FAF6E8",
          100: "#F3EAC6",
          200: "#EAD99B",
          300: "#DFC36D",
          400: "#D4AF37",
          500: "#C5A059",
          600: "#A98539",
          700: "#876628",
          800: "#60471A",
          900: "#3B2B0F",
          950: "#221706",
        },
        accent: {
          gold: "#D4AF37",
          goldLight: "#F3EAC6",
          goldMuted: "rgba(212, 175, 55, 0.15)",
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F3EAC6 0%, #D4AF37 50%, #A98539 100%)",
        "gold-metallic": "linear-gradient(135deg, #E6CA65 0%, #C5A059 40%, #876628 70%, #DFC36D 100%)",
        "dark-gradient": "linear-gradient(180deg, #10141D 0%, #07090E 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(22, 27, 38, 0.7) 0%, rgba(11, 14, 20, 0.9) 100%)",
        "radial-gold": "radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.15), transparent 70%)",
      },
      boxShadow: {
        "gold-sm": "0 0 12px rgba(212, 175, 55, 0.12)",
        "gold-md": "0 0 24px rgba(212, 175, 55, 0.18)",
        "gold-lg": "0 0 40px rgba(212, 175, 55, 0.25)",
        "card-luxury": "0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.12)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
