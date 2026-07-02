/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        sf: {
          bg:      '#0A0A14',
          surface: '#111120',
          card:    '#15152A',
          border:  '#1E1E38',
          hover:   '#1C1C34',
          purple:  '#6C63FF',
          teal:    '#00D4AA',
          pink:    '#FF6B9D',
          amber:   '#FFB347',
          blue:    '#4DA6FF',
          text1:   '#F0F0FF',
          text2:   '#9090B8',
          text3:   '#50507A',
          success: '#00D4AA',
          warning: '#FFB347',
          error:   '#FF5E7A',
        },
      },
      boxShadow: {
        'glow-purple': '0 0 24px rgba(108,99,255,0.25)',
        'glow-teal':   '0 0 24px rgba(0,212,170,0.25)',
        'card':        '0 4px 24px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-in':  'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
