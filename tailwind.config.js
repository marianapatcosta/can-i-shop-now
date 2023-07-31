/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    //  './app/**/*.{js,ts,jsx,tsx}',
    // './pages/**/*.{js,ts,jsx,tsx}',
    //'./components/**/*.{js,ts,jsx,tsx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-bg-primary)',
        secondary: 'var(--color-bg-secondary)',
        text: 'var(--color-text-primary)',
        highlight: '#db2777',
      },
      spacing: {
        headerHeight: '5rem',
      },
      transitionProperty: {
        height: 'height',
      },
      screens: {
        xs: '480px',
      },
      keyframes: {
        enterUp: {
          '0%': {
            transform: 'translateY(-110vh)',
          },
          '100%': {
            transform: 'translateY(0)',
          },
        },
        exitUp: {
          '0%': {
            transform: 'translateY(0)',
          },
          '100%': {
            transform: 'translateY(-110vh)',
          },
        },
        enterRight: {
          '0%': {
            transform: 'translateX(110vh)',
          },
          '100%': {
            transform: 'translateX(0)',
          },
        },
        exitRight: {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: 'translateX(110vh)',
          },
        },
      },
      animation: {
        'enter-up': 'enterUp 0.3s ease-in forwards',
        'exit-up': 'exitUp 0.3s ease-in forwards',
        'enter-right': 'enterRight 0.3s ease-in forwards',
        'exit-right': 'exitRight 0.3s ease-in forwards',
      },
    },
  },
  plugins: [],
}
