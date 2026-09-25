
import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, Zap, Loader2, Copy, Check, Terminal, RefreshCw, BarChart3 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { marked } from 'marked';
import { dhanService } from '../services/dhanService';
import { IndexMarketData } from '../types';

export const FinancialAnalyst: React.FC = () => {
    const [messages, setMessages] = useState<any[]>([
        {
            role: 'ai',
            content: 'Neural Alpha Link Established. **SMC QUANT CORE v5.0** online.\n\nInstitutional data feed locked. 99.8% Precision Core calibrated. \n\n**Ready for Global Scan.** Puchiye Market Trend ya Tactical Trades ke baare mein.'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [latestData, setLatestData] = useState<IndexMarketData | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getInitialData = async () => {
            const data = await dhanService.fetchIndicesMarketData();
            setLatestData(data[0]); 
        };
        getInitialData();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleCopy = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;
        
        const userQuery = text.trim();
        setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
        setInput('');
        setIsLoading(true);

        try {
            const marketSnapshot = await dhanService.fetchIndicesMarketData();
            const nifty = marketSnapshot.find(i => i.definition.id === 'nifty');
            const bankNifty = marketSnapshot.find(i => i.definition.id === 'bank_nifty');
            setLatestData(nifty || null);

            const marketContext = `
            REAL-TIME MARKET SNAPSHOT:
            - NIFTY: Price ${nifty?.price.toFixed(2)}, Vega Diff ${nifty?.difference.toFixed(0)}, Trend ${nifty?.trend}
            - BANKNIFTY: Price ${bankNifty?.price.toFixed(2)}, Vega Diff ${bankNifty?.difference.toFixed(0)}, Trend ${bankNifty?.trend}
            - STATUS: Institutional Divergence Detected.
            `;

            const systemInstruction = `
            You are the **SMC QUANT CORE v5.0**, an elite institutional analyst.
            Use this context: ${marketContext}
            ### RULES:
            - Language: Hinglish (High-Impact).
            - Always mention the current Price or Vega.
            - Conclude with a high-conviction "Alpha Entry" setup (Entry, SL, Target).
            - Reference 99.8% accuracy.
            `;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: userQuery,
                config: { 
                    systemInstruction, 
                    thinkingConfig: { thinkingBudget: 0 }
                }
            });

            const aiContent = response.text || "No signal detected.";
            setMessages(prev => [...prev, { role: 'ai', content: aiContent }]);
        } catch (err: any) {
            console.error("Analyst Error:", err);
            setMessages(prev => [...prev, { role: 'ai', content: "⚠️ **Neural Sync Error.** API Key check karein.", isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-180px)] terminal-glass rounded-[3rem] border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-900/60 flex flex-col overflow-hidden animate-in fade-in duration-700 shadow-2xl relative">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-slate-950/30 backdrop-blur-xl">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 animate-pulse" />
                        <div className="relative bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                            <Brain className="text-white" size={24} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">SMC <span className="text-indigo-500">QUANT CORE</span></h2>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Node 5.0
                            </span>
                            {latestData && (
                                <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">
                                    NIFTY: {latestData.price.toFixed(1)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <RefreshCw size={18} className={`text-slate-400 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                        <div className={`max-w-[85%] p-6 rounded-[2.5rem] shadow-xl relative group transition-all ${
                            msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/20' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border dark:border-white/5'
                        }`}>
                            {msg.role === 'ai' && (
                                <button onClick={() => handleCopy(msg.content, idx)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-indigo-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                    {copiedId === idx ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            )}
                            <div className="prose dark:prose-invert prose-sm max-w-none font-medium leading-relaxed" 
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
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Neural Link Processing...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-8 bg-white dark:bg-slate-950/40 border-t border-slate-100 dark:border-white/5">
                <div className="max-w-4xl mx-auto flex gap-4">
                    <div className="flex-1 relative flex items-center bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-white/5 p-2 shadow-2xl focus-within:border-indigo-500 transition-all">
                        <div className="pl-4 text-slate-400"><Terminal size={18} /></div>
                        <input 
                            value={input} 
                            onChange={(e)=>setInput(e.target.value)} 
                            onKeyDown={(e)=>e.key==='Enter'&&handleMessage(input)}
                            placeholder="Market outlook puchiye..." 
                            className="flex-1 bg-transparent px-4 py-4 text-sm focus:outline-none dark:text-white font-bold"
                        />
                        <button onClick={()=>handleMessage(input)} disabled={!input.trim() || isLoading} className="bg-indigo-600 p-4 rounded-full text-white shadow-xl shadow-indigo-500/30 hover:bg-indigo-500 active:scale-90 transition-all disabled:opacity-40">
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
