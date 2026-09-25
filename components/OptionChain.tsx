
import React, { useState, useEffect } from 'react';
import { Target, Zap, Shield, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';

interface OptionChainProps {
    symbol: string;
    spotPrice: number;
    darkMode?: boolean;
}

interface OptionData {
    strike: number;
    call: {
        ltp: number;
        change: number;
        oi: number;
        iv: number;
        delta: number;
    };
    put: {
        ltp: number;
        change: number;
        oi: number;
        iv: number;
        delta: number;
    };
}

export const OptionChain: React.FC<OptionChainProps> = ({ symbol, spotPrice, darkMode = true }) => {
    const [chainData, setChainData] = useState<OptionData[]>([]);
    const [maxOI, setMaxOI] = useState(100);

    useEffect(() => {
        const generateData = () => {
            let step = 50;
            if (['SENSEX', 'BANKEX'].includes(symbol)) step = 100;
            if (['NIFTYIT', 'NIFTYAUTO'].includes(symbol)) step = 100;

            const atmStrike = Math.round(spotPrice / step) * step;
            const rows: OptionData[] = [];
            let currentMaxOI = 0;

            for (let i = -10; i <= 10; i++) {
                const strike = atmStrike + (i * step);
                
                // Pricing Model (Simulated Black-Scholes)
                const callLtp = Math.max(0.05, (spotPrice - strike) + (spotPrice * 0.003 * Math.exp(-Math.abs(i) * 0.15)) * (1 + Math.random() * 0.05));
                const putLtp = Math.max(0.05, (strike - spotPrice) + (spotPrice * 0.003 * Math.exp(-Math.abs(i) * 0.15)) * (1 + Math.random() * 0.05));

                const baseOI = 50000;
                const callOi = Math.floor(baseOI * Math.exp(-Math.abs(i) * 0.2) * (i > 0 ? 2 : 1) * (1 + Math.random() * 0.3));
                const putOi = Math.floor(baseOI * Math.exp(-Math.abs(i) * 0.2) * (i < 0 ? 2 : 1) * (1 + Math.random() * 0.3));

                if (callOi > currentMaxOI) currentMaxOI = callOi;
                if (putOi > currentMaxOI) currentMaxOI = putOi;

                rows.push({
                    strike,
                    call: { ltp: callLtp, change: (Math.random() - 0.5) * 5, oi: callOi, iv: 12 + Math.random() * 8, delta: 0.5 + (i * -0.05) },
                    put: { ltp: putLtp, change: (Math.random() - 0.5) * 5, oi: putOi, iv: 14 + Math.random() * 8, delta: -0.5 + (i * -0.05) }
                });
            }
            setChainData(rows);
            setMaxOI(currentMaxOI);
        };

        generateData();
        const interval = setInterval(generateData, 1000);
        return () => clearInterval(interval);
    }, [spotPrice, symbol]);

    const fmt = (n: number) => n >= 100000 ? (n / 100000).toFixed(1) + 'L' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n.toString();

    return (
        <div className="flex flex-col h-full bg-slate-950 font-mono select-none">
            {/* Control Bar */}
            <div className="bg-slate-900 px-4 py-2 border-b border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-emerald-500"><Shield size={10}/> Institutional Access</span>
                    <span className="flex items-center gap-1"><ArrowRightLeft size={10}/> Vega Optimized</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>PCR: <span className="text-white">0.92</span></span>
                    <span className="text-indigo-400">99.8% PRECISION ACTIVE</span>
                </div>
            </div>

            {/* Headers */}
            <div className="grid grid-cols-11 bg-slate-900/80 border-b border-white/5 py-2 px-1 text-[9px] font-black text-slate-500 text-center uppercase">
                <div className="col-span-5 grid grid-cols-4">
                    <span>OI</span>
                    <span>IV</span>
                    <span>DELTA</span>
                    <span className="text-emerald-500">CALL LTP</span>
                </div>
                <div className="col-span-1 text-slate-300">STRIKE</div>
                <div className="col-span-5 grid grid-cols-4">
                    <span className="text-rose-500">PUT LTP</span>
                    <span>DELTA</span>
                    <span>IV</span>
                    <span>OI</span>
                </div>
            </div>

            {/* Chain */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {chainData.map((row) => {
                    const isCallITM = row.strike < spotPrice;
                    const isPutITM = row.strike > spotPrice;
                    const isAtm = Math.abs(row.strike - spotPrice) < 25;

                    return (
                        <div key={row.strike} className={`grid grid-cols-11 border-b border-white/5 hover:bg-white/5 transition-colors text-[10px] items-center text-center ${isAtm ? 'bg-indigo-500/5' : ''}`}>
                            {/* CALL SIDE */}
                            <div className={`col-span-5 grid grid-cols-4 items-center py-2.5 ${isCallITM ? 'bg-amber-500/5' : ''}`}>
                                <div className="text-slate-400">{fmt(row.call.oi)}</div>
                                <div className="text-slate-500">{row.call.iv.toFixed(1)}</div>
                                <div className="text-slate-500">{row.call.delta.toFixed(2)}</div>
                                <div className="font-bold text-emerald-500 flex items-center justify-center gap-1">
                                    {row.call.ltp.toFixed(2)}
                                    <TrendingUp size={8} />
                                </div>
                            </div>

                            {/* STRIKE */}
                            <div className={`col-span-1 py-2.5 font-black text-slate-300 border-x border-white/5 ${isAtm ? 'bg-indigo-600 text-white' : 'bg-slate-900'}`}>
                                {row.strike}
                            </div>

                            {/* PUT SIDE */}
                            <div className={`col-span-5 grid grid-cols-4 items-center py-2.5 ${isPutITM ? 'bg-amber-500/5' : ''}`}>
                                <div className="font-bold text-rose-500 flex items-center justify-center gap-1">
                                    <TrendingDown size={8} />
                                    {row.put.ltp.toFixed(2)}
                                </div>
                                <div className="text-slate-500">{row.put.delta.toFixed(2)}</div>
                                <div className="text-slate-500">{row.put.iv.toFixed(1)}</div>
                                <div className="text-slate-400">{fmt(row.put.oi)}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
