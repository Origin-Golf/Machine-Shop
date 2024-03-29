/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        CastleTLig: ['var(--font-castletlig)']
      },
      transitionProperty: {
        box: "width, height, top, right, bottom, left"
      }
    },
  },
  plugins: [],
}

