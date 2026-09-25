
import { IndexDefinition } from '../types';

// Mapping of internal IDs to TradingView Tickers
const TV_SYMBOL_MAP: Record<string, string> = {
    'nifty': 'NSE:NIFTY',
    'bank_nifty': 'NSE:BANKNIFTY',
    'sensex': 'BSE:SENSEX',
    'fin_nifty': 'NSE:CNXFINANCE',
    'midcap': 'NSE:MIDCPNIFTY', 
    'auto': 'NSE:CNXAUTO',
    'fmcg': 'NSE:CNXFMCG',
    'it': 'NSE:CNXIT',
    'pharma': 'NSE:CNXPHARMA',
    'metal': 'NSE:CNXMETAL',
    'realty': 'NSE:CNXREALTY',
    'media': 'NSE:CNXMEDIA',
    'energy': 'NSE:CNXENERGY',
    'infra': 'NSE:CNXINFRA',
    'bankex': 'BSE:BANKEX',
};

export interface TVMarketData {
    price: number;
    change: number;        // Absolute change
    changePercent: number; // Percentage change
    rating: number;        // Technical Rating (-1 to 1)
}

export const tradingViewService = {
    getWidgetSymbol(definition: IndexDefinition): string {
        const s = definition.symbol.toUpperCase();
        const exactMap: Record<string, string> = {
            'NIFTY': 'NSE:NIFTY',
            'BANKNIFTY': 'NSE:BANKNIFTY',
            'FINNIFTY': 'NSE:CNXFINANCE', 
            'MIDCPNIFTY': 'NSE:MIDCPNIFTY',
            'SENSEX': 'BSE:SENSEX',
            'BANKEX': 'BSE:BANKEX'
        };
        if (exactMap[s]) return exactMap[s];
        if (definition.exchange === 'NSE' && s.startsWith('NIFTY')) {
             return `NSE:${s.replace('NIFTY', 'CNX')}`;
        }
        return `${definition.exchange}:${s}`;
    },

    /**
     * Fetches market data from TradingView Scanner API using High-Availability Proxies.
     */
    async getMarketData(indices: string[]): Promise<Record<string, TVMarketData>> {
        const symbols = indices.map(id => TV_SYMBOL_MAP[id]).filter(Boolean);
        if (symbols.length === 0) return {};

        const url = 'https://scanner.tradingview.com/india/scan';
        const body = {
            symbols: { tickers: symbols },
            columns: ['close', 'change', 'change_abs', 'Recommend.All']
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); 

        // Helper to try fetching via a specific proxy
        const fetchViaProxy = async (proxyUrl: string, method: 'POST' | 'GET') => {
            const finalUrl = method === 'GET' 
                ? `${proxyUrl}${encodeURIComponent(url)}` // Some proxies need encoded target
                : proxyUrl; // Direct proxies like corsproxy.io handle target in query or path
            
            // Special handling for AllOrigins which is GET only and wraps response
            const isAllOrigins = proxyUrl.includes('allorigins');
            
            // Adjust options
            const options: RequestInit = {
                method: isAllOrigins ? 'GET' : 'POST',
                headers: isAllOrigins ? {} : { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: isAllOrigins ? undefined : JSON.stringify(body),
                signal: controller.signal
            };

            if (isAllOrigins) {
                // TradingView Scanner DOES NOT support GET requests easily via AllOrigins wrappers for POST bodies
                throw new Error("AllOrigins does not support POST");
            }

            const res = await fetch(finalUrl, options);
            if (!res.ok) throw new Error("Proxy failed");
            return res.json();
        };

        try {
            let json = null;
            
            // Strategy 1: corsproxy.io (Best for POST, Very Fast)
            try {
                // corsproxy.io often takes the target URL as a query param or appended
                const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' }, 
                    body: JSON.stringify(body),
                    signal: controller.signal
                });
                if(res.ok) json = await res.json();
            } catch (e) {}

            // Strategy 2: CodeTabs (Fallback)
            if (!json) {
                try {
                     const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`, {
                        method: 'POST',
                        body: JSON.stringify(body),
                        signal: controller.signal
                    });
                    if(res.ok) json = await res.json();
                } catch (e2) {}
            }
            
            clearTimeout(timeoutId);
            const result: Record<string, TVMarketData> = {};
            
            if (json && json.data && Array.isArray(json.data)) {
                json.data.forEach((item: any) => {
                    const symbol = item.s;
                    const price = item.d[0];
                    const changePercent = item.d[1];
                    const changeAbs = item.d[2];
                    const rating = item.d[3];
                    
                    const id = Object.keys(TV_SYMBOL_MAP).find(key => TV_SYMBOL_MAP[key] === symbol);
                    if (id && typeof price === 'number') {
                        result[id] = { price, change: changeAbs || 0, changePercent: changePercent || 0, rating: rating || 0 };
                    }
                });
            }
            return result;
        } catch (e) {
            return {};
        } finally {
            clearTimeout(timeoutId);
        }
    }
};
