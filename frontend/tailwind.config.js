/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds — layered depth system
        'bg-base': '#080810',
        'bg-surface': '#0f0f1a',
        'bg-card': '#141420',
        'bg-elevated': '#1a1a2e',

        // Accent
        'accent': '#6366f1',
        'accent-hover': '#4f46e5',

        // Semantic
        'success': '#10b981',
        'warning': '#f59e0b',
        'danger': '#ef4444',
        'info': '#3b82f6',

        // Typography
        'text-primary': '#f1f1f8',
        'text-secondary': '#8b8ba8',
        'text-muted': '#4b4b6a',

        // Borders
        'border-subtle': 'rgba(255, 255, 255, 0.08)',
        'border-strong': 'rgba(255, 255, 255, 0.15)',
      },
      fontSize: {
        'xs': '11px',
        'sm': '13px',
        'base': '14px',
        'md': '16px',
        'lg': '20px',
        'xl': '28px',
        '2xl': '40px',
      },
      spacing: {
        '4.5': '18px',
      },
    },
  },
  plugins: [],
}
