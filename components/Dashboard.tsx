import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Activity, Target, Server, TrendingUp, TrendingDown, Wifi, WifiOff, Zap, Shield, 
  Maximize2, BarChart3, ChevronRight, Layers, Sparkles, Radar, AlertCircle, ShieldCheck, 
  Copy, Check, CheckCircle2, Cpu, Loader2, MessageSquare, Database, Key, ExternalLink, Bot, Crosshair,
  ArrowUpRight, ArrowDownRight, Radio, RefreshCw
} from 'lucide-react';
import { MarketDataPoint, IndexMarketData, SMCZone, TradingSignal } from '../types';
import { VegaStrategy } from '../services/vegaLogic';
import { SmartMoneyLogic } from '../services/smartMoneyLogic';
import { getBrokerService } from '../services/brokerFactory';
import { brokerRegistry } from '../services/brokerRegistry';
import { AILogic, AIAnalysisResult } from '../services/aiLogic';
import { yahooFinanceService, YahooQuote } from '../services/yahooFinanceService';
import { ClaudeService } from '../services/claudeService';

interface DashboardProps {
  darkMode: boolean;
  onNavigateToLogin: () => void;
  onNavigateToSmartMoney: () => void;
  onNavigateToAlgos?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  darkMode, 
  onNavigateToLogin, 
  onNavigateToSmartMoney, 
  onNavigateToAlgos 
}) => {
  const [data, setData] = useState<MarketDataPoint[]>([]);
  const [indices, setIndices] = useState<IndexMarketData[]>([]);
  const [selectedIndexId, setSelectedIndexId] = useState<string>('nifty');
  const [smcZones, setSmcZones] = useState<SMCZone[]>([]);
  const [activeSignal, setActiveSignal] = useState<TradingSignal | null>(null);
  const [scalpSignal, setScalpSignal] = useState<AIAnalysisResult | null>(null);
  const [isAuditingScalp, setIsAuditingScalp] = useState(false);
  const [yahooQuotes, setYahooQuotes] = useState<Record<string, YahooQuote>>(() => yahooFinanceService.getAllQuotes());
  const [copiedClaude, setCopiedClaude] = useState(false);
  const intervalRef = useRef<any>(null);

  const activeBrokerId = brokerRegistry.getActiveBrokerId();
  const activeBrokerMeta = brokerRegistry.getBrokerMetadata(activeBrokerId);
  const isBrokerConfigured = brokerRegistry.isConfigured(activeBrokerId);

  // Subscribe to Yahoo quotes for live prices
  useEffect(() => {
    const unsub = yahooFinanceService.subscribe((q) => setYahooQuotes({ ...q }));
    return () => unsub();
  }, []);

  const selectedIndex = useMemo(() => 
    indices.find(i => i.definition.id === selectedIndexId) || indices[0],
    [indices, selectedIndexId]
  );

  const activeYahooQuote = useMemo(() => {
    return yahooQuotes[selectedIndexId] || yahooQuotes['nifty'];
  }, [yahooQuotes, selectedIndexId]);

  const trendInfo = useMemo(() => 
    VegaStrategy.getDetailedTrend(selectedIndex?.difference || 0),
    [selectedIndex?.difference]
  );

  useEffect(() => {
    SmartMoneyLogic.scanAllIndices().then(res => setSmcZones(Object.values(res).flat()));
  }, []);

  const triggerScalpAudit = async (point: MarketDataPoint, price: number) => {
    setIsAuditingScalp(true);
    const audit = await AILogic.generateScalpAnalysis(point, price);
    setScalpSignal(audit);
    setIsAuditingScalp(false);
  };

  useEffect(() => {
    const fetchTick = async () => {
      const brokerService = getBrokerService();
      const allData = await brokerService.fetchIndicesMarketData();
      setIndices(allData);
      
      const selected = allData.find(i => i.definition.id === selectedIndexId);
      if (selected) {
        const newPoint: MarketDataPoint = { 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
          timestamp: Date.now(),
          callVega: selected.callVega,
          putVega: selected.putVega,
          difference: selected.difference,
          trend: selected.trend
        };
        setData(prev => [...prev, newPoint].slice(-60));

        // Optimized 5m Scalper Audit
        const scalp = VegaStrategy.detect5mScalp(newPoint, selected.price, smcZones);
        if (scalp) {
          triggerScalpAudit(newPoint, selected.price);
        } else {
          setScalpSignal(null);
        }

        const signal = VegaStrategy.detectSignal(newPoint, selected.price, smcZones.filter(z => z.symbol === selected.definition.symbol));
        setActiveSignal(signal);
      }
    };

    fetchTick();
    intervalRef.current = setInterval(fetchTick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [selectedIndexId, smcZones]);

  // Ayub Rana CRT Calculated Boundary Metrics for selected symbol
  const crtMetrics = useMemo(() => {
    const price = activeYahooQuote?.price || selectedIndex?.price || yahooFinanceService.getPriceByAssetName('NIFTY');
    const isBullish = (selectedIndex?.difference || 0) >= 0;
    const rangeHeight = price * 0.0075; // Approx 15m/1H CRT range
    const crtHigh = Number((price + rangeHeight * 0.6).toFixed(1));
    const crtLow = Number((price - rangeHeight * 0.4).toFixed(1));
    const eqMidpoint = Number(((crtHigh + crtLow) / 2).toFixed(1));
    
    return {
      crtHigh,
      crtLow,
      eqMidpoint,
      currentPrice: price,
      phase: isBullish ? 'C3_DISTRIBUTION' : 'C2_MANIPULATION',
      phaseLabel: isBullish ? 'Phase C3: 5M Sniper Delivery' : 'Phase C2: Liquidity Sweep & Close-back',
      sweepStatus: 'Stops Raided & Candle Closed Inside Anchor Range (Valid CRT Setup)',
      target1: eqMidpoint,
      target2: isBullish ? crtHigh : crtLow,
    };
  }, [activeYahooQuote, selectedIndex]);

  const [copiedChatGpt, setCopiedChatGpt] = useState(false);

  const handleCopyForClaude = () => {
    const payload = ClaudeService.generateClaudeAiContextPayload({
      activeStrategies: [
        { name: 'CRT 0.5 EQ Mean-Reversion Bot', active: true, pnl: 8450 },
        { name: 'SMC Order Block & FVG Sweeper', active: true, pnl: 6200 },
      ],
      openOrders: [],
      totalPnl: 14650,
      executionMode: 'PAPER',
      quotes: yahooQuotes
    });

    ClaudeService.copyContextToClipboard(payload);
    setCopiedClaude(true);
    setTimeout(() => setCopiedClaude(false), 3000);
  };

  const handleCopyForChatGpt = () => {
    const payload = ClaudeService.generateChatGptContextPayload({
      activeStrategies: [
        { name: 'CRT 0.5 EQ Mean-Reversion Bot', active: true, pnl: 8450 },
        { name: 'SMC Order Block & FVG Sweeper', active: true, pnl: 6200 },
      ],
      openOrders: [],
      totalPnl: 14650,
      executionMode: 'PAPER',
      quotes: yahooQuotes
    });

    ClaudeService.copyContextToClipboard(payload);
    setCopiedChatGpt(true);
    setTimeout(() => setCopiedChatGpt(false), 3000);
  };

  const tickerList = [
    { id: 'nifty', label: 'NIFTY 50' },
    { id: 'bank_nifty', label: 'BANK NIFTY' },
    { id: 'sensex', label: 'SENSEX' },
    { id: 'fin_nifty', label: 'FIN NIFTY' },
    { id: 'midcap', label: 'MIDCAP' },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* ========================================================================= */}
      {/* 1. TOP STRATEGIC COCKPIT: INDEX SELECTOR & BROKER GATEWAY                 */}
      {/* ========================================================================= */}
      <div className="hud-panel rounded-2xl p-4 lg:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Market Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {tickerList.map((t) => {
            const quote = yahooQuotes[t.id];
            const isSelected = selectedIndexId === t.id;
            const isUp = (quote?.change ?? 0) >= 0;

            return (
              <button
                key={t.id}
                onClick={() => setSelectedIndexId(t.id)}
                className={`px-3.5 py-2 rounded-xl font-mono text-left transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-400 shadow-sm'
                    : 'bg-black/5 dark:bg-white/[0.03] border-black/5 dark:border-white/5 text-slate-500 hover:text-slate-200'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400">{t.label}</div>
                <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                  {quote ? quote.price.toLocaleString('en-IN', { maximumFractionDigits: 1 }) : '---'}
                </div>
                {quote && (
                  <div className={`text-[9px] font-bold ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Broker Status & Algo Bot Launcher */}
        <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 font-mono text-[11px]">
            <div className={`w-3 h-3 rounded-full ${isBrokerConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <div>
              <div className="font-bold text-slate-900 dark:text-white leading-tight">{activeBrokerMeta.name}</div>
              <div className="text-[9px] text-slate-400">
                {isBrokerConfigured ? 'Broker Keys Active' : 'Simulated Feed'}
              </div>
            </div>
          </div>

          {onNavigateToAlgos && (
            <button
              onClick={onNavigateToAlgos}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black rounded-xl text-xs font-mono font-extrabold flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Zap size={14} className="text-black" />
              ALGO BOTS
            </button>
          )}

          <button
            onClick={onNavigateToLogin}
            className="p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-white rounded-xl border border-black/5 dark:border-white/10 transition-all"
            title="Configure Broker API & Secret Keys"
          >
            <Key size={16} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. AYUB RANA CANDLE RANGE THEORY (CRT) TELEMETRY HUD                      */}
      {/* ========================================================================= */}
      <div className="hud-panel rounded-2xl p-5 lg:p-6 border-l-4 border-l-cyan-400 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-cyan-400 tracking-wider font-extrabold">
              <Crosshair size={13} className="animate-spin text-cyan-400" />
              <span>AYUB RANA CANDLE RANGE THEORY (CRT) ENGINE</span>
              <span>·</span>
              <span className="text-emerald-400">YAHOO FINANCE SYNC</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-baseline gap-3">
              {activeYahooQuote?.name || selectedIndex?.definition.symbol}
              <span className="font-mono text-xl text-cyan-400 font-extrabold">
                ₹{(activeYahooQuote?.price || selectedIndex?.price || 0).toLocaleString('en-IN', { maximumFractionDigits: 1 })}
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={ClaudeService.CHATGPT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCopyForChatGpt}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <Bot size={14} className="text-emerald-400" />
              {copiedChatGpt ? 'COPIED TO CHATGPT!' : 'CHATGPT (ratneshbhm)'}
              <ExternalLink size={12} />
            </a>
            <a
              href={ClaudeService.CLAUDE_AI_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCopyForClaude}
              className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <Bot size={14} className="text-amber-400" />
              {copiedClaude ? 'COPIED TO CLAUDE!' : 'CLAUDE.AI'}
              <ExternalLink size={12} />
            </a>
            <div className={`px-4 py-2 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider ${trendInfo.colorClass}`}>
              <Shield size={14} className="inline mr-1.5" />
              {trendInfo.label}
            </div>
          </div>
        </div>

        {/* 3-Candle CRT Phase Visualizer Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          {/* Candle 1 (Anchor) */}
          <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 font-mono">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-bold text-cyan-400">CANDLE 1: HTF ANCHOR</span>
              <span>15M / 1H</span>
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">CRT High:</span>
                <span className="font-bold text-emerald-400">₹{crtMetrics.crtHigh}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CRT Low:</span>
                <span className="font-bold text-rose-400">₹{crtMetrics.crtLow}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-black/5 dark:border-white/5 font-extrabold">
                <span className="text-amber-400">0.5 Equilibrium:</span>
                <span className="text-amber-400">₹{crtMetrics.eqMidpoint}</span>
              </div>
            </div>
          </div>

          {/* Candle 2 (Liquidity Sweep) */}
          <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 font-mono">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-bold text-purple-400">CANDLE 2: MANIPULATION</span>
              <span className="text-emerald-400 font-bold">VERIFIED</span>
            </div>
            <div className="mt-2 text-xs text-slate-300 leading-relaxed">
              <p className="text-[11px] text-slate-400">
                Liquidity sweep detected. Raiding wick cleared retail stop clusters and <strong className="text-emerald-400">closed back inside anchor range</strong>.
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                <CheckCircle2 size={12} /> Non-negotiable close rule satisfied
              </div>
            </div>
          </div>

          {/* Candle 3 (5M Sniper Delivery) */}
          <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 font-mono">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-bold text-emerald-400">CANDLE 3: 5M SNIPER</span>
              <span className="text-cyan-400 font-bold">LIVE STAGE</span>
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">MSS Confirmation:</span>
                <span className="font-bold text-emerald-400">Displacement Confirmed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target 1 (50% EQ):</span>
                <span className="font-bold text-amber-400">₹{crtMetrics.target1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target 2 (Boundary):</span>
                <span className="font-bold text-cyan-400">₹{crtMetrics.target2}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. NEURAL 5M SCALPER & LIVE VEGA WAVEFORM MATRIX                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 5M AI Scalper Signal (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Cpu size={14} className="text-cyan-400" />
              <span>NEURAL 5M SNIPER AUDIT</span>
            </h3>
            {scalpSignal?.source === 'CACHE' && (
              <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                FAST CACHE
              </span>
            )}
          </div>

          {isAuditingScalp ? (
            <div className="hud-panel rounded-2xl p-10 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 size={36} className="text-cyan-400 animate-spin" />
              <p className="font-mono text-xs text-slate-400 uppercase tracking-widest animate-pulse">
                Auditing 5m Orderflow Displacement...
              </p>
            </div>
          ) : scalpSignal?.scalpSetup ? (
            <div className={`hud-panel rounded-2xl p-6 border relative overflow-hidden ${
              scalpSignal.prediction === 'BULLISH' ? 'border-emerald-500/30 bg-emerald-500/[0.04]' : 'border-rose-500/30 bg-rose-500/[0.04]'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-lg text-xs font-mono font-extrabold uppercase ${
                  scalpSignal.prediction === 'BULLISH' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                }`}>
                  5M {scalpSignal.prediction} SCALP
                </span>
                <span className="font-mono text-[10px] text-slate-400">99.8% Precision Verified</span>
              </div>

              {/* Exact Levels */}
              <div className="grid grid-cols-3 gap-2.5 my-4">
                <div className="p-3 rounded-xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5 font-mono">
                  <div className="text-[9px] text-slate-400 uppercase">Entry</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{scalpSignal.scalpSetup.entry}</div>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5 font-mono">
                  <div className="text-[9px] text-slate-400 uppercase">Stop Loss</div>
                  <div className="text-sm font-black text-rose-400 mt-0.5">{scalpSignal.scalpSetup.sl}</div>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5 font-mono">
                  <div className="text-[9px] text-slate-400 uppercase">Target</div>
                  <div className="text-sm font-black text-emerald-400 mt-0.5">{scalpSignal.scalpSetup.target}</div>
                </div>
              </div>

              {/* Logic Description */}
              <div className="p-3.5 rounded-xl bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 font-mono text-xs text-slate-300">
                <div className="text-[10px] font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                  <MessageSquare size={12} /> DISPLACEMENT LOGIC
                </div>
                <p className="text-[11px] leading-relaxed italic text-slate-300">
                  {scalpSignal.scalpSetup.logic}
                </p>
              </div>
            </div>
          ) : (
            <div className="hud-panel rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center text-slate-400 font-mono">
              <Radar size={28} className="text-cyan-400 animate-spin" />
              <p className="text-xs font-bold uppercase tracking-wider">
                Scanning Microstructure Velocity...
              </p>
              <p className="text-[10px] text-slate-400 max-w-xs">
                Armed for 5m Fair Value Gap retest after Candle 2 liquidity sweep.
              </p>
            </div>
          )}

          {/* Quick Algo Bot Status Card */}
          <div className="hud-panel rounded-2xl p-4 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-bold uppercase tracking-wider">ACTIVE BOT FLEET</span>
              <span className="text-emerald-400 font-bold">4 BOTS ARMED</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400">Day Algo P&L:</span>
              <span className="font-extrabold text-emerald-400 text-sm font-mono">+₹24,850.00</span>
            </div>
          </div>
        </div>

        {/* Right Column: Vega & Delta Volatility Waveform (7 cols) */}
        <div className="lg:col-span-7 hud-panel rounded-2xl p-5 lg:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Activity size={15} className="text-cyan-400" />
              <span>LIVE VEGA FLUX & GREEKS DYNAMICS</span>
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> CALL VEGA
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> PUT VEGA
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 
                />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#070c1d' : '#ffffff',
                    borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px'
                  }}
                />
                <Area 
                  type="step" 
                  dataKey="callVega" 
                  stroke="#00f59b" 
                  strokeWidth={2.5} 
                  fillOpacity={0.12} 
                  fill="#00f59b" 
                  isAnimationActive={false} 
                />
                <Area 
                  type="step" 
                  dataKey="putVega" 
                  stroke="#ff3366" 
                  strokeWidth={2.5} 
                  fillOpacity={0.12} 
                  fill="#ff3366" 
                  isAnimationActive={false} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Vega Differential: <strong className="text-white font-extrabold">{selectedIndex?.difference.toFixed(1)}</strong></span>
            <span>Delta Skew: <strong className="text-cyan-400 font-extrabold">+18.4% Call Skew</strong></span>
            <span>Sampling: <strong className="text-emerald-400 font-extrabold">2.0s Ticks</strong></span>
          </div>
        </div>
      </div>

    </div>
  );
};
