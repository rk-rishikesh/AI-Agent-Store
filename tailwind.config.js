/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
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
    },
  },
  plugins: [],
};
