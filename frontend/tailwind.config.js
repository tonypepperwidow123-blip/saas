/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Backgrounds — true obsidian depth
        'bg-base':     '#060608',
        'bg-surface':  '#0a0a0f',
        'bg-card':     '#0e0e16',
        'bg-elevated': '#14141e',
        'bg-glass':    'rgba(255,255,255,0.025)',

        // Accent — warm amber gold
        'accent':       '#f59e0b',
        'accent-hover': '#d97706',
        'accent-dim':   'rgba(245,158,11,0.12)',
        'accent-glow':  'rgba(245,158,11,0.2)',

        // Accent 2 — cyan highlight
        'accent2':      '#06b6d4',
        'accent2-dim':  'rgba(6,182,212,0.12)',

        // Semantic
        'success':  '#10b981',
        'warning':  '#f59e0b',
        'danger':   '#f43f5e',
        'info':     '#06b6d4',

        // Typography
        'text-primary':   '#f0f0f5',
        'text-secondary': '#7c7c9a',
        'text-muted':     '#3d3d55',

        // Borders
        'border-subtle': 'rgba(255,255,255,0.055)',
        'border-strong': 'rgba(255,255,255,0.12)',
        'border-accent': 'rgba(245,158,11,0.25)',
      },
      fontSize: {
        'xs':   ['11px', { lineHeight: '16px' }],
        'sm':   ['13px', { lineHeight: '20px' }],
        'base': ['14px', { lineHeight: '22px' }],
        'md':   ['16px', { lineHeight: '24px' }],
        'lg':   ['20px', { lineHeight: '28px' }],
        'xl':   ['24px', { lineHeight: '32px' }],
        '2xl':  ['32px', { lineHeight: '40px' }],
        '3xl':  ['40px', { lineHeight: '48px' }],
        '4xl':  ['56px', { lineHeight: '62px' }],
      },
      spacing: {
        '4.5': '18px',
        '13':  '52px',
        '18':  '72px',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'glow-sm':   '0 0 12px rgba(245,158,11,0.15)',
        'glow':      '0 0 24px rgba(245,158,11,0.2)',
        'glow-lg':   '0 0 48px rgba(245,158,11,0.25)',
        'glow-cyan': '0 0 24px rgba(6,182,212,0.2)',
        'card':      '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':'0 8px 40px rgba(0,0,0,0.5)',
        'glass':     'inset 0 1px 0 rgba(255,255,255,0.06)',
        'inner-glow':'inset 0 0 20px rgba(245,158,11,0.08)',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'amber-gradient':  'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)',
        'glass-gradient':  'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-fast': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'orb-drift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':      { transform: 'translate(20px, -20px) scale(1.05)' },
          '66%':      { transform: 'translate(-10px, 15px) scale(0.97)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'progress-fill': {
          from: { width: '0%' },
          to:   { width: 'var(--progress-width)' },
        },
      },
      animation: {
        'fade-in':      'fade-in 0.4s ease forwards',
        'fade-in-fast': 'fade-in-fast 0.2s ease forwards',
        'slide-in':     'slide-in 0.35s ease forwards',
        'scale-in':     'scale-in 0.3s ease forwards',
        'shimmer':      'shimmer 2.5s linear infinite',
        'glow-pulse':   'glow-pulse 2s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'spin-slow':    'spin-slow 8s linear infinite',
        'orb-drift':    'orb-drift 10s ease-in-out infinite',
        'slide-up':     'slide-up 0.5s ease forwards',
      },
    },
  },
  plugins: [],
}
