import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#1A1A2E",
          accent: "#16213E",
          warm: "#FAF9F6",
          green: "#2D6A4F",
          amber: "#E9C46A",
          red: "#E76F51",
          teal: "#264653",
          purple: "#6C63FF",
        },
      },
      fontFamily: {
        headline: ["Playfair Display", "Georgia", "serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
