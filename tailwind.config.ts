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
        primary: {
          DEFAULT: "aqua",
          50: "#e0ffff",
          100: "#b3ffff",
          200: "#80ffff",
          300: "#4dffff",
          400: "#00ffff",  // aqua
          500: "#00e5e5",
          600: "#00b3b3",
          700: "#008080",  // teal
          800: "#006688",
          900: "#004d66",
        },
        sage: {
          dark: "rgb(22, 40, 50)",
          darker: "rgba(0,0,0,0.9)",
        },
      },
      backgroundImage: {
        "sage-gradient": "linear-gradient(to bottom, rgba(0,0,0,0.9), rgb(22,40,50), rgba(0,0,0,0.9))",
        "sage-gradient-nav": "linear-gradient(to bottom, rgba(0,0,0,0.9), rgb(22,40,50), rgba(0,0,0,0.9))",
      },
      fontFamily: {
        sans: ["Segoe UI", "Verdana", "Arial", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      animation: {
        "spin-slow": "spin 2s linear infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      gridTemplateColumns: {
        "layout": "25% 50% 25%",
        "layout-md": "0 100% 0",
      },
    },
  },
  plugins: [],
};

export default config;
