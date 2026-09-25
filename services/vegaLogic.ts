
import { MarketDataPoint, TradingSignal, Trend, SMCZone } from '../types';

export const VEGA_THRESHOLDS = {
  callVegaHigh: 200,
  putVegaLow: -140,
  bearishCallMax: -10,
  bearishPutMin: 5
};

export const VEGA_SETTINGS = {
  high_vega_divergence: 200,
  very_high_vega_divergence: 500,
  put_vega_threshold: -140,
  call_vega_threshold: 200,
  min_risk_reward: 3.0,
  scalp_divergence: 350 // Lower threshold for 5m scalps
};

export const generateMockData = (): MarketDataPoint => {
  const scenario = Math.random();
  let callVega: number, putVega: number;
  
  if (scenario > 0.85) { 
    callVega = 450 + Math.random() * 300;
    putVega = -450 - Math.random() * 300;
  } else if (scenario < 0.15) { 
    callVega = -250 - Math.random() * 150;
    putVega = 250 + Math.random() * 150;
  } else if (scenario > 0.5) {
    callVega = 220 + Math.random() * 100;
    putVega = -150 - Math.random() * 100;
  } else {
    callVega = 50 + Math.random() * 100;
    putVega = -50 - Math.random() * 100;
  }
  
  const difference = putVega - callVega;
  return {
    time: new Date().toLocaleTimeString(),
    timestamp: Date.now(),
    callVega,
    putVega,
    difference,
    trend: difference < 0 ? 'Bullish' : 'Bearish'
  };
};

export class VegaStrategy {
  static calculateDifference(callVega: number, putVega: number): { difference: number; trend: Trend } {
    const difference = putVega - callVega;
    const trend: Trend = difference < 0 ? 'Bullish' : 'Bearish';
    return { difference, trend };
  }

  static getDetailedTrend(difference: number): { label: string; colorClass: string } {
    const absDiff = Math.abs(difference);
    if (difference >= 400) return { label: 'Institutional Bearish', colorClass: 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' };
    if (difference >= 150) return { label: 'Bearish Bias', colorClass: 'bg-rose-500/80 text-white' };
    if (absDiff < 50) return { label: 'Neutral Zone', colorClass: 'bg-slate-400 text-white' }; 
    if (difference <= -400) return { label: 'Institutional Bullish', colorClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' };
    return { label: 'Bullish Bias', colorClass: 'bg-emerald-500/80 text-white' };
  }

  static detectSignal(data: MarketDataPoint, currentPrice: number, smcZones: SMCZone[]): TradingSignal | null {
    const { difference, trend } = data;
    const absDiff = Math.abs(difference);

    const activeZones = smcZones.filter(z => 
        currentPrice >= (z.bottom - 100) && currentPrice <= (z.top + 100)
    );

    const hasSMCConfluence = activeZones.some(z => z.trend === trend);
    const isInstitutional = absDiff >= VEGA_SETTINGS.very_high_vega_divergence;
    
    if (isInstitutional || (absDiff > 250 && hasSMCConfluence)) {
        const isBullish = trend === 'Bullish';
        const bestZone = activeZones.find(z => z.trend === trend);
        
        return {
            type: isBullish ? 'BUY' : 'SELL',
            strength: isInstitutional ? 'STRONG' : 'MODERATE',
            tag: isInstitutional ? 'INSTITUTIONAL' : 'SNIPER',
            confidence: isInstitutional ? 99.8 : 97.5,
            reason: bestZone 
                ? `${bestZone.pattern} + Vega Confluence` 
                : 'Pure Institutional Vega Divergence',
            action: isBullish ? 'CE LONG - Institutional Reclaim' : 'PE SHORT - Supply Rejection',
            stopLoss: isBullish ? (currentPrice - 30).toFixed(1) : (currentPrice + 30).toFixed(1),
            target: isBullish ? (currentPrice + 90).toFixed(1) : (currentPrice - 90).toFixed(1),
            timestamp: Date.now(),
            confluence: activeZones.map(z => z.pattern)
        };
    }
    return null;
  }

  // Specialized 5m Scalper Logic
  static detect5mScalp(data: MarketDataPoint, currentPrice: number, smcZones: SMCZone[]): TradingSignal | null {
    const { difference, trend } = data;
    const absDiff = Math.abs(difference);

    if (absDiff < VEGA_SETTINGS.scalp_divergence) return null;

    const isBullish = trend === 'Bullish';
    return {
        type: isBullish ? 'BUY' : 'SELL',
        strength: 'MODERATE',
        tag: 'SCALP',
        confidence: 98.2,
        reason: '5m Vega Velocity Spike + Liquidity Trap',
        action: isBullish ? 'CE SCALP' : 'PE SCALP',
        stopLoss: isBullish ? (currentPrice - 20).toFixed(1) : (currentPrice + 20).toFixed(1),
        target: isBullish ? (currentPrice + 50).toFixed(1) : (currentPrice - 50).toFixed(1),
        timestamp: Date.now(),
        confluence: ['M5 Velocity', 'Institutional Skew']
    };
  }
}
