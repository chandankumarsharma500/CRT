
import { Candle } from '../types';

// Mapping of internal IDs to Yahoo Finance Tickers
const YAHOO_SYMBOLS: Record<string, string> = {
    'nifty': '^NSEI',
    'bank_nifty': '^NSEBANK',
    'sensex': '^BSESN',
    'fin_nifty': 'NIFTY_FIN_SERVICE.NS',
    'midcap': '^NSEMDCP50', 
    'auto': '^CNXAUTO',
    'fmcg': '^CNXFMCG',
    'it': '^CNXIT',
    'pharma': '^CNXPHARMA',
    'metal': '^CNXMETAL',
    'realty': '^CNXREALTY',
    'media': '^CNXMEDIA',
    'energy': '^CNXENERGY',
    'infra': '^CNXINFRA',
    'bankex': '^BSEBANK',
};

export const yahooFinanceService = {
    /**
     * Fetches live data for the requested indices.
     * Tries multiple proxies to ensure reliability.
     */
    async getMarketData(indices: string[]): Promise<Record<string, number>> {
        const results: Record<string, number> = {};
        
        const mappedSymbols = indices
            .map(id => ({ id, yahoo: YAHOO_SYMBOLS[id] }))
            .filter(x => x.yahoo);
            
        if (mappedSymbols.length === 0) return {};
        
        const tickers = mappedSymbols.map(x => x.yahoo).join(',');
        const targetUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${tickers}`;
        
        // Helper to parse Quote Response
        const parseQuotes = (data: any) => {
            const quotes = data.quoteResponse?.result || [];
            quotes.forEach((q: any) => {
                const found = mappedSymbols.find(x => x.yahoo === q.symbol);
                if (found && q.regularMarketPrice && typeof q.regularMarketPrice === 'number') {
                    results[found.id] = q.regularMarketPrice;
                }
            });
        };

        const fetchWithTimeout = async (url: string, timeout = 3000) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            try {
                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(id);
                return response;
            } catch (e) {
                clearTimeout(id);
                throw e;
            }
        };

        // Strategy 1: AllOrigins
        try {
            const res = await fetchWithTimeout(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
            if (res.ok) {
                const wrapper = await res.json();
                if (wrapper.contents) {
                    const data = JSON.parse(wrapper.contents);
                    parseQuotes(data);
                    return results;
                }
            }
        } catch (e) {
            // Silent fail
        }

        // Strategy 2: CodeTabs (Fallback)
        try {
            const res = await fetchWithTimeout(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`);
            if (res.ok) {
                const data = await res.json();
                parseQuotes(data);
                return results;
            }
        } catch (e) {
            // Silent fail
        }
        
        return results;
    },

    /**
     * Fetches historical candle data for SMC analysis.
     * Implements robust fallback strategies to handle CORS and Rate Limits.
     */
    async getHistoricalCandles(indexId: string, timeframe: 'DAILY' | 'WEEKLY'): Promise<Candle[]> {
        const symbol = YAHOO_SYMBOLS[indexId];
        if (!symbol) return [];

        const interval = timeframe === 'DAILY' ? '1d' : '1wk';
        const range = timeframe === 'DAILY' ? '3mo' : '1y'; 

        const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;

        const fetchWithTimeout = async (url: string, timeout = 5000) => {
             const controller = new AbortController();
             const id = setTimeout(() => controller.abort(), timeout);
             try {
                 const response = await fetch(url, { signal: controller.signal });
                 clearTimeout(id);
                 return response;
             } catch (e) {
                 clearTimeout(id);
                 throw e;
             }
        };

        // Helper to parse Yahoo Chart JSON
        const parseResult = (data: any): Candle[] => {
            const result = data.chart?.result?.[0];
            if (!result) return [];
            
            const timestamps = result.timestamp || [];
            const quote = result.indicators?.quote?.[0];
            
            if (!quote || !quote.open) return [];
            
            const candles: Candle[] = [];
            for (let i = 0; i < timestamps.length; i++) {
                // Filter out incomplete candles (null values)
                if (quote.open[i] != null && quote.close[i] != null && quote.high[i] != null && quote.low[i] != null) {
                    candles.push({
                        time: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
                        open: quote.open[i],
                        high: quote.high[i],
                        low: quote.low[i],
                        close: quote.close[i]
                    });
                }
            }
            return candles;
        };

        // Strategy 1: AllOrigins
        try {
            const res = await fetchWithTimeout(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
            if (res.ok) {
                const wrapper = await res.json();
                if (wrapper.contents) {
                     const data = JSON.parse(wrapper.contents);
                     const candles = parseResult(data);
                     if (candles.length > 0) return candles;
                }
            }
        } catch(e) { 
            // Silent fail to try next proxy
        }

        // Strategy 2: CodeTabs (Fallback)
        try {
             const res = await fetchWithTimeout(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`);
             if (res.ok) {
                 const data = await res.json();
                 const candles = parseResult(data);
                 if (candles.length > 0) return candles;
             }
        } catch(e) { 
            // Silent fail
        }

        // Only log warning if strictly necessary for debug, otherwise silent for user
        // console.warn(`Failed to fetch history for ${indexId} (Proxies exhausted)`);
        return [];
    }
};
