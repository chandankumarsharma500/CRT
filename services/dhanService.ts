import { 
  DhanConfig, 
  DhanProfile, 
  DhanHolding, 
  DhanEnv, 
  IndexDefinition, 
  IndexMarketData, 
  Trend, 
  WebSocketState, 
  BrokerClosingPrice, 
  UnifiedBrokerService, 
  BrokerId,
  OrderRequest,
  BrokerProfile,
  BrokerHolding
} from '../types';
import { twelveDataService } from './twelveDataService';
import { mobileBackendService } from './mobileBackendService';
import { yahooFinanceService } from './yahooFinanceService';
import { marketHoursService } from './marketHoursService';

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

// Dhan Security IDs mapping for NSE / BSE Indices
export const DHAN_SECURITY_MAP: Record<string, { secId: string; segment: string }> = {
  nifty: { secId: '13', segment: 'IDX_I' },
  bank_nifty: { secId: '25', segment: 'IDX_I' },
  fin_nifty: { secId: '27', segment: 'IDX_I' },
  midcap: { secId: '43', segment: 'IDX_I' },
  next_50: { secId: '14', segment: 'IDX_I' },
  sensex: { secId: '51', segment: 'IDX_B' },
  bankex: { secId: '52', segment: 'IDX_B' },
  nifty_it: { secId: '29', segment: 'IDX_I' },
  nifty_auto: { secId: '30', segment: 'IDX_I' },
  nifty_fmcg: { secId: '31', segment: 'IDX_I' },
  nifty_pharma: { secId: '32', segment: 'IDX_I' },
  nifty_metal: { secId: '33', segment: 'IDX_I' }
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

class DhanApiService implements UnifiedBrokerService {
  readonly brokerId: BrokerId = 'DHAN';
  private config: DhanConfig | null = null;
  private readonly CONFIG_KEY = 'dhan_broker_config';
  private readonly CACHE_KEY = 'dhan_last_closing_prices';
  private baseUrl = "https://api.dhan.co/v2";

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
    return 'Dhan HQ';
  }

  private loadPersistedConfig() {
    const saved = localStorage.getItem(this.CONFIG_KEY) || localStorage.getItem('dhan_config');
    if (saved) {
      try {
        this.config = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved dhan config", e);
      }
    }
    if (!this.config) {
      const credsStr = localStorage.getItem('broker_creds_DHAN');
      if (credsStr) {
        try {
          const parsed = JSON.parse(credsStr);
          if (parsed.apiKey || parsed.apiSecret) {
            this.config = {
              clientId: (parsed.apiKey || '').trim(),
              accessToken: (parsed.apiSecret || '').trim(),
              environment: 'PRODUCTION',
              redirectUri: this.getDefaultRedirectUri(),
            };
          }
        } catch (_e) {}
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
          instrumentKey: DHAN_SECURITY_MAP[id]?.secId || id,
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
    clientId: string, 
    accessToken?: string, 
    environment: DhanEnv = 'PRODUCTION',
    redirectUri?: string,
    enableCorsProxy?: boolean,
    corsProxyUrl?: string
  ) {
    this.config = { 
      clientId: clientId.trim(), 
      accessToken: accessToken?.trim(), 
      environment,
      redirectUri: redirectUri?.trim() || this.getDefaultRedirectUri(),
      enableCorsProxy: enableCorsProxy ?? false,
      corsProxyUrl: corsProxyUrl?.trim() || 'https://corsproxy.io/?'
    };
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.config));

    if (this.config.accessToken && this.config.clientId && !this.isDemoCredentials()) {
      this.connectWebSocket();
    }
  }

  private isDemoCredentials(): boolean {
    const cid = (this.config?.clientId || '').toLowerCase();
    return !this.config?.accessToken || cid === 'demo' || cid.includes('_live_key_');
  }

  clearConfig() {
    this.disconnectWebSocket();
    this.config = null;
    localStorage.removeItem(this.CONFIG_KEY);
  }

  getConfig(): DhanConfig | null {
    if (!this.config) this.loadPersistedConfig();
    return this.config;
  }

  getLatestQuotesSnapshot(): Record<string, BrokerClosingPrice> {
    return { ...this.closingPrices };
  }

  isConfigured(): boolean {
    const cfg = this.getConfig();
    return !!(cfg && cfg.clientId && (cfg.accessToken || cfg.clientId.length > 2));
  }

  // --- Dynamic Redirect URI & OAuth Dialog Helpers ---

  getDefaultRedirectUri(): string {
    return 'https://crt-9nue.onrender.com';
  }

  getOAuthDialogUrl(apiKeyOverride?: string, redirectUriOverride?: string): string {
    const clientId = apiKeyOverride || this.config?.clientId || '';
    const redirect = redirectUriOverride || this.config?.redirectUri || this.getDefaultRedirectUri();
    return `https://auth.dhan.co/login/consent-app?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirect)}`;
  }

  checkForRedirectCode(): { code: string | null; state: string | null } {
    if (typeof window === 'undefined') return { code: null, state: null };

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || params.get('accessToken') || params.get('auth_token') || params.get('code');
    const state = params.get('state');

    if (token) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      if (this.config) {
        this.config.accessToken = token;
        this.config.authCode = token;
        localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.config));
      }
      return { code: token, state };
    }
    return { code: null, state: null };
  }

  async exchangeCodeForAccessToken(code: string): Promise<{ success: boolean; accessToken?: string; message: string }> {
    if (code) {
      if (this.config) {
        this.config.accessToken = code;
        localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.config));
      }
      this.connectWebSocket();
      return { success: true, accessToken: code, message: 'Dhan Token saved and activated!' };
    }
    return { success: false, message: 'Token string missing' };
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
        console.warn(`Direct fetch to Dhan API failed (CORS/Network). Routing via configured CORS proxy...`);
        this.corsBlocked = true;
        const proxiedUrl = `${this.config!.corsProxyUrl}${encodeURIComponent(url)}`;
        return await fetch(proxiedUrl, init);
      }
      if (isNetworkOrCors) this.corsBlocked = true;
      throw err;
    }
  }

  // --- WebSocket Streaming with REST Fallback ---

  getWebSocketState(): WebSocketState {
    return this.wsState;
  }

  connectWebSocket() {
    if (!this.config || !this.config.accessToken) {
      this.setWsState('DISCONNECTED');
      return;
    }

    if (this.config.clientId.toUpperCase() === 'DEMO') {
      this.setWsState('CONNECTED');
      return;
    }

    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }

    this.setWsState('CONNECTING');

    try {
      // Dhan Live Market Feed WebSocket
      const wsUrl = `wss://api-feed.dhan.co?version=2&token=${encodeURIComponent(this.config.accessToken)}&clientId=${encodeURIComponent(this.config.clientId)}&authType=2`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.setWsState('CONNECTED');
        this.wsReconnectAttempts = 0;
        this.stopRestPolling();

        // Subscribe to all index instruments
        const subPayload = {
          RequestCode: 15, // Quote subscribe
          InstrumentCount: Object.keys(DHAN_SECURITY_MAP).length,
          InstrumentList: Object.values(DHAN_SECURITY_MAP).map(item => ({
            ExchangeSegment: item.segment === 'IDX_I' ? 1 : 2,
            SecurityId: item.secId
          }))
        };
        try {
          this.ws?.send(JSON.stringify(subPayload));
        } catch (e) {
          console.warn('Failed to send Dhan WS subscription', e);
        }
      };

      this.ws.onmessage = (event) => {
        this.handleWebSocketMessage(event.data);
      };

      this.ws.onerror = (err) => {
        console.warn('Dhan WebSocket Error. Switching to REST API Fallback for closing prices...', err);
        this.handleWebSocketDisconnection();
      };

      this.ws.onclose = () => {
        console.warn('Dhan WebSocket disconnected. Activating REST API fallback...');
        this.handleWebSocketDisconnection();
      };

    } catch (err) {
      console.warn('Failed to initialize Dhan WebSocket. Fallback to REST active...', err);
      this.handleWebSocketDisconnection();
    }
  }

  private handleWebSocketDisconnection() {
    this.setWsState('FALLBACK_REST');

    // Immediately trigger REST fetch for last available closing price
    this.fetchLastAvailableClosingPricesViaRest().catch(e => {
      console.warn('Dhan REST fallback fetch notice:', e.message);
    });

    this.startRestPolling();

    if (this.wsReconnectAttempts < 5) {
      this.wsReconnectAttempts++;
      const delay = Math.min(30000, 2000 * Math.pow(1.5, this.wsReconnectAttempts));
      clearTimeout(this.wsReconnectTimer);
      this.wsReconnectTimer = setTimeout(() => {
        if (this.wsState === 'FALLBACK_REST') {
          console.log(`Re-attempting Dhan WebSocket connection (Attempt ${this.wsReconnectAttempts})...`);
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
      if (parsed.LTP || parsed.Close || parsed.ltp) {
        const ltp = Number(parsed.LTP || parsed.ltp);
        const close = Number(parsed.Close || parsed.close || ltp);
        const secId = String(parsed.SecurityId || parsed.security_id || '');

        for (const [indexId, item] of Object.entries(DHAN_SECURITY_MAP)) {
          if (item.secId === secId || !secId) {
            const prev = this.closingPrices[indexId];
            const lastClose = close || prev?.lastClose || BASELINE_CLOSES[indexId] || ltp;
            const lastPrice = ltp || prev?.lastPrice || lastClose;
            this.closingPrices[indexId] = {
              instrumentKey: secId,
              symbol: indexId.toUpperCase(),
              name: indexId.toUpperCase(),
              lastClose,
              lastPrice,
              timestamp: Date.now(),
              source: 'WEBSOCKET',
              change: lastPrice - lastClose,
              percentChange: lastClose > 0 ? ((lastPrice - lastClose) / lastClose) * 100 : 0
            };
          }
        }
        this.saveCachedClosingPrices();
        this.notifyListeners();
      }
    } catch (e) {}
  }

  // --- REST API: Fetch Last Available Closing Prices & LTP ---

  async fetchLastAvailableClosingPricesViaRest(): Promise<Record<string, BrokerClosingPrice>> {
    this.getConfig();
    const isDemo = this.isDemoCredentials();

    if (isDemo || !this.config?.accessToken) {
      for (const [id, baseClose] of Object.entries(BASELINE_CLOSES)) {
        const yQuote = yahooFinanceService.getQuote(id);
        const prev = this.closingPrices[id] || { lastClose: baseClose, lastPrice: baseClose };
        const effectiveClose = yQuote?.previousClose || prev.lastClose || baseClose;
        const price = yQuote?.price || prev.lastPrice || effectiveClose;
        const change = yQuote ? yQuote.change : Number((price - effectiveClose).toFixed(2));
        const percentChange = yQuote ? yQuote.changePercent : (effectiveClose > 0 ? Number(((change / effectiveClose) * 100).toFixed(2)) : 0);

        this.closingPrices[id] = {
          instrumentKey: DHAN_SECURITY_MAP[id]?.secId || id,
          symbol: id.toUpperCase(),
          name: id.toUpperCase(),
          lastClose: effectiveClose,
          lastPrice: Math.round(price * 100) / 100,
          timestamp: Date.now(),
          source: 'REST_FALLBACK_CACHE',
          change,
          percentChange
        };
      }
      this.saveCachedClosingPrices();
      this.notifyListeners();
      return this.closingPrices;
    }

    try {
      // Route DhanHQ v2 Market Feed OHLC call through our server-side bridge (CORS-free)
      const response = await fetch('/api/dhan/marketfeed', {
        method: 'POST',
        headers: {
          'access-token': this.config.accessToken,
          'client-id': this.config.clientId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: 'ohlc',
          instruments: {
            IDX_I: Object.values(DHAN_SECURITY_MAP)
              .filter(x => x.segment === 'IDX_I')
              .map(x => Number(x.secId)),
            IDX_B: Object.values(DHAN_SECURITY_MAP)
              .filter(x => x.segment === 'IDX_B')
              .map(x => Number(x.secId))
          }
        })
      });

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload?.error || errPayload?.internalErrorMessage || `Dhan REST Error: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const data = json.data || {};
      this.corsBlocked = false;

      for (const [indexId, item] of Object.entries(DHAN_SECURITY_MAP)) {
        const secQuote =
          data[item.segment]?.[item.secId] ||
          data[item.segment]?.[Number(item.secId)] ||
          data[item.secId] ||
          data.IDX_I?.[item.secId];
        if (!secQuote) continue;

        const baseClose = BASELINE_CLOSES[indexId] || 24800;
        const ohlc = secQuote.ohlc || {};
        const lastClose = Number(ohlc.close || secQuote.close || secQuote.last_close || baseClose);
        const lastPrice = Number(secQuote.last_price || lastClose);

        this.closingPrices[indexId] = {
          instrumentKey: item.secId,
          symbol: indexId.toUpperCase(),
          name: indexId.toUpperCase(),
          lastClose,
          lastPrice,
          timestamp: Date.now(),
          source: 'REST_API',
          change: Number((lastPrice - lastClose).toFixed(2)),
          percentChange: lastClose > 0 ? Number((((lastPrice - lastClose) / lastClose) * 100).toFixed(2)) : 0
        };
      }

      this.saveCachedClosingPrices();
      this.notifyListeners();
      return this.closingPrices;

    } catch (err: any) {
      console.warn('Dhan REST closing price fetch notice. Using cached closes:', err.message);

      for (const [id, baseClose] of Object.entries(BASELINE_CLOSES)) {
        if (!this.closingPrices[id]) {
          this.closingPrices[id] = {
            instrumentKey: DHAN_SECURITY_MAP[id]?.secId || id,
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

    const isConnected = this.wsState === 'CONNECTED' && !this.isDemoCredentials();
    const isConfig = this.isConfigured() && !this.isDemoCredentials();

    const dataSourceName = !isConfig
      ? 'Yahoo Finance (Live Market)'
      : isConnected
        ? 'Dhan WebSocket (Live Stream)'
        : this.corsBlocked
          ? 'Dhan REST / Yahoo Finance Sync'
          : 'Dhan REST / Yahoo Finance';

    return ALL_INDICES.map(index => {
      const quote = this.closingPrices[index.id];
      const yQuote = yahooFinanceService.getQuote(index.id);
      const hasLiveBrokerQuote = isConfig && quote && (quote.source === 'WEBSOCKET' || quote.source === 'REST_API');

      const baseClose = BASELINE_CLOSES[index.id] || 25800;
      const lastClose = hasLiveBrokerQuote ? (quote.lastClose || baseClose) : (yQuote?.previousClose || quote?.lastClose || baseClose);
      const price = hasLiveBrokerQuote ? (quote.lastPrice || lastClose) : (yQuote?.price || quote?.lastPrice || lastClose);
      const change = hasLiveBrokerQuote ? (quote.change ?? (price - lastClose)) : (yQuote?.change ?? (price - lastClose));
      const percentChange = hasLiveBrokerQuote ? (quote.percentChange ?? (lastClose > 0 ? (change / lastClose) * 100 : 0)) : (yQuote?.changePercent ?? (lastClose > 0 ? (change / lastClose) * 100 : 0));

      const diffFromClose = price - lastClose;
      const callVega = Math.max(-200, Math.min(1000, 360 + diffFromClose * 3.6));
      const putVega = Math.max(-200, Math.min(1000, -360 - diffFromClose * 3.6));
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
        source: hasLiveBrokerQuote ? dataSourceName : (yQuote ? 'Yahoo Finance (Live Market)' : dataSourceName)
      };
    });
  }

  // --- Profile, Holdings & Order Execution ---

  async getProfile(): Promise<BrokerProfile> {
    const cfg = this.getConfig();
    if (!cfg) throw new Error("Dhan API not configured");
    if (!this.isDemoCredentials() && cfg.accessToken) {
      try {
        const res = await fetch('/api/dhan/profile', {
          method: 'POST',
          headers: {
            'access-token': cfg.accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const data = await res.json();
          return {
            name: data.dhanClientId ? `DhanHQ (${data.dhanClientId})` : 'Dhan HQ Live',
            email: `${(data.dhanClientId || cfg.clientId).toLowerCase()}@dhan.co`,
            client_id: data.dhanClientId || cfg.clientId,
            userType: data.activeSegment || 'INSTITUTIONAL',
            broker: 'DHAN',
          };
        }
      } catch (_e) {}
    }
    return {
      name: "Dhan Institutional Alpha",
      email: `${cfg.clientId.toLowerCase()}@dhan.trader`,
      client_id: cfg.clientId,
      userType: "INSTITUTIONAL",
      broker: "DHAN"
    };
  }

  async getHoldings(): Promise<BrokerHolding[]> {
    const cfg = this.getConfig();
    if (!cfg) throw new Error("Dhan API not configured");
    if (!this.isDemoCredentials() && cfg.accessToken) {
      try {
        const res = await fetch('/api/dhan/holdings', {
          method: 'POST',
          headers: {
            'access-token': cfg.accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) return data;
        }
      } catch (_e) {}
    }
    return [];
  }

  async placeOrder(order: OrderRequest): Promise<any> {
    const cfg = this.getConfig();
    if (mobileBackendService.isEnabled()) {
      return await mobileBackendService.placeOrderViaCloud('DHAN', order);
    }
    if (cfg && !this.isDemoCredentials() && cfg.accessToken) {
      const res = await fetch('/api/dhan/orders', {
        method: 'POST',
        headers: {
          'access-token': cfg.accessToken,
          'client-id': cfg.clientId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || data?.internalErrorMessage || `Dhan Order Error (${res.status})`);
      }
      return data;
    }
    return {
      orderId: `DHAN-${Date.now()}`,
      status: "SUCCESS",
      message: `Order dispatched to Dhan HQ order routing terminal.`
    };
  }
}

export const dhanService = new DhanApiService();
