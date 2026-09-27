import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, Zap, Loader2, Copy, Check, Terminal, RefreshCw, BarChart3, ExternalLink, Bot, Sparkles } from 'lucide-react';
import { marked } from 'marked';
import { dhanService } from '../services/dhanService';
import { AILogic } from '../services/aiLogic';
import { ClaudeService } from '../services/claudeService';
import { yahooFinanceService, YahooQuote } from '../services/yahooFinanceService';
import { IndexMarketData, MarketDataPoint } from '../types';

export const FinancialAnalyst: React.FC = () => {
    const [messages, setMessages] = useState<any[]>([
        {
            role: 'ai',
            content: 'Neural Alpha Link Established. **SMC & AYUB RANA CRT QUANT CORE v5.0** online.\n\nLive **Yahoo Finance data feed** synchronized. **Candle Range Theory (CRT) & Smart Money Rules** calibrated according to the official ICT/Ayub Rana 3-candle framework (C1 Anchor Accumulation, C2 Manipulation Sweep with non-negotiable close-back inside, C3 Distribution on 5M MSS).\n\n**Direct Claude.ai Bridge Active.** Puchiye Market Trend, CRT Setup, ya 5M Tactical Trades ke baare mein, ya upar **"Open in Claude.ai"** dabakar direct Claude se sync karein!'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [latestData, setLatestData] = useState<IndexMarketData | null>(null);
    const [yahooQuote, setYahooQuote] = useState<YahooQuote | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [copiedClaudeContext, setCopiedClaudeContext] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const syncMarket = async () => {
        try {
            const quotes = await yahooFinanceService.getDetailedQuotes();
            if (quotes['nifty']) {
                setYahooQuote(quotes['nifty']);
            }
            const data = await dhanService.fetchIndicesMarketData();
            if (data && data.length > 0) {
                setLatestData(data[0]);
            }
        } catch (_) {}
    };

    useEffect(() => {
        syncMarket();
        const timer = setInterval(syncMarket, 6000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleCopy = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleOpenInClaude = () => {
        const payload = ClaudeService.generateClaudeAiContextPayload({
            activeStrategies: [
                { name: 'CRT 0.5 Equilibrium Mean-Reversion', active: true, pnl: 8450 },
                { name: 'Smart Money Liquidity Sweeper', active: true, pnl: 6200 },
                { name: 'CRT Super-Breakout Momentum', active: true, pnl: 4150 }
            ],
            openOrders: [],
            totalPnl: 18800,
            executionMode: 'LIVE',
            quotes: yahooFinanceService.getCachedQuotes()
        });

        ClaudeService.openClaudeAiWithContext(payload);
        setCopiedClaudeContext(true);
        setTimeout(() => setCopiedClaudeContext(false), 2500);
    };

    const handleMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;
        
        const userQuery = text.trim();
        setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
        setInput('');
        setIsLoading(true);

        try {
            const currentNiftyQuote = yahooFinanceService.getCachedQuotes()['nifty'];
            const response = await ClaudeService.processQuery(userQuery, currentNiftyQuote);

            setMessages(prev => [...prev, { 
                role: 'ai', 
                content: response.text,
                source: response.source 
            }]);
        } catch (err: any) {
            console.error("Analyst Error:", err);
            const fallbackContent = ClaudeService.generateAutonomousCRTSolution(userQuery, yahooQuote || undefined);
            setMessages(prev => [...prev, { role: 'ai', content: fallbackContent }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-180px)] terminal-glass rounded-[3rem] border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-900/60 flex flex-col overflow-hidden animate-in fade-in duration-700 shadow-2xl relative">
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 dark:bg-slate-950/30 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 animate-pulse" />
                        <div className="relative bg-gradient-to-tr from-indigo-600 to-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                            <Brain className="text-white" size={24} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                            SMC & CRT <span className="text-indigo-500">QUANT CORE</span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                Claude.ai Bridge
                            </span>
                        </h2>
                        <div className="flex flex-wrap items-center gap-2.5 mt-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Node 5.0
                            </span>
                            {yahooQuote && (
                                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                                    Yahoo NIFTY: ₹{yahooQuote.price.toFixed(1)} ({yahooQuote.changePercent >= 0 ? '+' : ''}{yahooQuote.changePercent.toFixed(2)}%)
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Launch Claude.ai Button */}
                    <button
                        onClick={handleOpenInClaude}
                        className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all active:scale-95"
                    >
                        <ExternalLink size={13} />
                        {copiedClaudeContext ? 'Copied & Opening...' : 'Open in Claude.ai'}
                    </button>

                    <button 
                        onClick={syncMarket}
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
                        title="Sync Yahoo Finance Quotes"
                    >
                        <RefreshCw size={15} className={isLoading ? 'animate-spin text-indigo-500' : ''} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                        <div className={`max-w-[88%] p-6 rounded-[2.5rem] shadow-xl relative group transition-all ${
                            msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/20' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border dark:border-white/5'
                        }`}>
                            {msg.role === 'ai' && (
                                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/40 dark:border-slate-700/60">
                                    <span className="text-[10px] font-black uppercase text-indigo-500 flex items-center gap-1.5">
                                        <Sparkles size={12} className="text-amber-400" />
                                        Ayub Rana CRT Neural Agent
                                    </span>
                                    <button onClick={() => handleCopy(msg.content, idx)} className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-xl transition-all">
                                        {copiedId === idx ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            )}
                            <div className="prose dark:prose-invert prose-sm max-w-none font-medium leading-relaxed whitespace-pre-wrap font-sans" 
                                 dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) as string }} 
                            />
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-4 p-4 animate-pulse">
                        <div className="bg-indigo-600/20 p-3 rounded-2xl">
                             <Loader2 size={20} className="animate-spin text-indigo-500" />
                        </div>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Ayub Rana CRT Model Scanning Yahoo Data...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-6 md:p-8 bg-white dark:bg-slate-950/40 border-t border-slate-100 dark:border-white/5 space-y-3">
                {/* Quick CRT Strategy Prompts */}
                <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-2">
                    {[
                        '🎯 Ayub Rana CRT PDF Rules',
                        '⚡ NIFTY C1-C2-C3 Trade Setup',
                        '🛡️ Non-Negotiable Close-Back Inside Filter',
                        '📈 0.5 Equilibrium Target (50% EQ)',
                        '🕒 Indian Market Killzone Hours (IST)',
                        '📊 Live Yahoo Finance Ticks Scan'
                    ].map((promptText) => (
                        <button
                            key={promptText}
                            onClick={() => handleMessage(promptText)}
                            disabled={isLoading}
                            className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-100 hover:bg-indigo-500/15 text-slate-600 dark:text-slate-300 dark:bg-slate-800/80 hover:text-indigo-400 border border-slate-200 dark:border-slate-700/60 transition-all active:scale-95"
                        >
                            {promptText}
                        </button>
                    ))}
                </div>

                <div className="max-w-4xl mx-auto flex gap-4">
                    <div className="flex-1 relative flex items-center bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-white/5 p-2 shadow-2xl focus-within:border-indigo-500 transition-all">
                        <div className="pl-4 text-slate-400"><Terminal size={18} /></div>
                        <input 
                            value={input} 
                            onChange={(e)=>setInput(e.target.value)} 
                            onKeyDown={(e)=>e.key==='Enter'&&handleMessage(input)}
                            placeholder="Ayub Rana CRT setup, Yahoo Finance market data, ya trade signal puchiye..." 
                            className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none dark:text-white font-bold"
                        />
                        <button onClick={()=>handleMessage(input)} disabled={!input.trim() || isLoading} className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3.5 rounded-full text-white shadow-xl shadow-indigo-500/30 hover:opacity-90 active:scale-90 transition-all disabled:opacity-40">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
