import { defineConfig } from 'vite';

export default defineConfig({
  // Root is the project root (index.html lives here)
  root: '.',

  // Source code lives in src/
  resolve: {
    alias: {
      '@': '/src',
      '@core': '/src/core',
      '@ar': '/src/ar',
      '@math': '/src/math',
      '@vectors': '/src/vectors',
      '@scenes': '/src/scenes',
      '@animations': '/src/animations',
      '@ui': '/src/ui',
      '@utils': '/src/utils',
      '@assets': '/src/assets',
    },
  },

  // Dev server config
  server: {
    port: 3000,
    open: true,
    // HTTPS needed for WebXR on non-localhost
    // https: true,
  },

  // Build config
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
  },
});
