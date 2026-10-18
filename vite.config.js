import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { SITE_URL } from './src/data/profile.js';

export default defineConfig({
  plugins: [
    react(),
    { name: 'site-url', transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', SITE_URL) },
  ],
  build: { target: 'es2020', cssCodeSplit: true, chunkSizeWarningLimit: 600 }, // three.js chunk is lazy-loaded
});
