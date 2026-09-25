
// Mapping of internal IDs to NSE Index Names as they appear in the API response
const NSE_INDEX_MAP: Record<string, string> = {
    'nifty': 'NIFTY 50',
    'bank_nifty': 'NIFTY BANK',
    'fin_nifty': 'NIFTY FIN SERVICE',
    'midcap': 'NIFTY MIDCAP 50',
    'auto': 'NIFTY AUTO',
    'fmcg': 'NIFTY FMCG',
    'it': 'NIFTY IT',
    'pharma': 'NIFTY PHARMA',
    'metal': 'NIFTY METAL',
    'realty': 'NIFTY REALTY',
    'media': 'NIFTY MEDIA',
    'energy': 'NIFTY ENERGY',
    'infra': 'NIFTY INFRA',
    // BSE indices are not available on NSE API
};

export interface NSEMarketData {
    price: number;
    change: number;
    changePercent: number;
}

export const nseService = {
    /**
     * Fetches market data from NSE India API via proxy.
     * Endpoint: https://www.nseindia.com/api/allIndices
     */
    async getMarketData(indices: string[]): Promise<Record<string, NSEMarketData>> {
        // Filter out indices that are not mapped (e.g. BSE ones)
        const relevantIndices = indices.filter(id => NSE_INDEX_MAP[id]);
        if (relevantIndices.length === 0) return {};

        const url = 'https://www.nseindia.com/api/allIndices';
        // Use CodeTabs proxy
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for NSE

        try {
            const response = await fetch(proxyUrl, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                return {};
            }

            const json = await response.json();
            const result: Record<string, NSEMarketData> = {};

            // NSE API returns { data: [ { index: "NIFTY 50", last: 22000, ... }, ... ] }
            if (json && Array.isArray(json.data)) {
                json.data.forEach((item: any) => {
                    const indexName = item.index;
                    // Find which internal ID matches this NSE index name
                    const internalId = Object.keys(NSE_INDEX_MAP).find(key => NSE_INDEX_MAP[key] === indexName);
                    
                    if (internalId) {
                        result[internalId] = {
                            price: item.last,
                            change: item.change,
                            changePercent: item.pChange
                        };
                    }
                });
            }

            return result;

        } catch (e) {
            // Suppress error logging
            // console.warn("NSE fetch error:", e);
            return {};
        } finally {
            clearTimeout(timeoutId);
        }
    }
};
