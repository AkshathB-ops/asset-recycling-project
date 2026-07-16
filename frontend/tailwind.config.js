/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14181C",
        panel: "#1C2126",
        paper: "#EDEAE2",
        steel: "#7C8791",
        line: "#2A3138",
        amber: "#D98E04",
        verified: "#5FBF88",
        redact: "#E17777",
      },
      fontFamily: {
        mono: ["'IBM Plex Mono'", "monospace"],
        sans: ["'IBM Plex Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
