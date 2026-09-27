import React, { useEffect, useState, useRef } from 'react';
import { Activity, RefreshCw, Search, BarChart2, List, Globe, ChevronRight, TrendingUp, TrendingDown, Radio } from 'lucide-react';
import { getBrokerService } from '../services/brokerFactory';
import { yahooFinanceService, YahooQuote } from '../services/yahooFinanceService';
import { IndexMarketData, IndexDefinition } from '../types';
import { VegaStrategy } from '../services/vegaLogic';
import { TradingViewModal } from './TradingViewModal';

export const IndicesTracker: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => {
  const [indicesData, setIndicesData] = useState<IndexMarketData[]>([]);
  const [yahooQuotes, setYahooQuotes] = useState<Record<string, YahooQuote>>(() => yahooFinanceService.getAllQuotes());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedForModal, setSelectedForModal] = useState<{definition: IndexDefinition, price: number} | null>(null);

  const fetchData = async () => {
    try {
      const brokerService = getBrokerService();
      const data = await brokerService.fetchIndicesMarketData();
      setIndicesData(data);
    } catch (e) {}
  };

  // Subscribe to real-time 1s Yahoo Finance ticks
  useEffect(() => {
    const unsub = yahooFinanceService.subscribe((q) => {
      setYahooQuotes({ ...q });
    });
    return () => unsub();
  }, []);

  // Continuous auto-tick refresh every 1000ms
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = indicesData.filter(d => 
    d.definition.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.definition.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in duration-300">
      <TradingViewModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        indexData={selectedForModal}
      />

      {/* Header */}
      <div className="hud-panel rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-cyan-400 font-extrabold uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>REAL-TIME TAPE READER</span>
            <span>·</span>
            <span className="text-emerald-400">1-SECOND TICK STREAM</span>
          </div>
          <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Market Tape & Vega Divergence
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Streaming real-time orderflow, live LTP ticks, Vega Greeks, and institutional smart money divergence.
          </p>
        </div>

        <button 
          onClick={async () => {
            setLoading(true);
            await yahooFinanceService.refreshAll();
            await fetchData();
            setLoading(false);
          }} 
          className="px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-200 border border-black/5 dark:border-white/10 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-cyan-400' : ''} />
          <span>SYNC TICKS</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="Filter indices (NIFTY, BANK NIFTY, SENSEX, IT, AUTO)..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full hud-panel rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white font-mono text-xs shadow-sm outline-none focus:border-cyan-400 placeholder-slate-500"
        />
      </div>

      {/* Live Indices Cards List */}
      <div className="space-y-2.5">
        {filteredData.map((data) => {
          const trend = VegaStrategy.getDetailedTrend(data.difference);
          const yq = yahooQuotes[data.definition.id];
          const isUp = (yq?.change ?? data.change) >= 0;
          const displayPrice = yq?.price ?? data.price;
          const displayPercent = yq?.changePercent ?? data.percentChange;

          return (
            <div 
              key={data.definition.id}
              onClick={() => {
                setSelectedForModal({ definition: data.definition, price: displayPrice });
                setModalOpen(true);
              }}
              className="hud-panel p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:border-cyan-500/30 group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full ${isUp ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-pulse'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                      {data.definition.symbol}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">
                      {data.definition.exchange}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {data.definition.name}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                {/* Live Price & Change */}
                <div className="text-right font-mono">
                  <div className="font-black text-slate-900 dark:text-white text-base">
                    ₹{displayPrice.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isUp ? '+' : ''}{displayPercent.toFixed(2)}% ({isUp ? '+' : ''}{(yq?.change ?? data.change).toFixed(1)})
                  </div>
                </div>

                {/* Greeks Delta */}
                <div className="hidden sm:flex flex-col items-end text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-emerald-400">C: {data.callVega.toFixed(0)}</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-rose-400">P: {data.putVega.toFixed(0)}</span>
                  </div>
                  <div className="text-slate-400 text-[9px]">
                    Diff: {data.difference.toFixed(0)} ({trend.label})
                  </div>
                </div>

                <ChevronRight size={16} className="text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
