import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      '@prism-tv/core': path.resolve(__dirname, '../../packages/core/src')
    }
  },
  build: { outDir: 'dist' }
});
