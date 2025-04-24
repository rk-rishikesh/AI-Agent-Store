/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        funnel: ['"Funnel Display"', "sans-serif"],
      },
      colors: {
        primary: "#f02d34",
        softPurple: "#f8e6fe",
        textDark: "#324d67",
        textMuted: "#5f5f5f",
      },
      spacing: {
        450: "450px",
        500: "500px",
      },
      fontSize: {
        "10xl": "10em",
      },
      zIndex: {
        10000: "10000",
      },
      margin: {
        "-20": "-20px",
      },
      keyframes: {
        progress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        }
      },
      animation: {
        progress: 'progress 3s ease-in-out infinite'
      }
    },
  },
  plugins: [],
};
