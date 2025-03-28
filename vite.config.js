import { defineConfig } from 'vite';

export default defineConfig({
  // Basic configuration
  root: '.',
  publicDir: 'public',
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  
  // Server configuration
  server: {
    port: 3000,
    open: true
  }
}); 