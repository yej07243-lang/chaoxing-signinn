/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        mist: '#f4f7fb',
        sky: '#d7e6ff',
        accent: '#0f172a',
        success: '#0f766e',
        danger: '#b91c1c',
      },
      fontFamily: {
        sans: ['Manrope', '"SF Pro Display"', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 24px 60px rgba(15, 23, 42, 0.12)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 500ms ease-out both',
      },
    },
  },
  plugins: [],
};
