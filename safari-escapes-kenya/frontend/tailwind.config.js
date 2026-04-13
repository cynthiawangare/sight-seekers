/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy (keep for admin/auth pages)
        'blue-primary': '#1A5276',
        'blue-light': '#2E86C1',
        'brown-primary': '#6E4B2A',
        'brown-light': '#A0724A',
        'off-white': '#FAFAFA',
        'gray-light': '#F2F3F4',
        'gray-mid': '#BDC3C7',
        // New design system
        'warm-white': '#F8F7F4',
        'near-black': '#1A1A18',
        'earth-brown': '#6E4B2A',
        'savanna-gold': '#C8973A',
        'forest-green': '#0D1F1A',
        'sticky-yellow': '#FDE68A',
      },
      fontFamily: {
        'serif': ['"Cormorant Garamond"', 'Georgia', 'serif'],
        'sans': ['"DM Sans"', 'system-ui', 'sans-serif'],
        'hand': ['"Caveat"', 'cursive'],
        // Legacy
        'playfair': ['"Cormorant Garamond"', 'serif'],
      },
      boxShadow: {
        'card': '0 8px 40px rgba(0,0,0,0.12), 0 2px 12px rgba(0,0,0,0.06)',
        'card-lg': '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
        'float': '0 24px 64px rgba(0,0,0,0.18), 0 6px 20px rgba(0,0,0,0.10)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-fast': 'float 4.5s ease-in-out infinite',
        'scroll-left': 'scrollLeft 30s linear infinite',
        'scroll-left-fast': 'scrollLeft 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        scrollLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
