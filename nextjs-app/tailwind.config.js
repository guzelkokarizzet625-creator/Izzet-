/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0d0f14',
        charcoal: '#171a23',
        slateGrey: '#2c313d',
        goldLight: '#f5e3b5',
        goldDark: '#d4af37',
        amberAccent: '#ffbf00',
        ivory: '#f8f9fa',
        softGrey: '#9ca3af',
        successGreen: '#10b981',
        warningOrange: '#f59e0b',
        errorRed: '#ef4444'
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
