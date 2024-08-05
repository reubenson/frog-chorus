// configuration notes taken from https://medium.com/@mdwikycahyo/how-to-set-up-svelte-using-vite-and-tailwind-css-617040ebccec

import postcss from './postcss.config.js';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: './docs',
  },
  css: {
    postcss,
  },
});
