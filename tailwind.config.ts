import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#020202",
        panel: "#080808",
        surface: "#0c0c0c",
        "terminal-green": "#00ff94",
        "terminal-green-glow": "rgba(0, 255, 148, 0.4)",
        "cyber-purple": "#7b61ff",
        "cyber-purple-glow": "rgba(123, 97, 255, 0.4)",
        "system-error": "#ff3333",
        "holo-blue": "#00d4ff",
        "border-subtle": "rgba(255, 255, 255, 0.05)",
        "border-glow": "rgba(0, 255, 148, 0.2)",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)',
        'scanlines': 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02))',
      },
      animation: {
        flicker: 'flicker 4s infinite linear',
        'pulse-glow': 'pulse-glow 2s infinite ease-in-out',
      },
      keyframes: {
        flicker: {
          '0%, 10%, 20%, 100%': { opacity: '0.9' },
          '5%': { opacity: '0.8' },
          '15%': { opacity: '0.7' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
