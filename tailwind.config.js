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
          primary: '#7A2E39', 
          accent: '#E88D94',  
          light: '#FFF0F5',   
          peach: '#FFE4E1',   
          text: '#555555',    
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #FFF0F5 0%, #FFDAB9 100%)',
      }
    },
  },
  plugins: [],
}