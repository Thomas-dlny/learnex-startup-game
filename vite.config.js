import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' : le build fonctionne sur GitHub Pages, Netlify ou Vercel sans réglage.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
});
