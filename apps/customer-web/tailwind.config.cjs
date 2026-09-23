/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@bta/shadcn/tailwind.preset.cjs')],
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/shadcn/src/**/*.{ts,tsx}'],
  plugins: [],
};
