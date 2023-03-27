export default {
  plugins: [],
  theme: {
    letterSpacing: {
      tighter: -'0.05em',
      tight: -'0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.4em'
    },
    extend: {},
  },
  content: ['./src/**/*.{svelte,js,ts}'], // for unused CSS
  variants: {
    extend: {},
  },
  darkMode: false, // or 'media' or 'class'
}
