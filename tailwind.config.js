/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1980px',
        '4xl': '2400px',
        // => @media (min-width: 992px) { ... }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors:{
        primary: "#BBD18A",
        secondary: "#131316",
        tertiary: "#E4EEF1",
        quartiary: "#BBD18A",
        quintiary: "#FFFFFF",
      }
    },
  },
  variants: {
    extend: {
      padding: ['hover'],
      width: ['hover'],
      margin: ['hover'],
      height: ['hover'],
    },
  },
  plugins: [],
}
