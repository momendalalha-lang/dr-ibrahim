import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // relative base so the build works on GitHub Pages project sites
  // (user.github.io/<repo>/) and on any custom domain later
  base: './',
  plugins: [react(), tailwindcss()],
});
