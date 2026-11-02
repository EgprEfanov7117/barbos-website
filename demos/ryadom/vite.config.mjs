import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/demos/ryadom/',
  plugins: [react()],
  build: { outDir: fileURLToPath(new URL('../../public/demos/ryadom', import.meta.url)), emptyOutDir: true },
});
