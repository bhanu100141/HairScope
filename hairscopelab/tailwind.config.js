/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#e9edff',
          200: '#c9d1ff',
          300: '#a8b5ff',
          400: '#8798ff',
          500: '#657bff',
          600: '#4b60e6',
          700: '#3949b3',
          800: '#2b3780',
          900: '#1c234d',
        }
      }
    },
  },
  plugins: [],
}