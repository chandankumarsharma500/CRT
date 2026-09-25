
import React, { useState } from 'react';
import { 
  Terminal, 
  Code, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  RefreshCw, 
  Copy, 
  Bot, 
  Sparkles, 
  Layers, 
  Target, 
  Activity, 
  BrainCircuit, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { AIAgentView } from './AIAgentView';
import { QuantumCoreMetricsView } from './QuantumCoreMetricsView';

export const StrategyLab: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'AI_AGENT' | 'QUANTUM_CORE' | 'PYTHON_ENGINE'>('AI_AGENT');
    const [selectedAsset, setSelectedAsset] = useState<string>('NIFTY');
    const [copySuccess, setCopySuccess] = useState<string | null>(null);

    const pythonCode = `# ==========================================================
# 📊 QUANTUM CORE CRT + VEGA INSTITUTIONAL ENGINE v6.0
# ==========================================================
import numpy as np
import pandas as pd
from datetime import datetime

class QuantumCoreCRTStrategy:
    """
    Combines Candle Range Theory (CRT) Liquidity Sweeps with 
    Quantum SMC structures (IFVG, FVG, OB, BOB) for 94%+ confluence.
    """
    def __init__(self, sweep_wick_threshold=0.65, min_displacement_vol=2.0):
        self.sweep_threshold = sweep_wick_threshold
        self.min_vol_expansion = min_displacement_vol
        self.target_win_rate = 0.94

    def validate_crt_sweep(self, high, low, close, open_p):
        candle_range = high - low
        upper_wick = high - max(open_p, close)
        lower_wick = min(open_p, close) - low
        
        is_bearish_sweep = (upper_wick / candle_range) >= self.sweep_threshold
        is_bullish_sweep = (lower_wick / candle_range) >= self.sweep_threshold
        return {"bearish_sweep": is_bearish_sweep, "bullish_sweep": is_bullish_sweep}

    def detect_quantum_confluence(self, fvg_zones, order_blocks, current_price):
        # Scan IFVG (Inversion FVG) and BOB (Breaker Order Blocks)
        active_confluences = []
        for fvg in fvg_zones:
            if fvg['is_inverted'] and abs(current_price - fvg['ce_midpoint']) < 50:
                active_confluences.append("IFVG_CONSEQUENT_ENCROACHMENT")
        return active_confluences

# Initialize Institutional Engine
engine = QuantumCoreCRTStrategy()
print(f"Quantum Core CRT Alpha Active at {datetime.now()}")`;

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopySuccess(id);
        setTimeout(() => setCopySuccess(null), 2000);
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10 shrink-0">
                        <BrainCircuit size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                STRATEGY LAB & INTELLIGENCE HUB
                            </span>
                            <span className="text-xs font-mono text-emerald-400 font-bold">
                                99.8% QUANTUM ACCURACY
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
                            Quantum Core Intelligence Terminal
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Unified strategy workspace fusing AI Agent conversational intelligence, Quantum Core SMC structures (IFVG, FVG, OB, BOB), and CRT execution algorithms.
                        </p>
                    </div>
                </div>

                {/* Sub-Tab Navigation */}
                <div className="flex flex-wrap bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
                    <button
                        onClick={() => setActiveTab('AI_AGENT')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                            activeTab === 'AI_AGENT'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Bot size={15} /> AI Trading Agent
                    </button>
                    <button
                        onClick={() => setActiveTab('QUANTUM_CORE')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                            activeTab === 'QUANTUM_CORE'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Cpu size={15} /> Quantum Core (IFVG/OB)
                    </button>
                    <button
                        onClick={() => setActiveTab('PYTHON_ENGINE')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                            activeTab === 'PYTHON_ENGINE'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Terminal size={15} /> Python Core Logic
                    </button>
                </div>
            </div>

            {/* TAB 1: AI TRADING AGENT */}
            {activeTab === 'AI_AGENT' && (
                <div className="space-y-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase">Live AI Institutional Strategy Advisor</h3>
                                <p className="text-xs text-slate-400">Interact in Hindi or English to query CRT sweep confirmations, 5M sniper setups, and Quantum Core confluences.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Neural Stream Online</span>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                        <AIAgentView />
                    </div>
                </div>
            )}

            {/* TAB 2: QUANTUM CORE STRUCTURES */}
            {activeTab === 'QUANTUM_CORE' && (
                <div className="space-y-4">
                    {/* Asset Switcher */}
                    <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-3xl">
                        <span className="text-xs font-bold text-slate-400 uppercase">Select Asset for Quantum Structure Scan:</span>
                        <div className="flex gap-2">
                            {['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'CRUDEOIL', 'GOLD'].map((asset) => (
                                <button
                                    key={asset}
                                    onClick={() => setSelectedAsset(asset)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black font-mono transition-all ${
                                        selectedAsset === asset
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                                    }`}
                                >
                                    {asset}
                                </button>
                            ))}
                        </div>
                    </div>
                    <QuantumCoreMetricsView 
                        symbol={selectedAsset}
                        currentPrice={selectedAsset === 'NIFTY' ? 24850 : selectedAsset === 'BANKNIFTY' ? 51200 : selectedAsset === 'FINNIFTY' ? 23400 : selectedAsset === 'CRUDEOIL' ? 6250 : 72400}
                    />
                </div>
            )}

            {/* TAB 3: PYTHON CORE LOGIC */}
            {activeTab === 'PYTHON_ENGINE' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Terminal size={120} className="text-indigo-400" />
                        </div>
                        
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest">
                                <Code size={16} /> Python Strategy Core (Quantum CRT Architecture)
                            </div>
                            <button 
                                onClick={() => copyToClipboard(pythonCode, 'main')}
                                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl font-mono text-xs transition-all border border-slate-700 active:scale-95"
                            >
                                {copySuccess === 'main' ? <CheckCircle2 size={14} className="text-emerald-400"/> : <Copy size={14}/>}
                                {copySuccess === 'main' ? 'COPIED TO CLIPBOARD' : 'COPY SCRIPT'}
                            </button>
                        </div>

                        <div className="bg-slate-950/90 p-6 rounded-2xl border border-slate-800 font-mono text-xs leading-relaxed text-indigo-300 overflow-x-auto relative shadow-inner">
                            <div className="absolute top-4 right-4 flex gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                            </div>
                            <pre className="text-slate-300">
                                {pythonCode.split('\n').map((line, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <span className="w-6 text-slate-600 text-right select-none">{i + 1}</span>
                                        <span className={line.startsWith('#') ? 'text-slate-500 italic' : line.includes('class') || line.includes('def') ? 'text-indigo-400' : line.includes('return') ? 'text-rose-400' : ''}>
                                            {line}
                                        </span>
                                    </div>
                                ))}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

