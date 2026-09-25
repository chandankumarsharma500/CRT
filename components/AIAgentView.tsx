
import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, Bot, RefreshCw, Sparkles, Terminal, Globe, Languages, Copy, Check } from 'lucide-react';
import { AILogic } from '../services/aiLogic';

interface Message {
    role: 'ai' | 'user';
    content: string;
}

export const AIAgentView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: '👋 **Namaste!** Main aapka **Free AI Assistant** hoon.\n\nMain Hindi aur English dono samajhta hoon. Market ka trend, signals ya Vega ke baare mein kuch bhi puchiye!\n\n*Try: "Trend kya hai?", "Signal do", or "Market outlook"*'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async () => {
      if (!input.trim() || isTyping) return;
      
      const userText = input.trim();
      setInput('');
      setMessages(prev => [...prev, { role: 'user', content: userText }]);
      setIsTyping(true);

      const mockData = {
          time: new Date().toLocaleTimeString(),
          timestamp: Date.now(),
          callVega: 250, 
          putVega: -150,
          difference: -400,
          trend: 'Bullish' as const
      };

      try {
          const stream = AILogic.chatStream(userText, mockData);
          let fullResponse = "";
          setMessages(prev => [...prev, { role: 'ai', content: "" }]); 

          for await (const chunk of stream) {
              fullResponse += chunk;
              setMessages(prev => {
                  const newArr = [...prev];
                  newArr[newArr.length - 1] = { role: 'ai', content: fullResponse };
                  return newArr;
              });
          }
      } catch (e) {
          setMessages(prev => {
              const newArr = [...prev];
              if (newArr.length > 0 && newArr[newArr.length-1].role === 'ai' && newArr[newArr.length-1].content === "") {
                  newArr[newArr.length - 1] = { role: 'ai', content: "⚠️ System busy. Please try asking about **Trend** or **Vega** for an instant answer." };
              } else {
                  newArr.push({ role: 'ai', content: "⚠️ System busy. Please try asking about **Trend** or **Vega**." });
              }
              return newArr;
          });
      } finally {
          setIsTyping(false);
      }
  };

  return (
    <div className="h-full bg-slate-900 rounded-xl overflow-hidden flex flex-col shadow-2xl border border-slate-700 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg">
                <Bot className="text-white" size={24} />
            </div>
            <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                    SMC AI Assistant
                </h1>
                <p className="text-indigo-100 text-xs flex items-center gap-1 opacity-90">
                   <Languages size={12} /> Hindi & English Supported
                </p>
            </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm relative group ${
                    msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/20' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-lg'
                }`}>
                    {msg.role === 'ai' && (
                        <>
                            <div className="absolute -top-3 -left-2 bg-slate-800 border border-slate-700 rounded-full p-1 shadow-md">
                                <Sparkles size={12} className="text-amber-400" />
                            </div>
                            <button 
                                onClick={() => handleCopy(msg.content, idx)}
                                className="absolute top-2 right-2 p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all text-slate-500"
                            >
                                {copiedId === idx ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            </button>
                        </>
                    )}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                        {msg.content}
                    </div>
                </div>
            </div>
        ))}
        
        {isTyping && (
             <div className="flex justify-start animate-in fade-in zoom-in duration-300">
                <div className="bg-slate-800 rounded-2xl rounded-bl-none p-4 border border-slate-700 flex gap-1.5 shadow-lg">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 shrink-0">
          <div className="relative flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Puchiye... (e.g. Trend kaisa hai?)"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center active:scale-95"
              >
                  <Send size={20} />
              </button>
          </div>
          <div className="text-center mt-2 text-[10px] text-slate-500 flex items-center justify-center gap-2">
              <Terminal size={10} />
              <span>Offline Mode: Rule-Based Logic Active</span>
          </div>
      </div>
    </div>
  );
};
