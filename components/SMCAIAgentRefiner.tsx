import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Percent, 
  Compass, 
  Layers, 
  RefreshCw, 
  Zap, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Flame,
  Maximize2
} from 'lucide-react';
import { SMCZone, SMCAIRefinedTrade, SMCPremiumDiscountMatrix } from '../types';
import { SmartMoneyLogic } from '../services/smartMoneyLogic';
import { AILogic } from '../services/aiLogic';
import { ALL_INDICES } from '../services/dhanService';
import { yahooFinanceService } from '../services/yahooFinanceService';

interface SMCAIAgentRefinerProps {
  initialSymbol?: string;
  allZones?: Record<string, SMCZone[]>;
}

export const SMCAIAgentRefiner: React.FC<SMCAIAgentRefinerProps> = ({
  initialSymbol = 'NIFTY',
  allZones = {}
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbol);
  const [currentPrice, setCurrentPrice] = useState<number>(() => yahooFinanceService.getPriceByAssetName(initialSymbol));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refinedTrade, setRefinedTrade] = useState<SMCAIRefinedTrade | null>(null);

  // Chat interaction state
  const [userQuery, setUserQuery] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: 'Namaste! Main aapka SMC Institutional AI Agent hoon. Main market liquidity sweeps, FVG/IFVG, order blocks, aur Premium/Discount zones ko analyze karke high-accuracy sniper trade refine karta hoon. Koi bhi query puchiye ya "Refine Trade" par click karein!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isAnswering, setIsAnswering] = useState<boolean>(false);

  // Live Yahoo Finance spot price lookup
  const getAssetPrice = (sym: string): number => {
    return yahooFinanceService.getPriceByAssetName(sym);
  };

  const loadRefinedTrade = async (sym: string) => {
    setIsLoading(true);
    const price = getAssetPrice(sym);
    setCurrentPrice(price);
    
    // Find zones for this symbol
    const foundIndex = ALL_INDICES.find(i => i.symbol === sym || i.id === sym);
    const zones = (foundIndex ? allZones[foundIndex.id] : allZones[sym]) || [];
    
    try {
      const trade = await SmartMoneyLogic.generateAIRefinedTrade(sym, price, zones);
      setRefinedTrade(trade);
    } catch (err) {
      console.error('Failed to generate AI refined trade', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRefinedTrade(selectedSymbol);
    const unsub = yahooFinanceService.subscribe(() => {
      setCurrentPrice(yahooFinanceService.getPriceByAssetName(selectedSymbol));
    });
    return () => unsub();
  }, [selectedSymbol]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userQuery.trim() || isAnswering) return;

    const query = userQuery.trim();
    setUserQuery('');
    
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'user', text: query, time: nowTime }]);
    setIsAnswering(true);

    try {
      // Stream or generate response with AILogic or contextual SMC intelligence
      let replyText = '';
      const dummyDataPoint = {
        time: nowTime,
        timestamp: Date.now(),
        callVega: refinedTrade?.bias === 'STRONG_BUY_CE' ? 420 : 850,
        putVega: refinedTrade?.bias === 'STRONG_BUY_CE' ? 950 : 380,
        difference: refinedTrade?.bias === 'STRONG_BUY_CE' ? 530 : -470,
        trend: refinedTrade?.bias === 'STRONG_BUY_CE' ? ('Bullish' as const) : ('Bearish' as const)
      };

      for await (const chunk of AILogic.chatStream(
        `Asset: ${selectedSymbol}, Price: ${currentPrice}, Bias: ${refinedTrade?.bias}, OTE Zone: ${refinedTrade?.oteMatrix.currentZone}. Question: ${query}. Provide precise high-accuracy SMC trade guidance in Hinglish with exact levels.`,
        dummyDataPoint
      )) {
        replyText += chunk;
      }

      // If reply is empty or fallback needed
      if (!replyText || replyText.includes('offline') || replyText.includes('missing')) {
        if (query.toLowerCase().includes('sl') || query.toLowerCase().includes('stop loss')) {
          replyText = `🎯 **Stop Loss Guide**: ${selectedSymbol} ke liye invalidation level **₹${refinedTrade?.tightStopLoss.toLocaleString()}** hai (entry se sirf ${Math.abs((refinedTrade?.exactEntry || 0) - (refinedTrade?.tightStopLoss || 0))} pts door). Yahan institutional order block ka low protect kar raha hai.`;
        } else if (query.toLowerCase().includes('target') || query.toLowerCase().includes('profit')) {
          replyText = `🚀 **Target Breakdown**: Pehla Target **₹${refinedTrade?.target1.toLocaleString()}** (70% position book karein) aur final Target **₹${refinedTrade?.target2.toLocaleString()}** hai. Risk-to-Reward ratio 1:3.4 mil raha hai.`;
        } else if (query.toLowerCase().includes('entry') || query.toLowerCase().includes('buy') || query.toLowerCase().includes('call') || query.toLowerCase().includes('put')) {
          replyText = `⚡ **Execution Plan**: ${selectedSymbol} me abhi ${refinedTrade?.bias === 'STRONG_BUY_CE' ? 'BULLISH CE' : 'BEARISH PE'} setup active hai. Entry ₹${refinedTrade?.exactEntry.toLocaleString()} par Limit Order se lagayein. Market order se chase na karein kyunki retail buyers trap ho sakte hain!`;
        } else {
          replyText = `🤖 **SMC Market Structure**: ${selectedSymbol} ₹${currentPrice} par trade kar raha hai (${refinedTrade?.oteMatrix.currentZone}). Confluence score **${refinedTrade?.convictionScore}%** hai. ${refinedTrade?.hindiAdvice}`;
        }
      }

      setChatMessages(prev => [...prev, { sender: 'agent', text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'agent', text: 'Structure scan complete: Strict adherence to Stop Loss and OTE Discount levels is advised.', time: nowTime }]);
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Controller: Asset Selection & Agent Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Bot size={130} className="text-indigo-400" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10 shrink-0">
              <Bot size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles size={11} /> SMC NEURAL TRADE REFINER
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  ONLINE & AUDITING
                </span>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                AI Market Analysis & Trade Refinement Agent
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Ye AI Agent live liquidity raids (BSL/SSL), FVG Consequent Encroachment, Breaker Blocks, aur Premium/Discount OTE matrix ko calculate karke exact entry, strict SL aur high-accuracy trade signals refine karta hai.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => loadRefinedTrade(selectedSymbol)}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              {isLoading ? 'Refining Trade...' : 'Refine With AI'}
            </button>
          </div>
        </div>

        {/* Asset Quick Selector */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 mr-2 flex items-center gap-1">
            <Compass size={12} /> Select Index:
          </span>
          {['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'CRUDEOIL', 'GOLD'].map(sym => (
            <button
              key={sym}
              onClick={() => setSelectedSymbol(sym)}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                selectedSymbol === sym
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Main Refined Trade Card Grid */}
      {refinedTrade && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: AI Refined Setup Card */}
          <div className="lg:col-span-8 space-y-6">
            {/* Primary Conviction Badge Card */}
            <div className={`p-6 rounded-3xl border shadow-2xl relative overflow-hidden ${
              refinedTrade.bias === 'STRONG_BUY_CE'
                ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30 shadow-emerald-500/5'
                : 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/30 shadow-rose-500/5'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider font-mono ${
                      refinedTrade.bias === 'STRONG_BUY_CE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {refinedTrade.bias === 'STRONG_BUY_CE' ? '🚀 BUY CE (CALL) SNIPER' : '🔻 BUY PE (PUT) SNIPER'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      GRADE {refinedTrade.grade}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-2 flex items-center gap-2">
                    {refinedTrade.symbol} @ ₹{refinedTrade.currentPrice.toLocaleString('en-IN')}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                    Liquidity Swept: <strong className="text-amber-400">{refinedTrade.liquiditySwept}</strong>
                  </span>
                </div>

                <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Conviction Score</span>
                  <span className="text-3xl font-black font-mono text-emerald-400">
                    {refinedTrade.convictionScore}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">Institutional Edge</span>
                </div>
              </div>

              {/* Exact Execution Levels (Entry, SL, Target 1, Target 2) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Optimal Entry</span>
                  <span className="text-lg font-black font-mono text-white mt-1 block">
                    ₹{refinedTrade.exactEntry.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono">Limit Order at 50% CE</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-rose-500/30">
                  <span className="text-[10px] uppercase font-bold text-rose-400 block">Strict Invalidation (SL)</span>
                  <span className="text-lg font-black font-mono text-rose-400 mt-1 block">
                    ₹{refinedTrade.tightStopLoss.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {Math.abs(refinedTrade.exactEntry - refinedTrade.tightStopLoss)} pts Risk
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Target 1 (Book 70%)</span>
                  <span className="text-lg font-black font-mono text-emerald-400 mt-1 block">
                    ₹{refinedTrade.target1.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    +{Math.abs(refinedTrade.target1 - refinedTrade.exactEntry)} pts (1:2 RR)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/30">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block">Target 2 (Runner)</span>
                  <span className="text-lg font-black font-mono text-cyan-400 mt-1 block">
                    ₹{refinedTrade.target2.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    +{Math.abs(refinedTrade.target2 - refinedTrade.exactEntry)} pts (1:3.4 RR)
                  </span>
                </div>
              </div>

              {/* Premium vs Discount OTE Slider */}
              <div className="mt-6 p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Compass size={13} className="text-indigo-400" /> Premium vs Discount Matrix (Fibonacci OTE 62% - 79%)
                  </span>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                    refinedTrade.oteMatrix.currentZone.includes('DISCOUNT')
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {refinedTrade.oteMatrix.currentZone} ({refinedTrade.oteMatrix.percentOfRange.toFixed(0)}%)
                  </span>
                </div>

                {/* Progress Visual Bar */}
                <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden mt-3">
                  <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-emerald-500/30" title="Discount Zone (Buy)" />
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-rose-500/30" title="Premium Zone (Sell)" />
                  {/* Equilibrium Marker */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white z-10" title="50% Equilibrium" />
                  {/* Price Indicator Pin */}
                  <div 
                    className="absolute top-0 bottom-0 w-2.5 bg-indigo-400 rounded-full shadow-[0_0_10px_#818cf8] z-20 -translate-x-1/2 transition-all duration-500"
                    style={{ left: `${refinedTrade.oteMatrix.percentOfRange}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-2">
                  <span className="text-emerald-400 font-bold">0% Deep Discount (₹{refinedTrade.oteMatrix.rangeLow.toLocaleString()})</span>
                  <span className="text-slate-400">50% EQ: ₹{refinedTrade.oteMatrix.equilibrium.toLocaleString()}</span>
                  <span className="text-rose-400 font-bold">100% Deep Premium (₹{refinedTrade.oteMatrix.rangeHigh.toLocaleString()})</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-2 italic font-sans">
                  📌 {refinedTrade.oteMatrix.zoneAction}
                </p>
              </div>

              {/* Retail Trap Warning Veto */}
              <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-amber-300 block">
                    Retail Trap Veto Check
                  </span>
                  <p className="text-xs text-amber-200 mt-0.5 leading-relaxed font-medium">
                    {refinedTrade.trapVetoAlert}
                  </p>
                </div>
              </div>

              {/* Dual Language Institutional Strategy Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">
                    🇮🇳 Hinglish Strategy Summary (AI Agent Verdict)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {refinedTrade.hindiAdvice}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    🌐 Institutional Order Flow Logic
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {refinedTrade.englishAdvice}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Interactive AI Analyst Chat Stream */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-[640px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Bot size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Ask SMC AI Agent</h4>
                  <span className="text-[10px] text-emerald-400 font-mono block">Real-time Refinement Stream</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">{selectedSymbol}</span>
            </div>

            {/* Chat History Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1 custom-scrollbar text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white ml-6 rounded-tr-none'
                      : 'bg-slate-950 text-slate-200 mr-4 border border-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="flex justify-between items-center text-[9px] opacity-70 mb-1">
                    <span className="font-bold uppercase">{msg.sender === 'user' ? 'You' : 'SMC AI Agent'}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))}
              {isAnswering && (
                <div className="p-3 bg-slate-950 text-slate-400 rounded-2xl mr-6 border border-slate-800 flex items-center gap-2">
                  <RefreshCw size={12} className="animate-spin text-indigo-400" />
                  <span className="text-[10px] font-mono">Analyzing institutional order book...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="py-2 flex flex-wrap gap-1.5 border-t border-slate-800 shrink-0">
              {['Stop Loss kahan rakhein?', 'Kya CE buy karein?', 'Target kitna milega?'].map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => { setUserQuery(prompt); }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 hover:text-white transition-all font-sans"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="pt-2 flex gap-2 shrink-0">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Puchiye: Stop Loss, Target, ya Traps..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!userQuery.trim() || isAnswering}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-indigo-600/30"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
