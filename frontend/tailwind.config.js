/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nusNavy: "#003D7C",
        nusOrange: "#EF7C00",
        ink: "#111827",
        muted: "#6B7280",
        panel: "#F8FAFC",
        line: "#E5E7EB"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(0, 61, 124, 0.09)"
      }
    }
  },
  plugins: []
};
