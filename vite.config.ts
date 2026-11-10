import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api/live-stream': {
        target: 'http://localhost:10000',
        changeOrigin: true
      },
      '/api/historical-candles': {
        target: 'http://localhost:10000',
        changeOrigin: true
      },
      '/api/yahoo-chart': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\\/api\\/yahoo-chart/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': '*/*'
        }
      }
    }
  }
});
