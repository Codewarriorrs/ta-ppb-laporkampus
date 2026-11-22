/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Quicksand', 'Inter', 'Poppins', 'system-ui', 'sans-serif'],
        display: ['Quicksand', 'Poppins', 'sans-serif'],
        body: ['Inter', 'Quicksand', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Soft 3D Illustration Design System Tokens
        primary: {
          DEFAULT: '#6d5ae6',
          hover: '#5b47dc',
          dark: '#4b37be',
          light: '#8575ea',
          50: '#f6f4ff',
          100: '#eeeaff',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#6d5ae6',
          600: '#5b47dc',
          700: '#4b37be',
          800: '#3c2b9a',
          900: '#2d1f76',
        },
        background: '#eef1fb',
        surface: {
          DEFAULT: '#ffffff',
          strong: '#f6f4ff',
          subtle: '#fafbfe',
        },
        text: {
          DEFAULT: '#2d2a45',
          muted: '#6b6690',
        },
        accent: {
          DEFAULT: '#ff9e7d',
          hover: '#f88c67',
          light: '#ffebe5',
          dark: '#e8734d',
        },
        mint: {
          DEFAULT: '#7be0c4',
          light: '#e6faf5',
          dark: '#4bc7a5',
        },
        neutral: {
          50: '#fafbfe',
          100: '#eef1fb',
          200: '#dfe4f4',
          300: '#c7cee5',
          400: '#9fa8c7',
          500: '#6b6690',
          600: '#544f77',
          700: '#3e3a5e',
          800: '#2d2a45',
          900: '#1d1a32',
        },
        success: {
          DEFAULT: '#10b981',
          light: '#ecfdf5',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fffbeb',
          dark: '#d97706',
        },
        danger: {
          DEFAULT: '#ef4444',
          light: '#fef2f2',
          dark: '#dc2626',
        },
      },
      borderRadius: {
        sm: '16px',
        md: '24px',
        lg: '32px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'soft-3d': '0 12px 32px -8px rgba(109, 90, 230, 0.16), 0 4px 12px 0 rgba(45, 42, 69, 0.04)',
        'card-3d': '0 16px 36px -10px rgba(109, 90, 230, 0.12), 0 4px 16px -2px rgba(45, 42, 69, 0.05)',
        'btn-3d': '0 8px 24px -4px rgba(109, 90, 230, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
        'accent-3d': '0 8px 24px -4px rgba(255, 158, 125, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(45, 42, 69, 0.04)',
      },
    },
  },
  plugins: [],
};
