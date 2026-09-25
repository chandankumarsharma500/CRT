
import React, { useEffect, useState, useRef } from 'react';
import { Activity, RefreshCw, Search, BarChart2, List, Globe, ChevronRight } from 'lucide-react';
import { dhanService } from '../services/dhanService';
import { IndexMarketData, IndexDefinition } from '../types';
import { VegaStrategy } from '../services/vegaLogic';
import { TradingViewModal } from './TradingViewModal';

export const IndicesTracker: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => {
  const [indicesData, setIndicesData] = useState<IndexMarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedForModal, setSelectedForModal] = useState<{definition: IndexDefinition, price: number} | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await dhanService.fetchIndicesMarketData();
      setIndicesData(data);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = indicesData.filter(d => 
    d.definition.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.definition.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <TradingViewModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        indexData={selectedForModal}
      />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Market Watch</h2>
          <p className="text-slate-500 text-xs font-bold">Vega Divergence Live Feed</p>
        </div>
        <button onClick={fetchData} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg active:scale-95 transition-all">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
              type="text" 
              placeholder="Search index..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white font-bold text-sm shadow-sm outline-none focus:border-indigo-500"
          />
      </div>

      {/* Desktop Table / Mobile Cards */}
      <div className="space-y-3">
          {filteredData.map((data) => {
              const trend = VegaStrategy.getDetailedTrend(data.difference);
              return (
                  <div 
                    key={data.definition.id}
                    onClick={() => {
                        setSelectedForModal({ definition: data.definition, price: data.price });
                        setModalOpen(true);
                    }}
                    className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
                  >
                      <div className="flex flex-col">
                          <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{data.definition.symbol}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{data.definition.name}</span>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${trend.colorClass}`}>{trend.label}</span>
                              <span className="font-black text-slate-900 dark:text-white font-mono">{data.price.toFixed(1)}</span>
                          </div>
                          <div className="flex gap-3 text-[10px] font-bold">
                              <span className="text-emerald-500">C: {data.callVega.toFixed(0)}</span>
                              <span className="text-rose-500">P: {data.putVega.toFixed(0)}</span>
                              <span className="text-slate-400">D: {data.difference.toFixed(0)}</span>
                          </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 ml-2" />
                  </div>
              );
          })}
      </div>
    </div>
  );
};
