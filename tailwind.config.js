/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#7c3aed',
          light:   '#8b5cf6',
          dark:    '#6d28d9',
          glow:    'rgba(124,58,237,0.25)',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7c3aed, #6366f1)',
        'gradient-brand-hover': 'linear-gradient(135deg, #6d28d9, #4f46e5)',
      },
      boxShadow: {
        'glow-violet': '0 0 0 1px rgba(124,58,237,0.4), 0 0 20px rgba(124,58,237,0.2)',
        'glow-green':  '0 0 0 1px rgba(34,197,94,0.3),  0 0 16px rgba(34,197,94,0.15)',
        'card':        '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover':  '0 4px 16px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}
