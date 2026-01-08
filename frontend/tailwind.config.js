/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Red Cross brand colors
        'rc-red': '#ed1c24',
        'rc-red-dark': '#c41e3a',
        'rc-gray': '#58595b',
        'rc-light-gray': '#f5f5f5',
      },
    },
  },
  plugins: [],
}
