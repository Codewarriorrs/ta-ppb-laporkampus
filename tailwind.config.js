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
        // Design System: Biru Navy (Navy Blue) & Clean Modern Neutrals
        primary: {
          DEFAULT: '#1e3a8a', // Deep Navy Blue
          hover: '#172554',   // Darker Navy
          dark: '#0f172a',    // Midnight Navy
          light: '#2563eb',   // Royal Navy Blue
          50: '#f0f5ff',
          100: '#e0ebfe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#38a5f8',
          500: '#1e3a8a',
          600: '#172554',
          700: '#0f172a',
          800: '#0a0f1d',
          900: '#05070e',
        },
        background: '#f4f6fb',
        surface: {
          DEFAULT: '#ffffff',
          strong: '#f0f4fa',
          subtle: '#fafbfe',
        },
        text: {
          DEFAULT: '#0f172a',
          muted: '#64748b',
        },
        accent: {
          DEFAULT: '#0284c7', // Sky Cyan Accent
          hover: '#0369a1',
          light: '#e0f2fe',
          dark: '#075985',
        },
        mint: {
          DEFAULT: '#10b981',
          light: '#ecfdf5',
          dark: '#059669',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
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
        sm: '12px',
        md: '16px',
        lg: '24px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        'soft-3d': '0 4px 20px -4px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'card-3d': '0 10px 30px -6px rgba(15, 23, 42, 0.07), 0 2px 8px -2px rgba(15, 23, 42, 0.04)',
        'btn-3d': '0 4px 16px -2px rgba(30, 58, 138, 0.35)',
        'accent-3d': '0 4px 16px -2px rgba(2, 132, 199, 0.35)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(15, 23, 42, 0.03)',
      },
    },
  },
  plugins: [],
};
