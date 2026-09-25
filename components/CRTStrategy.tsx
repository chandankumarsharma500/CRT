import React, { useState, useEffect } from 'react';
import { 
  Maximize2, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Crosshair, 
  RefreshCw, 
  ShieldAlert, 
  Zap, 
  ChevronRight, 
  CheckCircle2, 
  Compass, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info, 
  Clock, 
  Sliders, 
  Sparkles, 
  BarChart2, 
  Target, 
  Flame, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Award,
  Cpu
} from 'lucide-react';
import { CRTLogic, CRT_SUPPORTED_ASSETS } from '../services/crtLogic';
import { CRTTimeframe, CRTMultiTFAnalysis, CRTCandleMarking, FiveMinExecutionModel } from '../types';
import { CRTKillZoneView, CRTSMTDivergenceView, CRTQualityScoreView } from './CRTHighAccuracyFilters';
import { QuantumCoreMetricsView } from './QuantumCoreMetricsView';

export const CRTStrategy: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NIFTY');
  const [selectedTF, setSelectedTF] = useState<CRTTimeframe | 'ALL'>('ALL');
  const [analysis, setAnalysis] = useState<CRTMultiTFAnalysis | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    | 'FIVE_MIN_SNIPER' 
    | 'QUANTUM_CORE'
    | 'QUALITY_GRADER'
    | 'KILL_ZONES' 
    | 'SMT_RADAR' 
    | 'LIQUIDITY_MAP' 
    | 'VISUAL_RANGES' 
    | 'SIGNALS' 
    | 'CONFLUENCE_MATRIX'
  >('FIVE_MIN_SNIPER');
  const [activeSniperTF, setActiveSniperTF] = useState<CRTTimeframe>('DAILY');

  const refreshData = () => {
    setIsRefreshing(true);
    const result = CRTLogic.analyzeAsset(selectedSymbol);
    setAnalysis(result);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  useEffect(() => {
    refreshData();
  }, [selectedSymbol]);

  if (!analysis) return null;

  const timeframes: CRTTimeframe[] = ['MONTHLY', 'WEEKLY', 'DAILY', '4H', '1H'];
  const displayedTimeframes = selectedTF === 'ALL' ? timeframes : [selectedTF];
  const active5MSetup = analysis.markings[activeSniperTF].fiveMinSetup;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-600/20">
              <Maximize2 size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                  CRT Strategy
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Candle Range Theory + 5M Sniper
                  </span>
                </h1>
              </div>
              <p className="text-xs lg:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Institutional Multi-Timeframe Liquidity Sweeps (Monthly, Weekly, Daily, 4H, 1H) with <strong className="text-emerald-400 font-bold">5-Minute (5M) Precision Execution</strong>, MSS confirmation, 5M FVG mitigation, and 50% Equilibrium scaling.
              </p>
            </div>
          </div>

          {/* Symbol Selector & Refresh */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
              {CRT_SUPPORTED_ASSETS.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedSymbol(asset.symbol)}
                  className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    selectedSymbol === asset.symbol
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {asset.symbol}
                </button>
              ))}
            </div>

            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-all active:scale-95 flex items-center justify-center"
              title="Refresh CRT Scan"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-indigo-400' : ''} />
            </button>
          </div>
        </div>

        {/* Global Confluence Indicator Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80 relative z-10">
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Spot Price</span>
            <div className="text-base font-black font-mono text-white mt-0.5">
              ₹{analysis.currentPrice.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">5-TF Bias</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {analysis.confluentBias.includes('BULLISH') ? (
                <>
                  <TrendingUp size={15} className="text-emerald-400" />
                  <span className="text-xs font-black text-emerald-400 tracking-wide">{analysis.confluentBias.replace('_', ' ')}</span>
                </>
              ) : analysis.confluentBias.includes('BEARISH') ? (
                <>
                  <TrendingDown size={15} className="text-rose-400" />
                  <span className="text-xs font-black text-rose-400 tracking-wide">{analysis.confluentBias.replace('_', ' ')}</span>
                </>
              ) : (
                <>
                  <Compass size={15} className="text-amber-400" />
                  <span className="text-xs font-black text-amber-400 tracking-wide">EQUILIBRIUM</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl cursor-pointer hover:border-indigo-500/40 transition-all" onClick={() => setActiveTab('KILL_ZONES')}>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Kill Zone Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${analysis.killZone.isHighAccuracyWindow ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className={`text-xs font-bold truncate ${analysis.killZone.isHighAccuracyWindow ? 'text-emerald-400' : 'text-amber-400'}`}>
                {analysis.killZone.sessionName.split(' ')[0]}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl cursor-pointer hover:border-purple-500/40 transition-all" onClick={() => setActiveTab('SMT_RADAR')}>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">SMT Correlation</span>
            <div className="text-xs font-bold font-mono text-purple-300 mt-0.5 flex items-center gap-1">
              <Zap size={13} className="text-purple-400" />
              <span>{analysis.smtDivergence.status.includes('BEARISH') ? 'Bearish SMT' : analysis.smtDivergence.status.includes('BULLISH') ? 'Bullish SMT' : 'Neutral'}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl cursor-pointer hover:border-emerald-500/40 transition-all" onClick={() => setActiveTab('QUALITY_GRADER')}>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Setup Grade</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-black font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {analysis.overallQualityScore.grade} Tier
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {analysis.overallQualityScore.totalScore}/100
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">5M Execution</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-black text-emerald-400 font-mono">
                Sniper Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* View Tabs */}
        <div className="flex flex-wrap bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('FIVE_MIN_SNIPER')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'FIVE_MIN_SNIPER'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target size={14} className="text-emerald-300" /> 5M Sniper Entry
          </button>
          <button
            onClick={() => setActiveTab('QUANTUM_CORE')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'QUANTUM_CORE'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu size={14} className="text-indigo-400" /> Quantum Core (IFVG/OB)
          </button>
          <button
            onClick={() => setActiveTab('QUALITY_GRADER')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'QUALITY_GRADER'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award size={14} className="text-amber-400" /> A+ Setup Grader
          </button>
          <button
            onClick={() => setActiveTab('KILL_ZONES')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'KILL_ZONES'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock size={14} className="text-emerald-400" /> Kill Zones
          </button>
          <button
            onClick={() => setActiveTab('SMT_RADAR')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'SMT_RADAR'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap size={14} className="text-purple-400" /> SMT Radar
          </button>
          <button
            onClick={() => setActiveTab('LIQUIDITY_MAP')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'LIQUIDITY_MAP'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame size={14} className="text-amber-400" /> Liquidity Radar
          </button>
          <button
            onClick={() => setActiveTab('VISUAL_RANGES')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'VISUAL_RANGES'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={14} /> Ranges
          </button>
          <button
            onClick={() => setActiveTab('SIGNALS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'SIGNALS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} /> Signals ({analysis.activeSignals.length})
          </button>
          <button
            onClick={() => setActiveTab('CONFLUENCE_MATRIX')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'CONFLUENCE_MATRIX'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 size={14} /> Matrix
          </button>
        </div>

        {/* Timeframe Filter for Visual Ranges */}
        {activeTab === 'VISUAL_RANGES' && (
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Filter:</span>
            {(['ALL', 'MONTHLY', 'WEEKLY', 'DAILY', '4H', '1H'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTF(tf)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase transition-all ${
                  selectedTF === tf
                    ? 'bg-slate-700 text-white border border-slate-600'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 0: 5-MINUTE SNIPER EXECUTION ENGINE (PRIMARY USER REQUEST) */}
      {activeTab === 'FIVE_MIN_SNIPER' && (
        <div className="space-y-6">
          {/* HTF Setup Anchor Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Select Higher Timeframe CRT Origin (Whichever Timeframe Forms CRT Range/Sweep):
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Regardless of whether CRT forms on Monthly, Weekly, Daily, 4H, or 1H, <span className="text-emerald-400 font-bold">your entry is strictly executed on 5-Minute (5M)</span>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                {timeframes.map((tf) => {
                  const m = analysis.markings[tf];
                  const hasSweep = m.state === 'HIGH_SWEPT' || m.state === 'LOW_SWEPT';
                  return (
                    <button
                      key={tf}
                      onClick={() => setActiveSniperTF(tf)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                        activeSniperTF === tf
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {hasSweep && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                      <span>{tf}</span>
                      {hasSweep && <span className="text-[9px] text-amber-300 font-mono font-bold">SWEEP</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5M Sniper Execution Deck */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: 5M Execution Blueprint & Metrics */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                        active5MSetup.direction === 'LONG'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        5M SNIPER {active5MSetup.direction}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        HTF Anchor: {activeSniperTF} CRT
                      </span>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        R:R {active5MSetup.riskRewardRatio}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white">{active5MSetup.setupTitle}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {active5MSetup.liquiditySwept} • Switch to 5M chart to enter inside the 5M Fair Value Gap after displacement MSS.
                    </p>
                  </div>

                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Risk vs Reward</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      {active5MSetup.riskRewardRatio}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Risk: {active5MSetup.riskPoints5M} pts | Gain: +{active5MSetup.rewardPoints2} pts
                    </span>
                  </div>
                </div>

                {/* 5M Sniper Order Box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="bg-slate-950/80 border border-indigo-500/30 p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">5M Limit Entry</span>
                    <div className="text-lg font-black font-mono text-white">
                      ₹{active5MSetup.optimalEntry5M.toLocaleString()}
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-0.5">5M FVG 50% CE</span>
                  </div>

                  <div className="bg-slate-950/80 border border-rose-500/30 p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">5M Tight Stop Loss</span>
                    <div className="text-lg font-black font-mono text-rose-400">
                      ₹{active5MSetup.stopLoss5M.toLocaleString()}
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Risk: {active5MSetup.riskPoints5M} pts</span>
                  </div>

                  <div className="bg-slate-950/80 border border-amber-500/30 p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">TP1: HTF 50% EQ</span>
                    <div className="text-lg font-black font-mono text-amber-400">
                      ₹{active5MSetup.tp1EquilibriumHTF.toLocaleString()}
                    </div>
                    <span className="text-[9px] text-emerald-400 font-mono block mt-0.5">+{active5MSetup.rewardPoints1} pts (Book 50%)</span>
                  </div>

                  <div className="bg-slate-950/80 border border-emerald-500/30 p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">TP2: Opposite Liquidity</span>
                    <div className="text-lg font-black font-mono text-emerald-400">
                      ₹{active5MSetup.tp2OppositeLiquidityHTF.toLocaleString()}
                    </div>
                    <span className="text-[9px] text-emerald-400 font-mono block mt-0.5">+{active5MSetup.rewardPoints2} pts (Full Run)</span>
                  </div>
                </div>

                {/* 5-Minute Candlestick Flow Diagram */}
                <div className="mt-6 bg-slate-950/90 border border-slate-800 rounded-2xl p-5">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-4 flex items-center gap-2">
                    <Sliders size={16} className="text-indigo-400" />
                    5-Minute Sniper Candlestick Lifecycle
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-indigo-400 text-xs font-black mb-1">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px]">1</span>
                        HTF SWEEP
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Wick grabs liquidity at ₹{active5MSetup.sweepPrice.toLocaleString()} ({activeSniperTF} level).
                      </p>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-black mb-1">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">2</span>
                        5M MSS BREAK
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        5M candle body closes {active5MSetup.direction === 'LONG' ? 'above' : 'below'} swing level ₹{active5MSetup.fiveMinMSSLevel.toLocaleString()}.
                      </p>
                    </div>

                    <div className="bg-slate-900/80 border border-emerald-500/30 p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-black mb-1">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
                        5M FVG RETEST
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Price pulls back into 5M FVG [₹{active5MSetup.fiveMinFVG.bottom} - ₹{active5MSetup.fiveMinFVG.top}]. Enter @ CE.
                      </p>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-purple-400 text-xs font-black mb-1">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">4</span>
                        HTF EXPANSION
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Aggressive run towards HTF 50% Equilibrium and opposite liquidity pool.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5M FVG Detail Zone Box */}
                <div className="mt-4 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-400" />
                    <div>
                      <span className="font-bold text-white">5M Fair Value Gap (Imbalance Zone): </span>
                      <span className="text-indigo-300 font-mono">
                        ₹{active5MSetup.fiveMinFVG.bottom.toLocaleString()} — ₹{active5MSetup.fiveMinFVG.top.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-slate-400 text-[11px] font-mono">
                    Consequent Encroachment (50% CE): <strong className="text-emerald-400">₹{active5MSetup.fiveMinFVG.consequentEncroachment.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Institutional 5-Step Checklist */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    5M Sniper Checklist
                  </h3>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    5 Steps
                  </span>
                </div>

                <div className="space-y-4 mt-5">
                  {active5MSetup.checklist.map((item) => (
                    <div
                      key={item.step}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        item.completed
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                            item.completed
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.completed ? <Check size={14} /> : item.step}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white">{item.title}</h4>
                            {item.completed && (
                              <span className="text-[9px] font-black uppercase text-emerald-400">DONE</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Risk-To-Reward Comparison Box */}
                <div className="mt-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
                    Why 5-Minute Entry is Superior:
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Standard HTF Entry Risk:</span>
                      <span className="font-mono text-rose-400">~{analysis.markings[activeSniperTF].rangeSpan / 2} pts (1:1.6 R:R)</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-400 font-bold border-t border-slate-800 pt-2">
                      <span>5-Minute Sniper Entry Risk:</span>
                      <span className="font-mono text-emerald-300">~{active5MSetup.riskPoints5M} pts ({active5MSetup.riskRewardRatio} R:R)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* High-Accuracy Institutional Confluence Layer */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Institutional High-Accuracy Confluence Layer
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Setup Grade:</span>
                <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {analysis.overallQualityScore.grade} Tier ({analysis.overallQualityScore.totalScore}/100)
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  ({analysis.overallQualityScore.estimatedWinRate})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
              {/* 1. Wick Acceptance vs Body Breakout */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400 font-bold">1. Wick Absorption</span>
                  <span className="text-emerald-400 font-bold text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10">VALID SWEEP</span>
                </div>
                <p className="text-xs text-white font-bold">{analysis.markings[activeSniperTF].sweepValidation.details.split('.')[0]}.</p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Rejection Wick: {analysis.markings[activeSniperTF].sweepValidation.rejectionWickRatio}% of range (Clean stop run, no body acceptance outside).
                </span>
              </div>

              {/* 2. Kill Zone Session */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-indigo-500/40 transition-all" onClick={() => setActiveTab('KILL_ZONES')}>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400 font-bold">2. Kill Zone Window</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    analysis.killZone.isHighAccuracyWindow ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {analysis.killZone.isHighAccuracyWindow ? 'PRIME TIMING' : 'CHOP WARNING'}
                  </span>
                </div>
                <p className="text-xs text-white font-bold">{analysis.killZone.sessionName}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {analysis.killZone.timeWindowIST} • {analysis.killZone.tradeRecommendation.replace(/_/g, ' ')}
                </span>
              </div>

              {/* 3. SMT Divergence */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-purple-500/40 transition-all" onClick={() => setActiveTab('SMT_RADAR')}>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400 font-bold">3. SMT Divergence</span>
                  <span className="text-purple-400 font-bold text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10">+{analysis.smtDivergence.accuracyBoostPercent}% BOOST</span>
                </div>
                <p className="text-xs text-white font-bold">{analysis.smtDivergence.title.split('(')[0]}</p>
                <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                  {analysis.smtDivergence.primarySymbol} swept vs {analysis.smtDivergence.correlatedSymbol} divergence
                </span>
              </div>

              {/* 4. 5M Displacement & Volume */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400 font-bold">4. 5M Displacement</span>
                  <span className="text-indigo-400 font-bold text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10">URGENCY</span>
                </div>
                <p className="text-xs text-white font-bold">{analysis.markings[activeSniperTF].displacementMetrics.candleBodyRatio}% Body Ratio</p>
                <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                  Volume: {analysis.markings[activeSniperTF].displacementMetrics.relativeVolumeDelta}x avg • FVG Clean: {analysis.markings[activeSniperTF].displacementMetrics.fvgCleanlinessScore}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: QUANTUM CORE (IFVG / FVG / OB / BOB) */}
      {activeTab === 'QUANTUM_CORE' && (
        <QuantumCoreMetricsView 
          symbol={analysis.symbol}
          currentPrice={analysis.currentPrice}
          quantumCore={analysis.quantumCore}
        />
      )}

      {/* TAB: QUALITY GRADER */}
      {activeTab === 'QUALITY_GRADER' && (
        <CRTQualityScoreView 
          score={analysis.overallQualityScore}
          marking={analysis.markings[activeSniperTF]}
          killZone={analysis.killZone}
          smt={analysis.smtDivergence}
        />
      )}

      {/* TAB: KILL ZONES */}
      {activeTab === 'KILL_ZONES' && (
        <CRTKillZoneView killZone={analysis.killZone} />
      )}

      {/* TAB: SMT RADAR */}
      {activeTab === 'SMT_RADAR' && (
        <CRTSMTDivergenceView smt={analysis.smtDivergence} />
      )}

      {/* TAB 1: LIQUIDITY RADAR (BSL / SSL) */}
      {activeTab === 'LIQUIDITY_MAP' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
                  <Flame size={20} className="text-amber-400" />
                  Institutional Liquidity Radar
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Complete map of resting Buy-Side Liquidity (BSL) above candle highs and Sell-Side Liquidity (SSL) below candle lows.
                </p>
              </div>

              <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                Live Price: <strong className="text-white">₹{analysis.currentPrice.toLocaleString()}</strong>
              </div>
            </div>

            {/* Liquidity Grid: BSL vs SSL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Buy-Side Liquidity Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-rose-950/20 border border-rose-500/30 p-3.5 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                      Buy-Side Liquidity Pools (BSL)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Retail Buy Stops Above Highs</span>
                </div>

                <div className="space-y-3">
                  {timeframes.map((tf) => {
                    const pool = analysis.markings[tf].bslPool;
                    const distance = pool.price - analysis.currentPrice;
                    const isSwept = pool.status === 'SWEPT';

                    return (
                      <div
                        key={pool.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isSwept
                            ? 'bg-rose-950/30 border-rose-500/50 shadow-md shadow-rose-950/20'
                            : 'bg-slate-950/70 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                              {tf}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-1">{pool.name}</h4>
                          </div>

                          <div className="text-right font-mono">
                            <span className="text-base font-bold text-rose-400">₹{pool.price.toLocaleString()}</span>
                            <span className="text-[10px] block text-slate-400">
                              {isSwept ? (
                                <span className="text-rose-400 font-bold">SWEPT BY WICK (+{pool.sweptPoints} pts)</span>
                              ) : (
                                <span>+{distance} pts away ({((distance / analysis.currentPrice) * 100).toFixed(2)}%)</span>
                              )}
                            </span>
                          </div>
                        </div>

                        {isSwept && (
                          <div className="mt-2.5 pt-2.5 border-t border-rose-500/20 flex items-center justify-between text-[11px]">
                            <span className="text-rose-300">⚡ Liquidity Purged: Target 5M Short Setup</span>
                            <button
                              onClick={() => {
                                setActiveSniperTF(tf);
                                setActiveTab('FIVE_MIN_SNIPER');
                              }}
                              className="text-xs font-bold text-white hover:text-emerald-400 flex items-center gap-1"
                            >
                              Execute on 5M <ArrowRight size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sell-Side Liquidity Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      Sell-Side Liquidity Pools (SSL)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Retail Sell Stops Below Lows</span>
                </div>

                <div className="space-y-3">
                  {timeframes.map((tf) => {
                    const pool = analysis.markings[tf].sslPool;
                    const distance = analysis.currentPrice - pool.price;
                    const isSwept = pool.status === 'SWEPT';

                    return (
                      <div
                        key={pool.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isSwept
                            ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                            : 'bg-slate-950/70 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                              {tf}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-1">{pool.name}</h4>
                          </div>

                          <div className="text-right font-mono">
                            <span className="text-base font-bold text-emerald-400">₹{pool.price.toLocaleString()}</span>
                            <span className="text-[10px] block text-slate-400">
                              {isSwept ? (
                                <span className="text-emerald-400 font-bold">SWEPT BY WICK (-{pool.sweptPoints} pts)</span>
                              ) : (
                                <span>-{distance} pts away ({((distance / analysis.currentPrice) * 100).toFixed(2)}%)</span>
                              )}
                            </span>
                          </div>
                        </div>

                        {isSwept && (
                          <div className="mt-2.5 pt-2.5 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
                            <span className="text-emerald-300">⚡ Liquidity Purged: Target 5M Long Setup</span>
                            <button
                              onClick={() => {
                                setActiveSniperTF(tf);
                                setActiveTab('FIVE_MIN_SNIPER');
                              }}
                              className="text-xs font-bold text-white hover:text-emerald-400 flex items-center gap-1"
                            >
                              Execute on 5M <ArrowRight size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL CANDLE RANGES */}
      {activeTab === 'VISUAL_RANGES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTimeframes.map((tf) => {
            const marking = analysis.markings[tf];
            return (
              <CRTCandleCard 
                key={tf} 
                marking={marking} 
                currentPrice={analysis.currentPrice}
                onSelect5M={() => {
                  setActiveSniperTF(tf);
                  setActiveTab('FIVE_MIN_SNIPER');
                }}
              />
            );
          })}
        </div>
      )}

      {/* TAB 3: ACTIVE CRT SIGNALS */}
      {activeTab === 'SIGNALS' && (
        <div className="space-y-4">
          {analysis.activeSignals.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              <Crosshair size={36} className="mx-auto mb-3 text-slate-600" />
              <h3 className="text-base font-bold text-white uppercase tracking-tight">No Active Sweep Setup Triggered</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Candle ranges are currently in fair-value equilibrium without extreme High/Low liquidity sweeps on monitored timeframes.
              </p>
            </div>
          ) : (
            analysis.activeSignals.map((signal, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 transition-all relative overflow-hidden group shadow-lg"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                        signal.type.includes('BUY') 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {signal.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {signal.timeframe} CRT Anchor
                      </span>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        5-Minute Execution
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        Win Rate: {signal.confidence}%
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{signal.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">{signal.description}</p>
                    
                    {/* 5M Execution Guide */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-mono flex items-center gap-2">
                      <Target size={14} className="text-emerald-400 shrink-0" />
                      <span>{signal.fiveMinExecutionGuide}</span>
                    </div>
                  </div>

                  {/* Level Metrics */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">5M Limit Entry</span>
                        <span className="font-mono text-sm font-bold text-white">₹{signal.entry.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-rose-400 block">5M Tight SL</span>
                        <span className="font-mono text-sm font-bold text-rose-400">₹{signal.stopLoss.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-emerald-400 block">TP1 (50% EQ)</span>
                        <span className="font-mono text-sm font-bold text-emerald-400">₹{signal.tp1.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-indigo-400 block">TP2 (Range Ext.)</span>
                        <span className="font-mono text-sm font-bold text-indigo-400">₹{signal.tp2.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveSniperTF(signal.timeframe);
                        setActiveTab('FIVE_MIN_SNIPER');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                    >
                      Open 5M Sniper Blueprint <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: 5-TF CONFLUENCE MATRIX */}
      {activeTab === 'CONFLUENCE_MATRIX' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 bg-slate-950/60 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <Compass size={18} className="text-indigo-400" />
              Multi-Timeframe Candle Range Alignment Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live alignment across Monthly, Weekly, Daily, 4H, and 1H candles showing Premium vs Discount status and 5M entry state.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <tr>
                  <th className="px-6 py-4">Timeframe</th>
                  <th className="px-6 py-4">Candle Range (High - Low)</th>
                  <th className="px-6 py-4">50% Equilibrium (EQ)</th>
                  <th className="px-6 py-4">Current Zone</th>
                  <th className="px-6 py-4">Sweep Status</th>
                  <th className="px-6 py-4">CRT Bias</th>
                  <th className="px-6 py-4">5M Sniper Entry</th>
                  <th className="px-6 py-4 text-right">5M Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {timeframes.map((tf) => {
                  const m = analysis.markings[tf];
                  const s = m.fiveMinSetup;

                  return (
                    <tr key={tf} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        {tf}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {m.high.toLocaleString()} - {m.low.toLocaleString()}
                        <span className="text-[10px] text-slate-500 ml-1">({m.rangeSpan} pts)</span>
                      </td>
                      <td className="px-6 py-4 text-amber-400 font-bold">
                        {m.equilibrium.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          m.zone === 'DISCOUNT' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : m.zone === 'PREMIUM'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {m.zone}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold ${
                          m.state === 'HIGH_SWEPT' 
                            ? 'text-rose-400' 
                            : m.state === 'LOW_SWEPT' 
                            ? 'text-emerald-400' 
                            : 'text-slate-400'
                        }`}>
                          {m.state.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold flex items-center gap-1 ${
                          m.bias === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {m.bias === 'BULLISH' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {m.bias}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-indigo-300 font-bold">
                        ₹{s.optimalEntry5M.toLocaleString()} ({s.riskRewardRatio})
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setActiveSniperTF(tf);
                            setActiveTab('FIVE_MIN_SNIPER');
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-all text-[10px] font-bold uppercase"
                        >
                          View 5M
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Strategy Summary & Rules Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Info size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              CRT Institutional Liquidity & 5-Minute Execution Protocol:
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 mt-3">
              <li className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <strong className="text-indigo-400 block mb-1">1. HTF Liquidity Grab:</strong>
                Monthly, Weekly, Daily, 4H, or 1H candle sweeps resting Buy-Side Liquidity (BSL) or Sell-Side Liquidity (SSL) by a wick.
              </li>
              <li className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <strong className="text-emerald-400 block mb-1">2. 5-Minute (5M) MSS & FVG:</strong>
                Switch immediately to the 5-Minute chart. Look for a Market Structure Shift (MSS) displacement body close and the formation of a 5M Fair Value Gap (FVG).
              </li>
              <li className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <strong className="text-amber-400 block mb-1">3. Sniper Risk-to-Reward:</strong>
                Enter limit order on 5M FVG Consequent Encroachment (50% CE) with tight 5M SL. Scale 50% partials at HTF 50% Equilibrium (EQ) and ride runner to opposite extreme!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CRTCandleCardProps {
  marking: CRTCandleMarking;
  currentPrice: number;
  onSelect5M?: () => void;
}

const CRTCandleCard: React.FC<CRTCandleCardProps> = ({ marking, currentPrice, onSelect5M }) => {
  // Calculate relative percent height for visual gauge (0% at Low, 100% at High)
  const range = marking.rangeSpan || 1;
  const currentRatio = Math.max(0, Math.min(100, ((currentPrice - marking.low) / range) * 100));
  const openRatio = Math.max(0, Math.min(100, ((marking.open - marking.low) / range) * 100));

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 transition-all shadow-xl flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {marking.timeframe}
              </span>
              <h3 className="text-sm font-bold text-white">{marking.periodLabel}</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
              Range: {marking.rangeSpan} points
            </span>
          </div>

          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
            marking.bias === 'BULLISH' 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}>
            {marking.bias}
          </span>
        </div>

        {/* Visual Range Indicator Diagram */}
        <div className="my-6 bg-slate-950/80 rounded-2xl p-4 border border-slate-800">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-2">
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <span className="w-2 h-0.5 bg-rose-500 rounded" />
              {marking.highLabel} (BSL)
            </span>
            <span className="font-bold text-white font-mono">₹{marking.high.toLocaleString()}</span>
          </div>

          {/* Candle Range Vertical Gauge */}
          <div className="relative h-28 w-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden my-2 flex items-center justify-center">
            {/* Premium / Discount Background split */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-rose-500/5" title="Premium Zone" />
            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-emerald-500/5" title="Discount Zone" />

            {/* 50% Equilibrium Line */}
            <div className="absolute top-1/2 inset-x-0 border-b border-dashed border-amber-500/80 z-10 flex items-center justify-between px-3">
              <span className="text-[9px] font-bold font-mono text-amber-400 bg-slate-950/90 px-1.5 py-0.5 rounded">
                50% EQ: ₹{marking.equilibrium.toLocaleString()}
              </span>
              <span className="text-[8px] uppercase tracking-widest text-amber-500/80">Equilibrium</span>
            </div>

            {/* Candle Open Marker */}
            <div 
              className="absolute inset-x-0 border-b border-slate-500/50 z-10" 
              style={{ bottom: `${openRatio}%` }} 
            />

            {/* Current Price Pointer */}
            <div 
              className="absolute inset-x-0 z-20 flex items-center justify-end px-3 -translate-y-1/2 pointer-events-none"
              style={{ bottom: `${currentRatio}%` }}
            >
              <div className="flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-md shadow-lg shadow-indigo-600/40 border border-indigo-400 animate-pulse">
                <span>LIVE</span>
                <span>₹{currentPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-0.5 bg-emerald-500 rounded" />
              {marking.lowLabel} (SSL)
            </span>
            <span className="font-bold text-white font-mono">₹{marking.low.toLocaleString()}</span>
          </div>
        </div>

        {/* Detailed Level Table */}
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-slate-400 text-[11px]">Candle Open:</span>
            <span className="font-bold text-slate-200">₹{marking.open.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-slate-400 text-[11px]">Active Zone:</span>
            <span className={`font-bold ${
              marking.zone === 'DISCOUNT' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {marking.zone} ({currentRatio > 50 ? `+${(currentRatio - 50).toFixed(1)}%` : `-${(50 - currentRatio).toFixed(1)}%`})
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-slate-400 text-[11px]">Sweep Status:</span>
            <span className={`font-bold ${
              marking.state === 'HIGH_SWEPT' 
                ? 'text-rose-400' 
                : marking.state === 'LOW_SWEPT' 
                ? 'text-emerald-400' 
                : 'text-slate-400'
            }`}>
              {marking.state.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Target Preview & 5M Button */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px]">
        <div>
          <span className="text-slate-500 block text-[9px]">50% EQ Target:</span>
          <span className="font-mono font-bold text-indigo-400">
            ₹{marking.target1.toLocaleString()}
          </span>
        </div>
        {onSelect5M && (
          <button
            onClick={onSelect5M}
            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all font-bold text-xs flex items-center gap-1"
          >
            5M Sniper Plan <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
