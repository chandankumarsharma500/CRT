
import React from 'react';
import { X, List, ExternalLink } from 'lucide-react';
import { IndexDefinition } from '../types';
import { OptionChain } from './OptionChain';

interface TradingViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  indexData: {
    definition: IndexDefinition;
    price: number;
  } | null;
  initialView?: 'CHART' | 'CHAIN';
}

export const TradingViewModal: React.FC<TradingViewModalProps> = ({ isOpen, onClose, indexData }) => {
  if (!isOpen || !indexData) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-950 w-full h-[95vh] md:h-[90vh] md:max-w-6xl rounded-t-3xl md:rounded-3xl border-t md:border border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
        
        {/* Drag Handle for Mobile */}
        <div className="md:hidden flex justify-center py-2 shrink-0">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" onClick={onClose}></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-900 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                {indexData.definition.symbol}
                <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-lg">{indexData.definition.exchange}</span>
            </h2>
            <p className="text-emerald-500 font-black text-sm font-mono">{indexData.price.toFixed(2)} <span className="text-[10px] opacity-60 ml-1">Live Spot</span></p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl text-slate-500 dark:text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
            <OptionChain 
                symbol={indexData.definition.symbol} 
                spotPrice={indexData.price} 
            />
        </div>
      </div>
    </div>
  );
};
