import tailwindcss from 'tailwindcss';
import nesting from 'tailwindcss/nesting';
import tailwindConfig from './tailwind.config.js'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    tailwindcss(tailwindConfig),
    autoprefixer,
    nesting
  ]
}
