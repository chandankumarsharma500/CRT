import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use relative base for assets
  base: './',
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api/tv-scan': {
        target: 'https://scanner.tradingview.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tv-scan/, '')
      },
      '/api/yahoo-chart': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo-chart/, '')
      }
    }
  }
});