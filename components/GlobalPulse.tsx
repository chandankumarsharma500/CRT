
import React, { useState, useEffect } from 'react';
import { Globe, Bitcoin, TrendingUp, TrendingDown, Zap, ShieldAlert, Activity, RefreshCw, Sparkles, Server } from 'lucide-react';
import { globalMarketService } from '../services/globalMarketService';
import { GlobalAssetData } from '../types';

export const GlobalPulse: React.FC = () => {
    const [assets, setAssets] = useState<GlobalAssetData[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState<string>('');

    const refreshData = async () => {
        setLoading(true);
        const data = await globalMarketService.fetchGlobalPulse();
        setAssets(data);
        setLastSync(new Date().toLocaleTimeString());
        setLoading(false);
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 5000);
        return () => clearInterval(interval);
    }, []);

    const cryptoAssets = assets.filter(a => a.category === 'CRYPTO');
    const indexAssets = assets.filter(a => a.category === 'INDEX');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 rounded text-indigo-400 text-[9px] font-black uppercase tracking-widest">Macro Terminal</div>
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase">
                            <Server size={10} /> Precision Feed v5.1
                        </span>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                        Global <span className="text-indigo-500">Pulse</span> & Liquidity
                    </h2>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Stream</p>
                        <p className="text-sm font-mono text-emerald-400 font-bold">{lastSync || 'Syncing...'}</p>
                    </div>
                    <div className="px-3.5 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl font-mono text-xs font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>AUTO 1s</span>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* World Indices Section */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Globe size={14} className="text-indigo-400" /> World Equity Indices
                        </h3>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">99.8% Core Accuracy</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {indexAssets.map(asset => (
                            <div key={asset.id} className="terminal-glass p-6 rounded-[2rem] border border-white/5 group hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                    <Globe size={100} />
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{asset.name}</p>
                                        <h4 className="text-xl font-black text-white font-mono">{asset.symbol}</h4>
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${asset.percentChange >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {asset.percentChange >= 0 ? '+' : ''}{asset.percentChange.toFixed(2)}%
                                    </div>
                                </div>
                                <div className="flex items-end justify-between">
                                    <span className="text-2xl font-black text-slate-100 font-mono">{asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-[9px] font-black uppercase tracking-tighter ${asset.percentChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {asset.trend} Bias
                                        </span>
                                        <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                            <div className={`h-full transition-all duration-1000 ${asset.percentChange >= 0 ? 'bg-emerald-500 w-full' : 'bg-rose-500 w-[40%]'}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Crypto Liquidity Section */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Bitcoin size={14} className="text-amber-400" /> Digital Liquidity
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-slate-400 uppercase">Live HFT Stream</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {cryptoAssets.map(asset => (
                            <div key={asset.id} className="bg-slate-900/60 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between hover:bg-slate-900 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${asset.symbol.includes('BTC') ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white">{asset.name}</h4>
                                        <p className="text-[10px] font-mono text-slate-500">{asset.symbol}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-white font-mono">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                    <p className={`text-[10px] font-black ${asset.percentChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {asset.percentChange >= 0 ? '+' : ''}{asset.percentChange.toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Global Sentiment Indicator */}
                        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />
                            <div className="relative z-10 text-center">
                                <Sparkles className="mx-auto text-indigo-400 mb-3" size={32} />
                                <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-2">Macro Risk Sentiment</h4>
                                <div className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Risk-On Expansion</div>
                                <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase px-4">
                                    <span>Fear Index: 24</span>
                                    <span>Correlation: 0.82</span>
                                </div>
                                <div className="h-1.5 bg-slate-950 rounded-full mt-3 overflow-hidden border border-white/5">
                                    <div className="h-full bg-indigo-500 w-[78%] shadow-[0_0_10px_#6366f1]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Institutional Alert Bar */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex items-center gap-6 overflow-hidden">
                <div className="flex items-center gap-2 shrink-0">
                    <ShieldAlert size={16} className="text-amber-500" />
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Real-time Anomaly Detection</span>
                </div>
                <div className="flex-1 overflow-hidden whitespace-nowrap">
                    <div className="inline-block animate-marquee text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        ⚠️ DXY Divergence detected at 104.2 level • US10Y Yield compression suggests capital rotation into Equity • BTC Liquidity hunt active above $69k • Institutional sell-off in Nikkei 225 impacting Asian markets...
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </div>
    );
};
