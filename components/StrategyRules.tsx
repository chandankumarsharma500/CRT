import React, { useState } from 'react';
import { BookOpen, Shield, Target, TrendingUp, TrendingDown, Clock, PieChart, Maximize2, Compass, Layers, CheckCircle2 } from 'lucide-react';
import { VEGA_THRESHOLDS } from '../services/vegaLogic';

export const StrategyRules: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<'CRT' | 'VEGA'>('CRT');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
            Strategy Manifesto
            <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              v2.0 Multi-Engine
            </span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">Official institutional execution rules and candle mark protocols</p>
        </div>

        {/* Strategy Switcher */}
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setSelectedStrategy('CRT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedStrategy === 'CRT'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Maximize2 size={15} /> CRT Strategy (Candle Range)
          </button>
          <button
            onClick={() => setSelectedStrategy('VEGA')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedStrategy === 'VEGA'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen size={15} /> Vega Divergence
          </button>
        </div>
      </div>

      {/* STRATEGY 1: CRT STRATEGY (CANDLE RANGE THEORY) */}
      {selectedStrategy === 'CRT' && (
        <div className="space-y-6">
          {/* CRT Overview */}
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Maximize2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                  CRT Strategy — Candle Range Theory & Marking System
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Candle Range Theory is based on higher-timeframe candle equilibrium and liquidity distribution. Institutional smart money sweeps the High (Buy-Side Liquidity) or Low (Sell-Side Liquidity) of previous candles across <strong>Monthly, Weekly, Daily, 4-Hour (4H), and 1-Hour (1H)</strong>, seeking mean reversion back to the 50% Equilibrium (EQ) or expansion to the opposite range extreme.
                </p>
              </div>
            </div>

            {/* 5 Timeframe Markings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800">
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-black uppercase text-indigo-400 block">1. Monthly (1M)</span>
                <div className="text-xs font-bold text-white mt-1">Macro Bias Anchor</div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Marks: PMH, PML, MO, MEQ</div>
              </div>
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-black uppercase text-indigo-400 block">2. Weekly (1W)</span>
                <div className="text-xs font-bold text-white mt-1">Swing Trend Driver</div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Marks: PWH, PWL, WO, WEQ</div>
              </div>
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-black uppercase text-indigo-400 block">3. Daily (1D)</span>
                <div className="text-xs font-bold text-white mt-1">Daily Range (PDH/PDL)</div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Marks: PDH, PDL, DO, DEQ</div>
              </div>
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-black uppercase text-indigo-400 block">4. 4-Hour (4H)</span>
                <div className="text-xs font-bold text-white mt-1">Intraday Structure</div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Marks: P4H_H, P4H_L, 4HO, 4H_EQ</div>
              </div>
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-black uppercase text-indigo-400 block">5. 1-Hour (1H)</span>
                <div className="text-xs font-bold text-white mt-1">Sniper Entry Trigger</div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Marks: P1H_H, P1H_L, 1HO, 1H_EQ</div>
              </div>
            </div>
          </div>

          {/* CRT Rules: Bullish vs Bearish */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bullish CRT Setup */}
            <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp size={100} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <TrendingUp size={20} /> Bullish CRT Entry (Spring / Liquidity Sweep)
              </h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span>Candle Low Sweep</span>
                  <span className="font-mono text-emerald-400 font-bold">Wick below PDL / P4H_L / P1H_L</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span>Rejection Closure</span>
                  <span className="font-mono text-emerald-400 font-bold">Close BACK INSIDE Range</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span>Valuation Zone</span>
                  <span className="font-mono text-emerald-400 font-bold">Discount Zone (&lt; 50% Equilibrium)</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span>Confirmation Trigger</span>
                  <span className="font-mono text-emerald-400 font-bold">1H / 15m MSS (Market Structure Shift)</span>
                </li>
                <li className="text-slate-400 mt-2 leading-relaxed">
                  <strong className="text-slate-200">Execution:</strong> Enter long upon closure above swept candle low. Stop loss placed 2-5 points below sweep wick. Target 1 is 50% Equilibrium (EQ), Target 2 is Range High (PDH / P4H_H).
                </li>
              </ul>
            </div>

            {/* Bearish CRT Setup */}
            <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingDown size={100} className="text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-rose-400 mb-4 flex items-center gap-2">
                <TrendingDown size={20} /> Bearish CRT Entry (Turtle Soup / BSL Sweep)
              </h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span>Candle High Sweep</span>
                  <span className="font-mono text-rose-400 font-bold">Wick above PDH / P4H_H / P1H_H</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span>Rejection Closure</span>
                  <span className="font-mono text-rose-400 font-bold">Close BACK INSIDE Range</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span>Valuation Zone</span>
                  <span className="font-mono text-rose-400 font-bold">Premium Zone (&gt; 50% Equilibrium)</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span>Confirmation Trigger</span>
                  <span className="font-mono text-rose-400 font-bold">1H / 15m MSS Bearish Breakdown</span>
                </li>
                <li className="text-slate-400 mt-2 leading-relaxed">
                  <strong className="text-slate-200">Execution:</strong> Enter short upon closure below swept candle high. Stop loss placed 2-5 points above sweep wick. Target 1 is 50% Equilibrium (EQ), Target 2 is Range Low (PDL / P4H_L).
                </li>
              </ul>
            </div>
          </div>

          {/* CRT Mathematical Formulas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold text-sm uppercase">
                <Compass size={18} />
                50% Equilibrium Formula
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-amber-400 font-bold">
                EQ = (Candle_High + Candle_Low) / 2
              </div>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Fair-value midpoint. Prices above EQ are Premium (favorable for selling); prices below EQ are Discount (favorable for buying).
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-sm uppercase">
                <Target size={18} />
                Target Hierarchy
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 font-bold">
                TP1: 50% EQ | TP2: Range Opposite
              </div>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Lock 50% partial profit at Equilibrium, trail stop loss to breakeven, and ride remainder to opposite High or Low.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2 text-rose-400 font-bold text-sm uppercase">
                <Shield size={18} />
                Invalidation Criterion
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-rose-400 font-bold">
                Candle Body Close Outside Range
              </div>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                If candle body closes completely beyond High or Low, the sweep is invalidated and shifts into range expansion mode.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STRATEGY 2: VEGA DIVERGENCE (ORIGINAL) */}
      {selectedStrategy === 'VEGA' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bullish Entry */}
            <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp size={100} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <TrendingUp size={20} /> Bullish Entry Rules
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between text-slate-300 border-b border-slate-700 pb-2">
                  <span>Call Vega Threshold</span>
                  <span className="font-mono text-emerald-400 font-bold">&gt; {VEGA_THRESHOLDS.callVegaHigh}</span>
                </li>
                <li className="flex items-center justify-between text-slate-300 border-b border-slate-700 pb-2">
                  <span>Put Vega Threshold</span>
                  <span className="font-mono text-emerald-400 font-bold">&lt; {VEGA_THRESHOLDS.putVegaLow}</span>
                </li>
                <li className="flex items-center justify-between text-slate-300 border-b border-slate-700 pb-2">
                  <span>Market Trend</span>
                  <span className="font-mono text-emerald-400 font-bold">Bullish</span>
                </li>
                <li className="text-sm text-slate-400 mt-2">
                  <span className="font-semibold text-slate-300">Logic:</span> High Call Vega implies rising premiums in calls, while low negative Put Vega implies support.
                </li>
              </ul>
            </div>

            {/* Bearish Entry */}
            <div className="bg-slate-800/50 border border-rose-500/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingDown size={100} className="text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-rose-400 mb-4 flex items-center gap-2">
                <TrendingDown size={20} /> Bearish Entry Rules
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between text-slate-300 border-b border-slate-700 pb-2">
                  <span>Call Vega Max</span>
                  <span className="font-mono text-rose-400 font-bold">&lt; {VEGA_THRESHOLDS.bearishCallMax}</span>
                </li>
                <li className="flex items-center justify-between text-slate-300 border-b border-slate-700 pb-2">
                  <span>Put Vega Min</span>
                  <span className="font-mono text-rose-400 font-bold">&gt; {VEGA_THRESHOLDS.bearishPutMin}</span>
                </li>
                <li className="flex items-center justify-between text-slate-300 border-b border-slate-700 pb-2">
                  <span>Market Trend</span>
                  <span className="font-mono text-rose-400 font-bold">Bearish</span>
                </li>
                <li className="text-sm text-slate-400 mt-2">
                  <span className="font-semibold text-slate-300">Logic:</span> Positive Put Vega in bearish trend indicates increasing put premiums.
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3 text-blue-400">
                <Target size={24} />
                <h4 className="font-bold text-lg">Exit Rules</h4>
              </div>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li className="flex gap-2"><span className="text-blue-400">•</span> Take Profit: 3% or Vega Reversal (20%)</li>
                <li className="flex gap-2"><span className="text-blue-400">•</span> Stop Loss: 1.5% from entry</li>
                <li className="flex gap-2"><span className="text-blue-400">•</span> Trailing: Breakeven after 2% gain</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3 text-amber-400">
                <PieChart size={24} />
                <h4 className="font-bold text-lg">Position Sizing</h4>
              </div>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li className="flex gap-2"><span className="text-amber-400">•</span> Capital per trade: 2%</li>
                <li className="flex gap-2"><span className="text-amber-400">•</span> Max trades/day: 5</li>
                <li className="flex gap-2"><span className="text-amber-400">•</span> Max concurrent: 3</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3 text-purple-400">
                <Shield size={24} />
                <h4 className="font-bold text-lg">Risk Management</h4>
              </div>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li className="flex gap-2"><span className="text-purple-400">•</span> Daily Loss Limit: 5%</li>
                <li className="flex gap-2"><span className="text-purple-400">•</span> Weekly Loss Limit: 10%</li>
                <li className="flex gap-2"><span className="text-purple-400">•</span> No Trade: First/Last 30 mins</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
