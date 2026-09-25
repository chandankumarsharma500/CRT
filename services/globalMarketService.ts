
import { GlobalAssetData, Trend } from '../types';
import { twelveDataService } from './twelveDataService';

const GLOBAL_ASSETS = [
    { id: 'spx', symbol: 'SPX', name: 'S&P 500', category: 'INDEX' as const },
    { id: 'ndx', symbol: 'IXIC', name: 'Nasdaq 100', category: 'INDEX' as const },
    { id: 'dxy', symbol: 'DXY', name: 'US Dollar Index', category: 'INDEX' as const },
    { id: 'btc', symbol: 'BTC/USD', name: 'Bitcoin', category: 'CRYPTO' as const },
    { id: 'eth', symbol: 'ETH/USD', name: 'Ethereum', category: 'CRYPTO' as const },
    { id: 'sol', symbol: 'SOL/USD', name: 'Solana', category: 'CRYPTO' as const },
    { id: 'us10y', symbol: 'US10Y', name: 'US 10Y Yield', category: 'INDEX' as const },
    { id: 'vix', symbol: 'VIX', name: 'Volatility Index', category: 'INDEX' as const }
];

class GlobalMarketService {
    private lastValues: Record<string, number> = {};

    async fetchGlobalPulse(): Promise<GlobalAssetData[]> {
        const symbols = GLOBAL_ASSETS.map(a => a.symbol);
        
        // Use TwelveData for high-precision global/crypto data
        const realPrices = await twelveDataService.getBatchPrices(symbols);

        return GLOBAL_ASSETS.map(asset => {
            const lastPrice = this.lastValues[asset.id] || 0;
            // Use real price if available, otherwise simulate institutional volatility
            let price = realPrices[asset.symbol] || (lastPrice === 0 ? this.getBasePrice(asset.id) : lastPrice + (Math.random() - 0.5) * (lastPrice * 0.001));
            
            if (isNaN(price)) price = this.getBasePrice(asset.id);
            
            const change = lastPrice === 0 ? 0 : price - lastPrice;
            const percentChange = lastPrice === 0 ? (Math.random() - 0.5) * 2 : (change / lastPrice) * 100;
            
            this.lastValues[asset.id] = price;

            return {
                ...asset,
                price,
                change,
                percentChange,
                trend: (percentChange >= 0 ? 'Bullish' : 'Bearish') as Trend
            };
        });
    }

    private getBasePrice(id: string): number {
        switch(id) {
            case 'spx': return 5100;
            case 'ndx': return 18000;
            case 'dxy': return 104;
            case 'btc': return 67000;
            case 'eth': return 3500;
            case 'sol': return 145;
            case 'us10y': return 4.2;
            case 'vix': return 15;
            default: return 100;
        }
    }
}

export const globalMarketService = new GlobalMarketService();
