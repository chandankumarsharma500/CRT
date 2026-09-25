import React, { useState } from 'react';
import { Download, FileArchive, FileCode, CheckCircle2, X, FolderTree, Sparkles, ExternalLink, ShieldCheck, Terminal } from 'lucide-react';
import { downloadProjectZip, downloadPythonStrategy } from '../services/projectExporter';

interface DownloadZipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadZipModal: React.FC<DownloadZipModalProps> = ({ isOpen, onClose }) => {
  const [downloadedZip, setDownloadedZip] = useState(false);
  const [downloadedPy, setDownloadedPy] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = () => {
    downloadProjectZip('smc-vega-quant-code.zip');
    setDownloadedZip(true);
    setTimeout(() => setDownloadedZip(false), 3000);
  };

  const handleDownloadPy = () => {
    downloadPythonStrategy('vega_trading_strategy.py');
    setDownloadedPy(true);
    setTimeout(() => setDownloadedPy(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Decorative ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileArchive size={26} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                Project Code Export
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready (.ZIP)
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Download all codebase files including React UI, TypeScript services, and Python Vega Strategy.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 relative z-10">
          {/* Complete ZIP Archive */}
          <div className="bg-slate-950/70 border border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-500/60 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                <FileArchive size={22} />
              </div>
              <h3 className="font-bold text-white text-base">Full Project (.ZIP)</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Contains complete repository: React 19 frontend, all 16 components, 12 backend services, configs & Python code.
              </p>
            </div>
            <button
              onClick={handleDownloadZip}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20"
            >
              {downloadedZip ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-300" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download Complete ZIP
                </>
              )}
            </button>
          </div>

          {/* Python Strategy File */}
          <div className="bg-slate-950/70 border border-emerald-500/30 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/60 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                <Terminal size={22} />
              </div>
              <h3 className="font-bold text-white text-base">Python Strategy (.py)</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Standalone <span className="font-mono text-emerald-400">vega_trading_strategy.py</span> with Pandas, Greeks math, institutional order flow & backtester.
              </p>
            </div>
            <button
              onClick={handleDownloadPy}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20"
            >
              {downloadedPy ? (
                <>
                  <CheckCircle2 size={16} className="text-white" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download .py Script
                </>
              )}
            </button>
          </div>
        </div>

        {/* What's Inside Archive */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 relative z-10 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            <FolderTree size={16} className="text-indigo-400" />
            Archive Contents Preview
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-slate-300">
            <div className="bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
              <span className="text-emerald-400">📄</span> vega_trading_strategy.py
            </div>
            <div className="bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
              <span className="text-indigo-400">📁</span> components/ (16 files)
            </div>
            <div className="bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
              <span className="text-indigo-400">📁</span> services/ (13 files)
            </div>
            <div className="bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
              <span className="text-amber-400">⚛️</span> App.tsx & index.tsx
            </div>
            <div className="bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
              <span className="text-blue-400">📦</span> package.json & lock
            </div>
            <div className="bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
              <span className="text-purple-400">⚙️</span> tsconfig & vite.config
            </div>
          </div>
        </div>

        {/* AI Studio Platform Export Tip */}
        <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3 relative z-10">
          <ShieldCheck size={20} className="text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-slate-300">
            <span className="font-bold text-white">Google AI Studio Export Options:</span>
            <p className="mt-0.5 text-slate-400">
              Aap screen ke top-right menu icon (⚙️ Settings / Project options) par click karke bhi <strong className="text-slate-200">&quot;Export &gt; Download ZIP&quot;</strong> ya <strong className="text-slate-200">&quot;Export to GitHub&quot;</strong> select kar sakte hain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
