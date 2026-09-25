import { UpstoxConfig, BrokerProfile, BrokerHolding, OrderRequest } from '../types';

// Mock data for Upstox Simulation
const MOCK_PROFILE: BrokerProfile = {
  name: "Upstox Demo User",
  email: "demo@upstox.com",
  client_id: "UP123456",
  userType: "RETAIL",
  broker: "UPSTOX"
};

const MOCK_HOLDINGS: BrokerHolding[] = [
  { tradingSymbol: "TATASTEEL", quantity: 100, averagePrice: 140.00, lastPrice: 142.50, pnl: 250.00, exchange: "NSE_EQ" },
  { tradingSymbol: "HDFCBANK", quantity: 10, averagePrice: 1600.00, lastPrice: 1580.00, pnl: -200.00, exchange: "NSE_EQ" },
];

class UpstoxApiService {
  private config: UpstoxConfig | null = null;
  private baseUrl = "https://api.upstox.com/v2";
  
  constructor() {
    const saved = localStorage.getItem('upstox_config');
    if (saved) {
      try {
        this.config = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved upstox config", e);
      }
    }
  }

  saveConfig(apiKey: string, accessToken: string, apiSecret?: string, redirectUri?: string) {
    this.config = { apiKey, accessToken, apiSecret, redirectUri };
    localStorage.setItem('upstox_config', JSON.stringify(this.config));
  }

  clearConfig() {
    this.config = null;
    localStorage.removeItem('upstox_config');
  }

  getConfig() {
    return this.config;
  }

  isConfigured() {
    return !!this.config;
  }

  // Helper to simulate network delay
  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getProfile(): Promise<BrokerProfile> {
    if (!this.config) throw new Error("Upstox API not configured");
    
    // Simulation mode
    if (this.config.apiKey.toUpperCase() === 'DEMO') {
      await this.delay(800);
      return MOCK_PROFILE;
    }

    try {
      const response = await fetch(`${this.baseUrl}/user/profile`, {
        headers: {
          "Authorization": `Bearer ${this.config.accessToken}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
          throw new Error(`Upstox API Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      // Map Upstox response to BrokerProfile
      return {
        name: data.data.user_name,
        email: data.data.email,
        client_id: data.data.user_id,
        userType: data.data.user_type,
        broker: "UPSTOX"
      };
    } catch (error) {
      console.error("Upstox API Call Failed:", error);
      throw error;
    }
  }

  async getHoldings(): Promise<BrokerHolding[]> {
    if (!this.config) throw new Error("Upstox API not configured");

    if (this.config.apiKey.toUpperCase() === 'DEMO') {
        await this.delay(800);
        return MOCK_HOLDINGS;
    }

    const response = await fetch(`${this.baseUrl}/portfolio/long-term-holdings`, {
        headers: {
            "Authorization": `Bearer ${this.config.accessToken}`,
            "Accept": "application/json"
        }
    });
    if (!response.ok) throw new Error(`Upstox API Error: ${response.statusText}`);
    const data = await response.json();
    
    // Map Upstox Holdings to BrokerHolding
    return data.data.map((h: any) => ({
        tradingSymbol: h.trading_symbol,
        quantity: h.quantity,
        averagePrice: h.average_price,
        lastPrice: h.last_price,
        pnl: h.pnl,
        exchange: h.exchange
    }));
  }

  async placeOrder(order: OrderRequest): Promise<any> {
    if (!this.config) throw new Error("Upstox API not configured");
    
    // Mock Execution for DEMO
    if (this.config.apiKey.toUpperCase() === 'DEMO') {
        await this.delay(1000);
        return { 
          orderId: `UP-${Date.now()}`, 
          status: "SUCCESS", 
          message: `Order placed successfully (Upstox Mock)` 
        };
    }

    // Map OrderRequest to Upstox Payload
    const upstoxPayload = {
        quantity: order.quantity,
        product: order.productType === 'INTRADAY' ? 'I' : 'D',
        validity: 'DAY',
        price: 0,
        tag: 'XReelsAlgo',
        instrument_token: order.tradingSymbol, 
        order_type: 'MARKET',
        transaction_type: order.transactionType,
        disclosed_quantity: 0,
        trigger_price: 0,
        is_amo: false
    };

    const response = await fetch(`${this.baseUrl}/order/place`, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${this.config.accessToken}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(upstoxPayload)
    });
    
    if (!response.ok) throw new Error(`Upstox Order Error: ${response.statusText}`);
    return response.json();
  }

  // New method matching Python snippet: fetch_options_data
  async fetchOptionsData(symbol: string = "BANKNIFTY"): Promise<{ callVega: number; putVega: number; spotPrice: number } | null> {
    if (!this.config) return null;

    // Simulation logic for DEMO mode
    // In a real implementation, this would fetch Option Chain and calculate Greeks
    if (this.config.apiKey.toUpperCase() === 'DEMO') {
        await this.delay(300); // Small latency
        const time = Date.now();
        // Generate simulated Vega values for the strategy
        return {
            callVega: 200 + Math.sin(time / 8000) * 60 + (Math.random() * 20 - 10),
            putVega: -140 + Math.cos(time / 8000) * 60 - (Math.random() * 20 - 10),
            spotPrice: 46000 + Math.sin(time / 10000) * 150
        };
    }

    // Placeholder for real API interaction
    // Upstox V2 API requires instrument keys for option chain
    console.warn("Live Vega fetching requires real-time Greeks calculation which is mocked here.");
    return null;
  }
}

export const upstoxService = new UpstoxApiService();
