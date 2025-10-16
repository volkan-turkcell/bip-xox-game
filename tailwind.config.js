/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        bip: {
          blue: "#03A9F4",
          yellow: "#FFD826",
          white: "#FFFFFF",
          pink: "#DF0080",
          purple: "#990DC6",
          light: "#E8F6FD",
          ink: "#002231",
        },
      },
    },
  },
  plugins: [],
};
