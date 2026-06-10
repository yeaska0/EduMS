/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT:'#6c63ff', dark:'#4a42d4', light:'#8b85ff' },
        surface: { DEFAULT:'#13162b', card:'rgba(255,255,255,0.04)', hover:'rgba(255,255,255,0.08)' },
      },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] },
    }
  },
  plugins: []
}
