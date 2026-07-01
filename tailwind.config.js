/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ember: {
          300: "#ffd166",
          400: "#ffb238",
          500: "#ff8a1f",
        },
        reactor: {
          cyan: "#31e8ff",
          blue: "#2778ff",
          magenta: "#ff4fd8",
          green: "#66f6a5",
        },
      },
      boxShadow: {
        amber: "0 0 28px rgba(255, 178, 56, 0.28)",
        cyan: "0 0 24px rgba(49, 232, 255, 0.24)",
        magenta: "0 0 24px rgba(255, 79, 216, 0.2)",
      },
      fontFamily: {
        display: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
