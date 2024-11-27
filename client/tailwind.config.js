/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        linkedin: '#0077b5',
        dark : {
          bg: '#1a1a1a',
          card: '#2d2d2d',
          text: '#e5e5e5'
        }
      },
      animation: {
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'bounce-slow': 'bounce 3s infinite',
        'fade-in': 'fadeIn 1s ease-out',
        'fade-in-delay-1': 'fadeIn 1s ease-out 0.5s both',
        'fade-in-delay-2': 'fadeIn 1s ease-out 1s both',
        'fade-in-delay-3': 'fadeIn 1s ease-out 1.5s both',
      },
      keyframes: {
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'fadeIn': {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(20px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          }
        }
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        'mobile-lg': '430px',
      },
      spacing: {
        '88': '22rem',
        '128': '32rem',
      },
      fontSize: {
        '2xs': '0.625rem',
        'mobile-lg': '1.125rem',
      },
    },
  },
  plugins: [],
}