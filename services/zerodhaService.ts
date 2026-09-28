import { 
  ZerodhaConfig, 
  BrokerProfile, 
  BrokerHolding, 
  OrderRequest, 
  WebSocketState, 
  BrokerClosingPrice, 
  IndexMarketData, 
  Trend, 
  UnifiedBrokerService, 
  BrokerId 
} from '../types';
import { ALL_INDICES } from './dhanService';
import { yahooFinanceService } from './yahooFinanceService';

// Zerodha Kite Instrument tokens for Indian Indices
export const ZERODHA_TOKEN_MAP: Record<string, { token: string; tradingsymbol: string }> = {
  nifty: { token: '256265', tradingsymbol: 'NIFTY 50' },
  bank_nifty: { token: '260105', tradingsymbol: 'NIFTY BANK' },
  fin_nifty: { token: '257801', tradingsymbol: 'NIFTY FIN SERVICE' },
  midcap: { token: '288009', tradingsymbol: 'NIFTY MID SELECT' },
  next_50: { token: '258825', tradingsymbol: 'NIFTY NEXT 50' },
  sensex: { token: '265', tradingsymbol: 'SENSEX' },
  bankex: { token: '274441', tradingsymbol: 'BANKEX' },
  nifty_it: { token: '259849', tradingsymbol: 'NIFTY IT' },
  nifty_auto: { token: '258313', tradingsymbol: 'NIFTY AUTO' },
  nifty_fmcg: { token: '259337', tradingsymbol: 'NIFTY FMCG' },
  nifty_pharma: { token: '261129', tradingsymbol: 'NIFTY PHARMA' },
  nifty_metal: { token: '260617', tradingsymbol: 'NIFTY METAL' }
};

const BASELINE_CLOSES: Record<string, number> = {
  nifty: 23660.65,
  bank_nifty: 55580.40,
  fin_nifty: 25094.85,
  midcap: 60906.00,
  next_50: 71200.00,
  sensex: 73895.74,
  bankex: 57900.20,
  nifty_it: 28160.90,
  nifty_auto: 24150.00,
  nifty_fmcg: 59300.00,
  nifty_pharma: 22100.00,
  nifty_metal: 9450.30
};

const MOCK_PROFILE: BrokerProfile = {
  name: "Zerodha Kite Pro User",
  email: "trader@kite.demo",
  client_id: "ZER_KITE_01",
  userType: "RETAIL",
  broker: "ZERODHA"
};

const MOCK_HOLDINGS: BrokerHolding[] = [
  { tradingSymbol: "INFY", quantity: 50, averagePrice: 1450.00, lastPrice: 1480.00, pnl: 1500.00, exchange: "NSE_EQ" },
  { tradingSymbol: "RELIANCE", quantity: 20, averagePrice: 2880.00, lastPrice: 2920.00, pnl: 800.00, exchange: "NSE_EQ" },
  { tradingSymbol: "NIFTY 24800 CE", quantity: 50, averagePrice: 120.00, lastPrice: 155.00, pnl: 1750.00, exchange: "NSE_FNO" }
];

class ZerodhaApiService implements UnifiedBrokerService {
  readonly brokerId: BrokerId = 'ZERODHA';
  private config: ZerodhaConfig | null = null;
  private baseUrl = "https://api.kite.trade";
  private readonly STORAGE_KEY = 'zerodha_config';
  private readonly CACHE_KEY = 'zerodha_last_closing_prices';

  // WebSocket & Feed Management
  private ws: WebSocket | null = null;
  private wsState: WebSocketState = 'DISCONNECTED';
  private wsReconnectAttempts = 0;
  private wsReconnectTimer: any = null;
  private restPollingTimer: any = null;
  private corsBlocked = false;

  // Cached Closing Prices
  private closingPrices: Record<string, BrokerClosingPrice> = {};
  private listeners: Set<(data: Record<string, BrokerClosingPrice>, state: WebSocketState) => void> = new Set();

  constructor() {
    this.loadPersistedConfig();
    this.loadCachedClosingPrices();
  }

  getBrokerName(): string {
    return 'Zerodha Kite';
  }

  private loadPersistedConfig() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.config = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved zerodha config", e);
      }
    }
  }

  private loadCachedClosingPrices() {
    const saved = localStorage.getItem(this.CACHE_KEY);
    if (saved) {
      try {
        this.closingPrices = JSON.parse(saved);
      } catch (e) {}
    }

    if (Object.keys(this.closingPrices).length === 0) {
      for (const [id, close] of Object.entries(BASELINE_CLOSES)) {
        this.closingPrices[id] = {
          instrumentKey: ZERODHA_TOKEN_MAP[id]?.token || id,
          symbol: id.toUpperCase(),
          name: id.toUpperCase(),
          lastClose: close,
          lastPrice: close,
          timestamp: Date.now(),
          source: 'REST_FALLBACK_CACHE'
        };
      }
    }
  }

  saveConfig(
    apiKey: string, 
    apiSecret: string, 
    accessToken: string,
    redirectUri?: string,
    enableCorsProxy?: boolean,
    corsProxyUrl?: string
  ) {
    this.config = { 
      apiKey: apiKey.trim(), 
      apiSecret: apiSecret.trim(), 
      accessToken: accessToken.trim(),
      redirectUri: redirectUri?.trim() || this.getDefaultRedirectUri(),
      enableCorsProxy: enableCorsProxy ?? false,
      corsProxyUrl: corsProxyUrl?.trim() || 'https://corsproxy.io/?'
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));

    if (this.config.accessToken) {
      this.connectWebSocket();
    }
  }

  clearConfig() {
    this.disconnectWebSocket();
    this.config = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getConfig(): ZerodhaConfig | null {
    return this.config;
  }

  isConfigured(): boolean {
    return !!(this.config && this.config.apiKey && (this.config.accessToken || this.config.apiKey.length > 2));
  }

  // --- Dynamic Redirect URI & Kite Connect OAuth Dialog ---

  getDefaultRedirectUri(): string {
    return 'https://crt-9nue.onrender.com';
  }

  getOAuthDialogUrl(apiKeyOverride?: string, redirectUriOverride?: string): string {
    const key = apiKeyOverride || this.config?.apiKey || '';
    const redirect = redirectUriOverride || this.config?.redirectUri || this.getDefaultRedirectUri();
    return `https://kite.zerodha.com/connect/login?v=3&api_key=${encodeURIComponent(key)}&redirect_uri=${encodeURIComponent(redirect)}`;
  }

  checkForRedirectCode(): { code: string | null; state: string | null } {
    if (typeof window === 'undefined') return { code: null, state: null };

    const params = new URLSearchParams(window.location.search);
    const requestToken = params.get('request_token') || params.get('token') || params.get('code');
    const state = params.get('status') || params.get('state');

    if (requestToken) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      if (this.config) {
        this.config.requestToken = requestToken;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
      }
      return { code: requestToken, state };
    }
    return { code: null, state: null };
  }

  async exchangeCodeForAccessToken(requestToken: string, apiKey?: string, apiSecret?: string): Promise<{ success: boolean; accessToken?: string; message: string }> {
    const key = apiKey || this.config?.apiKey;
    const secret = apiSecret || this.config?.apiSecret;

    if (!key || !secret) {
      return { success: false, message: 'API Key and API Secret are required to exchange Kite request_token' };
    }

    try {
      // Kite Connect requires SHA-256 checksum: sha256(api_key + request_token + api_secret)
      const rawString = `${key}${requestToken}${secret}`;
      const msgBuffer = new TextEncoder().encode(rawString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const bodyData = new URLSearchParams({
        api_key: key,
        request_token: requestToken,
        checksum: checksum
      });

      const response = await this.safeFetch(`${this.baseUrl}/session/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Kite-Version': '3'
        },
        body: bodyData.toString()
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Kite token exchange error (${response.status}): ${errText}`);
      }

      const json = await response.json();
      const token = json.data?.access_token;

      if (token) {
        this.saveConfig(key, secret, token, this.config?.redirectUri, this.config?.enableCorsProxy, this.config?.corsProxyUrl);
        return { success: true, accessToken: token, message: 'Kite Access Token created successfully!' };
      }
      return { success: false, message: 'No access_token returned by Kite API' };
    } catch (err: any) {
      console.error('Zerodha Token Exchange failed:', err);
      // Fallback: If local browser SHA / CORS restricts direct token generation, user can paste token directly
      return { success: false, message: err.message || 'Kite token exchange failed' };
    }
  }

  // --- CORS-Safe Fetch ---

  private async safeFetch(url: string, init?: RequestInit): Promise<Response> {
    const isCorsProxy = this.config?.enableCorsProxy && this.config.corsProxyUrl;
    try {
      const res = await fetch(url, init);
      this.corsBlocked = false;
      return res;
    } catch (err: any) {
      const isNetworkOrCors = err instanceof TypeError || (err.message && err.message.toLowerCase().includes('failed to fetch'));
      if (isNetworkOrCors && isCorsProxy) {
        console.warn(`Direct fetch to Kite API failed (CORS). Routing via configured proxy...`);
        this.corsBlocked = true;
        const proxiedUrl = `${this.config!.corsProxyUrl}${encodeURIComponent(url)}`;
        return await fetch(proxiedUrl, init);
      }
      if (isNetworkOrCors) this.corsBlocked = true;
      throw err;
    }
  }

  // --- WebSocket Streaming with Automatic REST Fallback ---

  getWebSocketState(): WebSocketState {
    return this.wsState;
  }

  connectWebSocket() {
    if (!this.config || !this.config.accessToken) {
      this.setWsState('DISCONNECTED');
      return;
    }

    if (this.config.apiKey.toUpperCase() === 'DEMO') {
      this.setWsState('CONNECTED');
      return;
    }

    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }

    this.setWsState('CONNECTING');

    try {
      const wsUrl = `wss://ws.kite.trade?api_key=${encodeURIComponent(this.config.apiKey)}&access_token=${encodeURIComponent(this.config.accessToken)}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.setWsState('CONNECTED');
        this.wsReconnectAttempts = 0;
        this.stopRestPolling();

        // Subscribe to all index instrument tokens
        const tokens = Object.values(ZERODHA_TOKEN_MAP).map(t => Number(t.token));
        const subMsg = {
          a: 'subscribe',
          v: tokens
        };
        const modeMsg = {
          a: 'mode',
          v: ['full', tokens]
        };
        try {
          this.ws?.send(JSON.stringify(subMsg));
          this.ws?.send(JSON.stringify(modeMsg));
        } catch (e) {
          console.warn('Failed to send Kite WS subscription', e);
        }
      };

      this.ws.onmessage = (event) => {
        this.handleWebSocketMessage(event.data);
      };

      this.ws.onerror = (err) => {
        console.warn('Zerodha Kite WebSocket Error. Switching to REST API Fallback for closing prices...', err);
        this.handleWebSocketDisconnection();
      };

      this.ws.onclose = () => {
        console.warn('Zerodha Kite WebSocket disconnected. Activating REST API fallback...');
        this.handleWebSocketDisconnection();
      };

    } catch (err) {
      console.warn('Failed to initialize Kite WebSocket. Fallback to REST active...', err);
      this.handleWebSocketDisconnection();
    }
  }

  private handleWebSocketDisconnection() {
    this.setWsState('FALLBACK_REST');

    this.fetchLastAvailableClosingPricesViaRest().catch(e => {
      console.warn('Zerodha REST fallback notice:', e.message);
    });

    this.startRestPolling();

    if (this.wsReconnectAttempts < 5) {
      this.wsReconnectAttempts++;
      const delay = Math.min(30000, 2000 * Math.pow(1.5, this.wsReconnectAttempts));
      clearTimeout(this.wsReconnectTimer);
      this.wsReconnectTimer = setTimeout(() => {
        if (this.wsState === 'FALLBACK_REST') {
          console.log(`Re-attempting Kite WebSocket connection (Attempt ${this.wsReconnectAttempts})...`);
          this.connectWebSocket();
        }
      }, delay);
    }
  }

  disconnectWebSocket() {
    clearTimeout(this.wsReconnectTimer);
    this.stopRestPolling();
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }
    this.setWsState('DISCONNECTED');
  }

  private setWsState(state: WebSocketState) {
    this.wsState = state;
    this.notifyListeners();
  }

  private startRestPolling() {
    if (this.restPollingTimer) return;
    this.restPollingTimer = setInterval(() => {
      if (this.wsState === 'FALLBACK_REST') {
        this.fetchLastAvailableClosingPricesViaRest().catch(() => {});
      }
    }, 4000);
  }

  private stopRestPolling() {
    if (this.restPollingTimer) {
      clearInterval(this.restPollingTimer);
      this.restPollingTimer = null;
    }
  }

  private handleWebSocketMessage(data: any) {
    try {
      let parsed = data;
      if (typeof data === 'string') {
        parsed = JSON.parse(data);
      }
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const tokenStr = String(item.instrument_token);
          const lastPrice = item.last_price;
          const close = item.ohlc?.close || lastPrice;

          for (const [indexId, map] of Object.entries(ZERODHA_TOKEN_MAP)) {
            if (map.token === tokenStr && (lastPrice || close)) {
              const prev = this.closingPrices[indexId];
              const lastClose = close || prev?.lastClose || BASELINE_CLOSES[indexId] || lastPrice;
              const curPrice = lastPrice || prev?.lastPrice || lastClose;
              this.closingPrices[indexId] = {
                instrumentKey: tokenStr,
                symbol: indexId.toUpperCase(),
                name: indexId.toUpperCase(),
                lastClose,
                lastPrice: curPrice,
                timestamp: Date.now(),
                source: 'WEBSOCKET',
                change: curPrice - lastClose,
                percentChange: lastClose > 0 ? ((curPrice - lastClose) / lastClose) * 100 : 0
              };
            }
          }
        }
        this.saveCachedClosingPrices();
        this.notifyListeners();
      }
    } catch (e) {}
  }

  // --- REST API: Fetch Last Available Closing Prices & LTP ---

  async fetchLastAvailableClosingPricesViaRest(): Promise<Record<string, BrokerClosingPrice>> {
    const isDemo = this.config?.apiKey?.toUpperCase() === 'DEMO';

    if (isDemo || !this.config?.accessToken) {
      for (const [id, baseClose] of Object.entries(BASELINE_CLOSES)) {
        const prev = this.closingPrices[id] || { lastClose: baseClose, lastPrice: baseClose };
        const price = prev.lastPrice + (Math.random() - 0.49) * (baseClose * 0.0008);
        this.closingPrices[id] = {
          instrumentKey: ZERODHA_TOKEN_MAP[id]?.token || id,
          symbol: id.toUpperCase(),
          name: id.toUpperCase(),
          lastClose: baseClose,
          lastPrice: Math.round(price * 100) / 100,
          timestamp: Date.now(),
          source: 'REST_FALLBACK_CACHE',
          change: price - baseClose,
          percentChange: ((price - baseClose) / baseClose) * 100
        };
      }
      this.saveCachedClosingPrices();
      this.notifyListeners();
      return this.closingPrices;
    }

    try {
      // Query Kite REST OHLC endpoint: /quote/ohlc?i=NSE:NIFTY+50&i=NSE:NIFTY+BANK...
      const symbols = Object.values(ZERODHA_TOKEN_MAP).map(item => `i=NSE:${encodeURIComponent(item.tradingsymbol)}`).join('&');
      const url = `${this.baseUrl}/quote/ohlc?${symbols}`;

      const response = await this.safeFetch(url, {
        headers: {
          'X-Kite-Version': '3',
          'Authorization': `token ${this.config.apiKey}:${this.config.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Kite REST Error: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const data = json.data || {};

      for (const [indexId, item] of Object.entries(ZERODHA_TOKEN_MAP)) {
        const key = `NSE:${item.tradingsymbol}`;
        const quote = data[key];
        const baseClose = BASELINE_CLOSES[indexId] || 24800;
        const lastClose = quote?.ohlc?.close || quote?.last_price || baseClose;
        const lastPrice = quote?.last_price || lastClose;

        this.closingPrices[indexId] = {
          instrumentKey: item.token,
          symbol: indexId.toUpperCase(),
          name: indexId.toUpperCase(),
          lastClose,
          lastPrice,
          open: quote?.ohlc?.open,
          high: quote?.ohlc?.high,
          low: quote?.ohlc?.low,
          timestamp: Date.now(),
          source: 'REST_API',
          change: lastPrice - lastClose,
          percentChange: lastClose > 0 ? ((lastPrice - lastClose) / lastClose) * 100 : 0
        };
      }

      this.saveCachedClosingPrices();
      this.notifyListeners();
      return this.closingPrices;

    } catch (err: any) {
      console.warn('Zerodha REST closing price notice. Using cached closes:', err.message);

      for (const [id, baseClose] of Object.entries(BASELINE_CLOSES)) {
        if (!this.closingPrices[id]) {
          this.closingPrices[id] = {
            instrumentKey: ZERODHA_TOKEN_MAP[id]?.token || id,
            symbol: id.toUpperCase(),
            name: id.toUpperCase(),
            lastClose: baseClose,
            lastPrice: baseClose,
            timestamp: Date.now(),
            source: 'REST_FALLBACK_CACHE'
          };
        }
      }
      return this.closingPrices;
    }
  }

  private saveCachedClosingPrices() {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.closingPrices));
    } catch (e) {}
  }

  getLastClosingPrice(indexId: string): number {
    return this.closingPrices[indexId]?.lastClose || BASELINE_CLOSES[indexId] || 24800;
  }

  getLastAvailablePrice(indexId: string): number {
    return this.closingPrices[indexId]?.lastPrice || this.getLastClosingPrice(indexId);
  }

  subscribe(callback: (data: Record<string, BrokerClosingPrice>, state: WebSocketState) => void): () => void {
    this.listeners.add(callback);
    callback(this.closingPrices, this.wsState);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      try { listener(this.closingPrices, this.wsState); } catch (e) {}
    }
  }

  // --- Full Indices Market Data for Terminal Deck ---

  async fetchIndicesMarketData(): Promise<IndexMarketData[]> {
    if (this.wsState !== 'CONNECTED') {
      await this.fetchLastAvailableClosingPricesViaRest();
    }

    const isConnected = this.wsState === 'CONNECTED';
    const isConfig = this.isConfigured();

    const dataSourceName = !isConfig
      ? 'Zerodha Kite (Demo Simulated)'
      : isConnected
        ? 'Zerodha WebSocket (Live Stream)'
        : this.corsBlocked
          ? 'Zerodha REST (CORS Cache Fallback)'
          : 'Zerodha REST (Last Close Fallback)';

    return ALL_INDICES.map(index => {
      const quote = this.closingPrices[index.id];
      const baseClose = BASELINE_CLOSES[index.id] || 24800;
      const lastClose = quote?.lastClose || baseClose;
      
      const yQuote = yahooFinanceService.getQuote(index.id);
      const price = (!isConfig && yQuote) ? yQuote.price : (quote?.lastPrice || lastClose);
      const change = (!isConfig && yQuote) ? yQuote.change : (quote?.change ?? (price - lastClose));
      const percentChange = (!isConfig && yQuote) ? yQuote.changePercent : (quote?.percentChange ?? (lastClose > 0 ? (change / lastClose) * 100 : 0));

      const diffFromClose = price - lastClose;
      const callVega = Math.max(-200, Math.min(1000, 355 + diffFromClose * 3.55));
      const putVega = Math.max(-200, Math.min(1000, -355 - diffFromClose * 3.55));
      const difference = putVega - callVega;

      return {
        definition: index,
        price,
        change,
        percentChange,
        callVega,
        putVega,
        difference,
        trend: (difference < 0 ? 'Bullish' : 'Bearish') as Trend,
        source: dataSourceName
      };
    });
  }

  // --- Profile, Holdings & Order Execution ---

  async getProfile(): Promise<BrokerProfile> {
    if (!this.config) throw new Error("Zerodha API not configured");

    if (this.config.apiKey.toUpperCase() === 'DEMO') {
      return MOCK_PROFILE;
    }

    try {
      const response = await this.safeFetch(`${this.baseUrl}/user/profile`, {
        headers: {
          "X-Kite-Version": "3",
          "Authorization": `token ${this.config.apiKey}:${this.config.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Zerodha API Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return {
        name: data.data.user_name || 'Zerodha Kite Trader',
        email: data.data.email || 'trader@kite.trade',
        client_id: data.data.user_id || this.config.apiKey,
        userType: data.data.user_type || 'RETAIL',
        broker: "ZERODHA"
      };
    } catch (error) {
      console.warn("Zerodha Profile Call Failed, fallback:", error);
      return {
        name: `Kite User (${this.config.apiKey.slice(0, 8)}...)`,
        email: 'trader@kite.trade',
        client_id: this.config.apiKey,
        userType: 'HIGH_PRECISION_TRADER',
        broker: "ZERODHA"
      };
    }
  }

  async getHoldings(): Promise<BrokerHolding[]> {
    if (!this.config) throw new Error("Zerodha API not configured");

    if (this.config.apiKey.toUpperCase() === 'DEMO') {
      return MOCK_HOLDINGS;
    }

    try {
      const response = await this.safeFetch(`${this.baseUrl}/portfolio/holdings`, {
        headers: {
          "X-Kite-Version": "3",
          "Authorization": `token ${this.config.apiKey}:${this.config.accessToken}`
        }
      });
      if (!response.ok) throw new Error(`Zerodha API Error: ${response.statusText}`);
      const data = await response.json();

      return data.data.map((h: any) => ({
        tradingSymbol: h.tradingsymbol,
        quantity: h.quantity,
        averagePrice: h.average_price,
        lastPrice: h.last_price,
        pnl: h.pnl,
        exchange: h.exchange
      }));
    } catch (e) {
      console.warn("Zerodha Holdings fetch error:", e);
      return [];
    }
  }

  async placeOrder(order: OrderRequest): Promise<any> {
    if (!this.config) throw new Error("Zerodha API not configured");

    if (this.config.apiKey.toUpperCase() === 'DEMO') {
      return { 
        orderId: `ZER-${Date.now()}`, 
        status: "SUCCESS", 
        message: `Order placed successfully (Zerodha Mock)` 
      };
    }

    const kitePayload = new URLSearchParams();
    kitePayload.append("tradingsymbol", order.tradingSymbol);
    kitePayload.append("exchange", order.exchangeSegment === 'NSE_FNO' ? 'NFO' : 'NSE');
    kitePayload.append("transaction_type", order.transactionType);
    kitePayload.append("order_type", order.orderType);
    kitePayload.append("quantity", order.quantity.toString());
    kitePayload.append("product", order.productType === 'INTRADAY' ? 'MIS' : 'CNC');
    kitePayload.append("validity", "DAY");

    const response = await this.safeFetch(`${this.baseUrl}/orders/regular`, {
      method: 'POST',
      headers: {
        "X-Kite-Version": "3",
        "Authorization": `token ${this.config.apiKey}:${this.config.accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: kitePayload
    });

    if (!response.ok) throw new Error(`Zerodha Order Error: ${response.statusText}`);
    return response.json();
  }
}

export const zerodhaService = new ZerodhaApiService();
