import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For GitHub Pages set base to '/coffee-website/' (and add a 404.html copy of index.html for SPA routing).
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: { port: 5173 }
});
