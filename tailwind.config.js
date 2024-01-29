/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateRows: {
        '[auto,auto,1fr]': 'auto auto 1fr',
      },
      colors: {
        gold: '#ffd700',   // You can put the actual color code for gold here
        silver: '#c0c0c0', // Actual color code for silver
        bronze: '#cd7f32', // Actual color code for bronze
      },
    },
  },
  plugins: [
    require("kutty"),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}