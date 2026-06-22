import type { Config } from 'tailwindcss';

/**
 * Tailwind is mapped onto the Pulse Design System semantic tokens
 * (src/styles/pulse/tokens/*.css). shadcn/ui names (primary, muted, …)
 * resolve to Pulse tokens, so existing primitives re-theme automatically;
 * Pulse-native utilities (brand, ai, surface-*, text-*, data-*) are added too.
 */
const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        // --- shadcn bridge -------------------------------------------------
        border: 'var(--border-default)',
        input: 'var(--border-default)',
        ring: 'var(--ring-focus)',
        background: 'var(--surface-canvas)',
        foreground: 'var(--text-primary)',
        primary: {
          DEFAULT: 'var(--brand)',
          foreground: 'var(--text-on-brand)',
        },
        secondary: {
          DEFAULT: 'var(--surface-sunken)',
          foreground: 'var(--text-secondary)',
        },
        destructive: {
          DEFAULT: 'var(--error)',
          foreground: 'var(--text-on-brand)',
        },
        muted: {
          DEFAULT: 'var(--surface-offset)',
          foreground: 'var(--text-muted)',
        },
        accent: {
          DEFAULT: 'var(--brand-subtle)',
          foreground: 'var(--brand-subtle-text)',
        },
        card: {
          DEFAULT: 'var(--surface-card)',
          foreground: 'var(--text-primary)',
        },

        // --- Pulse-native semantic tokens ----------------------------------
        brand: {
          DEFAULT: 'var(--brand)',
          hover: 'var(--brand-hover)',
          active: 'var(--brand-active)',
          subtle: 'var(--brand-subtle)',
          'subtle-text': 'var(--brand-subtle-text)',
          foreground: 'var(--text-on-brand)',
        },
        ai: {
          DEFAULT: 'var(--ai)',
          hover: 'var(--ai-hover)',
          subtle: 'var(--ai-subtle)',
          'subtle-text': 'var(--ai-subtle-text)',
          border: 'var(--ai-border)',
          foreground: 'var(--text-on-brand)',
        },
        success: {
          DEFAULT: 'var(--success)',
          subtle: 'var(--success-subtle)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          subtle: 'var(--warning-subtle)',
        },
        info: {
          DEFAULT: 'var(--info)',
          subtle: 'var(--info-subtle)',
        },
        live: 'var(--live)',
        surface: {
          canvas: 'var(--surface-canvas)',
          card: 'var(--surface-card)',
          raised: 'var(--surface-raised)',
          sunken: 'var(--surface-sunken)',
          offset: 'var(--surface-offset)',
          inverse: 'var(--surface-inverse)',
        },
        ink: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          faint: 'var(--text-faint)',
          'on-dark': 'var(--text-on-dark)',
        },
        data: {
          1: 'var(--data-1)',
          2: 'var(--data-2)',
          3: 'var(--data-3)',
          4: 'var(--data-4)',
          5: 'var(--data-5)',
          6: 'var(--data-6)',
          7: 'var(--data-7)',
          8: 'var(--data-8)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        '2xs': 'var(--text-2xs)',
        '7xl': 'var(--text-7xl)',
        '6xl': 'var(--text-6xl)',
      },
      letterSpacing: {
        tighter: 'var(--tracking-tighter)',
        tight: 'var(--tracking-tight)',
        wide: 'var(--tracking-wide)',
        wider: 'var(--tracking-wider)',
        code: 'var(--tracking-code)',
      },
      maxWidth: {
        'container-sm': 'var(--container-sm)',
        'container-md': 'var(--container-md)',
        'container-lg': 'var(--container-lg)',
        'container-xl': 'var(--container-xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        'glow-brand': 'var(--glow-brand)',
        'glow-ai': 'var(--glow-ai)',
        'glow-live': 'var(--glow-live)',
      },
      backgroundImage: {
        'ai-gradient': 'var(--ai-gradient)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
        out: 'var(--ease-out)',
        in: 'var(--ease-in)',
        spring: 'var(--ease-spring)',
      },
      transitionDuration: {
        fast: '140ms',
        base: '220ms',
        slow: '420ms',
        slower: '700ms',
      },
      keyframes: {
        'pulse-live': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.35)', opacity: '0.55' },
        },
        'pulse-shimmer': {
          '0%': { backgroundPosition: '-160% 0' },
          '100%': { backgroundPosition: '160% 0' },
        },
        'pulse-grow': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'pulse-live': 'pulse-live 1.6s var(--ease-standard) infinite',
        'pulse-shimmer': 'pulse-shimmer 1.6s var(--ease-standard) infinite',
        'pulse-grow': 'pulse-grow var(--dur-slow) var(--ease-out) forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
