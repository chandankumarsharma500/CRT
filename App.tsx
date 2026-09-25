import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, BookOpen, BarChart, List, Layers, LogIn, TrendingUp, Menu, X, Activity, Terminal, Shield, Zap, Moon, Sun, Globe, FlaskConical, Key, AlertCircle, CheckCircle2, Maximize2 } from 'lucide-react';
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

type View = 'dashboard' | 'indices' | 'global-pulse' | 'smart-money' | 'crt' | 'rules' | 'backtest' | 'settings' | 'login' | 'analyst' | 'lab';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiKeyStatus, setAiKeyStatus] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('smc_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('smc_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

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

  const CurrentComponent = useMemo(() => {
    switch (currentView) {
      case 'dashboard': return (
        <Dashboard 
          darkMode={darkMode} 
          onNavigateToLogin={() => setCurrentView('login')} 
          onNavigateToSmartMoney={() => setCurrentView('smart-money')}
        />
      );
      case 'indices': return <IndicesTracker darkMode={darkMode} />;
      case 'global-pulse': return <GlobalPulse />;
      case 'smart-money': return <SmartMoneyTracker />;
      case 'crt': return <CRTStrategy />;
      case 'rules': return <StrategyRules />;
      case 'backtest': return <Backtest />;
      case 'settings': 
      case 'login': return <BrokerConnect />;
      case 'analyst': return <FinancialAnalyst />;
      case 'lab': return <StrategyLab />;
      default: return (
        <Dashboard 
          darkMode={darkMode} 
          onNavigateToLogin={() => setCurrentView('login')} 
          onNavigateToSmartMoney={() => setCurrentView('smart-money')}
        />
      );
    }
  }, [currentView, darkMode]);

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => { setCurrentView(view); setSidebarOpen(false); }}
      className={`relative w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
        currentView === view 
        ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' 
        : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
      }`}
    >
      {currentView === view && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_#6366f1]" />}
      <Icon size={18} className={currentView === view ? 'text-indigo-600 dark:text-indigo-400' : 'group-hover:text-indigo-500 transition-colors'} />
      <span className="font-bold text-[11px] uppercase tracking-[0.15em]">{label}</span>
      {currentView === view && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-[#020617] selection:bg-indigo-500/30 selection:text-white overflow-hidden transition-colors duration-500">
        <div className="fixed inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-1000">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-900/10 blur-[120px] rounded-full animate-pulse-slow" />
          <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <header className="md:hidden h-20 border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between px-6 bg-white dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <SMCLogo size={36} showText={true} variant="compact" />
            </div>
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-3 text-slate-500 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>
        </header>

        <aside className={`fixed md:static inset-y-0 left-0 z-50 w-76 bg-white dark:bg-slate-950/40 backdrop-blur-3xl border-r border-slate-200 dark:border-white/5 transform transition-transform duration-500 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="h-full flex flex-col p-8">
            <div className="hidden md:flex items-center mb-12 px-1 group cursor-pointer" onClick={() => setCurrentView('dashboard')}>
              <SMCLogo size={46} showText={true} variant="full" />
            </div>

            <nav className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
              <div className="px-5 mb-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Operations</div>
              <NavItem view="dashboard" icon={LayoutDashboard} label="Realtime Deck" />
              <NavItem view="crt" icon={Maximize2} label="CRT Range Map" />
              <NavItem view="indices" icon={List} label="Tape Reader" />
              <NavItem view="global-pulse" icon={Globe} label="Global Pulse" />
              <NavItem view="smart-money" icon={Layers} label="Struct Map" />
              
              <div className="px-5 mb-4 mt-8 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Intelligence</div>
              <NavItem view="analyst" icon={TrendingUp} label="Neural Insight" />
              <NavItem view="lab" icon={FlaskConical} label="Strategy Lab" />
              <NavItem view="backtest" icon={BarChart} label="Quant Audit" />
              <NavItem view="rules" icon={BookOpen} label="Manifesto" />
              
              <div className="px-5 mb-4 mt-8 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Systems</div>
              <NavItem view="login" icon={LogIn} label="All Brokers Hub" />
            </nav>

            <div className="mt-auto pt-8 border-t border-slate-200 dark:border-white/5 space-y-4">
               <button 
                onClick={handleConnectKey}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 border shadow-lg group active:scale-95 ${
                    aiKeyStatus 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20' 
                    : 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 text-slate-400 hover:text-indigo-500'
                }`}
               >
                 {aiKeyStatus ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Key size={18} />}
                 <div className="flex flex-col items-start">
                    <span className="font-black text-[10px] uppercase tracking-[0.15em] leading-tight">
                        {aiKeyStatus ? 'Neural Link Active' : 'Connect AI Key'}
                    </span>
                    <span className="text-[8px] opacity-60 uppercase font-bold">
                        {aiKeyStatus ? 'Personal Key Verified' : 'Tap to sync Google Key'}
                    </span>
                 </div>
               </button>

               <button 
                onClick={() => setDarkMode(!darkMode)}
                className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-indigo-500"
               >
                 {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                 <span className="font-bold text-[11px] uppercase tracking-[0.15em]">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
               </button>

               <div className="px-6 py-4 flex flex-col gap-1 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full" />
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest relative z-10">
                    <span className="text-slate-400">System State</span>
                    <span className="text-emerald-500 flex items-center gap-1.5"><Zap size={10} /> Online</span>
                  </div>
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 relative z-10 overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[85%] animate-pulse" />
                  </div>
               </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 md:p-12 pb-24 md:pb-12 relative z-10">
            <div className="max-w-7xl mx-auto h-full">
              {CurrentComponent}
            </div>
        </main>

        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-sm h-18 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] flex items-center justify-around px-4 z-40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
             {[
               {id: 'dashboard', icon: LayoutDashboard},
               {id: 'crt', icon: Maximize2},
               {id: 'global-pulse', icon: Globe},
               {id: 'smart-money', icon: Layers},
               {id: 'analyst', icon: TrendingUp}
             ].map(tab => (
               <button 
                 key={tab.id} 
                 onClick={() => setCurrentView(tab.id as View)} 
                 className={`p-4 rounded-full transition-all duration-300 ${
                   currentView === tab.id 
                   ? 'text-white bg-indigo-600 scale-110 shadow-[0_0_20px_rgba(79,70,229,0.5)]' 
                   : 'text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                 }`}
               >
                  <tab.icon size={22} />
               </button>
             ))}
        </div>
    </div>
  );
};

export default App;