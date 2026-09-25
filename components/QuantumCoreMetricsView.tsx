import React from 'react';
import { 
  Cpu, 
  Layers, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Info, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { SMCZone } from '../types';
import { QuantumCoreLogic, QuantumCoreStructure } from '../services/quantumCoreLogic';

interface QuantumCoreMetricsViewProps {
  symbol: string;
  currentPrice: number;
  quantumCore?: {
    fvgCount: number;
    ifvgCount: number;
    obCount: number;
    bobCount: number;
    accuracyBoost: number;
    highestConfluenceZone?: SMCZone;
    confluenceDescription: string;
  };
}

export const QuantumCoreMetricsView: React.FC<QuantumCoreMetricsViewProps> = ({
  symbol,
  currentPrice,
  quantumCore
}) => {
  // If not directly passed, compute in real-time
  const structures: QuantumCoreStructure = React.useMemo(() => {
    return QuantumCoreLogic.getAssetQuantumStructures(symbol, currentPrice);
  }, [symbol, currentPrice]);

  const fvgCount = quantumCore?.fvgCount ?? structures.fvg.length;
  const ifvgCount = quantumCore?.ifvgCount ?? structures.ifvg.length;
  const obCount = quantumCore?.obCount ?? structures.ob.length;
  const bobCount = quantumCore?.bobCount ?? structures.bob.length;
  const accuracyBoost = quantumCore?.accuracyBoost ?? structures.quantumAccuracyBoost;
  const highestZone = quantumCore?.highestConfluenceZone ?? structures.highestConfluenceZone;
  const description = quantumCore?.confluenceDescription ?? structures.confluenceDescription;

  return (
    <div className="space-y-6">
      {/* Top Banner Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Cpu size={140} className="text-indigo-400" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10 shrink-0">
              <Cpu size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  INSTITUTIONAL QUANTUM ENGINE
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  +{accuracyBoost}% ACCURACY BOOST
                </span>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                Quantum Core SMC Structure Detection
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Scans 4 proprietary structural pillars: Inversion Fair Value Gaps (<strong>IFVG</strong>), Standard Imbalance Gaps (<strong>FVG</strong>), Order Blocks (<strong>OB</strong>), and Breaker Order Blocks (<strong>BOB</strong>) for unmatched 5M confluence accuracy.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Asset</span>
            <span className="text-lg font-black font-mono text-white mt-0.5 block">{symbol} ₹{currentPrice.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-indigo-400 font-mono flex items-center justify-end gap-1">
              <Sparkles size={11} /> 4-Factor Core Aligned
            </span>
          </div>
        </div>

        {/* 4 Pillars Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* 1. IFVG */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-indigo-500/30 shadow-lg shadow-indigo-500/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                IFVG
              </span>
              <span className="text-xs font-bold font-mono text-emerald-400">+{structures.ifvg.length > 0 ? '8%' : '0%'} Accuracy</span>
            </div>
            <h4 className="text-xs font-black text-white uppercase">Inversion Fair Value Gap</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Disrespected FVG flipped into institutional support/resistance. High-urgency liquidity reversal.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Detected:</span>
              <span className="font-bold text-white px-2 py-0.5 rounded bg-indigo-600/30 border border-indigo-500/30">
                {ifvgCount} Active
              </span>
            </div>
          </div>

          {/* 2. FVG */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 shadow-lg shadow-emerald-500/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                FVG
              </span>
              <span className="text-xs font-bold font-mono text-emerald-400">+{structures.fvg.length > 0 ? '5%' : '0%'} Accuracy</span>
            </div>
            <h4 className="text-xs font-black text-white uppercase">Fair Value Gap (Imbalance)</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              3-candle structural displacement leaving unfilled orders. Ideal for 50% Consequent Encroachment entries.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Detected:</span>
              <span className="font-bold text-white px-2 py-0.5 rounded bg-emerald-600/30 border border-emerald-500/30">
                {fvgCount} Active
              </span>
            </div>
          </div>

          {/* 3. OB */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-purple-500/30 shadow-lg shadow-purple-500/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                OB
              </span>
              <span className="text-xs font-bold font-mono text-emerald-400">+{structures.ob.length > 0 ? '5%' : '0%'} Accuracy</span>
            </div>
            <h4 className="text-xs font-black text-white uppercase">Order Block</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              The final counter-candle before explosive institutional displacement. Clean invalidation reference.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Detected:</span>
              <span className="font-bold text-white px-2 py-0.5 rounded bg-purple-600/30 border border-purple-500/30">
                {obCount} Active
              </span>
            </div>
          </div>

          {/* 4. BOB */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30 shadow-lg shadow-amber-500/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                BOB
              </span>
              <span className="text-xs font-bold font-mono text-emerald-400">+{structures.bob.length > 0 ? '8%' : '0%'} Accuracy</span>
            </div>
            <h4 className="text-xs font-black text-white uppercase">Breaker Order Block</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              A failed Order Block that swept retail stops before being violated, transitioning into violent trend continuation.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Detected:</span>
              <span className="font-bold text-white px-2 py-0.5 rounded bg-amber-600/30 border border-amber-500/30">
                {bobCount} Active
              </span>
            </div>
          </div>
        </div>

        {/* Real-Time Confluence Breakdown */}
        <div className="mt-6 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 block">
                Quantum Accuracy Verdict
              </span>
              <p className="text-xs text-white font-medium mt-0.5">
                {description}
              </p>
            </div>
          </div>
          {highestZone && (
            <div className="bg-slate-900/90 border border-indigo-500/30 px-3.5 py-2 rounded-xl text-xs font-mono shrink-0">
              <span className="text-[10px] text-slate-400 uppercase block">Prime Structure Zone</span>
              <span className="font-bold text-emerald-400">
                {highestZone.pattern} ({highestZone.trend}): ₹{highestZone.bottom.toLocaleString()} - ₹{highestZone.top.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Live Detected Quantum Structures Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IFVG & FVG Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers size={16} className="text-indigo-400" />
            Fair Value Gaps & Inversions (IFVG / FVG)
          </h3>
          <div className="space-y-3">
            {[...structures.ifvg, ...structures.fvg].slice(0, 5).map((zone, idx) => (
              <div 
                key={zone.id || idx}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase font-mono ${
                    zone.pattern === 'IFVG' 
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {zone.pattern}
                  </span>
                  <div>
                    <span className="font-mono font-bold text-white">
                      ₹{zone.bottom.toLocaleString()} - ₹{zone.top.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {zone.trend} • CE Midpoint: ₹{Math.round((zone.top + zone.bottom) / 2).toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                  zone.isMitigated ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {zone.isMitigated ? 'Mitigated' : 'Fresh Zone'}
                </span>
              </div>
            ))}
            {[...structures.ifvg, ...structures.fvg].length === 0 && (
              <p className="text-xs text-slate-500 italic p-4 text-center">Scanning live candles for FVG & IFVG footprints...</p>
            )}
          </div>
        </div>

        {/* OB & BOB Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cpu size={16} className="text-purple-400" />
            Order Blocks & Breakers (OB / BOB)
          </h3>
          <div className="space-y-3">
            {[...structures.bob, ...structures.ob].slice(0, 5).map((zone, idx) => (
              <div 
                key={zone.id || idx}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase font-mono ${
                    zone.pattern === 'BOB' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {zone.pattern}
                  </span>
                  <div>
                    <span className="font-mono font-bold text-white">
                      ₹{zone.bottom.toLocaleString()} - ₹{zone.top.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {zone.trend} • Breaker Status: {zone.pattern === 'BOB' ? 'Violated into S/R' : 'Active Footprint'}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Confirmed
                </span>
              </div>
            ))}
            {[...structures.bob, ...structures.ob].length === 0 && (
              <p className="text-xs text-slate-500 italic p-4 text-center">Scanning live candles for Order Block footprints...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
