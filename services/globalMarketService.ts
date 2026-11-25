import { GlobalAssetData, Trend } from '../types';

const TV_GLOBAL_PULSE_META: Record<
  string,
  { id: string; symbol: string; name: string; category: 'INDEX' | 'CRYPTO' }
> = {
  'SP:SPX': { id: 'spx', symbol: 'SPX', name: 'S&P 500', category: 'INDEX' },
  'NASDAQ:IXIC': { id: 'ndx', symbol: 'IXIC', name: 'Nasdaq Composite', category: 'INDEX' },
  'TVC:DXY': { id: 'dxy', symbol: 'DXY', name: 'US Dollar Index', category: 'INDEX' },
  'TVC:US10Y': { id: 'us10y', symbol: 'US10Y', name: 'US 10Y Yield', category: 'INDEX' },
  'CBOE:VIX': { id: 'vix', symbol: 'VIX', name: 'Volatility Index', category: 'INDEX' },
  'BINANCE:BTCUSDT': { id: 'btc', symbol: 'BTC/USD', name: 'Bitcoin', category: 'CRYPTO' },
  'BINANCE:ETHUSDT': { id: 'eth', symbol: 'ETH/USD', name: 'Ethereum', category: 'CRYPTO' },
  'BINANCE:SOLUSDT': { id: 'sol', symbol: 'SOL/USD', name: 'Solana', category: 'CRYPTO' },
};

const BINANCE_CRYPTO_MAP: Record<string, { id: string; symbol: string; name: string }> = {
  BTCUSDT: { id: 'btc', symbol: 'BTC/USD', name: 'Bitcoin' },
  ETHUSDT: { id: 'eth', symbol: 'ETH/USD', name: 'Ethereum' },
  SOLUSDT: { id: 'sol', symbol: 'SOL/USD', name: 'Solana' },
};

class GlobalMarketService {
  private lastSnapshot: GlobalAssetData[] = [];

  async fetchGlobalPulse(): Promise<GlobalAssetData[]> {
    // 1. Primary: Express backend /api/global-quotes (strictly require JSON content-type)
    try {
      const res = await fetch(`/api/global-quotes?_t=${Date.now()}`, { cache: 'no-store' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data?.assets) && data.assets.length > 0) {
          this.lastSnapshot = data.assets.map((a: GlobalAssetData) => ({
            ...a,
            trend: (a.percentChange >= 0 ? 'Bullish' : 'Bearish') as Trend,
          }));
          return this.lastSnapshot;
        }
      }
    } catch {
      // Fall through to CORS-safe static-host fallback
    }

    // 2. Static-host fallback: TradingView Global Scanner (Content-Type: text/plain, zero preflight)
    const assetsById = new Map<string, GlobalAssetData>();
    try {
      const tvRes = await fetch('https://scanner.tradingview.com/global/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          symbols: { tickers: Object.keys(TV_GLOBAL_PULSE_META) },
          columns: ['close', 'change', 'change_abs'],
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      if (tvRes.ok) {
        const tvData = await tvRes.json();
        if (Array.isArray(tvData?.data)) {
          for (const row of tvData.data) {
            const meta = TV_GLOBAL_PULSE_META[row?.s];
            const d = row?.d;
            if (!meta || !Array.isArray(d)) continue;
            const price = Number(d[0]);
            if (!Number.isFinite(price) || price <= 0) continue;
            const percentChange = Number.isFinite(Number(d[1])) ? Number(d[1]) : 0;
            const change = Number.isFinite(Number(d[2])) ? Number(d[2]) : 0;
            assetsById.set(meta.id, {
              id: meta.id,
              symbol: meta.symbol,
              name: meta.name,
              category: meta.category,
              price: Number(price.toFixed(2)),
              change: Number(change.toFixed(2)),
              percentChange: Number(percentChange.toFixed(2)),
              trend: (percentChange >= 0 ? 'Bullish' : 'Bearish') as Trend,
            });
          }
        }
      }
    } catch {
      // Continue to Binance fallback for crypto
    }

    // 3. Tertiary Crypto Fallback: Binance public 24hr ticker (Access-Control-Allow-Origin: *)
    if (!assetsById.has('btc') || !assetsById.has('eth') || !assetsById.has('sol')) {
      try {
        const binRes = await fetch(
          'https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22,%22ETHUSDT%22,%22SOLUSDT%22%5D',
          { cache: 'no-store', signal: AbortSignal.timeout(4500) }
        );
        if (binRes.ok) {
          const rows = await binRes.json();
          if (Array.isArray(rows)) {
            for (const row of rows) {
              const meta = BINANCE_CRYPTO_MAP[row?.symbol];
              if (!meta || assetsById.has(meta.id)) continue;
              const price = Number(row.lastPrice);
              const change = Number(row.priceChange);
              const percentChange = Number(row.priceChangePercent);
              if (!Number.isFinite(price) || price <= 0) continue;
              assetsById.set(meta.id, {
                id: meta.id,
                symbol: meta.symbol,
                name: meta.name,
                category: 'CRYPTO',
                price: Number(price.toFixed(2)),
                change: Number((Number.isFinite(change) ? change : 0).toFixed(2)),
                percentChange: Number((Number.isFinite(percentChange) ? percentChange : 0).toFixed(2)),
                trend: (percentChange >= 0 ? 'Bullish' : 'Bearish') as Trend,
              });
            }
          }
        }
      } catch {
        // Ignore
      }
    }

    if (assetsById.size > 0) {
      const order = ['spx', 'ndx', 'dxy', 'us10y', 'vix', 'btc', 'eth', 'sol'];
      this.lastSnapshot = order
        .map((id) => assetsById.get(id))
        .filter((x): x is GlobalAssetData => Boolean(x));
    }

    return this.lastSnapshot;
  }
}

export const globalMarketService = new GlobalMarketService();
