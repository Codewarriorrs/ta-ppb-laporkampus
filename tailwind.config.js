/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1A3F8F',
          light: '#2356C4',
          dark: '#0F2660',
        },
        accent: {
          DEFAULT: '#F5C400',
          dark: '#C49B00',
        },
        neutral: {
          50: '#F7F8FC',
          100: '#E8ECF4',
          200: '#D1D7E6',
          400: '#9099AE',
          700: '#3D4560',
          900: '#111827',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
          dark: '#15803D',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
          dark: '#B45309',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
          dark: '#B91C1C',
        },
        // Alias backward compatibility
        brand: {
          50: '#F7F8FC',
          100: '#E8ECF4',
          200: '#D1D7E6',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2356C4',
          600: '#1A3F8F',
          700: '#0F2660',
          800: '#0c1f4d',
          900: '#081433',
        }
      }
    },
  },
  plugins: [],
}
