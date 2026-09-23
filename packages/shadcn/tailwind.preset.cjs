// Re-export preset BTA từ design/tokens (nguồn sự thật). apps/*: presets: [require('@bta/shadcn/tailwind.preset.cjs')]
const base = require('../../design/tokens/tailwind.preset.cjs');
module.exports = {
  ...base,
  darkMode: ['class'],
  theme: {
    ...base.theme,
    extend: {
      ...base.theme.extend,
      colors: {
        ...base.theme.extend.colors,
        // shadcn semantic aliases (rgb vars từ tokens.css)
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        'card-foreground': 'rgb(var(--card-foreground) / <alpha-value>)',
        popover: 'rgb(var(--popover) / <alpha-value>)',
        'popover-foreground': 'rgb(var(--popover-foreground) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        'secondary-foreground': 'rgb(var(--secondary-foreground) / <alpha-value>)',
        destructive: 'rgb(var(--destructive) / <alpha-value>)',
        'destructive-foreground': 'rgb(var(--destructive-foreground) / <alpha-value>)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'zoom-in': { from: { opacity: '0', transform: 'scale(.97)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in .15s ease-out',
        'slide-in-right': 'slide-in-right .2s ease-out',
        'zoom-in': 'zoom-in .15s ease-out',
      },
    },
  },
};
