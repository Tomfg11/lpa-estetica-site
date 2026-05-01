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
      },
      borderWidth: {
        '3': '3px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
        shimmer: 'shimmer 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}