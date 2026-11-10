import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function liveMarketPlugin(): Plugin {
  return {
    name: 'live-market-provider',
    configureServer(server) {
      server.middlewares.use('/api/live-stream', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        try {
          // Fetch from TradingView scanner for Indian market
          const tvTickers = [
            'NSE:NIFTY',
            'NSE:BANKNIFTY',
            'NSE:CNXFINANCE',
            'BSE:SENSEX',
            'NSE:CNXMIDCAP',
            'NSE:RELIANCE',
            'NSE:HDFCBANK',
            'NSE:ICICIBANK',
            'NSE:TCS',
            'NSE:INFY'
          ];
          const tvPromise = fetch('https://scanner.tradingview.com/india/scan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
              symbols: { tickers: tvTickers },
              columns: ['close', 'change', 'change_abs', 'high', 'low', 'open', 'volume']
            })
          }).then(r => r.json()).catch(() => null);

          // Fetch Yahoo Finance NIFTY, BANKNIFTY, SENSEX in parallel
          const yahooSymbols = ['%5ENSEI', '%5ENSEBANK', '%5EBSESN'];
          const yahooPromises = yahooSymbols.map(sym =>
            fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
              }
            }).then(r => r.json()).catch(() => null)
          );

          const [tvData, ...yahooData] = await Promise.all([tvPromise, ...yahooPromises]);

          res.end(JSON.stringify({
            status: 'LIVE_OK',
            timestamp: Date.now(),
            tvData,
            yahooData
          }));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ status: 'ERROR', error: err?.message || String(err) }));
        }
      });

      server.middlewares.use('/api/historical-candles', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        try {
          const urlObj = new URL(req.url || '', `http://${req.headers.host}`);
          const symbol = urlObj.searchParams.get('symbol') || '%5ENSEI';
          const range = urlObj.searchParams.get('range') || '3mo';
          const interval = urlObj.searchParams.get('interval') || '1d';

          const target = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
          const response = await fetch(target, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
          });
          const json = await response.json();
          res.end(JSON.stringify(json));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ status: 'ERROR', error: err?.message || String(err) }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), liveMarketPlugin()],
  // Use relative base for assets
  base: './',
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
        rewrite: (path) => path.replace(/^\/api\/tv-scan/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        }
      },
      '/api/yahoo-chart': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo-chart/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': '*/*'
        }
      }
    }
  }
});