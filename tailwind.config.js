/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0D0D0F',
          secondary: '#18181B',
          tertiary: '#27272A',
          card: '#1C1C1F',
        },
        accent: {
          DEFAULT: '#6C63FF',
          light: '#8B84FF',
          dark: '#5248E8',
        },
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        text: {
          primary: '#FAFAFA',
          secondary: '#A1A1AA',
          muted: '#71717A',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      screens: {
        'xs': '375px',
      }
    },
  },
  plugins: [],
}
