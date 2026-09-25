import React, { useEffect, useState, useRef } from 'react';
import { Brain, Sparkles, Zap, Activity, Cpu, CheckCircle2, ChevronDown, ChevronRight, MessageCircle, Send, Terminal, ShieldAlert, X, WifiOff, Wifi, BarChart3, TrendingUp, Search, AlertTriangle, Loader2, Copy, Check } from 'lucide-react';
import { AILogic, AIAnalysisResult } from '../services/aiLogic';
import { MarketDataPoint } from '../types';

interface AIAnalystProps {
    data: MarketDataPoint[];
    isOpen?: boolean; 
    onClose?: () => void;
    mode?: 'MODAL' | 'FULL'; 
}

interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
}

const SUGGESTED_PROMPTS = [
    { label: "Is market Bullish?", icon: TrendingUp },
    { label: "Give me a Trade", icon: Zap },
    { label: "Explain Vega", icon: Search },
];

export const AIAnalyst: React.FC<AIAnalystProps> = ({ data, isOpen = false, onClose, mode = 'MODAL' }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<AIAnalysisResult | null>(null);
    const [typedSummary, setTypedSummary] = useState('');
    const [showReasoning, setShowReasoning] = useState(true);
    
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mode === 'FULL' && data.length > 0 && !result && !analyzing) {
            performAnalysis();
        } else if (mode === 'MODAL' && isOpen && data.length > 0) {
            performAnalysis();
            setChatHistory([]);
        }
    }, [isOpen, data, mode]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const performAnalysis = async () => {
        setAnalyzing(true);
        setTypedSummary('');
        
        try {
            const latestData = data[data.length - 1];
            const aiResult = await AILogic.generateMarketInsight(latestData);
            
            setResult(aiResult);
            setAnalyzing(false);
            
            let i = 0;
            const text = aiResult.summary || "";
            const timer = setInterval(() => {
                setTypedSummary(text.substring(0, i + 1));
                i++;
                if (i > text.length) clearInterval(timer);
            }, 20);
        } catch (error) {
            console.error("Analysis failed", error);
            const latestData = data[data.length - 1];
            setResult(AILogic.getLocalAnalysis(latestData));
            setAnalyzing(false);
        }
    };

    const handleCopy = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSendMessage = async (textOverride?: string) => {
        const userMsg = textOverride || chatInput;
        if (!userMsg.trim() || !result || data.length === 0) return;

        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatLoading(true);
        setChatHistory(prev => [...prev, { role: 'ai', text: '' }]);

        const latestData = data[data.length - 1];
        
        try {
            const stream = AILogic.chatStream(userMsg, latestData);
            let fullText = "";

            for await (const chunk of stream) {
                fullText += chunk;
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    const lastMsgIndex = newHistory.length - 1;
                    newHistory[lastMsgIndex] = { ...newHistory[lastMsgIndex], text: fullText };
                    return newHistory;
                });
            }
        } catch (e) {
            setChatHistory(prev => {
                const newHistory = [...prev];
                const lastMsgIndex = newHistory.length - 1;
                newHistory[lastMsgIndex] = { ...newHistory[lastMsgIndex], text: "⚠️ System busy. Please try asking about Trend or Vega." };
                return newHistory;
            });
        } finally {
            setChatLoading(false);
        }
    };

    if (mode === 'MODAL' && !isOpen) return null;

    const containerClasses = mode === 'MODAL' 
        ? "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300"
        : "flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xl";

    const wrapperClasses = mode === 'MODAL'
        ? "bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.25)] flex flex-col overflow-hidden relative max-h-[90vh]"
        : "flex flex-col h-full relative";

    return (
        <div className={containerClasses}>
            <div className={wrapperClasses}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                <div className="flex items-center justify-between p-4 border-b border-indigo-500/10 bg-indigo-50/50 dark:bg-indigo-950/20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg shadow-lg bg-indigo-600`}>
                            <Brain className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-wider flex items-center gap-2">
                                ChartGPT <span className="text-indigo-600 dark:text-indigo-400">Pro</span>
                            </h2>
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-300 uppercase font-mono tracking-widest">
                                {analyzing ? 'Thinking...' : 'Neural Link Active'}
                            </p>
                        </div>
                    </div>
                    {mode === 'MODAL' && onClose && (
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
                            <X size={24} />
                        </button>
                    )}
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {analyzing ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-6">
                            <Loader2 size={48} className="text-indigo-500 animate-spin" />
                            <p className="text-slate-500 text-sm animate-pulse uppercase tracking-widest">Analyzing Vega Patterns...</p>
                        </div>
                    ) : result ? (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                <button onClick={() => setShowReasoning(!showReasoning)} className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <Terminal size={14} className="text-amber-500" /> Thinking Process
                                    </div>
                                    <Zap size={10} className="text-emerald-500" />
                                </button>
                                {showReasoning && (
                                    <div className="p-4 font-mono text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-white/50 dark:bg-black/20 animate-in slide-in-from-top-2 relative group">
                                        <button onClick={() => handleCopy(result.reasoning, -1)} className="absolute top-2 right-2 p-1.5 bg-indigo-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                                            {copiedId === -1 ? <Check size={12}/> : <Copy size={12}/>}
                                        </button>
                                        {result.reasoning}
                                    </div>
                                )}
                            </div>

                            <div className={`flex flex-col md:flex-row items-center justify-between p-6 rounded-xl border-l-4 shadow-lg group relative ${
                                result.prediction === 'BULLISH' ? 'bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/40 dark:to-slate-900 border-emerald-500' : 
                                result.prediction === 'BEARISH' ? 'bg-gradient-to-r from-rose-50 to-white dark:from-rose-900/40 dark:to-slate-900 border-rose-500' : 
                                'bg-slate-100 dark:bg-slate-800 border-slate-500'
                            }`}>
                                <div className="flex items-center gap-6">
                                    <div className={`p-4 rounded-full shadow-inner ${
                                        result.prediction === 'BULLISH' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600'
                                    }`}>
                                        {result.prediction === 'BULLISH' ? <TrendingUp size={32} /> : <BarChart3 size={32} />}
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Final Verdict</div>
                                        <div className={`text-4xl font-black tracking-tight ${
                                             result.prediction === 'BULLISH' ? 'text-emerald-600 dark:text-emerald-400' : 
                                             result.prediction === 'BEARISH' ? 'text-rose-600 dark:text-rose-400' : 
                                             'text-slate-700 dark:text-slate-300'
                                        }`}>
                                            {result.prediction}
                                        </div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-mono">{typedSummary}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <MessageCircle size={16} className="text-indigo-500" /> ChartGPT Assistant
                                </h3>
                                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                                        <button key={idx} onClick={() => handleSendMessage(prompt.label)} disabled={chatLoading} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors whitespace-nowrap disabled:opacity-50">
                                            <prompt.icon size={12} className="text-indigo-500" /> {prompt.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 h-64 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                    {chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-xl p-3 text-sm leading-relaxed shadow-sm relative group ${
                                                msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                                            }`}>
                                                {msg.role === 'ai' && (
                                                    <button onClick={() => handleCopy(msg.text, idx)} className="absolute top-1 right-1 p-1 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 hover:text-white">
                                                        {copiedId === idx ? <Check size={10}/> : <Copy size={10}/>}
                                                    </button>
                                                )}
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef}></div>
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask follow-up..." className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                                    <button onClick={() => handleSendMessage()} disabled={chatLoading || !chatInput.trim()} className="bg-indigo-600 p-4 rounded-xl hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-lg active:scale-95">
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};