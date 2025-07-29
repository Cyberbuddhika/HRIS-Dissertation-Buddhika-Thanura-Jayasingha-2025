/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.handlebars"],
  safelist: ["bg-customLime", "bg-customOrange", "bg-customGreen"],
  theme: {
    extend: {
      colors: {
        primary: "#022534",
        secondary: {
          100: "#A0BACC",
          200: "#08546C",
          300: "#F4F6F7",
          400: "#3187bc",
          500: "#d0383f",
          600: "#3187bc",
          700: "#C6F8FF",
          800: "#08546C",
          900: "#f2f2f3",
        },
        customlime: "#D9F99D", // Corrected color names
        customorange: "#DD6B20",
        customgreen: "#48BB78",
      },
      fontFamily: {
        inter: ["Inter"],
      },
    },
  },
  plugins: [],
};
