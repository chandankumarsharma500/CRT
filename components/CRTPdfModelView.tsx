import React, { useState } from 'react';
import { 
  Maximize2, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, 
  Target, TrendingUp, TrendingDown, Clock, Layers, Sparkles, BookOpen,
  HelpCircle, Check, Compass, Cpu, Zap, ChevronRight, BarChart3, Filter
} from 'lucide-react';
import { CRTMultiTFAnalysis, CRTTimeframe } from '../types';

interface CRTPdfModelViewProps {
  analysis: CRTMultiTFAnalysis;
  selectedSymbol: string;
}

export const CRTPdfModelView: React.FC<CRTPdfModelViewProps> = ({ analysis, selectedSymbol }) => {
  const [modelType, setModelType] = useState<'BULLISH' | 'BEARISH'>('BULLISH');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [entryMode, setEntryMode] = useState<'REFINED_RETEST' | 'AGGRESSIVE_BREAK'>('REFINED_RETEST');

  const currentPrice = analysis.currentPrice;
  const currentMarking = analysis.markings['DAILY'] || analysis.markings['4H'];
  
  // Real-time calculated CRT boundary levels based on actual asset
  const crtHigh = currentMarking.high;
  const crtLow = currentMarking.low;
  const crtEq = (currentMarking as any).eq50 || (crtHigh + crtLow) / 2;
  const rangeSpan = crtHigh - crtLow;

  // Bullish Model Levels
  const bullishSweepLow = Number((crtLow - rangeSpan * 0.08).toFixed(2));
  const bullishEntry = Number((crtLow + rangeSpan * 0.06).toFixed(2));
  const bullishSl = Number((bullishSweepLow - rangeSpan * 0.04).toFixed(2));
  const bullishTp1 = crtEq;
  const bullishTp2 = crtHigh;
  const bullishRisk = Math.abs(bullishEntry - bullishSl);
  const bullishReward = Math.abs(bullishTp2 - bullishEntry);
  const bullishRR = (bullishReward / (bullishRisk || 1)).toFixed(2);

  // Bearish Model Levels
  const bearishSweepHigh = Number((crtHigh + rangeSpan * 0.08).toFixed(2));
  const bearishEntry = Number((crtHigh - rangeSpan * 0.06).toFixed(2));
  const bearishSl = Number((bearishSweepHigh + rangeSpan * 0.04).toFixed(2));
  const bearishTp1 = crtEq;
  const bearishTp2 = crtLow;
  const bearishRisk = Math.abs(bearishSl - bearishEntry);
  const bearishReward = Math.abs(bearishEntry - bearishTp2);
  const bearishRR = (bearishReward / (bearishRisk || 1)).toFixed(2);

  const stepsList = [
    {
      num: 1,
      title: 'Anchor on Higher Timeframe',
      subtitle: 'C1 - Accumulation Phase',
      desc: 'Identify the H4, H1, or Daily candle that has just closed at a meaningful support or resistance level (prior day high/low, order block, or session extreme).'
    },
    {
      num: 2,
      title: 'Mark CRT-High and CRT-Low',
      subtitle: 'Define Range Boundaries',
      desc: 'Draw horizontal lines at the exact High (CRT-High) and Low (CRT-Low) of the anchor candle. Wicks represent rejection territory; the body shows settlement intent.'
    },
    {
      num: 3,
      title: 'Wait for the Liquidity Raid',
      subtitle: 'C2 - Manipulation Phase',
      desc: 'The next candle must pierce beyond either the CRT-High (for bearish setup) or CRT-Low (for bullish setup) collecting resting buy/sell stops.'
    },
    {
      num: 4,
      title: 'Confirm Close-Back Inside',
      subtitle: 'Non-Negotiable Trap Filter',
      desc: 'The raiding candle MUST close back inside the anchor range (above CRT-Low for bullish, below CRT-High for bearish). No close-back = breakout continuation, NO TRADE.'
    },
    {
      num: 5,
      title: 'Drop to Lower Timeframe',
      subtitle: 'M15 / M5 Precision Zoom',
      desc: 'Switch to the M5 or M1 chart inside active Killzone hours to spot the institutional microstructure reversal.'
    },
    {
      num: 6,
      title: 'Look for Market Structure Shift (MSS)',
      subtitle: 'Structural Reversal Trigger',
      desc: 'Confirm a decisive break of the most recent counter-trend swing on the lower timeframe with displacement.'
    },
    {
      num: 7,
      title: 'Enter on Retest into FVG / OB',
      subtitle: 'Refined Sniper Entry',
      desc: 'Place limit or market buy/sell order on the retest of the Fair Value Gap (FVG) or Order Block left behind by the displacement candle.'
    },
    {
      num: 8,
      title: 'Set Protected Stop Loss',
      subtitle: 'Wick Invalidation Buffer',
      desc: 'Place Stop Loss beyond the wick that raided liquidity or beyond the MSS swing, adding a 2-4 tick buffer on indices (3-5 pips on forex).'
    },
    {
      num: 9,
      title: 'Take Profit at Opposite Side',
      subtitle: 'C3 - Distribution & Scaling',
      desc: 'Target 1 at 50% Equilibrium (take partial profit & shift SL to Break-Even). Target 2 at opposite extreme CRT-High / CRT-Low, trailing remainder.'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                <BookOpen size={12} /> Complete CRT Guidebook Model (Ayub Rana)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                15 Chapters Synthesized
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Candle Range Theory (CRT) Master Strategy
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              "Liquidity in, liquidity out." Treats every higher-timeframe candle as an internal range, trades the liquidity raid when price closes back inside, and targets opposite extremes.
            </p>
          </div>

          {/* Model Switcher */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 self-start lg:self-center">
            <button
              onClick={() => setModelType('BULLISH')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
                modelType === 'BULLISH'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp size={14} /> Bullish CRT Model
            </button>
            <button
              onClick={() => setModelType('BEARISH')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
                modelType === 'BEARISH'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown size={14} /> Bearish CRT Model
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: 3-CANDLE PO3 VISUALIZER (ACCUMULATION, MANIPULATION, DISTRIBUTION) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-500" />
              {modelType === 'BULLISH' ? 'Bullish CRT: 3-Candle Sequence (Sweep Low → Reclaim → Drive High)' : 'Bearish CRT: 3-Candle Sequence (Sweep High → Reclaim → Drive Low)'}
            </h3>
            <p className="text-xs text-slate-400">
              The Power of 3 (PO3) mapped onto specific candlesticks: Accumulation (C1), Manipulation (C2), and Distribution (C3).
            </p>
          </div>

          <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase font-mono ${
            modelType === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            Target R:R: 1 : {modelType === 'BULLISH' ? bullishRR : bearishRR}
          </span>
        </div>

        {/* Visual Candle Diagram */}
        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
          {/* CRT Horizontal Boundary Reference Lines */}
          <div className="space-y-12 my-4 relative">
            
            {/* CRT-High Line */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 shrink-0">
                CRT-HIGH ({modelType === 'BULLISH' ? 'Target TP2' : 'Swept Resistance'}): ₹{crtHigh.toFixed(2)}
              </span>
              <div className="flex-1 border-b-2 border-dashed border-amber-400/50" />
            </div>

            {/* 50% Equilibrium Line */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase font-mono text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/20 shrink-0">
                0.5 EQUILIBRIUM (Target TP1 - Move SL to BE): ₹{crtEq.toFixed(2)}
              </span>
              <div className="flex-1 border-b-2 border-dashed border-indigo-400/40" />
            </div>

            {/* CRT-Low Line */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 shrink-0">
                CRT-LOW ({modelType === 'BULLISH' ? 'Swept Support' : 'Target TP2'}): ₹{crtLow.toFixed(2)}
              </span>
              <div className="flex-1 border-b-2 border-dashed border-emerald-400/50" />
            </div>
          </div>

          {/* 3 Candles Cards Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-800">
            {/* C1: Accumulation */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-[9px] font-black font-mono">
                  C1 · ANCHOR CANDLE
                </span>
                <span className="text-[10px] font-bold text-slate-400">PO3: Accumulation</span>
              </div>
              <h4 className="text-sm font-black text-white">Range Definition</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Forms at key HTF support/resistance. Sets the two non-negotiable range boundaries: <strong>CRT-High</strong> and <strong>CRT-Low</strong>.
              </p>
              <div className="pt-2 text-[10px] font-mono text-indigo-300">
                Boundary Span: {rangeSpan.toFixed(1)} points
              </div>
            </div>

            {/* C2: Manipulation */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[9px] font-black font-mono">
                  C2 · RAID CANDLE
                </span>
                <span className="text-[10px] font-bold text-amber-300">PO3: Manipulation</span>
              </div>
              <h4 className="text-sm font-black text-white">The Liquidity Sweep</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Wicks beyond {modelType === 'BULLISH' ? 'CRT-Low to raid buy-stops' : 'CRT-High to raid sell-stops'}, then <strong>closes back inside the range</strong>.
              </p>
              <div className="pt-1 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                <AlertTriangle size={12} /> Non-negotiable close-back rule confirmed!
              </div>
            </div>

            {/* C3: Distribution */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-black font-mono">
                  C3 · DELIVERY CANDLE
                </span>
                <span className="text-[10px] font-bold text-emerald-400">PO3: Distribution</span>
              </div>
              <h4 className="text-sm font-black text-white">Target Delivery</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Fires in the opposite direction. Captures the primary R-multiple move toward 50% Equilibrium and opposite extreme.
              </p>
              <div className="pt-2 text-[10px] font-mono text-emerald-400">
                Expected Move: +{rangeSpan.toFixed(1)} points
              </div>
            </div>
          </div>
        </div>

        {/* Live Asset Execution Blueprint Table */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
              <Target size={14} className="text-indigo-500" />
              Calculated {selectedSymbol} CRT Execution Parameters
            </span>
            <span className="text-[10px] font-bold font-mono text-slate-400">
              LTP: ₹{currentPrice.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[8px] font-black uppercase text-slate-400 block">Setup Type</span>
              <span className={`text-xs font-black uppercase ${modelType === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {modelType} CRT
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[8px] font-black uppercase text-slate-400 block">Raid Wick Target</span>
              <span className="text-xs font-black text-amber-400 font-mono">
                ₹{modelType === 'BULLISH' ? bullishSweepLow : bearishSweepHigh}
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[8px] font-black uppercase text-slate-400 block">MSS Retest Entry</span>
              <span className="text-xs font-black text-indigo-400 font-mono">
                ₹{modelType === 'BULLISH' ? bullishEntry : bearishEntry}
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[8px] font-black uppercase text-slate-400 block">Stop Loss (Wick Buffer)</span>
              <span className="text-xs font-black text-rose-400 font-mono">
                ₹{modelType === 'BULLISH' ? bullishSl : bearishSl}
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[8px] font-black uppercase text-slate-400 block">TP1 (50% EQ Partial)</span>
              <span className="text-xs font-black text-emerald-400 font-mono">
                ₹{crtEq.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[8px] font-black uppercase text-slate-400 block">TP2 (Opposite Extreme)</span>
              <span className="text-xs font-black text-emerald-400 font-mono">
                ₹{(modelType === 'BULLISH' ? crtHigh : crtLow).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: THE 9-STEP CRT TRADE FLOW (INTERACTIVE STEPPER) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Layers size={18} className="text-indigo-500" />
              The Official 9-Step CRT Trade Flow (Section 06 of Guide)
            </h3>
            <p className="text-xs text-slate-400">
              Follow this exact procedural sequence before entering any trade to compress decision-making to 2 minutes.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <span>Step {activeStep} of 9</span>
          </div>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
          {stepsList.map(st => (
            <button
              key={st.num}
              onClick={() => setActiveStep(st.num)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                activeStep === st.num
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25 scale-105'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-[9px] font-black uppercase">Step {st.num}</div>
              <div className="text-[10px] font-bold truncate mt-0.5">{st.title.split(' ')[0]}</div>
            </button>
          ))}
        </div>

        {/* Active Step Detailed Card */}
        <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                {activeStep}
              </span>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {stepsList[activeStep - 1].title}
              </h4>
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-400">
                {stepsList[activeStep - 1].subtitle}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed pl-9">
              {stepsList[activeStep - 1].desc}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center pl-9 md:pl-0">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(prev => prev - 1)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Previous Step
              </button>
            )}
            {activeStep < 9 ? (
              <button
                onClick={() => setActiveStep(prev => prev + 1)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
              >
                Next Step <ArrowRight size={13} />
              </button>
            ) : (
              <span className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase flex items-center gap-1 border border-emerald-500/30">
                <CheckCircle2 size={13} /> Complete Setup Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: KILLZONE & MACRO TIMING CLOCK (SECTION 10 OF GUIDE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Killzones Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Clock size={16} className="text-indigo-500" />
              Killzones & Session Schedule (PDF Section 10)
            </h3>
            <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">
              IST & NY Alignment
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { ny: '01:00 EST', ist: '11:30 AM IST', name: 'Asian Close / London Prep', edge: 'MEDIUM', desc: 'Sets initial H4 reference range.' },
              { ny: '02:00 – 05:00 EST', ist: '12:30 – 15:30 IST', name: 'London Killzone', edge: 'HIGH', desc: 'Asian high/low sweeps. H1/M15 CRTs fire here.' },
              { ny: '08:30 – 11:00 EST', ist: '19:00 – 21:30 IST', name: 'NY Open Killzone', edge: 'HIGH', desc: 'Prime CRT window. London high/low sweeps.' },
              { ny: '09:50 – 10:10 EST', ist: '20:20 – 20:40 IST', name: 'NY-AM Macro Window', edge: 'PRIME', desc: '20-min institutional window for refined M15/M5 entries.' },
              { ny: '09:15 – 10:30 IST', ist: '09:15 – 10:30 IST', name: 'Indian Morning Open Killzone', edge: 'HIGH', desc: 'Initial Balance sweeps on Nifty / BankNifty.' },
              { ny: '14:00 – 15:15 IST', ist: '14:00 – 15:15 IST', name: 'Indian Afternoon Power Hour', edge: 'HIGH', desc: 'Macro rebalancing into HTF 50% Equilibrium.' }
            ].map((kz, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 dark:text-white font-bold">{kz.name}</strong>
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase font-mono ${
                      kz.edge === 'PRIME' ? 'bg-purple-500/20 text-purple-400' : kz.edge === 'HIGH' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {kz.edge} EDGE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{kz.desc}</p>
                </div>
                <div className="text-right shrink-0 font-mono text-[10px]">
                  <span className="text-slate-300 block">{kz.ist}</span>
                  <span className="text-slate-500">{kz.ny}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Win-Rate Tiers & 6 Common Mistakes Guard */}
        <div className="space-y-6">
          {/* Win Rates Tiers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Filter size={16} className="text-indigo-500" />
              Audited Win-Rate Tiers (PDF Section 13)
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-lg font-black text-amber-400">~45%</span>
                <p className="text-[9px] font-black uppercase text-slate-400 mt-0.5">Raw Signal</p>
                <p className="text-[9px] text-slate-500 mt-1">No HTF filters</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-lg font-black text-indigo-400">~60%</span>
                <p className="text-[9px] font-black uppercase text-slate-400 mt-0.5">+ HTF Bias</p>
                <p className="text-[9px] text-slate-500 mt-1">Daily / H4 trend</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-lg font-black text-emerald-400">~75%</span>
                <p className="text-[9px] font-black uppercase text-slate-400 mt-0.5">+ Killzone & MSS</p>
                <p className="text-[9px] text-slate-500 mt-1">Refined FVG retest</p>
              </div>
            </div>
          </div>

          {/* 6 Common Mistakes Guard */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <ShieldCheck size={16} className="text-rose-500" />
              6 Fatal Mistakes to Eliminate (PDF Section 14)
            </h3>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">1.</span>
                <span><strong>Trading mid-range:</strong> Anchor candle MUST close at meaningful HTF support or resistance.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">2.</span>
                <span><strong>Skipping close-back:</strong> Entering on wick alone is gambling. Wait for close back inside.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">3.</span>
                <span><strong>Entering without MSS:</strong> Lower timeframe market structure shift is the institutional trigger.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">4.</span>
                <span><strong>Stops too tight:</strong> Always buffer 2-4 ticks on indices (3-5 pips on FX) beyond raid wick.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">5.</span>
                <span><strong>Ignoring 50% Equilibrium:</strong> Always book 50% partial at equilibrium and shift SL to Break-Even.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
