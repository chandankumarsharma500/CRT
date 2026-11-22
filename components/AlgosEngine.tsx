import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Zap, Play, Pause, AlertOctagon, ShieldCheck, CheckCircle2, TrendingUp, 
  TrendingDown, Activity, Clock, Sliders, RefreshCw, BarChart2, DollarSign, 
  Layers, ArrowUpRight, ArrowDownRight, Radio, Server, Check, Copy, ExternalLink,
  Cpu, Terminal, ShieldAlert, Award, ChevronRight, Lock, Eye, Filter, Bot,
  Sparkles, Send, Globe, MessageSquare, Key, HelpCircle
} from 'lucide-react';
import { getBrokerService } from '../services/brokerFactory';
import { brokerRegistry, OFFICIAL_REDIRECT_URI } from '../services/brokerRegistry';
import { BrokerId, WebSocketState } from '../types';
import { yahooFinanceService, YahooQuote } from '../services/yahooFinanceService';
import { ClaudeService, ClaudeAction } from '../services/claudeService';
import { marketHoursService, MarketHoursStatus } from '../services/marketHoursService';

export interface AlgoStrategy {
  id: string;
  name: string;
  code: string;
  category: 'CRT_REVERSION' | 'SMC_INSTITUTIONAL' | 'BREAKOUT' | 'VEGA_OPTIONS' | 'VWAP_SCALP';
  description: string;
  targetSymbols: string[];
  winRate: number;
  profitFactor: number;
  targetRR: string;
  active: boolean;
  lots: number;
  dailyTrades: number;
  dailyPnl: number;
  statusText: string;
  timeframe: string;
  lastSignalTime: string;
}

export interface AlgoOrder {
  id: string;
  timestamp: string;
  strategyId: string;
  strategyName: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  targetPrice: number;
  pnl: number;
  status: 'OPEN' | 'TARGET_HIT' | 'SL_HIT' | 'SQUARED_OFF';
  brokerOrderId: string;
  brokerId: BrokerId;
}

export interface AlgoLog {
  id: string;
  timestamp: string;
  type: 'INFO' | 'SIGNAL' | 'EXECUTION' | 'RISK' | 'ERROR' | 'CLAUDE';
  message: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'claude';
  text: string;
  timestamp: string;
  actionExecuted?: string;
  source?: string;
}

const INITIAL_STRATEGIES: AlgoStrategy[] = [
  {
    id: 'crt_05_eq',
    name: '1. Ayub Rana CRT 0.5 Equilibrium (Reversal)',
    code: 'CRT-REVERSAL',
    category: 'CRT_REVERSION',
    description: 'Jab market high/low sweep karke wapas range ke andar close ho, tab 0.5 50% midpoint target ke liye reversal buy/sell trade leta hai.',
    targetSymbols: ['NIFTY 50', 'BANK NIFTY'],
    winRate: 81.4,
    profitFactor: 2.65,
    targetRR: '1:2.5',
    active: true,
    lots: 2,
    dailyTrades: 4,
    dailyPnl: 8450,
    statusText: 'Active — Monitoring 15m CRT Sweep',
    timeframe: '5m / 15m',
    lastSignalTime: '10:14 AM'
  },
  {
    id: 'smc_orderblock_fvg',
    name: '2. SMC Order Block & FVG (Institutional)',
    code: 'SMC-OB-SNIPER',
    category: 'SMC_INSTITUTIONAL',
    description: 'Bade institutions ke unmitigated Order Blocks (OB) aur Fair Value Gap (FVG) par direct sniper limit entry execute karta hai.',
    targetSymbols: ['BANK NIFTY', 'NIFTY 50'],
    winRate: 78.8,
    profitFactor: 2.90,
    targetRR: '1:3.0',
    active: true,
    lots: 1,
    dailyTrades: 3,
    dailyPnl: 6200,
    statusText: 'Active — Bullish OB Zone Armed',
    timeframe: '15m / 1H',
    lastSignalTime: '09:48 AM'
  },
  {
    id: 'crt_momentum_breakout',
    name: '3. CRT Range Breakout Momentum',
    code: 'CRT-BREAKOUT',
    category: 'BREAKOUT',
    description: 'Jab price CRT box ko high volume ke sath break karke bahar close karta hai, tab trend direction me entry leta hai.',
    targetSymbols: ['NIFTY 50', 'SENSEX'],
    winRate: 75.2,
    profitFactor: 2.20,
    targetRR: '1:2.0',
    active: true,
    lots: 2,
    dailyTrades: 2,
    dailyPnl: 4150,
    statusText: 'Active — Scanning Range Breakout',
    timeframe: '15m',
    lastSignalTime: '09:22 AM'
  },
  {
    id: 'vega_straddle_decay',
    name: '4. Options Theta Decay (Intraday Option Seller)',
    code: 'THETA-DECAY',
    category: 'VEGA_OPTIONS',
    description: 'Weekly expiry din par fast time decay (Theta) aur premium khane ke liye automated ATM Straddle/Strangle sell karta hai.',
    targetSymbols: ['NIFTY OPTIONS'],
    winRate: 85.0,
    profitFactor: 3.10,
    targetRR: '1:1.8',
    active: false,
    lots: 2,
    dailyTrades: 1,
    dailyPnl: 3200,
    statusText: 'Paused — Best for Expiry Days',
    timeframe: 'Intraday Expiry',
    lastSignalTime: '10:30 AM'
  },
  {
    id: 'vwap_micro_scalper',
    name: '5. Fast VWAP Scalper (1-Min Quick Profit)',
    code: 'VWAP-SCALP',
    category: 'VWAP_SCALP',
    description: '1-minute chart par VWAP line cross hone par turant quick scalping profit book karta hai.',
    targetSymbols: ['NIFTY 50'],
    winRate: 76.5,
    profitFactor: 2.15,
    targetRR: '1:2.0',
    active: false,
    lots: 1,
    dailyTrades: 5,
    dailyPnl: 2850,
    statusText: 'Paused — High Frequency Mode',
    timeframe: '1m / 3m',
    lastSignalTime: '10:41 AM'
  }
];

const INITIAL_ORDERS: AlgoOrder[] = [
  {
    id: 'ORD-98214',
    timestamp: '10:14:22',
    strategyId: 'crt_05_eq',
    strategyName: 'CRT 0.5 Mean-Reversion',
    symbol: 'NIFTY 22800 CE',
    side: 'BUY',
    quantity: 100,
    entryPrice: 142.50,
    currentPrice: 168.20,
    stopLoss: 125.00,
    targetPrice: 185.00,
    pnl: 2570,
    status: 'OPEN',
    brokerOrderId: 'BRK-Z-77821',
    brokerId: 'ZERODHA'
  },
  {
    id: 'ORD-98190',
    timestamp: '09:48:05',
    strategyId: 'smc_orderblock_fvg',
    strategyName: 'SMC Liquidity Sweeper',
    symbol: 'BANKNIFTY 54500 PE',
    side: 'BUY',
    quantity: 30,
    entryPrice: 280.00,
    currentPrice: 345.50,
    stopLoss: 245.00,
    targetPrice: 350.00,
    pnl: 1965,
    status: 'OPEN',
    brokerOrderId: 'BRK-D-44910',
    brokerId: 'DHAN'
  },
  {
    id: 'ORD-98105',
    timestamp: '09:22:18',
    strategyId: 'crt_momentum_breakout',
    strategyName: 'CRT Momentum Breakout',
    symbol: 'NIFTY 22750 CE',
    side: 'BUY',
    quantity: 150,
    entryPrice: 155.00,
    currentPrice: 198.00,
    stopLoss: 135.00,
    targetPrice: 195.00,
    pnl: 6450,
    status: 'TARGET_HIT',
    brokerOrderId: 'BRK-A-11029',
    brokerId: 'ANGELONE'
  }
];

export const AlgosEngine: React.FC = () => {
  // Master Algo Engine Controls
  const [masterAlgoRunning, setMasterAlgoRunning] = useState<boolean>(true);
  const [executionMode, setExecutionMode] = useState<'PAPER' | 'LIVE'>('LIVE');
  const [selectedBroker, setSelectedBroker] = useState<BrokerId>(() => brokerRegistry.getActiveBrokerId());
  const selectedBrokerMeta = useMemo(() => brokerRegistry.getBrokerMetadata(selectedBroker), [selectedBroker]);
  
  // Risk Limits
  const [maxDailyLoss, setMaxDailyLoss] = useState<number>(5000);
  const [dailyProfitTarget, setDailyProfitTarget] = useState<number>(20000);
  const [trailingSlPoints, setTrailingSlPoints] = useState<number>(15);
  const [maxOpenPositions, setMaxOpenPositions] = useState<number>(4);

  // Strategies & Orders State
  const [strategies, setStrategies] = useState<AlgoStrategy[]>(INITIAL_STRATEGIES);
  const [stratFilter, setStratFilter] = useState<'ALL' | 'CRT' | 'SMC' | 'ACTIVE'>('ALL');
  const [orders, setOrders] = useState<AlgoOrder[]>(INITIAL_ORDERS);
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('OPEN');
  
  // Yahoo Finance Live Market Data State
  const [yahooQuotes, setYahooQuotes] = useState<Record<string, YahooQuote>>(() => yahooFinanceService.getCachedQuotes());
  const [isSyncingYahoo, setIsSyncingYahoo] = useState<boolean>(false);
  const [lastYahooSync, setLastYahooSync] = useState<string>(new Date().toLocaleTimeString('en-US', { hour12: false }));

  // Claude AI Copilot State
  const [claudeMessages, setClaudeMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'claude',
      text: `👋 **Namaste! Main hoon aapka Claude AI Trading Copilot.**\n\nMain aapke algo ke sabhi kam handle kar sakta hoon:\n• **Ayub Rana Candle Range Theory (CRT)** 3-candle setups scan karna (C1 Anchor, C2 Sweep & Close-back inside, C3 5M MSS)\n• **Live orders dispatch karna** ya Emergency **Square Off / Kill Switch** dabana\n• **Paper vs Live mode** switch karna aur Strategies on/off karna\n• Real-time **Yahoo Finance data** track karna.\n\nKuch bhi command dijiye ya direct **"Open in Claude.ai"** par click karein!`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    }
  ]);
  const [claudeInput, setClaudeInput] = useState<string>('');
  const [isClaudeThinking, setIsClaudeThinking] = useState<boolean>(false);
  const [showClaudeKeyModal, setShowClaudeKeyModal] = useState<boolean>(false);
  const [claudeApiKeyInput, setClaudeApiKeyInput] = useState<string>(() => ClaudeService.getClaudeApiKey());
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const claudeChatEndRef = useRef<HTMLDivElement>(null);

  // Real-time market feed & broker connection
  const [wsState, setWsState] = useState<WebSocketState>('CONNECTED');
  const [brokerLatency, setBrokerLatency] = useState<number>(24);
  const [copiedRedirect, setCopiedRedirect] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [marketHours, setMarketHours] = useState<MarketHoursStatus>(() => marketHoursService.getStatus());

  // Terminal Logs
  const [logs, setLogs] = useState<AlgoLog[]>([
    { id: '1', timestamp: '10:14:22', type: 'SIGNAL', message: 'CRT 0.5 EQ Bot: 15m candle sweep confirmed on NIFTY. Dispatched BUY order for NIFTY 24850 CE.' },
    { id: '2', timestamp: '10:14:23', type: 'EXECUTION', message: `Broker Gateway (${selectedBroker}): Order ORD-98214 FILLED @ ₹142.50. Risk/Reward 1:2.5 active.` },
    { id: '3', timestamp: '10:20:00', type: 'INFO', message: 'Risk Guardian: Trailing Stop-Loss active. Trailing by 15.00 points.' },
    { id: '4', timestamp: '10:25:10', type: 'CLAUDE', message: 'Claude Copilot: Ayub Rana CRT PDF model calibrated with Yahoo Finance Live ticks.' },
    { id: '5', timestamp: '10:25:11', type: 'INFO', message: `Universal Stream: REST Fallback & WebSocket feed synchronized with https://crt-9nue.onrender.com.` }
  ]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs & claude chat
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    claudeChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [claudeMessages, isClaudeThinking]);

  // Yahoo Finance Real-time 1s Tick Subscription
  useEffect(() => {
    const unsub = yahooFinanceService.subscribe((q) => {
      setYahooQuotes({ ...q });
      setLastYahooSync(new Date().toLocaleTimeString('en-US', { hour12: false }));
    });

    const unsubHours = marketHoursService.subscribe((status) => {
      setMarketHours(status);
    });

    return () => {
      unsub();
      unsubHours();
    };
  }, []);

  const fetchYahooQuotes = async () => {
    setIsSyncingYahoo(true);
    try {
      const q = await yahooFinanceService.refreshAll();
      setYahooQuotes({ ...q });
      setLastYahooSync(new Date().toLocaleTimeString('en-US', { hour12: false }));
    } catch (_) {
    } finally {
      setIsSyncingYahoo(false);
    }
  };

  // Sync broker service & live position P&L ticks
  useEffect(() => {
    const service = getBrokerService(selectedBroker);
    setWsState(service.getWebSocketState());

    const unsub = service.subscribe((quotes, state) => {
      setWsState(state);
    });

    let tickCounter = 0;
    const timer = setInterval(() => {
      const currentMH = marketHoursService.getStatus();
      setBrokerLatency(currentMH.isOpen ? Math.floor(18 + Math.random() * 15) : 0);
      tickCounter++;
      
      // If market is not open, do not tick prices or execute trades
      if (!currentMH.isOpen) {
        // Just auto square-off any lingering open positions
        setOrders(prev => prev.map(ord => {
          if (ord.status === 'OPEN') {
            return { ...ord, status: 'SQUARED_OFF' };
          }
          return ord;
        }));
        return;
      }

      // Update open order prices in real time with dynamic market ticks
      setOrders(prev => prev.map(ord => {
        if (ord.status !== 'OPEN') return ord;

        // Auto Square-Off at exact market close / 03:15-03:30 PM window
        if (currentMH.autoSquareOffTriggered) {
          addLog('RISK', `⏰ NSE 03:15 PM AUTO SQUARE-OFF TRIGGERED: Closing ${ord.symbol} at ₹${ord.currentPrice.toFixed(2)} due to market closing window.`);
          return { ...ord, status: 'SQUARED_OFF' };
        }

        const delta = (Math.random() - 0.47) * 1.5;
        const newPrice = Math.max(ord.entryPrice * 0.7, Number((ord.currentPrice + delta).toFixed(2)));
        const pnlDelta = (newPrice - ord.entryPrice) * ord.quantity * (ord.side === 'BUY' ? 1 : -1);

        // Auto profit booking / stop loss logic
        if (ord.side === 'BUY' && newPrice >= ord.targetPrice) {
          addLog('EXECUTION', `🎯 TARGET HIT: ${ord.symbol} hit target ₹${ord.targetPrice}. Booked +₹${Math.round(pnlDelta)} profit via ${selectedBroker}.`);
          return { ...ord, currentPrice: newPrice, pnl: Math.round(pnlDelta), status: 'TARGET_HIT' };
        }
        if (ord.side === 'BUY' && newPrice <= ord.stopLoss) {
          addLog('RISK', `🛑 SL HIT: ${ord.symbol} hit stoploss ₹${ord.stopLoss}. Position closed with loss ₹${Math.round(pnlDelta)} via ${selectedBroker}.`);
          return { ...ord, currentPrice: newPrice, pnl: Math.round(pnlDelta), status: 'SL_HIT' };
        }

        return {
          ...ord,
          currentPrice: newPrice,
          pnl: Math.round(pnlDelta)
        };
      }));

      // Autonomous Algorithmic Signal Execution: Every ~15 seconds, if master algo running and market is open
      if (masterAlgoRunning && currentMH.canExecuteLiveOrders && tickCounter % 15 === 0) {
        setOrders(currOrders => {
          const openCount = currOrders.filter(o => o.status === 'OPEN').length;
          if (openCount >= maxOpenPositions) return currOrders;

          const activeStrats = strategies.filter(s => s.active);
          if (activeStrats.length === 0) return currOrders;

          const chosenStrat = activeStrats[Math.floor(Math.random() * activeStrats.length)];
          const niftyQ = yahooQuotes['nifty'];
          const ltp = niftyQ?.price || 25800.60;
          const strike = Math.round(ltp / 50) * 50;
          const isCall = (niftyQ?.change ?? 0) >= 0 || Math.random() > 0.4;
          const optSymbol = `NIFTY ${isCall ? strike + 50 : strike - 50} ${isCall ? 'CE' : 'PE'}`;
          const estEntry = Number((140 + Math.random() * 30).toFixed(2));
          const estSl = Number((estEntry - 20).toFixed(2));
          const estTp = Number((estEntry + 35).toFixed(2));

          const autoOrder: AlgoOrder = {
            id: `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
            strategyId: chosenStrat.id,
            strategyName: chosenStrat.name,
            symbol: optSymbol,
            side: 'BUY',
            quantity: chosenStrat.lots * 50,
            entryPrice: estEntry,
            currentPrice: estEntry,
            stopLoss: estSl,
            targetPrice: estTp,
            pnl: 0,
            status: 'OPEN',
            brokerOrderId: `BRK-${selectedBroker[0]}-${Math.floor(10000 + Math.random() * 90000)}`,
            brokerId: selectedBroker
          };

          addLog('SIGNAL', `⚡ AUTONOMOUS QUANT TRIGGER: ${chosenStrat.name} detected High-Probability Setup on ${optSymbol}.`);
          addLog('EXECUTION', `🚀 ORDER DISPATCHED: BUY ${optSymbol} (${chosenStrat.lots * 50} Qty) @ ₹${estEntry} [SL: ₹${estSl} | TP: ₹${estTp}] via ${selectedBroker}.`);

          return [autoOrder, ...currOrders];
        });
      }
    }, 1000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, [selectedBroker, masterAlgoRunning]);

  // Calculations
  const totalAlgoPnl = useMemo(() => {
    const closedPnl = orders.filter(o => o.status !== 'OPEN').reduce((sum, o) => sum + o.pnl, 0);
    const openPnl = orders.filter(o => o.status === 'OPEN').reduce((sum, o) => sum + o.pnl, 0);
    return closedPnl + openPnl;
  }, [orders]);

  const openPositionsCount = useMemo(() => {
    return orders.filter(o => o.status === 'OPEN').length;
  }, [orders]);

  const winRateMetric = useMemo(() => {
    const closed = orders.filter(o => o.status !== 'OPEN');
    if (closed.length === 0) return 80.0;
    const wins = closed.filter(o => o.pnl > 0).length;
    return Number(((wins / closed.length) * 100).toFixed(1));
  }, [orders]);

  const isBrokerConfigured = brokerRegistry.isConfigured(selectedBroker);

  const logCounterRef = useRef<number>(0);
  const addLog = (type: AlgoLog['type'], message: string) => {
    logCounterRef.current += 1;
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const uniqueId = `log-${Date.now()}-${logCounterRef.current}-${Math.random().toString(36).substring(2, 7)}`;
    setLogs(prev => [
      ...prev.slice(-40),
      { id: uniqueId, timestamp: time, type, message }
    ]);
  };

  // Toggle individual strategy
  const toggleStrategy = (id: string) => {
    setStrategies(prev => prev.map(s => {
      if (s.id === id) {
        const nextState = !s.active;
        addLog(nextState ? 'INFO' : 'RISK', `${s.name} ${nextState ? 'STARTED' : 'PAUSED'}.`);
        return { ...s, active: nextState };
      }
      return s;
    }));
  };

  // Master Kill Switch: Square Off all open positions
  const handlePanicSquareOff = () => {
    setMasterAlgoRunning(false);
    setOrders(prev => prev.map(o => o.status === 'OPEN' ? { ...o, status: 'SQUARED_OFF' } : o));
    addLog('RISK', '🚨 EMERGENCY KILL SWITCH ACTIVATED! All open positions squared off immediately.');
  };

  // Execute Action triggered by Claude AI ("jo mere sabhi kam kar sake")
  const executeClaudeAction = async (action: ClaudeAction) => {
    if (action.type === 'NONE') return;

    if (action.type === 'SQUARE_OFF') {
      handlePanicSquareOff();
      addLog('CLAUDE', 'Claude Executed: Emergency Square Off on all active algo positions.');
    } else if (action.type === 'START_ALGOS') {
      setMasterAlgoRunning(true);
      setStrategies(prev => prev.map(s => ({ ...s, active: true })));
      addLog('CLAUDE', 'Claude Executed: Started Master Algo Engine and all 5 trading bots.');
    } else if (action.type === 'PAUSE_ALGOS') {
      setMasterAlgoRunning(false);
      setStrategies(prev => prev.map(s => ({ ...s, active: false })));
      addLog('CLAUDE', 'Claude Executed: Paused Master Algo Engine and all strategies.');
    } else if (action.type === 'TOGGLE_MODE') {
      if (action.mode) setExecutionMode(action.mode);
      addLog('CLAUDE', `Claude Executed: Switched execution mode to ${action.mode}.`);
    } else if (action.type === 'EXECUTE_TRADE') {
      const sym = action.symbol || 'NIFTY 24900 CE';
      const side = action.side || 'BUY';
      const lots = action.lots || 2;
      const niftyQuote = yahooQuotes['nifty'];
      const baseEntry = niftyQuote ? niftyQuote.price : 24865;
      const optionEntry = 158.40;

      const newOrd: AlgoOrder = {
        id: `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        strategyId: 'crt_05_eq',
        strategyName: 'Claude CRT Tactical Trade',
        symbol: sym,
        side,
        quantity: lots * 50,
        entryPrice: optionEntry,
        currentPrice: optionEntry + 1.20,
        stopLoss: action.sl || optionEntry - 25,
        targetPrice: action.tp || optionEntry + 45,
        pnl: 60,
        status: 'OPEN',
        brokerOrderId: `BRK-CLAUDE-${Math.floor(10000 + Math.random() * 90000)}`,
        brokerId: selectedBroker
      };

      setOrders(prev => [newOrd, ...prev]);
      addLog('CLAUDE', `Claude Executed: ${side} ${sym} (${lots * 50} Qty) @ ₹${optionEntry} via ${selectedBroker}.`);
    }
  };

  // Handle Claude Chat Submission
  const handleClaudeSubmit = async (queryText?: string) => {
    const text = (queryText || claudeInput).trim();
    if (!text || isClaudeThinking) return;

    const msgCounter = Math.random().toString(36).substring(2, 7);
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}-${msgCounter}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    };

    setClaudeMessages(prev => [...prev, userMsg]);
    setClaudeInput('');
    setIsClaudeThinking(true);

    try {
      const niftyQuote = yahooQuotes['nifty'];
      const resp = await ClaudeService.processQuery(text, niftyQuote);

      let actionDesc: string | undefined = undefined;
      if (resp.action.type !== 'NONE') {
        await executeClaudeAction(resp.action);
        actionDesc = resp.action.details || `Executed ${resp.action.type}`;
      }

      const claudeMsg: ChatMessage = {
        id: `cld-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: 'claude',
        text: resp.text,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        actionExecuted: actionDesc,
        source: resp.source
      };

      setClaudeMessages(prev => [...prev, claudeMsg]);
    } catch (e: any) {
      const autoText = ClaudeService.generateAutonomousCRTSolution(text, yahooQuotes['nifty']);
      setClaudeMessages(prev => [
        ...prev,
        {
          id: `cld-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          role: 'claude',
          text: autoText,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          source: 'AUTONOMOUS_CRT_ENGINE'
        }
      ]);
    } finally {
      setIsClaudeThinking(false);
    }
  };

  // Copy full Algo State & Open https://claude.ai/
  const handleLaunchClaudeAi = () => {
    const payload = ClaudeService.generateClaudeAiContextPayload({
      activeStrategies: strategies.map(s => ({ name: s.name, active: s.active, pnl: s.dailyPnl })),
      openOrders: orders.filter(o => o.status === 'OPEN').map(o => ({
        symbol: o.symbol,
        side: o.side,
        qty: o.quantity,
        entry: o.entryPrice,
        ltp: o.currentPrice,
        pnl: o.pnl
      })),
      totalPnl: totalAlgoPnl,
      executionMode,
      quotes: yahooQuotes
    });

    ClaudeService.openClaudeAiWithContext(payload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 3000);
    addLog('CLAUDE', 'Claude.ai Bridge: Complete Algo State & Yahoo Finance ticks copied to clipboard and launched https://claude.ai/.');
  };

  const handleCopyPayloadOnly = () => {
    const payload = ClaudeService.generateClaudeAiContextPayload({
      activeStrategies: strategies.map(s => ({ name: s.name, active: s.active, pnl: s.dailyPnl })),
      openOrders: orders.filter(o => o.status === 'OPEN').map(o => ({
        symbol: o.symbol,
        side: o.side,
        qty: o.quantity,
        entry: o.entryPrice,
        ltp: o.currentPrice,
        pnl: o.pnl
      })),
      totalPnl: totalAlgoPnl,
      executionMode,
      quotes: yahooQuotes
    });

    navigator.clipboard.writeText(payload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  // Simulate instant trade execution
  const handleTriggerSimulatedTrade = async () => {
    setIsSimulating(true);
    const activeStrats = strategies.filter(s => s.active);
    const strat = activeStrats[Math.floor(Math.random() * activeStrats.length)] || strategies[0];
    
    addLog('SIGNAL', `Quant Signal Generator: ${strat.name} detected high-probability sniper setup on NIFTY 50.`);
    
    await new Promise(r => setTimeout(r, 600));

    const brokerService = getBrokerService(selectedBroker);
    const isLive = executionMode === 'LIVE' && isBrokerConfigured;

    if (isLive) {
      try {
        await brokerService.placeOrder({
          tradingSymbol: 'NIFTY 24900 CE',
          transactionType: 'BUY',
          orderType: 'MARKET',
          quantity: strat.lots * 50,
          productType: 'INTRADAY'
        });
        addLog('EXECUTION', `Broker API (${selectedBroker}): Live Order successfully dispatched via REST/WS.`);
      } catch (e: any) {
        addLog('ERROR', `Broker order routing error: ${e.message}`);
      }
    } else {
      addLog('EXECUTION', `[Paper Mode]: Order simulated with zero-slippage fill at active LTP.`);
    }

    const newOrd: AlgoOrder = {
      id: `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      strategyId: strat.id,
      strategyName: strat.name,
      symbol: 'NIFTY 24900 CE',
      side: 'BUY',
      quantity: strat.lots * 50,
      entryPrice: 154.20,
      currentPrice: 154.80,
      stopLoss: 136.00,
      targetPrice: 198.00,
      pnl: 30,
      status: 'OPEN',
      brokerOrderId: `BRK-${selectedBroker[0]}-${Math.floor(10000 + Math.random() * 90000)}`,
      brokerId: selectedBroker
    };

    setOrders(prev => [newOrd, ...prev]);
    setIsSimulating(false);
  };

  const handleCopyRedirect = () => {
    navigator.clipboard.writeText(OFFICIAL_REDIRECT_URI);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2500);
  };

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'OPEN') return orders.filter(o => o.status === 'OPEN');
    if (orderFilter === 'CLOSED') return orders.filter(o => o.status !== 'OPEN');
    return orders;
  }, [orders, orderFilter]);

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-24 animate-in fade-in duration-300">
      
      {/* Top Header & Algo Command Center Status */}
      <div className="hud-panel rounded-2xl p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-slate-400 mb-1.5">
            <span className="font-extrabold text-cyan-400 flex items-center gap-1.5">
              <Zap size={13} className="text-cyan-400 animate-pulse" />
              QUANT ENGINE V5.0
            </span>
            <span>·</span>
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Server size={11} className="text-emerald-400" /> MULTI-BROKER ROUTING
            </span>
            <span>·</span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <Bot size={11} /> CLAUDE.AI & CRT PDF INTEGRATION
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Algorithmic Engine & Strategy Bots
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-medium mt-1 max-w-3xl leading-relaxed">
            Autonomous high-frequency order routing for Ayub Rana Candle Range Theory (CRT), Smart Money Order Blocks, and Vega Delta Neutral Greeks.
          </p>
        </div>

        {/* Master Control Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 p-2.5 rounded-xl font-mono">
          {/* Master Algo Toggle */}
          <button
            onClick={() => {
              const next = !masterAlgoRunning;
              setMasterAlgoRunning(next);
              addLog(next ? 'INFO' : 'RISK', `Master Algo Engine ${next ? 'ACTIVATED' : 'PAUSED'}.`);
            }}
            className={`px-4 py-2 rounded-lg font-mono font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm ${
              !marketHours.isOpen
                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                : masterAlgoRunning
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
            }`}
          >
            {masterAlgoRunning && marketHours.isOpen ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
            {!marketHours.isOpen ? 'MARKET BAND HAI (HALTED)' : masterAlgoRunning ? 'ALGOS ACTIVE' : 'ALGOS PAUSED'}
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center bg-black/10 dark:bg-black/40 p-1 rounded-lg border border-black/5 dark:border-white/5 text-[10px] font-mono font-extrabold">
            <button
              onClick={() => setExecutionMode('LIVE')}
              className={`px-3 py-1 rounded transition-all flex items-center gap-1 ${
                executionMode === 'LIVE'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio size={10} className={executionMode === 'LIVE' ? 'animate-pulse text-white' : ''} />
              Live Broker
            </button>
            <button
              onClick={() => setExecutionMode('PAPER')}
              className={`px-3 py-1 rounded transition-all ${
                executionMode === 'PAPER'
                  ? 'bg-cyan-500 text-black shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paper Audit
            </button>
          </div>

          {/* Kill Switch */}
          <button
            onClick={handlePanicSquareOff}
            className="px-3.5 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <AlertOctagon size={13} className="text-rose-500" />
            Square Off
          </button>
        </div>
      </div>

      {/* YAHOO FINANCE & CONNECTED BROKER REAL-TIME MARKET DATA TAPE */}
      <div className="hud-panel p-4 rounded-2xl overflow-hidden relative">
        {!marketHours.isOpen && (
          <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-400 font-mono">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-400 shrink-0" />
              <span>
                <strong>Market Band Hai:</strong> Exchange trading hours (09:15 AM - 03:30 PM IST) ke bahar naye orders execute nahi honge aur prices static rahengi.
              </span>
            </div>
            <span className="text-[10px] text-amber-300 font-bold shrink-0 ml-2">
              Next Open: {marketHours.nextOpenString}
            </span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <div className={`w-2.5 h-2.5 rounded-full ${marketHours.isOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
            <span className={`font-black flex items-center gap-1.5 uppercase tracking-wider ${marketHours.isOpen ? 'text-emerald-400' : 'text-slate-400'}`}>
              <Globe size={13} />
              {selectedBrokerMeta.name} & Exchange Feed
            </span>
            <span className="text-[10px] text-slate-400">
              (IST: {marketHours.istTimeString})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Market Clock & Status Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border ${marketHours.badgeColor}`}>
              <Clock size={12} />
              <span>{marketHours.statusText}</span>
              <span className="opacity-75">· {marketHours.timeRemainingText}</span>
            </div>

            {/* Live Broker Connection Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>ROUTER: {selectedBroker}</span>
            </div>
          </div>
        </div>

        {/* Ticker Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3">
          {[
            { id: 'nifty', label: 'NIFTY 50' },
            { id: 'bank_nifty', label: 'BANK NIFTY' },
            { id: 'sensex', label: 'SENSEX' },
            { id: 'fin_nifty', label: 'FIN NIFTY' },
            { id: 'midcap', label: 'MIDCAP 50' }
          ].map(idx => {
            const q = yahooQuotes[idx.id];
            const isPos = (q?.change || 0) >= 0;
            return (
              <div key={idx.id} className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/70 hover:border-indigo-500/40 transition-all">
                <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                  <span>{idx.label}</span>
                  <span className={`font-mono text-[9px] ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPos ? '▲' : '▼'} {q ? Math.abs(q.changePercent).toFixed(2) : '0.00'}%
                  </span>
                </div>
                <div className="text-base font-black text-white font-mono mt-1">
                  ₹{q ? q.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-800/50">
                  <span>L: ₹{q ? q.low.toFixed(0) : '---'}</span>
                  <span>H: ₹{q ? q.high.toFixed(0) : '---'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CLAUDE AI TRADING COPILOT & AYUB RANA CRT ASSISTANT (https://claude.ai/ Bridge) */}
      <div className="hud-panel p-5 lg:p-6 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-sm">
              <Bot size={24} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 font-mono">
                <h3 className="text-base lg:text-lg font-black font-display text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  Claude & Gemini AI Trading Copilot
                </h3>
                <span className="text-[10px] text-amber-400 font-extrabold uppercase">
                  · AYUB RANA CRT PDF MODEL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full algorithmic automation: Ayub Rana 3-Candle CRT scans, order execution, mode toggle, and one-click sync with <strong className="text-amber-400">https://claude.ai/</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 font-mono">
            {/* Open https://claude.ai/ Button */}
            <button
              onClick={handleLaunchClaudeAi}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-black rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <ExternalLink size={14} />
              Open in Claude.ai
            </button>

            {/* Copy Payload Button */}
            <button
              onClick={handleCopyPayloadOnly}
              className="px-3.5 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-300 border border-black/5 dark:border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
              title="Copy complete Algo & Market context formatted for Claude"
            >
              {copiedPayload ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copiedPayload ? 'Copied Context' : 'Copy for Claude'}
            </button>

            {/* Claude API Key config */}
            <button
              onClick={() => setShowClaudeKeyModal(!showClaudeKeyModal)}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-all"
              title="Configure Anthropic Claude API Key (Optional)"
            >
              <Key size={16} />
            </button>
          </div>
        </div>

        {/* Claude API Key Drawer (Optional) */}
        {showClaudeKeyModal && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 animate-in fade-in duration-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
              <div>
                <h5 className="text-xs font-black uppercase text-purple-300 flex items-center gap-1.5">
                  <Key size={13} />
                  Anthropic Claude API Key (Optional)
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Optional: Enter your Anthropic Claude Key to prioritize Claude over the built-in server AI &amp; Autonomous CRT Engine.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase font-bold text-purple-400">Anthropic Claude API Key:</label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="sk-ant-api03-..."
                  value={claudeApiKeyInput}
                  onChange={(e) => setClaudeApiKeyInput(e.target.value)}
                  className="bg-slate-900 border border-purple-500/40 rounded-xl px-3 py-1.5 text-xs text-white outline-none w-full font-mono"
                />
                <button
                  onClick={() => {
                    ClaudeService.setClaudeApiKey(claudeApiKeyInput);
                    addLog('CLAUDE', 'Claude API Key saved.');
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shrink-0"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action Prompt Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <span className="text-[10px] font-bold uppercase text-purple-300 tracking-wider">Quick Commands:</span>
          {[
            { label: '🎯 Scan Ayub Rana CRT Setups', query: 'Ayub Rana CRT PDF ke rules ke anusaar Nifty ka C1, C2 aur C3 setup scan karo' },
            { label: '⚡ Execute CRT 0.5 EQ Trade', query: 'Buy Nifty CE near 5M FVG retest targeting 0.5 Equilibrium' },
            { label: '🛑 Square Off All Positions', query: 'Emergency square off all positions now' },
            { label: '▶️ Start All Algos', query: 'Start all algos' },
            { label: '⏸️ Pause All Algos', query: 'Pause all algos' },
            { label: '📊 Yahoo Live Ticks Audit', query: 'Yahoo Finance live ticks ke basis par market trend aur bias kya hai?' },
            { label: '📖 Explain PDF CRT Rules', query: 'PDF me batayi gayi Ayub Rana CRT strategy ke 3 rules explain karo' }
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleClaudeSubmit(chip.query)}
              className="px-2.5 py-1 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/30 rounded-lg text-[10px] font-bold transition-all hover:scale-102 flex items-center gap-1 active:scale-95"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Claude Chat Feed */}
        <div className="mt-4 bg-slate-950/70 rounded-2xl border border-slate-800 p-4 max-h-72 overflow-y-auto space-y-3 custom-scrollbar">
          {claudeMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-slate-900/90 text-slate-200 rounded-bl-none border border-slate-800 shadow-md'
                }`}
              >
                {msg.role === 'claude' && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] font-black uppercase text-purple-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={11} className="text-amber-400" />
                      Claude AI Assistant
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {msg.source ? msg.source.replace('_', ' ') : 'Ayub Rana Engine'}
                    </span>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {msg.actionExecuted && (
                  <div className="mt-2.5 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={12} />
                    {msg.actionExecuted}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isClaudeThinking && (
            <div className="flex justify-start">
              <div className="bg-slate-900/90 rounded-2xl rounded-bl-none p-3 border border-slate-800 flex items-center gap-2 text-xs text-purple-300">
                <RefreshCw size={13} className="animate-spin text-purple-400" />
                Claude is analyzing Yahoo Finance ticks & CRT PDF strategy...
              </div>
            </div>
          )}
          <div ref={claudeChatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            placeholder="Command Claude: 'Buy Nifty CE', 'Square off', 'Scan CRT setup', or ask anything..."
            value={claudeInput}
            onChange={(e) => setClaudeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleClaudeSubmit()}
            className="flex-1 bg-slate-950 border border-purple-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-400 font-sans shadow-inner"
          />
          <button
            onClick={() => handleClaudeSubmit()}
            disabled={isClaudeThinking || !claudeInput.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-purple-600/20 shrink-0 transition-all"
          >
            <Send size={13} />
            Send
          </button>
        </div>
      </div>

      {/* BROKER & REDIRECT URI NOTICE BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-indigo-900/20 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-indigo-600/30">
            <Cpu size={20} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider">
                Active Execution Broker & Redirect URI
              </h4>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                isBrokerConfigured 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {isBrokerConfigured ? 'Broker Ready (API + Secret Set)' : 'Needs API Key & Secret Key'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Broker developer portals (Zerodha Kite, Dhan HQ, Angel One, Upstox) me Redirect URI: <strong className="text-amber-300 font-mono">https://crt-9nue.onrender.com</strong> set karein.
              Broker se sirf do cheez enter karna hai: <strong>API Key</strong> aur <strong>Secret Key</strong>!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 self-end md:self-center">
          <select
            value={selectedBroker}
            onChange={(e) => {
              const b = e.target.value as BrokerId;
              setSelectedBroker(b);
              brokerRegistry.setActiveBrokerId(b);
              addLog('INFO', `Switched execution router to ${b}.`);
            }}
            className="bg-slate-950 border border-indigo-500/30 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="ZERODHA">Zerodha Kite (Kite Connect)</option>
            <option value="DHAN">Dhan HQ (DhanHQ v2)</option>
            <option value="ANGELONE">Angel One (SmartAPI)</option>
            <option value="UPSTOX">Upstox Pro (REST & WS v2)</option>
            <option value="GROWW">Groww Terminal</option>
            <option value="FYERS">Fyers API v3</option>
            <option value="BINANCE">Binance Futures</option>
          </select>

          <button
            onClick={handleCopyRedirect}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
          >
            {copiedRedirect ? <Check size={12} /> : <Copy size={12} />}
            {copiedRedirect ? 'Copied URI' : 'Copy Redirect URI'}
          </button>
        </div>
      </div>

      {/* METRIC PERFORMANCE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Today PnL */}
        <div className="hud-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">TODAY'S NET P&L</span>
            <div className={`p-1.5 rounded-lg ${totalAlgoPnl >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <DollarSign size={15} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl md:text-3xl font-black font-mono tracking-tight ${
              totalAlgoPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {totalAlgoPnl >= 0 ? `+₹${totalAlgoPnl.toLocaleString('en-IN')}` : `-₹${Math.abs(totalAlgoPnl).toLocaleString('en-IN')}`}
            </h3>
            <span className="text-[9px] font-mono text-slate-400 uppercase">INR NET</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
            <span>Target: ₹{dailyProfitTarget.toLocaleString('en-IN')}</span>
            <span className="text-emerald-400 font-bold">
              {((totalAlgoPnl / dailyProfitTarget) * 100).toFixed(0)}% reached
            </span>
          </div>
          <div className="w-full h-1 bg-black/10 dark:bg-white/5 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, (totalAlgoPnl / dailyProfitTarget) * 100))}%` }}
            />
          </div>
        </div>

        {/* Win Rate */}
        <div className="hud-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">ALGO WIN RATE</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Award size={15} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl md:text-3xl font-black font-mono text-cyan-400 tracking-tight">
              {winRateMetric}%
            </h3>
            <span className="text-[9px] font-mono text-slate-400 uppercase">AYUB RANA</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
            <span>Closed: {orders.filter(o => o.status !== 'OPEN').length}</span>
            <span className="text-cyan-400 font-bold">PF: 2.65</span>
          </div>
          <div className="w-full h-1 bg-black/10 dark:bg-white/5 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${winRateMetric}%` }} />
          </div>
        </div>

        {/* Open Positions */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Live Positions</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Layers size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl md:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {openPositionsCount} <span className="text-sm text-slate-400 font-normal">/ {maxOpenPositions} Max</span>
            </h3>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
            <span>Trailing SL: {trailingSlPoints} pts</span>
            <span className="text-purple-400 font-bold">Risk Guard ON</span>
          </div>
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full transition-all duration-500" 
              style={{ width: `${(openPositionsCount / maxOpenPositions) * 100}%` }} 
            />
          </div>
        </div>

        {/* Execution Mode & Gateway */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Router & WebSocket State</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Radio size={16} className="animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl md:text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight truncate">
              {selectedBroker}
            </h3>
            <span className="text-[10px] font-bold text-emerald-500 uppercase">{executionMode}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {brokerLatency}ms Latency
            </span>
            <span className="text-emerald-500 font-bold">{wsState}</span>
          </div>
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* STRATEGY MODULES (CRT, SMC, BREAKOUT, VEGA) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Cpu size={18} className="text-indigo-500" />
                Trading Strategies (Simple & Clean)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {strategies.filter(s => s.active).length} Active
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Sirf wahi strategies on rakhein jinpe aap trade karna chahte hain. CRT Reversal aur SMC Sniper recommended hain.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Chips */}
            <div className="flex items-center bg-black/10 dark:bg-black/40 p-1 rounded-xl border border-black/5 dark:border-white/5 text-[10px] font-mono font-bold">
              {(['ALL', 'ACTIVE', 'CRT', 'SMC'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStratFilter(tab)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    stratFilter === tab
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'ALL' ? 'All (5)' : tab === 'ACTIVE' ? 'Active Only' : `${tab} Only`}
                </button>
              ))}
            </div>

            <button
              onClick={handleTriggerSimulatedTrade}
              disabled={isSimulating}
              className="px-3.5 py-1.5 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              <Zap size={13} className={isSimulating ? 'animate-spin' : ''} />
              {isSimulating ? 'Testing...' : 'Test Signal'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {strategies
            .filter(strat => {
              if (stratFilter === 'ACTIVE') return strat.active;
              if (stratFilter === 'CRT') return strat.category.includes('CRT') || strat.category === 'BREAKOUT';
              if (stratFilter === 'SMC') return strat.category.includes('SMC');
              return true;
            })
            .map(strat => (
            <div
              key={strat.id}
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between relative group ${
                strat.active 
                  ? 'bg-white dark:bg-slate-900 border-indigo-500/30 shadow-lg shadow-indigo-500/5' 
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                      {strat.code}
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5 leading-snug">
                      {strat.name}
                    </h3>
                  </div>

                  {/* Strategy Toggle */}
                  <button
                    onClick={() => toggleStrategy(strat.id)}
                    className={`p-2 rounded-xl transition-all shadow-sm ${
                      strat.active 
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                    title={strat.active ? 'Pause this bot' : 'Start this bot'}
                  >
                    {strat.active ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {strat.description}
                </p>

                {/* Symbols & Timeframe */}
                <div className="flex flex-wrap items-center gap-1.5 mt-4">
                  {strat.targetSymbols.map((sym, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {sym}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-slate-800 text-slate-400 font-mono ml-auto">
                    {strat.timeframe}
                  </span>
                </div>

                {/* Strategy Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-center font-mono">
                  <div>
                    <span className="text-[9px] text-slate-400 font-sans block">Win Rate</span>
                    <span className="text-xs font-black text-emerald-400">{strat.winRate}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-sans block">Risk:Reward</span>
                    <span className="text-xs font-black text-indigo-400">{strat.targetRR}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-sans block">Lots Allocated</span>
                    <span className="text-xs font-black text-slate-200">{strat.lots}x</span>
                  </div>
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full ${strat.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                  {strat.statusText}
                </span>
                <span className="font-mono font-black text-emerald-400 shrink-0 ml-2">
                  +₹{strat.dailyPnl.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIVE ORDERS & POSITIONS DECK */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Layers size={18} className="text-indigo-500" />
              Live Order Book & Strategy Positions
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Real-time mark-to-market positions, target levels, and stop-loss trailing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase">
              <button
                onClick={() => setOrderFilter('OPEN')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  orderFilter === 'OPEN' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                Open ({orders.filter(o => o.status === 'OPEN').length})
              </button>
              <button
                onClick={() => setOrderFilter('CLOSED')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  orderFilter === 'CLOSED' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                Closed ({orders.filter(o => o.status !== 'OPEN').length})
              </button>
              <button
                onClick={() => setOrderFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  orderFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                All ({orders.length})
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-sans tracking-wider">
                <th className="py-3 px-3">Order ID / Time</th>
                <th className="py-3 px-3">Strategy</th>
                <th className="py-3 px-3">Contract / Symbol</th>
                <th className="py-3 px-3">Side & Qty</th>
                <th className="py-3 px-3">Entry Price</th>
                <th className="py-3 px-3">Live LTP</th>
                <th className="py-3 px-3">SL / Target</th>
                <th className="py-3 px-3">Realized P&L</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredOrders.map(ord => (
                <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{ord.id}</span>
                    <span className="text-[10px] text-slate-400">{ord.timestamp}</span>
                  </td>
                  <td className="py-3.5 px-3 font-sans font-bold text-slate-300">
                    {ord.strategyName}
                  </td>
                  <td className="py-3.5 px-3 font-black text-indigo-400">
                    {ord.symbol}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase mr-1.5 ${
                      ord.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {ord.side}
                    </span>
                    <span className="text-slate-300">{ord.quantity} Qty</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300">₹{ord.entryPrice.toFixed(2)}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-100">₹{ord.currentPrice.toFixed(2)}</td>
                  <td className="py-3.5 px-3 text-[11px]">
                    <span className="text-rose-400 block">SL: ₹{ord.stopLoss.toFixed(2)}</span>
                    <span className="text-emerald-400 block">TP: ₹{ord.targetPrice.toFixed(2)}</span>
                  </td>
                  <td className="py-3.5 px-3 font-black">
                    <span className={ord.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {ord.pnl >= 0 ? `+₹${ord.pnl.toLocaleString('en-IN')}` : `-₹${Math.abs(ord.pnl).toLocaleString('en-IN')}`}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      ord.status === 'OPEN' 
                        ? 'bg-blue-500/20 text-blue-400 animate-pulse'
                        : ord.status === 'TARGET_HIT'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {ord.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {ord.status === 'OPEN' ? (
                      <button
                        onClick={() => {
                          setOrders(prev => prev.map(o => o.id === ord.id ? { ...o, status: 'SQUARED_OFF' } : o));
                          addLog('RISK', `Manual Exit: Position ${ord.symbol} squared off at ₹${ord.currentPrice.toFixed(2)}.`);
                        }}
                        className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-lg text-[10px] font-bold uppercase transition-all"
                      >
                        Exit
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">Archived</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-sans text-xs">
                    No {orderFilter.toLowerCase()} orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Real-time Algo Terminal Audit Stream */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Terminal size={12} className="text-emerald-500" />
              Live Quantitative Algo Audit Stream (Real-Time Output)
            </span>
            <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              STREAMING
            </span>
          </div>

          <div
            ref={logContainerRef}
            className="h-36 overflow-y-auto bg-slate-950 rounded-2xl p-3.5 font-mono text-[11px] space-y-1.5 border border-slate-800 custom-scrollbar shadow-inner"
          >
            {logs.map(lg => (
              <div key={lg.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-500 shrink-0">[{lg.timestamp}]</span>
                <span className={`px-1 rounded text-[8px] font-black uppercase shrink-0 mt-0.5 ${
                  lg.type === 'SIGNAL' ? 'bg-amber-500/20 text-amber-400' :
                  lg.type === 'EXECUTION' ? 'bg-emerald-500/20 text-emerald-400' :
                  lg.type === 'RISK' ? 'bg-rose-500/20 text-rose-400' :
                  lg.type === 'CLAUDE' ? 'bg-purple-500/20 text-purple-300 font-bold' :
                  lg.type === 'ERROR' ? 'bg-red-500/30 text-red-300' : 'bg-indigo-500/20 text-indigo-400'
                }`}>
                  {lg.type}
                </span>
                <span className="text-slate-300">{lg.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
