
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fcs-bg': '#0f172a',
        'fcs-cyan': '#00f0ff',
        'fcs-magenta': '#ff00ff',
        'fcs-glass': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 10px #00f0ff, 0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-magenta': '0 0 10px #ff00ff, 0 0 20px rgba(255, 0, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
