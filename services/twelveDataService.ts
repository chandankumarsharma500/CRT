
import { TwelveDataConfig, Candle } from '../types';

// Mapping internal IDs to Twelve Data Symbols
const TD_SYMBOL_MAP: Record<string, string> = {
    'nifty': 'NSE:NIFTY',
    'bank_nifty': 'NSE:BANKNIFTY',
    'sensex': 'BSE:SENSEX',
    'fin_nifty': 'NSE:FINNIFTY',
    'midcap': 'NSE:NIFTYMIDCAP50', 
    'auto': 'NSE:NIFTYAUTO',
    'fmcg': 'NSE:NIFTYFMCG',
    'it': 'NSE:NIFTYIT',
    'pharma': 'NSE:NIFTYPHARMA',
    'metal': 'NSE:NIFTYMETAL',
    'realty': 'NSE:NIFTYREALTY',
    'media': 'NSE:NIFTYMEDIA',
    'energy': 'NSE:NIFTYENERGY',
    'infra': 'NSE:NIFTYINFRA',
    'bankex': 'BSE:BANKEX',
};

class TwelveDataService {
  private config: TwelveDataConfig | null = null;
  private baseUrl = "https://api.twelvedata.com";
  // Default Key provided
  private readonly DEFAULT_API_KEY = "f6cc30e18bb94fd68ee0193c3a70b89f";

  constructor() {
    const saved = localStorage.getItem('twelvedata_config');
    if (saved) {
      try {
        this.config = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse twelvedata config", e);
      }
    }
    
    // Use default key if no configuration is found or apiKey is missing
    if (!this.config || !this.config.apiKey) {
        this.config = {
            apiKey: this.DEFAULT_API_KEY,
            symbol: this.config?.symbol || "SBIN/BSE"
        };
    }
  }

  saveConfig(apiKey: string, symbol: string = "SBIN/BSE") {
    this.config = { apiKey, symbol };
    localStorage.setItem('twelvedata_config', JSON.stringify(this.config));
  }

  getConfig() {
    return this.config;
  }

  isConfigured() {
    return !!(this.config && this.config.apiKey);
  }

  // Polls the Time Series endpoint
  async getLatestPrice(): Promise<number | null> {
    if (!this.config || !this.config.apiKey) return null;
    
    try {
      const symbol = this.config.symbol || "SBIN/BSE";
      const interval = this.config.interval || "1min";
      const url = `${this.baseUrl}/time_series?symbol=${symbol}&interval=${interval}&apikey=${this.config.apiKey}&outputsize=1`;
      
      const res = await fetch(url);
      if (!res.ok) return null;

      const data = await res.json();
      
      if (data.status === 'error' || !data.values) return null;

      if (data.values.length > 0) {
        return parseFloat(data.values[0].close);
      }
      return null;
    } catch (e) {
      // console.error("Failed to fetch from Twelve Data", e);
      return null;
    }
  }

  /**
   * Fetches real-time prices for a list of symbols in batch.
   */
  async getBatchPrices(symbols: string[]): Promise<Record<string, number>> {
    if (!this.config || !this.config.apiKey || symbols.length === 0) return {};

    try {
        const symbolStr = symbols.join(',');
        const url = `${this.baseUrl}/price?symbol=${symbolStr}&apikey=${this.config.apiKey}`;
        
        const res = await fetch(url);
        if (!res.ok) return {};

        const data = await res.json();
        const result: Record<string, number> = {};

        if (symbols.length === 1 && data.price) {
            result[symbols[0]] = parseFloat(data.price);
        } else {
             for (const key in data) {
                 if (data[key] && data[key].price) {
                     result[key] = parseFloat(data[key].price);
                 }
             }
        }
        return result;
    } catch (error) {
        // console.error("Batch price fetch failed", error);
        return {};
    }
  }

  /**
   * Helper to get prices for internal Index IDs
   */
  async getPricesForIndices(indexIds: string[]): Promise<Record<string, number>> {
      if (!this.config || !this.config.apiKey) return {};
      
      const symbolsToFetch = indexIds
        .map(id => TD_SYMBOL_MAP[id])
        .filter(Boolean);
        
      if (symbolsToFetch.length === 0) return {};

      const batchData = await this.getBatchPrices(symbolsToFetch);
      
      // Map back to internal IDs
      const result: Record<string, number> = {};
      indexIds.forEach(id => {
          const sym = TD_SYMBOL_MAP[id];
          if (sym && batchData[sym]) {
              result[id] = batchData[sym];
          }
      });
      
      return result;
  }

  /**
   * Fetches historical candles (Time Series)
   * Realtime streaming API: time_series(symbol, interval, outputsize)
   */
  async getCandles(indexId: string, timeframe: 'DAILY' | 'WEEKLY'): Promise<Candle[]> {
      if (!this.config || !this.config.apiKey) return [];

      const tdSymbol = TD_SYMBOL_MAP[indexId];
      if (!tdSymbol) return [];

      const interval = timeframe === 'DAILY' ? '1day' : '1week';
      const outputsize = timeframe === 'DAILY' ? 100 : 52; // Get enough data

      const url = `${this.baseUrl}/time_series?symbol=${tdSymbol}&interval=${interval}&apikey=${this.config.apiKey}&outputsize=${outputsize}`;

      try {
          const res = await fetch(url);
          const data = await res.json();

          if (data.status === 'error' || !data.values) {
              // console.warn(`TwelveData error for ${indexId}:`, data.message);
              return [];
          }

          // Map response to Candle interface
          // TwelveData returns values in reverse chronological order (newest first)
          return data.values.map((v: any) => ({
              time: v.datetime,
              open: parseFloat(v.open),
              high: parseFloat(v.high),
              low: parseFloat(v.low),
              close: parseFloat(v.close)
          })).reverse(); // SmartMoneyLogic expects oldest first usually, but check logic

      } catch (e) {
          // console.error(`Failed to fetch candles for ${indexId}`, e);
          return [];
      }
  }
}

export const twelveDataService = new TwelveDataService();
