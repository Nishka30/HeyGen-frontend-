/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'rgba(0, 0, 0, 0.1)', 
        background: 'hsl(var(--background) / <alpha-value>)', // Ensure Tailwind understands this
        foreground: 'hsl(var(--foreground) / <alpha-value>)', 
      },
    },
  },
  plugins: [],
};
