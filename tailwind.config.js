import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  // The admin panel is styled by AdminLTE, so it is excluded from the Tailwind scan.
  content: ['./index.html', './src/**/*.{ts,tsx}', '!./src/admin/**'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Kanit', 'sans-serif'],
      },
    },
  },
  plugins: [typography],
};
