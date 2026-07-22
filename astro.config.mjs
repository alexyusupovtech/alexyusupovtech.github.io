// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Live URL (GitHub Pages user site — served at the root).
  site: 'https://alexyusupovtech.github.io',

  // Serve everything in ./assets directly at the site root, so files dropped
  // into assets/... are available at /... on the site.
  publicDir: './assets',
});
