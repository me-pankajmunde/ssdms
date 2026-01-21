/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#EAA636',
          light: '#F5C75D',
          dark: '#C4881F',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#D35400',
          light: '#E67E22',
        },
        saffron: '#FF6B35',
        vermillion: '#E63946',
        sandalwood: '#F4A261',
        dark: '#1E1916',
        light: '#FDF5EB',
        cream: '#FFF8F0',
        success: '#2ECC71',
        warning: '#F39C12',
        error: '#E74C3C',
      },
      fontFamily: {
        marathi: ['Noto Sans Devanagari', 'Mukta', 'sans-serif'],
        heading: ['Playfair Display', 'serif'],
        body: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
