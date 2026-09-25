
import { MobileBackendConfig, BrokerId, OrderRequest } from '../types';

class MobileBackendService {
  private config: MobileBackendConfig | null = null;
  private readonly DHAN_CONFIG_KEY = 'dhan_broker_config';

  constructor() {
    const saved = localStorage.getItem('mobile_backend_config');
    if (saved) {
      try {
        this.config = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse mobile backend config", e);
      }
    }
  }

  saveConfig(enabled: boolean, cloudFunctionUrl: string, authKey?: string) {
    // Normalize URL: Ensure it starts with https and has no trailing slash
    let normalizedUrl = cloudFunctionUrl.trim();
    if (normalizedUrl.endsWith('/')) {
        normalizedUrl = normalizedUrl.slice(0, -1);
    }
    
    this.config = { enabled, cloudFunctionUrl: normalizedUrl, authKey };
    localStorage.setItem('mobile_backend_config', JSON.stringify(this.config));
  }

  getConfig() {
    return this.config;
  }

  isEnabled() {
    return !!(this.config && this.config.enabled && this.config.cloudFunctionUrl);
  }

  /**
   * Fetches real-time market data via Cloud Proxy
   */
  async fetchMarketDataViaCloud(indices: string[]): Promise<any> {
    if (!this.isEnabled() || !this.config) return null;

    // Use the correct key used by dhanService
    const dhanConfigStr = localStorage.getItem(this.DHAN_CONFIG_KEY);
    if (!dhanConfigStr) return null;

    const dhanConfig = JSON.parse(dhanConfigStr);
    const clientId = dhanConfig.clientId || "";
    const accessToken = dhanConfig.accessToken || "";

    if (!clientId || !accessToken) return null;

    try {
      const baseUrl = this.config.cloudFunctionUrl;
      const endpoint = "/fetchPrices";
      const fullUrl = `${baseUrl}${endpoint}`;

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access-token': accessToken,
          'client-id': clientId,
          ...(this.config.authKey ? { 'Authorization': `Bearer ${this.config.authKey}` } : {})
        },
        body: JSON.stringify({ indices }),
        // Add a timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        return null;
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (e) {
      // Log silently to prevent UI clutter, dhanService handles the null fallback
      return null;
    }
  }

  /**
   * Calls the Firebase Cloud Function for orders
   */
  async placeOrderViaCloud(broker: BrokerId, orderData: OrderRequest): Promise<any> {
    if (!this.isEnabled() || !this.config) {
      throw new Error("Mobile Backend not configured");
    }

    const dhanConfigStr = localStorage.getItem(this.DHAN_CONFIG_KEY);
    if (!dhanConfigStr) throw new Error("Broker credentials not found in storage");

    const dhanConfig = JSON.parse(dhanConfigStr);
    const clientId = dhanConfig.clientId || "";
    const accessToken = dhanConfig.accessToken || "";

    try {
      const fullUrl = `${this.config.cloudFunctionUrl}/placeOrder`;
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access-token': accessToken,
          'client-id': clientId,
          ...(this.config.authKey ? { 'Authorization': `Bearer ${this.config.authKey}` } : {})
        },
        body: JSON.stringify({
          data: { 
            broker: broker.toLowerCase(),
            orderData: orderData
          }
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Cloud Proxy Http Error: ${response.status}`);
      }

      const result = await response.json();
      return result.result || result.data || result; 

    } catch (error: any) {
      if (error.name === 'TimeoutError') throw new Error("Order request timed out. Check your Cloud Function logs.");
      throw error;
    }
  }
}

export const mobileBackendService = new MobileBackendService();
