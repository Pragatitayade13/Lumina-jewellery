/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/admin/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // We'll manage dark mode via class on the .admin-root
  corePlugins: {
    preflight: false, // CRITICAL: Protect the storefront from global resets!
  },
  theme: {
    extend: {
      colors: {
        admin: {
          dark: {
            bg: '#050816',
            surface: '#0B1220',
            card: 'rgba(10,20,40,0.65)',
            border: 'rgba(255,255,255,0.08)',
            textPrimary: '#F5F5F5',
            textSecondary: '#B8C2D1',
            accent: '#102B46'
          },
          light: {
            bg: '#FDFBF7',
            surface: '#F5F2EB',
            card: 'rgba(255,255,255,0.85)',
            border: 'rgba(212, 175, 55, 0.2)',
            textPrimary: '#1A1A1A',
            textSecondary: '#4A4A4A',
            accent: '#E6DFD1'
          },
          primary: {
            gold: '#D4AF37',
            goldHover: '#F3E5AB'
          }
        }
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 10px 40px rgba(0, 0, 0, 0.5)',
        'luxury-light': '0 10px 40px rgba(212, 175, 55, 0.1)',
        glow: '0 0 20px rgba(212, 175, 55, 0.3)',
      }
    },
  },
  plugins: [],
}
