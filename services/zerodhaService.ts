import { ZerodhaConfig, BrokerProfile, BrokerHolding, OrderRequest } from '../types';

// Mock data for Zerodha Simulation
const MOCK_PROFILE: BrokerProfile = {
  name: "Zerodha Kite User",
  email: "trader@kite.demo",
  client_id: "ZER123",
  userType: "RETAIL",
  broker: "ZERODHA"
};

const MOCK_HOLDINGS: BrokerHolding[] = [
  { tradingSymbol: "INFY", quantity: 50, averagePrice: 1450.00, lastPrice: 1480.00, pnl: 1500.00, exchange: "NSE_EQ" },
  { tradingSymbol: "NIFTY 22000 CE", quantity: 50, averagePrice: 120.00, lastPrice: 110.00, pnl: -500.00, exchange: "NSE_FNO" },
];

class ZerodhaApiService {
  private config: ZerodhaConfig | null = null;
  private baseUrl = "https://api.kite.trade";
  
  constructor() {
    const saved = localStorage.getItem('zerodha_config');
    if (saved) {
      try {
        this.config = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved zerodha config", e);
      }
    }
  }

  saveConfig(apiKey: string, apiSecret: string, accessToken: string) {
    this.config = { apiKey, apiSecret, accessToken };
    localStorage.setItem('zerodha_config', JSON.stringify(this.config));
  }

  clearConfig() {
    this.config = null;
    localStorage.removeItem('zerodha_config');
  }

  getConfig() {
    return this.config;
  }

  isConfigured() {
    return !!this.config;
  }

  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getProfile(): Promise<BrokerProfile> {
    if (!this.config) throw new Error("Zerodha API not configured");
    
    if (this.config.apiKey.toUpperCase() === 'DEMO') {
      await this.delay(600);
      return MOCK_PROFILE;
    }

    try {
      const response = await fetch(`${this.baseUrl}/user/profile`, {
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
        name: data.data.user_name,
        email: data.data.email,
        client_id: data.data.user_id,
        userType: data.data.user_type,
        broker: "ZERODHA"
      };
    } catch (error) {
      console.error("Zerodha API Call Failed:", error);
      throw error;
    }
  }

  async getHoldings(): Promise<BrokerHolding[]> {
    if (!this.config) throw new Error("Zerodha API not configured");

    if (this.config.apiKey.toUpperCase() === 'DEMO') {
        await this.delay(600);
        return MOCK_HOLDINGS;
    }

    const response = await fetch(`${this.baseUrl}/portfolio/holdings`, {
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
  }

  async placeOrder(order: OrderRequest): Promise<any> {
    if (!this.config) throw new Error("Zerodha API not configured");
    
    if (this.config.apiKey.toUpperCase() === 'DEMO') {
        await this.delay(800);
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

    const response = await fetch(`${this.baseUrl}/orders/regular`, {
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
