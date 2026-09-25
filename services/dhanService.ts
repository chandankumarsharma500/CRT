
import { DhanConfig, DhanProfile, DhanHolding, DhanEnv, IndexDefinition, IndexMarketData, Trend } from '../types';
import { twelveDataService } from './twelveDataService';
import { mobileBackendService } from './mobileBackendService';

export const ALL_INDICES: IndexDefinition[] = [
    { id: "nifty", symbol: "NIFTY", exchange: "NSE", name: "NIFTY 50" },
    { id: "bank_nifty", symbol: "BANKNIFTY", exchange: "NSE", name: "NIFTY BANK" },
    { id: "fin_nifty", symbol: "FINNIFTY", exchange: "NSE", name: "NIFTY FINANCIAL" },
    { id: "midcap", symbol: "MIDCPNIFTY", exchange: "NSE", name: "NIFTY MIDCAP" },
    { id: "next_50", symbol: "NIFTYNEXT50", exchange: "NSE", name: "NIFTY NEXT 50" },
    { id: "sensex", symbol: "SENSEX", exchange: "BSE", name: "SENSEX" },
    { id: "bankex", symbol: "BANKEX", exchange: "BSE", name: "BANKEX" },
    { id: "nifty_it", symbol: "NIFTYIT", exchange: "NSE", name: "NIFTY IT" },
    { id: "nifty_auto", symbol: "NIFTYAUTO", exchange: "NSE", name: "NIFTY AUTO" },
    { id: "nifty_fmcg", symbol: "NIFTYFMCG", exchange: "NSE", name: "NIFTY FMCG" },
    { id: "nifty_pharma", symbol: "NIFTYPHARMA", exchange: "NSE", name: "NIFTY PHARMA" },
    { id: "nifty_metal", symbol: "NIFTYMETAL", exchange: "NSE", name: "NIFTY METAL" }
];

class DhanApiService {
  private config: DhanConfig | null = null;
  private lastMockValues: Record<string, { price: number, callVega: number, putVega: number }> = {};
  private readonly CONFIG_KEY = 'dhan_broker_config';
  
  constructor() {
    this.loadPersistedConfig();
    this.loadLastKnownPrices();
  }

  private loadPersistedConfig() {
    const saved = localStorage.getItem(this.CONFIG_KEY);
    if (saved) this.config = JSON.parse(saved);
  }

  private loadLastKnownPrices() {
      const saved = localStorage.getItem('dhan_last_prices');
      if (saved) this.lastMockValues = JSON.parse(saved);
  }

  getConfig() {
    return this.config;
  }

  clearConfig() {
    this.config = null;
    localStorage.removeItem(this.CONFIG_KEY);
  }

  saveConfig(clientId: string, accessToken?: string, environment: DhanEnv = 'PRODUCTION') {
    this.config = { clientId, accessToken, environment };
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.config));
  }

  isConfigured() { return !!(this.config && this.config.clientId); }

  async getProfile(): Promise<DhanProfile> {
    if (!this.config) throw new Error("Dhan API not configured");
    return {
      name: "Institutional Alpha",
      email: "quant@terminal.io",
      client_id: this.config.clientId,
      userType: "INSTITUTIONAL",
      broker: "DHAN"
    };
  }

  async getHoldings(): Promise<DhanHolding[]> {
    if (!this.config) throw new Error("Dhan API not configured");
    return [];
  }

  async fetchIndicesMarketData(): Promise<IndexMarketData[]> {
    const idsToFetch = ALL_INDICES.map(i => i.id);
    let realPrices: Record<string, number> = {};
    let dataSource: 'Broker' | 'TwelveData' | 'TradingView' | 'NSE' | 'Simulation' = 'Simulation';

    if (mobileBackendService.isEnabled()) {
        const cloudData = await mobileBackendService.fetchMarketDataViaCloud(idsToFetch);
        if (cloudData) {
            realPrices = cloudData;
            dataSource = 'Broker';
        }
    }

    if (Object.keys(realPrices).length === 0) {
        const tdResults = await twelveDataService.getPricesForIndices(idsToFetch);
        if (Object.keys(tdResults).length > 0) {
            for (const id in tdResults) {
                const def = ALL_INDICES.find(x => x.id === id);
                if (def) realPrices[def.symbol] = tdResults[id];
            }
            dataSource = 'TwelveData';
        }
    }

    return ALL_INDICES.map(index => {
        if (!this.lastMockValues[index.symbol]) {
             let basePrice = 22000;
             if (index.symbol === 'SENSEX') basePrice = 74000;
             if (index.symbol === 'BANKNIFTY') basePrice = 48000;
             if (index.symbol === 'BANKEX') basePrice = 54000;
             if (index.id.startsWith('nifty_')) basePrice = 15000;

             this.lastMockValues[index.symbol] = { 
                 price: basePrice, 
                 callVega: 400 + (Math.random() - 0.5) * 100, 
                 putVega: -400 + (Math.random() - 0.5) * 100 
             };
        }

        const last = this.lastMockValues[index.symbol];
        let price = realPrices[index.symbol] || (last.price + (Math.random() - 0.5) * 10);
        
        const priceDiff = price - last.price;
        let callVega = last.callVega + (priceDiff > 0 ? 25 : -10);
        let putVega = last.putVega + (priceDiff < 0 ? 25 : -10);

        callVega = Math.max(-200, Math.min(1000, callVega));
        putVega = Math.max(-200, Math.min(1000, putVega));

        this.lastMockValues[index.symbol] = { price, callVega, putVega };
        localStorage.setItem('dhan_last_prices', JSON.stringify(this.lastMockValues));

        const difference = putVega - callVega;
        return {
            definition: index,
            price,
            change: price - last.price,
            percentChange: ((price - last.price) / last.price) * 100,
            callVega, putVega, difference,
            trend: (difference < 0 ? 'Bullish' : 'Bearish') as Trend,
            source: dataSource
        };
    });
  }
}

export const dhanService = new DhanApiService();
