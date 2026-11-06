import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Source files keep the .js extension (JSX inside), so enable JSX handling for .js.
export default defineConfig({
  plugins: [react({ include: /\.(js|jsx)$/ })],
  esbuild: { loader: 'jsx', include: /src\/.*\.jsx?$/, exclude: [] },
  optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
  build: { outDir: 'build' },
});
