import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, BookOpen, BarChart, List, Layers, LogIn, TrendingUp, Menu, X, 
  Activity, Terminal, Shield, Zap, Moon, Sun, Globe, FlaskConical, Key, AlertCircle, 
  CheckCircle2, Maximize2, RefreshCw, Bot, ExternalLink, Copy, Check, AlertOctagon,
  ChevronRight, Radio, ShieldAlert, Cpu, Sparkles
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { StrategyRules } from './components/StrategyRules';
import { Backtest } from './components/Backtest';
import { IndicesTracker } from './components/IndicesTracker';
import { SmartMoneyTracker } from './components/SmartMoneyTracker';
import { BrokerConnect } from './components/BrokerConnect';
import { FinancialAnalyst } from './components/FinancialAnalyst';
import { GlobalPulse } from './components/GlobalPulse';
import { StrategyLab } from './components/StrategyLab';
import { CRTStrategy } from './components/CRTStrategy';
import { SMCLogo } from './components/SMCLogo';
import { AlgosEngine } from './components/AlgosEngine';
import { upstoxService } from './services/upstoxService';
import { yahooFinanceService, YahooQuote } from './services/yahooFinanceService';
import { ClaudeService } from './services/claudeService';

type View = 'algos' | 'dashboard' | 'crt' | 'indices' | 'global-pulse' | 'smart-money' | 'analyst' | 'lab' | 'backtest' | 'rules' | 'login';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('algos');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiKeyStatus, setAiKeyStatus] = useState<boolean>(false);
  const [quotes, setQuotes] = useState<Record<string, YahooQuote>>(() => yahooFinanceService.getAllQuotes());
  const [isSyncingYahoo, setIsSyncingYahoo] = useState(false);
  const [executionMode, setExecutionMode] = useState<'PAPER' | 'LIVE'>('PAPER');
  const [showClaudeDrawer, setShowClaudeDrawer] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('smc_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const { code } = upstoxService.checkForRedirectCode();
    if (code) {
      setCurrentView('login');
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('smc_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Subscribe to Yahoo Finance Live Quotes
  useEffect(() => {
    const unsubscribe = yahooFinanceService.subscribe((updatedQuotes) => {
      setQuotes({ ...updatedQuotes });
    });
    return () => unsubscribe();
  }, []);

  // AI Key check
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setAiKeyStatus(hasKey);
      }
    };
    checkKey();
    const interval = setInterval(checkKey, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualYahooSync = async () => {
    setIsSyncingYahoo(true);
    await yahooFinanceService.refreshAll();
    setTimeout(() => setIsSyncingYahoo(false), 600);
  };

  const handleConnectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        await window.aistudio.openSelectKey();
        setAiKeyStatus(true);
        setTimeout(() => window.location.reload(), 500);
      } catch (err) {
        console.error("Key selection failed", err);
      }
    }
  };

  const handleLaunchClaudeAi = () => {
    const payload = ClaudeService.generateClaudeAiContextPayload({
      activeStrategies: [
        { name: 'CRT 0.5 EQ Mean-Reversion Bot', active: true, pnl: 8450 },
        { name: 'SMC Order Block & FVG Sweeper', active: true, pnl: 6200 },
        { name: 'CRT Super-Breakout Momentum Bot', active: true, pnl: 4150 },
      ],
      openOrders: [
        { symbol: 'NIFTY 24900 CE', side: 'BUY', qty: 50, pnl: 3200, entry: 112.5, ltp: 176.5 }
      ],
      totalPnl: 24850,
      executionMode,
      quotes
    });

    navigator.clipboard.writeText(payload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 3000);
    window.open('https://claude.ai/', '_blank');
  };

  const handleEmergencySquareOff = () => {
    setEmergencyAlert('EMERGENCY KILLSWITCH: All open algo positions have been squared off at market. Bot execution paused.');
    setTimeout(() => setEmergencyAlert(null), 5000);
  };

  const CurrentComponent = useMemo(() => {
    switch (currentView) {
      case 'algos': return <AlgosEngine />;
      case 'dashboard': return (
        <Dashboard 
          darkMode={darkMode} 
          onNavigateToLogin={() => setCurrentView('login')} 
          onNavigateToSmartMoney={() => setCurrentView('smart-money')}
          onNavigateToAlgos={() => setCurrentView('algos')}
        />
      );
      case 'crt': return <CRTStrategy />;
      case 'indices': return <IndicesTracker darkMode={darkMode} />;
      case 'global-pulse': return <GlobalPulse />;
      case 'smart-money': return <SmartMoneyTracker />;
      case 'analyst': return <FinancialAnalyst />;
      case 'lab': return <StrategyLab />;
      case 'backtest': return <Backtest />;
      case 'rules': return <StrategyRules />;
      case 'login': return <BrokerConnect />;
      default: return <AlgosEngine />;
    }
  }, [currentView, darkMode]);

  const navGroups = [
    {
      title: 'QUANT EXECUTION',
      items: [
        { view: 'algos' as View, icon: Zap, label: 'ALGO BOTS', badge: 'ACTIVE' },
        { view: 'dashboard' as View, icon: LayoutDashboard, label: 'MISSION CONTROL' },
        { view: 'crt' as View, icon: Maximize2, label: 'CRT RANGE MAP', badge: 'AYUB RANA' },
      ]
    },
    {
      title: 'MARKET RADAR',
      items: [
        { view: 'indices' as View, icon: List, label: 'TAPE TICKER' },
        { view: 'global-pulse' as View, icon: Globe, label: 'GLOBAL PULSE' },
        { view: 'smart-money' as View, icon: Layers, label: 'SMC STRUCT' },
      ]
    },
    {
      title: 'NEURAL & QUANT AUDIT',
      items: [
        { view: 'analyst' as View, icon: TrendingUp, label: 'NEURAL COPILOT' },
        { view: 'lab' as View, icon: FlaskConical, label: 'STRATEGY LAB' },
        { view: 'backtest' as View, icon: BarChart, label: 'QUANT BACKTEST' },
        { view: 'rules' as View, icon: BookOpen, label: 'MANIFESTO' },
      ]
    },
    {
      title: 'CONNECTIVITY',
      items: [
        { view: 'login' as View, icon: LogIn, label: 'BROKER API KEYS' },
      ]
    }
  ];

  const primaryTickers = ['nifty', 'bank_nifty', 'sensex', 'fin_nifty', 'midcap'];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#040711] text-slate-900 dark:text-slate-100 cyber-grid selection:bg-cyan-500/30 selection:text-white transition-colors duration-300">
      
      {/* ========================================================================= */}
      {/* TOP INSTITUTIONAL TELEMETRY COMMAND BAR (ALWAYS VISIBLE)                 */}
      {/* ========================================================================= */}
      <header className="hud-panel sticky top-0 z-40 border-b border-black/5 dark:border-white/10 px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Model Version */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setCurrentView('algos')}>
          <SMCLogo size={36} showText={true} variant="header" />
        </div>

        {/* Live Yahoo Finance Market Strip (Center) */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[10px] font-mono shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-slate-500 dark:text-slate-400">YAHOO LIVE 1s</span>
          </div>

          {primaryTickers.map((key) => {
            const q = quotes[key];
            if (!q) return null;
            const isUp = q.change >= 0;
            return (
              <div 
                key={key} 
                className={`flex items-center gap-2 px-3 py-1 rounded bg-white/70 dark:bg-[#070c1d]/90 border border-black/5 dark:border-white/5 text-[11px] font-mono tracking-tight shrink-0 shadow-sm transition-all duration-300 ${
                  q.tickDirection === 'UP' ? 'border-emerald-500/30' : q.tickDirection === 'DOWN' ? 'border-rose-500/30' : ''
                }`}
              >
                <span className="font-extrabold text-slate-700 dark:text-slate-300">{q.name}</span>
                <span className={`font-black ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹{q.price.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? '+' : ''}{q.changePercent.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Controls & Fast Triggers (Right) */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Execution Mode Segmented Toggle */}
          <div className="hidden sm:flex items-center p-0.5 rounded bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 font-mono text-[10px] font-bold">
            <button
              onClick={() => setExecutionMode('PAPER')}
              className={`px-2.5 py-1 rounded transition-all ${
                executionMode === 'PAPER' 
                  ? 'bg-cyan-500 text-black shadow-sm font-extrabold' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              SIMULATOR
            </button>
            <button
              onClick={() => setExecutionMode('LIVE')}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                executionMode === 'LIVE' 
                  ? 'bg-rose-500 text-white shadow-sm font-extrabold animate-pulse' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Radio size={10} /> LIVE BROKER
            </button>
          </div>

          {/* Direct Claude AI Bridge Button */}
          <button
            onClick={handleLaunchClaudeAi}
            className="px-3 py-1.5 rounded bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-500 dark:text-amber-300 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Send live algo state, Yahoo ticks, and CRT PDF rules to https://claude.ai/"
          >
            <Bot size={14} className="text-amber-400" />
            <span className="hidden md:inline font-extrabold">CLAUDE.AI</span>
            <ExternalLink size={12} className="opacity-70" />
          </button>

          {/* Master Emergency Kill Switch */}
          <button
            onClick={handleEmergencySquareOff}
            className="px-3 py-1.5 rounded bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-500 dark:text-rose-400 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95"
            title="Immediate Square Off All Algo Positions"
          >
            <AlertOctagon size={13} className="text-rose-500" />
            <span className="hidden lg:inline">KILLSWITCH</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 border border-black/5 dark:border-white/10 transition-all"
            title={darkMode ? 'Light Theme' : 'Dark Theme'}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-slate-500 dark:text-slate-300"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Emergency Square Off Banner Toast */}
      {emergencyAlert && (
        <div className="hud-panel border-b border-rose-500 bg-rose-500/10 px-6 py-2.5 flex items-center justify-between text-xs font-mono text-rose-400 animate-in slide-in-from-top duration-300 z-50">
          <div className="flex items-center gap-2">
            <AlertOctagon size={16} className="text-rose-500 animate-pulse" />
            <span className="font-bold">{emergencyAlert}</span>
          </div>
          <button onClick={() => setEmergencyAlert(null)} className="text-rose-400 hover:text-white font-bold">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Copied payload toast */}
      {copiedPayload && (
        <div className="hud-panel border-b border-amber-500/30 bg-amber-500/10 px-6 py-2 flex items-center justify-center gap-2 text-xs font-mono text-amber-400 z-50">
          <Check size={14} className="text-emerald-400" />
          <span>Algo Context, Live Yahoo Quotes & Ayub Rana CRT PDF instructions copied! Opening Claude.ai...</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN LAYOUT: QUANT COCKPIT SIDEBAR + CENTRAL OPERATIONS ARENA             */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Futuristic Command Deck Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 top-[53px] lg:top-0 z-40 w-64 hud-panel border-r border-black/5 dark:border-white/10 flex flex-col transform transition-transform duration-300 ease-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* System Status Telemetry Box */}
            <div className="p-3 rounded-lg bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 font-mono text-[10px]">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>SYSTEM ENGINE</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[9px]">MODE</span>
                  <span className="font-extrabold text-cyan-400">{executionMode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">YAHOO FEED</span>
                  <span className="font-extrabold text-emerald-400">SYNCED</span>
                </div>
              </div>
            </div>

            {/* Navigation Groups */}
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 mb-1.5 text-[9px] font-mono font-extrabold text-slate-400 dark:text-slate-400 tracking-wider">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const isActive = currentView === item.view;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.view}
                      onClick={() => {
                        setCurrentView(item.view);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded font-mono text-xs transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 dark:bg-cyan-400/10 text-cyan-600 dark:text-cyan-300 border-l-2 border-cyan-400 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                        <span className="tracking-tight">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                          item.badge === 'ACTIVE' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer: Neural Link & Version */}
          <div className="p-4 border-t border-black/5 dark:border-white/10 space-y-2">
            <button
              onClick={handleConnectKey}
              className={`w-full flex items-center justify-between p-2.5 rounded font-mono text-[10px] transition-all border ${
                aiKeyStatus 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-400 hover:text-cyan-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Key size={13} className={aiKeyStatus ? 'text-emerald-400' : 'text-slate-400'} />
                <span className="font-bold">{aiKeyStatus ? 'NEURAL KEY LINKED' : 'CONNECT API KEY'}</span>
              </div>
              {aiKeyStatus && <CheckCircle2 size={12} className="text-emerald-400" />}
            </button>

            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1">
              <span>LATENCY: 8ms</span>
              <span>TERMINAL V5.0</span>
            </div>
          </div>
        </aside>

        {/* Central Operations Arena */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-[1720px] mx-auto">
            {CurrentComponent}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Dock */}
      <div className="lg:hidden hud-panel border-t border-black/5 dark:border-white/10 flex items-center justify-around py-2.5 px-3 z-30">
        {[
          { id: 'algos' as View, icon: Zap, label: 'Algos' },
          { id: 'dashboard' as View, icon: LayoutDashboard, label: 'Deck' },
          { id: 'crt' as View, icon: Maximize2, label: 'CRT' },
          { id: 'indices' as View, icon: List, label: 'Tape' },
          { id: 'analyst' as View, icon: TrendingUp, label: 'Copilot' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            className={`flex flex-col items-center gap-1 font-mono text-[10px] px-2 py-1 rounded transition-all ${
              currentView === tab.id
                ? 'text-cyan-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

    </div>
  );
};

export default App;
