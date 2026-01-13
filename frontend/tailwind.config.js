/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a1128',
          light: '#131e3d',
          dark: '#050916',
        },
        charcoal: {
          DEFAULT: '#1c1c1e',
          light: '#2c2c2e',
          dark: '#121213',
        },
        'off-white': {
          DEFAULT: '#f5f5f7',
        },
        'light-gray': {
          DEFAULT: '#e5e5ea',
        },
        yellow: {
          DEFAULT: '#ffcc00',
        },
        orange: {
          DEFAULT: '#ff6700',
        },
        success: {
          DEFAULT: '#34c759',
        },
        alert: {
          DEFAULT: '#ff3b30',
        },
        info: {
          DEFAULT: '#007aff',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        logo: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
