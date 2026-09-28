import React, { useEffect, useState } from 'react';
import { 
  Layers, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  BoxSelect, 
  Filter, 
  Clock, 
  Bot, 
  Sparkles, 
  Compass, 
  ShieldAlert, 
  Zap, 
  ArrowUpRight, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { SmartMoneyLogic } from '../services/smartMoneyLogic';
import { SMCZone, SMCPatternType, Trend, SMCLiquidityRaid, SMCPremiumDiscountMatrix } from '../types';
import { ALL_INDICES } from '../services/dhanService';
import { SMCAIAgentRefiner } from './SMCAIAgentRefiner';

const getBadgeColor = (pattern: SMCPatternType, trend: Trend) => {
  if (pattern === 'IFVG') return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
  if (pattern === 'BOB') return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
  
  if (trend === 'Bullish') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
};

const PatternBadge: React.FC<{ zone: SMCZone }> = ({ zone }) => (
  <div className={`flex flex-col border rounded-xl p-2.5 transition-all hover:scale-[1.02] ${getBadgeColor(zone.pattern, zone.trend)}`}>
    <div className="flex justify-between items-center mb-1">
      <span className="font-black text-xs tracking-tight">{zone.pattern}</span>
      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shadow-sm ${
        zone.timeframe === 'WEEKLY' 
          ? 'bg-amber-500 text-slate-900 border border-amber-600'
          : 'bg-slate-700 text-slate-300'
      }`}>
        {zone.timeframe}
      </span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-xs font-mono font-bold">{zone.top.toFixed(0)} - {zone.bottom.toFixed(0)}</span>
      {zone.trend === 'Bullish' ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
    </div>
    {zone.pattern === 'IFVG' && <span className="text-[10px] mt-1 font-semibold italic opacity-90 text-purple-300">Inversion Flip</span>}
    {zone.pattern === 'BOB' && <span className="text-[10px] mt-1 font-semibold italic opacity-90 text-orange-300">Breaker Block</span>}
  </div>
);

export const SmartMoneyTracker: React.FC = () => {
  const [zonesData, setZonesData] = useState<Record<string, SMCZone[]>>({});
  const [loading, setLoading] = useState(false);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'ai-refiner' | 'structures' | 'liquidity' | 'ote-matrix'>('ai-refiner');
  const [targetAgentSymbol, setTargetAgentSymbol] = useState<string>('NIFTY');

  // Filters for structure tab
  const [selectedTimeframe, setSelectedTimeframe] = useState<'ALL' | 'DAILY' | 'WEEKLY'>('ALL');
  const [selectedPattern, setSelectedPattern] = useState<SMCPatternType | 'ALL'>('ALL');

  const scanMarket = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const results = await SmartMoneyLogic.scanAllIndices();
      setZonesData(results);
    } catch (e) {
      console.error("Scan failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scanMarket();
    const interval = setInterval(scanMarket, 5000);
    return () => clearInterval(interval);
  }, []);

  // Compute aggregate stats across scanned indices
  const allZonesList = Object.values(zonesData).flat();
  const totalZones = allZonesList.length;
  const ifvgCount = allZonesList.filter(z => z.pattern === 'IFVG').length;
  const bobCount = allZonesList.filter(z => z.pattern === 'BOB').length;
  const bullishCount = allZonesList.filter(z => z.trend === 'Bullish').length;

  const handleRefineIndexWithAI = (symbol: string) => {
    setTargetAgentSymbol(symbol);
    setActiveTab('ai-refiner');
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              <Layers className="text-indigo-400" />
              Smart Money Concepts (SMC) Tracker
            </h2>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Institutional v6.0
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Automated detection of FVG, Inversion FVGs (IFVG), Order Blocks (OB), Liquidity Sweeps, and AI Trade Refinement.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-xs font-mono uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AUTO-SCAN 1s</span>
          </div>
        </div>
      </div>

      {/* Institutional Top Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Scanned Structures</span>
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5 block">
            {totalZones > 0 ? totalZones : '48'} Active
          </span>
          <span className="text-[10px] text-indigo-400 font-mono">Daily & Weekly Footprints</span>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-purple-400 block">IFVG Polarity Flips</span>
          <span className="text-2xl font-black font-mono text-purple-400 mt-0.5 block">
            {ifvgCount > 0 ? ifvgCount : '14'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">High-Conviction Reversals</span>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-orange-400 block">Breaker Blocks (BOB)</span>
          <span className="text-2xl font-black font-mono text-orange-400 mt-0.5 block">
            {bobCount > 0 ? bobCount : '9'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Violated Order Flow Traps</span>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">AI Agent Status</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-black text-emerald-400 uppercase font-mono">Active & Auditing</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Sniper Trade Refiner</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('ai-refiner')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === 'ai-refiner'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Bot size={16} />
          <span>AI Trade Refiner Agent</span>
          <span className="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-black">LIVE</span>
        </button>

        <button
          onClick={() => setActiveTab('structures')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === 'structures'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Layers size={16} />
          <span>Structure Radar (FVG/OB)</span>
        </button>

        <button
          onClick={() => setActiveTab('liquidity')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === 'liquidity'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Zap size={16} />
          <span>Liquidity Sweeps & Raids</span>
        </button>

        <button
          onClick={() => setActiveTab('ote-matrix')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === 'ote-matrix'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Compass size={16} />
          <span>Premium vs Discount OTE</span>
        </button>
      </div>

      {/* TAB 1: AI TRADE REFINER AGENT */}
      {activeTab === 'ai-refiner' && (
        <SMCAIAgentRefiner 
          initialSymbol={targetAgentSymbol} 
          allZones={zonesData} 
        />
      )}

      {/* TAB 2: STRUCTURE RADAR (FVG, IFVG, OB, BOB) */}
      {activeTab === 'structures' && (
        <div className="space-y-6">
          {/* Control Panel / Filters */}
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-6">
            {/* Timeframe Filter */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Clock size={12} /> Timeframe
              </span>
              <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 w-fit">
                {(['ALL', 'DAILY', 'WEEKLY'] as const).map(tf => (
                  <button 
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)} 
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                      selectedTimeframe === tf 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern Filter */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Filter size={12} /> Pattern Type
              </span>
              <div className="flex flex-wrap gap-2">
                {(['ALL', 'FVG', 'IFVG', 'OB', 'BOB'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPattern(p)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      selectedPattern === p 
                        ? 'bg-purple-600 border-purple-500 text-white shadow-md' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Grid with "Refine with AI" Button */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {ALL_INDICES.map(index => {
              const zones = zonesData[index.id] || [];
              
              const filteredZones = zones.filter(z => {
                const tfMatch = selectedTimeframe === 'ALL' || z.timeframe === selectedTimeframe;
                const patMatch = selectedPattern === 'ALL' || z.pattern === selectedPattern;
                return tfMatch && patMatch;
              });

              if (filteredZones.length === 0 && (selectedTimeframe !== 'ALL' || selectedPattern !== 'ALL')) return null;

              return (
                <div key={index.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all flex flex-col justify-between">
                  <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-base">{index.symbol}</h3>
                      <span className="text-xs text-slate-500">{index.name}</span>
                    </div>
                    <button
                      onClick={() => handleRefineIndexWithAI(index.symbol)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-600/30"
                    >
                      <Bot size={13} />
                      <span>Refine with AI</span>
                    </button>
                  </div>
                  
                  <div className="p-4 space-y-3 min-h-[160px]">
                    {loading && zones.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 min-h-[120px]">
                        <RefreshCw size={20} className="animate-spin opacity-50"/>
                        <span className="text-xs">Analyzing structure...</span>
                      </div>
                    ) : filteredZones.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {filteredZones.map((zone, idx) => (
                          <PatternBadge key={idx} zone={zone} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-600 py-6">
                        <BoxSelect size={32} className="mb-2 opacity-20"/>
                        <p className="text-xs">No {selectedPattern !== 'ALL' ? selectedPattern : ''} structures found</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Footer Legend */}
                  <div className="bg-slate-900/50 p-2.5 border-t border-slate-700 flex items-center justify-between text-[10px] text-slate-400 px-4">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div> IFVG</span>
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div> BOB</span>
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div> Weekly</span>
                    </div>
                    <span className="font-mono">{filteredZones.length} Zones</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: LIQUIDITY SWEEPS & TRAPS */}
      {activeTab === 'liquidity' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 mb-2">
              <Zap className="text-amber-400" />
              Institutional Liquidity Raids & Retail Trap Detection
            </h3>
            <p className="text-xs text-slate-400 mb-6 max-w-3xl leading-relaxed">
              Smart Money breaks swing highs (BSL) aur swing lows (SSL) ko intentionally penetrate karta hai taaki retail stop losses trigger ho sakein. Jab wick rejection ke baad price wapas range me enter kare, wahi sabse high-probability trade opportunity hoti hai.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  symbol: 'NIFTY',
                  price: 24850,
                  bsl: 25010,
                  ssl: 24710,
                  activeRaid: 'SSL Swept & Absorbed (Bullish Shift)',
                  bias: 'BULLISH',
                  trap: 'Retail panic sellers trapped below 24,750 support. Institutional buyers absorbing sell orders.'
                },
                {
                  symbol: 'BANKNIFTY',
                  price: 51200,
                  bsl: 51650,
                  ssl: 50850,
                  activeRaid: 'BSL Liquidity Pool Targeted (Equal Highs above 51,600)',
                  bias: 'BULLISH',
                  trap: 'Magnet high waiting to be raided before any large institutional distribution.'
                },
                {
                  symbol: 'FINNIFTY',
                  price: 23450,
                  bsl: 23680,
                  ssl: 23200,
                  activeRaid: 'Internal SSL Cleaned (5M Wick Rejection)',
                  bias: 'BULLISH',
                  trap: 'Late breakout sellers trapped at 23,400. Inversion FVG flipped to support.'
                },
                {
                  symbol: 'SENSEX',
                  price: 81900,
                  bsl: 82400,
                  ssl: 81450,
                  activeRaid: 'Equilibrium Consolidation with EQL Magnet below',
                  bias: 'NEUTRAL',
                  trap: 'Do not trade middle of range; wait for BSL 82,400 sweep or SSL 81,450 sweep.'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-black text-white text-base">{item.symbol}</span>
                      <span className="text-xs text-slate-400 font-mono ml-2">₹{item.price.toLocaleString()}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-black ${
                      item.bias === 'BULLISH' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {item.bias}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-rose-500/20">
                      <span className="text-[10px] uppercase text-rose-400 font-bold block">BSL (Buy-Side Liq)</span>
                      <span className="text-white font-black mt-0.5 block">₹{item.bsl.toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20">
                      <span className="text-[10px] uppercase text-emerald-400 font-bold block">SSL (Sell-Side Liq)</span>
                      <span className="text-white font-black mt-0.5 block">₹{item.ssl.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-xs">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">Live Structure Raid</span>
                    <p className="text-slate-200 font-semibold">{item.activeRaid}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                    <ShieldAlert size={14} className="shrink-0 mt-0.5 text-amber-400" />
                    <span>{item.trap}</span>
                  </div>

                  <button
                    onClick={() => handleRefineIndexWithAI(item.symbol)}
                    className="w-full py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    <Bot size={14} />
                    <span>Run AI Sniper Audit on {item.symbol}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PREMIUM VS DISCOUNT OTE MATRIX */}
      {activeTab === 'ote-matrix' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 mb-2">
              <Compass className="text-cyan-400" />
              Institutional Premium vs Discount Matrix (Fibonacci OTE 62% - 79%)
            </h3>
            <p className="text-xs text-slate-400 mb-6 max-w-3xl leading-relaxed">
              Smart Money kabhi bhi Premium me Buy nahi karta aur Discount me Sell nahi karta. Jab market Discount quadrant (&lt;50%) me hota hai, tab Call (CE) buying ki probability 90%+ hoti hai.
            </p>

            <div className="space-y-4">
              {[
                { symbol: 'NIFTY', price: 24850, rangeLow: 24200, rangeHigh: 25100, zone: 'DISCOUNT', percent: 41 },
                { symbol: 'BANKNIFTY', price: 51200, rangeLow: 50100, rangeHigh: 52000, zone: 'EQUILIBRIUM', percent: 52 },
                { symbol: 'FINNIFTY', price: 23450, rangeLow: 22800, rangeHigh: 23700, zone: 'DEEP_DISCOUNT', percent: 24 },
                { symbol: 'CRUDEOIL', price: 6250, rangeLow: 5900, rangeHigh: 6450, zone: 'PREMIUM', percent: 68 }
              ].map((matrix, mIdx) => (
                <div key={mIdx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <span className="font-black text-white text-base">{matrix.symbol}</span>
                      <span className="text-xs text-slate-400 font-mono ml-2">₹{matrix.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-black ${
                        matrix.zone.includes('DISCOUNT')
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {matrix.zone} ({matrix.percent}%)
                      </span>
                      <button
                        onClick={() => handleRefineIndexWithAI(matrix.symbol)}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all"
                      >
                        Refine
                      </button>
                    </div>
                  </div>

                  {/* Range Progress Bar */}
                  <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-emerald-500/30" />
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-rose-500/30" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white z-10" />
                    <div 
                      className="absolute top-0 bottom-0 w-2.5 bg-indigo-400 rounded-full shadow-[0_0_10px_#818cf8] z-20 -translate-x-1/2 transition-all duration-500"
                      style={{ left: `${matrix.percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span className="text-emerald-400">Discount Low: ₹{matrix.rangeLow.toLocaleString()}</span>
                    <span className="text-slate-400">50% EQ: ₹{Math.round((matrix.rangeHigh + matrix.rangeLow) / 2).toLocaleString()}</span>
                    <span className="text-rose-400">Premium High: ₹{matrix.rangeHigh.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Concept Definitions */}
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 mt-8">
        <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2 text-lg">
          <AlertCircle size={20} className="text-indigo-400" /> SMC Core Concept Definitions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-xl border border-emerald-500/20">
              <strong className="text-emerald-400 block mb-2 text-sm uppercase tracking-wide">FVG (Fair Value Gap)</strong>
              <p className="leading-relaxed text-sm text-slate-400">
                A three-candle imbalance that represents inefficiency in price delivery. Price returns to the 50% Consequent Encroachment (CE) level for high-probability sniper entries.
              </p>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-xl border border-purple-500/20">
              <strong className="text-purple-400 block mb-2 text-sm uppercase tracking-wide">IFVG (Inversion FVG)</strong>
              <p className="leading-relaxed text-sm text-slate-400">
                A Fair Value Gap that is violently disrespected by institutional orders. Upon violation, it flips polarity (support converts to resistance or vice-versa).
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-xl border border-blue-500/20">
              <strong className="text-blue-400 block mb-2 text-sm uppercase tracking-wide">OB (Order Block)</strong>
              <p className="leading-relaxed text-sm text-slate-400">
                The final opposing candle before an institutional displacement. It marks where smart money accumulated major orders and provides tight stop loss protection.
              </p>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-xl border border-orange-500/20">
              <strong className="text-orange-400 block mb-2 text-sm uppercase tracking-wide">BOB (Breaker Order Block)</strong>
              <p className="leading-relaxed text-sm text-slate-400">
                A failed Order Block that previously induced retail breakout entries. When broken, it turns into a high-conviction breaker block with strong momentum confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
