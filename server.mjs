import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT) || 10000;
const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const USER_AGENT = 'Mozilla/5.0 (compatible; CRT-Market-Data/1.0)';

async function yahooJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
  const body = await response.text();
  return { response, body };
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/live-stream', async (_req, res) => {
  try {
    const tvTickers = [
      'NSE:NIFTY', 'NSE:BANKNIFTY', 'NSE:CNXFINANCE', 'BSE:SENSEX',
      'NSE:CNXMIDCAP', 'NSE:RELIANCE', 'NSE:HDFCBANK', 'NSE:ICICIBANK',
      'NSE:TCS', 'NSE:INFY'
    ];
    const tvPromise = fetch('https://scanner.tradingview.com/india/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
      body: JSON.stringify({
        symbols: { tickers: tvTickers },
        columns: ['close', 'change', 'change_abs', 'high', 'low', 'open', 'volume']
      })
    }).then(async response => response.ok ? response.json() : null).catch(() => null);

    const yahooSymbols = ['%5ENSEI', '%5ENSEBANK', '%5EBSESN'];
    const yahooPromises = yahooSymbols.map(symbol =>
      yahooJson(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`)
        .then(({ response, body }) => response.ok ? JSON.parse(body) : null)
        .catch(() => null)
    );
    const [tvData, ...yahooData] = await Promise.all([tvPromise, ...yahooPromises]);
    res.json({ status: 'LIVE_OK', timestamp: Date.now(), tvData, yahooData });
  } catch (error) {
    res.status(502).json({ status: 'ERROR', error: error instanceof Error ? error.message : 'Market data unavailable' });
  }
});

app.get('/api/historical-candles', async (req, res) => {
  try {
    const rawSymbol = String(req.query.symbol || '%5ENSEI');
    const symbol = decodeURIComponent(rawSymbol);
    const range = String(req.query.range || '3mo');
    const interval = String(req.query.interval || '1d');
    if (!/^[A-Za-z0-9^=._-]+$/.test(symbol) || !/^(1d|5d|1mo|3mo|6mo|1y|2y|5y|max)$/.test(range) ||
        !/^(1m|2m|5m|15m|30m|60m|90m|1h|1d|5d|1wk|1mo|3mo)$/.test(interval)) {
      return res.status(400).json({ status: 'ERROR', error: 'Invalid symbol, range, or interval' });
    }
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(range)}`;
    const { response, body } = await yahooJson(url);
    res.status(response.status).type('application/json').send(body);
  } catch (error) {
    res.status(502).json({ status: 'ERROR', error: error instanceof Error ? error.message : 'Historical data unavailable' });
  }
});

app.get('/api/yahoo-chart/*', async (req, res) => {
  try {
    const suffix = req.originalUrl.replace(/^\/api\/yahoo-chart/, '');
    const { response, body } = await yahooJson(`https://query1.finance.yahoo.com${suffix}`);
    res.status(response.status).type(response.headers.get('content-type') || 'application/json').send(body);
  } catch (error) {
    res.status(502).json({ status: 'ERROR', error: error instanceof Error ? error.message : 'Yahoo Finance unavailable' });
  }
});

app.use(express.static(dist, { index: false }));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ status: 'NOT_FOUND' });
  res.sendFile(path.join(dist, 'index.html'), error => error && next(error));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`CRT production server listening on port ${port}`);
});
