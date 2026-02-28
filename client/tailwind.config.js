/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        netflixRed: "#e50914",
        netflixBlack: "#141414"
      },
      boxShadow: {
        panel: "0 24px 50px rgba(0, 0, 0, 0.55)"
      }
    }
  },
  plugins: []
};
