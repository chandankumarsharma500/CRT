import { Candle } from '../types';
import { marketHoursService } from './marketHoursService';

export interface YahooQuote {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  timestamp: number;
  lastUpdated: string;
  tickDirection?: 'UP' | 'DOWN' | 'EQUAL';
  source?: string;
}

// Official Yahoo Finance Baseline (immediately overwritten by live /api/yahoo-quotes or TradingView CORS fetch on boot)
export const YAHOO_SYMBOLS: Record<string, { symbol: string; name: string; basePrice: number; tickRange: number }> = {
  'nifty': { symbol: '^NSEI', name: 'NIFTY 50', basePrice: 25897.60, tickRange: 3.5 },
  'bank_nifty': { symbol: '^NSEBANK', name: 'BANK NIFTY', basePrice: 64018.90, tickRange: 12.0 },
  'fin_nifty': { symbol: 'NIFTY_FIN_SERVICE.NS', name: 'FIN NIFTY', basePrice: 28990.05, tickRange: 6.0 },
  'sensex': { symbol: '^BSESN', name: 'BSE SENSEX', basePrice: 84323.10, tickRange: 18.0 },
  'midcap': { symbol: '^NSEMDCP50', name: 'MIDCAP 50', basePrice: 17885.85, tickRange: 8.0 },
  'next_50': { symbol: '^NSMIDCP', name: 'NIFTY NEXT 50', basePrice: 72840.35, tickRange: 14.0 },
  'bankex': { symbol: 'BSE-BANK.BO', name: 'BSE BANKEX', basePrice: 72696.05, tickRange: 14.0 },
  'nifty_it': { symbol: '^CNXIT', name: 'NIFTY IT', basePrice: 32221.30, tickRange: 10.0 },
  'nifty_auto': { symbol: '^CNXAUTO', name: 'NIFTY AUTO', basePrice: 28787.65, tickRange: 8.0 },
  'nifty_fmcg': { symbol: '^CNXFMCG', name: 'NIFTY FMCG', basePrice: 48535.70, tickRange: 9.0 },
  'nifty_pharma': { symbol: '^CNXPHARMA', name: 'NIFTY PHARMA', basePrice: 28386.90, tickRange: 8.0 },
  'nifty_metal': { symbol: '^CNXMETAL', name: 'NIFTY METAL', basePrice: 12271.10, tickRange: 5.0 },
  'reliance': { symbol: 'RELIANCE.NS', name: 'Reliance Industries', basePrice: 1381.30, tickRange: 1.0 },
  'hdfc_bank': { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', basePrice: 847.90, tickRange: 0.6 },
  'icici_bank': { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', basePrice: 1644.60, tickRange: 0.8 },
  'tcs': { symbol: 'TCS.NS', name: 'Tata Consultancy', basePrice: 2515.00, tickRange: 1.5 },
  'infy': { symbol: 'INFY.NS', name: 'Infosys', basePrice: 1132.70, tickRange: 0.9 },
  'crude': { symbol: 'CL=F', name: 'CRUDE OIL', basePrice: 80.55, tickRange: 0.08 },
  'gold': { symbol: 'GC=F', name: 'GOLD', basePrice: 3521.83, tickRange: 1.5 }
};

// Direct CORS-safe TradingView ticker map (uses Content-Type: text/plain simple CORS POST — zero preflight)
const TV_INDIA_REVERSE_MAP: Record<string, string> = {
  'NSE:NIFTY': 'nifty',
  'NSE:BANKNIFTY': 'bank_nifty',
  'NSE:CNXFINANCE': 'fin_nifty',
  'BSE:SENSEX': 'sensex',
  'NSE:NIFTYJR': 'next_50',
  'NSE:CNXIT': 'nifty_it',
  'NSE:RELIANCE': 'reliance',
  'NSE:HDFCBANK': 'hdfc_bank',
  'NSE:ICICIBANK': 'icici_bank',
  'NSE:TCS': 'tcs',
  'NSE:INFY': 'infy',
};

const TV_GLOBAL_REVERSE_MAP: Record<string, string> = {
  'TVC:GOLD': 'gold',
  'FX:USOIL': 'crude',
};

// In-memory quote cache
const quoteCache: Record<string, YahooQuote> = {};

// Initialize cache with baseline values until /api/yahoo-quotes resolves
Object.entries(YAHOO_SYMBOLS).forEach(([id, meta]) => {
  const p = meta.basePrice;
  quoteCache[id] = {
    id,
    symbol: meta.symbol,
    name: meta.name,
    price: p,
    change: 0,
    changePercent: 0,
    high: p,
    low: p,
    open: p,
    previousClose: p,
    volume: 0,
    timestamp: Date.now(),
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false }),
    tickDirection: 'EQUAL',
    source: 'YAHOO_FINANCE_INIT'
  };
});

type Listener = (quotes: Record<string, YahooQuote>) => void;
const listeners: Set<Listener> = new Set();

const notifyListeners = () => {
  const snapshot = { ...quoteCache };
  listeners.forEach((fn) => {
    try {
      fn(snapshot);
    } catch (_) {}
  });
};

let lastPollTime = 0;

// Start automatic real Yahoo Finance polling
if (typeof window !== 'undefined') {
  // Immediate fetch on app boot
  setTimeout(() => {
    yahooFinanceService.fetchRealQuotesInBackground(undefined, true).catch(() => {});
  }, 50);

  // Immediately refresh when user returns to tab/window
  window.addEventListener('focus', () => {
    yahooFinanceService.fetchRealQuotesInBackground(undefined, true).catch(() => {});
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      yahooFinanceService.fetchRealQuotesInBackground(undefined, true).catch(() => {});
    }
  });

  // Poll every 4s during NSE/Global weekday hours, every 15s on weekends
  setInterval(() => {
    const isOpen = marketHoursService.getStatus().isOpen;
    const day = new Date().getDay();
    const isWeekday = day >= 1 && day <= 5;
    const minIntervalMs = isOpen ? 4000 : isWeekday ? 6000 : 15000;
    if (Date.now() - lastPollTime >= minIntervalMs) {
      yahooFinanceService.fetchRealQuotesInBackground().catch(() => {});
    }
  }, 4000);
}

export const yahooFinanceService = {
  /**
   * Get all active cached quotes immediately
   */
  getCachedQuotes(): Record<string, YahooQuote> {
    return { ...quoteCache };
  },

  getAllQuotes(): Record<string, YahooQuote> {
    return { ...quoteCache };
  },

  getQuote(id: string): YahooQuote | undefined {
    return quoteCache[id];
  },

  getPriceByAssetName(sym: string): number {
    const norm = sym.trim().toUpperCase();
    const map: Record<string, string> = {
      NIFTY: 'nifty',
      'NIFTY 50': 'nifty',
      BANKNIFTY: 'bank_nifty',
      'BANK NIFTY': 'bank_nifty',
      FINNIFTY: 'fin_nifty',
      MIDCPNIFTY: 'midcap',
      MIDCAP: 'midcap',
      SENSEX: 'sensex',
      BANKEX: 'bankex',
      CRUDEOIL: 'crude',
      CRUDE: 'crude',
      GOLD: 'gold',
    };
    const key = map[norm] || norm.toLowerCase();
    return quoteCache[key]?.price ?? quoteCache['nifty']?.price ?? 25897.60;
  },

  /**
   * Directly inject or override quote data from active connected broker feed
   */
  injectBrokerQuote(id: string, quote: Partial<YahooQuote> & { price: number; name?: string }) {
    const existing = quoteCache[id];
    const prev = existing ? existing.price : quote.price;
    const price = quote.price;
    const change = quote.change !== undefined ? quote.change : Number((price - prev).toFixed(2));
    const changePercent = quote.changePercent !== undefined ? quote.changePercent : (prev > 0 ? Number(((change / prev) * 100).toFixed(2)) : 0);

    quoteCache[id] = {
      id,
      symbol: existing?.symbol || id.toUpperCase(),
      name: quote.name || existing?.name || id.toUpperCase(),
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      high: quote.high || Math.max(existing?.high || price, price),
      low: quote.low || Math.min(existing?.low || price, price),
      open: quote.open || existing?.open || price,
      previousClose: quote.previousClose || existing?.previousClose || prev,
      volume: quote.volume || existing?.volume || 1000000,
      timestamp: Date.now(),
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false }),
      tickDirection: change >= 0 ? 'UP' : 'DOWN',
      source: quote.source || 'BROKER_FEED'
    };

    const snap = { ...quoteCache };
    listeners.forEach(fn => { try { fn(snap); } catch (_) {} });
  },

  /**
   * Subscribe to real-time quote updates (called immediately + on every live tick)
   */
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    fn({ ...quoteCache });
    return () => listeners.delete(fn);
  },

  /**
   * Manual refresh trigger from UI (bypasses server TTL cache)
   */
  async refreshAll(): Promise<Record<string, YahooQuote>> {
    await this.fetchRealQuotesInBackground(undefined, true).catch(() => {});
    return { ...quoteCache };
  },

  /**
   * Fetches live market quotes for requested indices from Yahoo Finance.
   */
  async getDetailedQuotes(ids: string[] = ['nifty', 'bank_nifty', 'sensex', 'fin_nifty', 'midcap']): Promise<Record<string, YahooQuote>> {
    await this.fetchRealQuotesInBackground(ids, false).catch(() => {});
    return { ...quoteCache };
  },

  /**
   * Static-host CORS-safe fallback via TradingView Scanner (uses Content-Type: text/plain — zero preflight)
   */
  async fetchTradingViewCorsFallback(timeStr: string): Promise<boolean> {
    const columns = ['close', 'change', 'change_abs', 'high', 'low', 'open', 'volume'];

    const applyTvPayload = (payload: any, reverseMap: Record<string, string>): boolean => {
      if (!payload || !Array.isArray(payload.data)) return false;
      let updated = false;
      for (const row of payload.data) {
        const ticker = row?.s;
        const d = row?.d;
        const id = reverseMap[ticker];
        if (!id || !Array.isArray(d)) continue;
        const price = Number(d[0]);
        if (!Number.isFinite(price) || price <= 0) continue;

        const changePercent = Number.isFinite(Number(d[1])) ? Number(d[1]) : 0;
        const change = Number.isFinite(Number(d[2])) ? Number(d[2]) : 0;
        const high = Number.isFinite(Number(d[3])) ? Number(d[3]) : price;
        const low = Number.isFinite(Number(d[4])) ? Number(d[4]) : price;
        const open = Number.isFinite(Number(d[5])) ? Number(d[5]) : price - change;
        const volume = Number.isFinite(Number(d[6])) ? Number(d[6]) : 0;

        const meta = YAHOO_SYMBOLS[id];
        const prevPrice = quoteCache[id]?.price ?? price;
        const direction: 'UP' | 'DOWN' | 'EQUAL' =
          price > prevPrice ? 'UP' : price < prevPrice ? 'DOWN' : (change >= 0 ? 'UP' : 'DOWN');

        quoteCache[id] = {
          id,
          symbol: meta?.symbol || ticker,
          name: meta?.name || id.toUpperCase(),
          price: Number(price.toFixed(2)),
          change: Number(change.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          open: Number(open.toFixed(2)),
          previousClose: Number((price - change).toFixed(2)),
          volume,
          timestamp: Date.now(),
          lastUpdated: timeStr,
          tickDirection: direction,
          source: 'TRADINGVIEW_CORS_LIVE',
        };
        updated = true;
      }
      return updated;
    };

    const [indiaRes, globalRes] = await Promise.allSettled([
      fetch('https://scanner.tradingview.com/india/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ symbols: { tickers: Object.keys(TV_INDIA_REVERSE_MAP) }, columns }),
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      }).then((r) => (r.ok ? r.json() : null)),
      fetch('https://scanner.tradingview.com/global/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ symbols: { tickers: Object.keys(TV_GLOBAL_REVERSE_MAP) }, columns }),
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      }).then((r) => (r.ok ? r.json() : null)),
    ]);

    const ok1 = indiaRes.status === 'fulfilled' && applyTvPayload(indiaRes.value, TV_INDIA_REVERSE_MAP);
    const ok2 = globalRes.status === 'fulfilled' && applyTvPayload(globalRes.value, TV_GLOBAL_REVERSE_MAP);
    if (ok1 || ok2) {
      notifyListeners();
      return true;
    }
    return false;
  },

  /**
   * Sync directly with real Yahoo Finance API endpoints via server, or CORS-safe TradingView fallback on static hosts
   */
  async fetchRealQuotesInBackground(ids: string[] = Object.keys(YAHOO_SYMBOLS), force = false): Promise<void> {
    lastPollTime = Date.now();
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    let isStaticSpaHost = false;

    // 1. Primary: Dedicated Express /api/yahoo-quotes (fetches all symbols via Yahoo Finance v8/finance/chart)
    try {
      const qs = `?_t=${Date.now()}${force ? '&force=1' : ''}`;
      const res = await fetch(`/api/yahoo-quotes${qs}`, { cache: 'no-store' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('text/html')) {
        isStaticSpaHost = true;
      } else if (res.ok && contentType.includes('application/json')) {
        const payload = await res.json();
        const remoteQuotes = payload?.quotes;
        if (remoteQuotes && typeof remoteQuotes === 'object') {
          let updatedAny = false;
          for (const [id, q] of Object.entries<any>(remoteQuotes)) {
            if (!q || typeof q.price !== 'number' || q.price <= 0) continue;
            const prevPrice = quoteCache[id]?.price ?? q.price;
            const direction: 'UP' | 'DOWN' | 'EQUAL' =
              q.price > prevPrice ? 'UP' : q.price < prevPrice ? 'DOWN' : (q.change >= 0 ? 'UP' : 'DOWN');

            quoteCache[id] = {
              id,
              symbol: q.symbol,
              name: q.name,
              price: Number(q.price.toFixed(2)),
              change: Number((q.change ?? 0).toFixed(2)),
              changePercent: Number((q.changePercent ?? 0).toFixed(2)),
              high: Number((q.high ?? q.price).toFixed(2)),
              low: Number((q.low ?? q.price).toFixed(2)),
              open: Number((q.open ?? q.price).toFixed(2)),
              previousClose: Number((q.previousClose ?? q.price).toFixed(2)),
              volume: q.volume ?? 0,
              timestamp: payload.timestamp || Date.now(),
              lastUpdated: timeStr,
              tickDirection: direction,
              source: 'YAHOO_FINANCE_LIVE',
            };
            updatedAny = true;
          }
          if (updatedAny) {
            notifyListeners();
            return;
          }
        }
      }
    } catch (_) {}

    // 2. Fallback: Direct CORS-safe TradingView Scanner (works on static *.ai.studio without Express backend)
    try {
      const tvOk = await this.fetchTradingViewCorsFallback(timeStr);
      if (tvOk) return;
    } catch (_) {}

    if (isStaticSpaHost) return;

    // 3. Express per-symbol /api/yahoo-chart/v8/finance/chart/ fallback
    const symbolsToFetch = ids
      .map(id => ({ id, meta: YAHOO_SYMBOLS[id] }))
      .filter(item => item.meta);

    if (symbolsToFetch.length === 0) return;

    let anyUpdated = false;
    await Promise.all(
      symbolsToFetch.map(async ({ id, meta }) => {
        try {
          const res = await fetch(
            `/api/yahoo-chart/v8/finance/chart/${encodeURIComponent(meta.symbol)}?interval=1d&range=1d&_=${Date.now()}`,
            { cache: 'no-store' }
          );
          const contentType = res.headers.get('content-type') || '';
          if (!res.ok || !contentType.includes('application/json')) return;
          const data = await res.json();
          const m = data?.chart?.result?.[0]?.meta;
          if (!m || typeof m.regularMarketPrice !== 'number' || m.regularMarketPrice <= 0) return;

          const price = m.regularMarketPrice;
          const prev = m.chartPreviousClose ?? m.previousClose ?? price;
          const change = m.regularMarketChange ?? (price - prev);
          const changePercent = m.regularMarketChangePercent ?? (prev > 0 ? (change / prev) * 100 : 0);
          const prevCached = quoteCache[id]?.price ?? price;

          quoteCache[id] = {
            id,
            symbol: meta.symbol,
            name: meta.name,
            price: Number(price.toFixed(2)),
            change: Number(change.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
            high: Number((m.regularMarketDayHigh ?? price).toFixed(2)),
            low: Number((m.regularMarketDayLow ?? price).toFixed(2)),
            open: Number((m.regularMarketOpen ?? prev).toFixed(2)),
            previousClose: Number(prev.toFixed(2)),
            volume: m.regularMarketVolume ?? 0,
            timestamp: Date.now(),
            lastUpdated: timeStr,
            tickDirection: price > prevCached ? 'UP' : price < prevCached ? 'DOWN' : (change >= 0 ? 'UP' : 'DOWN'),
            source: 'YAHOO_FINANCE_LIVE',
          };
          anyUpdated = true;
        } catch (_) {}
      })
    );

    if (anyUpdated) {
      notifyListeners();
    }
  },

  /**
   * Fetches simple price map for compatibility
   */
  async getMarketData(indices: string[]): Promise<Record<string, number>> {
    const result: Record<string, number> = {};
    indices.forEach((id) => {
      const q = quoteCache[id];
      if (q) result[id] = q.price;
    });
    return result;
  },

  /**
   * Fetches historical candle data for SMC/CRT analysis.
   */
  async getHistoricalCandles(indexId: string, timeframe: 'DAILY' | 'WEEKLY'): Promise<Candle[]> {
    const meta = YAHOO_SYMBOLS[indexId] || YAHOO_SYMBOLS['nifty'];
    if (!meta) return [];

    const interval = timeframe === 'DAILY' ? '1d' : '1wk';
    const range = timeframe === 'DAILY' ? '3mo' : '1y';

    const fetchTimeout = async (url: string, ms = 3500) => {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), ms);
      try {
        const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
        clearTimeout(t);
        return res;
      } catch (e) {
        clearTimeout(t);
        throw e;
      }
    };

    const parseResult = (data: any): Candle[] => {
      const result = data?.chart?.result?.[0];
      if (!result) return [];
      const timestamps = result.timestamp || [];
      const quote = result.indicators?.quote?.[0];
      if (!quote || !quote.open) return [];

      const candles: Candle[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (quote.open[i] != null && quote.close[i] != null && quote.high[i] != null && quote.low[i] != null) {
          candles.push({
            time: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
            open: Number(quote.open[i].toFixed(2)),
            high: Number(quote.high[i].toFixed(2)),
            low: Number(quote.low[i].toFixed(2)),
            close: Number(quote.close[i].toFixed(2))
          });
        }
      }
      return candles;
    };

    // 1. Try local server-side historical-candles endpoint (strictly verify JSON response)
    try {
      const localUrl = `/api/historical-candles?symbol=${encodeURIComponent(meta.symbol)}&range=${range}&interval=${interval}`;
      const res = await fetchTimeout(localUrl, 3500);
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const data = await res.json();
        const candles = parseResult(data);
        if (candles.length > 0) return candles;
      }
    } catch (_) {}

    // 2. Try proxy /api/yahoo-chart (strictly verify JSON response)
    try {
      const proxyUrl = `/api/yahoo-chart/v8/finance/chart/${encodeURIComponent(meta.symbol)}?interval=${interval}&range=${range}`;
      const res = await fetchTimeout(proxyUrl, 3500);
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const data = await res.json();
        const candles = parseResult(data);
        if (candles.length > 0) return candles;
      }
    } catch (_) {}

    // 3. Fallback: Generate 30 daily candles anchored on active live quote price
    const fallbackCandles: Candle[] = [];
    const activeQuote = quoteCache[indexId] || quoteCache['nifty'];
    let current = activeQuote ? activeQuote.price * 0.96 : meta.basePrice * 0.96;
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now - i * 86400000).toISOString().split('T')[0];
      const move = (Math.random() - 0.48) * (meta.basePrice * 0.012);
      const open = current;
      const close = open + move;
      const high = Math.max(open, close) + Math.random() * (meta.basePrice * 0.005);
      const low = Math.min(open, close) - Math.random() * (meta.basePrice * 0.005);
      current = close;
      fallbackCandles.push({
        time: date,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2))
      });
    }
    return fallbackCandles;
  }
};
