import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Radar,
  RefreshCw,
  Download,
  ExternalLink,
  Copy,
  Check,
  Search,
  TrendingUp,
  TrendingDown,
  Layers,
  Crosshair,
  BarChart3,
  FlaskConical,
  Code2,
  ChevronDown,
  ChevronUp,
  Play,
  AlertCircle,
} from 'lucide-react';
import {
  NSE_UNIVERSE,
  BSE_UNIVERSE,
  INDIA_CRT_CORE_UNIVERSE,
  INDIA_ALL_INDICES_UNIVERSE,
  GOLD_GLOBAL_FUTURES_UNIVERSE,
  UniverseItem,
  MonthlyDailyCRTResult,
  MTFCisdRow,
  IntradayStructureResult,
  CRTBacktestReport,
  ALGO_RESEARCH_NAMES,
  AlgoResearchName,
  AlgoResearchSummary,
  fetchScannerCandles,
  analyzeMonthlyDailyCRT,
  analyzeMTFCisdConfluence,
  analyzeIntradayStructure,
  toTradingViewSymbol,
  toTradingViewUrl,
  generateCrtPineScript,
  buildCrtResultsCsv,
  runHistoricalCRTBacktest,
  runAlgoResearchBacktest,
} from '../services/scanner5Service';

type RepoTab = 'crt-dashboard' | 'mtf-cisd' | 'multi-screener' | 'backtest-research';
type UniverseMode = 'CORE_CRT' | 'ALL_INDICES' | 'NSE_BLUECHIPS' | 'BSE_SCRIPS' | 'GOLD_GLOBAL_FUTURES' | 'CUSTOM';
type CrtStageFilter = 'ALL' | 'ACTIONABLE' | 'BUY' | 'SELL' | 'WAIT_STAGES' | 'BULLISH' | 'BEARISH';

interface MultiScreenerRow {
  symbol: string;
  name: string;
  dailyClose: number;
  dailyBias: 'Bullish' | 'Bearish';
  dailyBreakout: boolean;
  hourlyBias: 'Bullish' | 'Bearish';
  hourlyChoch: boolean;
  fifteenMinClose: number;
  activeZonesCount: number;
  latestZoneLabel: string;
  retestConfirmed: boolean;
}

const ALGO_LINE_COLORS = [
  '#00f59b',
  '#00e5ff',
  '#f59e0b',
  '#a78bfa',
  '#fb7185',
  '#34d399',
];

export const IndiaCrtDashboardPanel: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState<RepoTab>('crt-dashboard');

  // --- Tab 1: Monthly-Daily CRT Dashboard ---
  const [universeMode, setUniverseMode] = useState<UniverseMode>('CORE_CRT');
  const [historyRange, setHistoryRange] = useState<'6mo' | '1y' | '2y'>('6mo');
  const [customSymbolsInput, setCustomSymbolsInput] = useState('RELIANCE.NS, TCS.NS, HDFCBANK.NS, ^NSEI, GC=F');
  const [crtResults, setCrtResults] = useState<MonthlyDailyCRTResult[]>([]);
  const [crtLoading, setCrtLoading] = useState(false);
  const [crtError, setCrtError] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<string>('');
  const [dataReceivedCount, setDataReceivedCount] = useState<number>(0);
  const [universeTotalCount, setUniverseTotalCount] = useState<number>(0);
  const [stageFilter, setStageFilter] = useState<CrtStageFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected row + Pine Script + MTF Drilldown
  const [selectedSymbol, setSelectedSymbol] = useState<string>('^NSEI');
  const [showPineScript, setShowPineScript] = useState(false);
  const [copiedPine, setCopiedPine] = useState(false);

  // --- Tab 2: MTF CISD & Gold/FX Multi-Asset ---
  const [mtfSymbol, setMtfSymbol] = useState<string>('^NSEI');
  const [mtfCustomSymbol, setMtfCustomSymbol] = useState<string>('');
  const [mtfRows, setMtfRows] = useState<MTFCisdRow[]>([]);
  const [intradayStruct, setIntradayStruct] = useState<IntradayStructureResult | null>(null);
  const [mtfLoading, setMtfLoading] = useState(false);
  const [mtfError, setMtfError] = useState<string | null>(null);

  // --- Tab 3: Multi-Symbol 1H/15M OB+FVG Screener ---
  const [screenerRows, setScreenerRows] = useState<MultiScreenerRow[]>([]);
  const [screenerLoading, setScreenerLoading] = useState(false);
  const [screenerError, setScreenerError] = useState<string | null>(null);

  // --- Tab 4: Historical CRT Backtest & 12-Algo Research ---
  const [researchMode, setResearchMode] = useState<'CRT_BACKTEST' | 'ALGO_RESEARCH'>('CRT_BACKTEST');
  const [btSymbol, setBtSymbol] = useState<string>('^NSEI');
  const [btRange, setBtRange] = useState<'1y' | '2y' | '3y' | '5y'>('3y');
  const [btChargesBps, setBtChargesBps] = useState<number>(12);
  const [btSlippageBps, setBtSlippageBps] = useState<number>(5);
  const [crtBtReport, setCrtBtReport] = useState<CRTBacktestReport | null>(null);
  const [selectedAlgos, setSelectedAlgos] = useState<AlgoResearchName[]>([
    'EMA 9/21 Crossover',
    'Supertrend 10/3',
    'Donchian 20 Breakout',
    'RSI 14 Mean Reversion',
  ]);
  const [algoSummaries, setAlgoSummaries] = useState<AlgoResearchSummary[]>([]);
  const [btLoading, setBtLoading] = useState(false);
  const [btError, setBtError] = useState<string | null>(null);

  const activeUniverseList: UniverseItem[] = useMemo(() => {
    switch (universeMode) {
      case 'ALL_INDICES':
        return INDIA_ALL_INDICES_UNIVERSE;
      case 'NSE_BLUECHIPS':
        return NSE_UNIVERSE;
      case 'BSE_SCRIPS':
        return BSE_UNIVERSE;
      case 'GOLD_GLOBAL_FUTURES':
        return GOLD_GLOBAL_FUTURES_UNIVERSE;
      case 'CUSTOM': {
        const items = customSymbolsInput
          .split(/[\n,]+/)
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean)
          .slice(0, 30);
        return items.map((raw) => {
          const hasSuffix = raw.includes('.') || raw.startsWith('^') || raw.includes('=') || raw.includes('-');
          const sym = hasSuffix ? raw : `${raw}.NS`;
          return {
            symbol: sym,
            shortCode: raw.replace(/\.(NS|BO)$/, ''),
            name: `${raw} Custom`,
            sector: 'Custom',
            exchange: sym.endsWith('.BO') ? 'BSE' : sym.startsWith('^') ? 'INDEX' : 'NSE',
          };
        });
      }
      case 'CORE_CRT':
      default:
        return INDIA_CRT_CORE_UNIVERSE;
    }
  }, [universeMode, customSymbolsInput]);

  // 1. Run Monthly-Daily CRT Scan
  const runCrtScan = useCallback(async () => {
    if (activeUniverseList.length === 0) return;
    setCrtLoading(true);
    setCrtError(null);
    setUniverseTotalCount(activeUniverseList.length);
    try {
      const syms = activeUniverseList.map((u) => u.symbol);
      const { candlesBySymbol, errors } = await fetchScannerCandles(syms, '1d', historyRange);
      const received = activeUniverseList.filter((u) => (candlesBySymbol[u.symbol] ?? []).length > 0);
      setDataReceivedCount(received.length);

      const computed = activeUniverseList
        .map((u) => analyzeMonthlyDailyCRT(u.symbol, `${u.shortCode} · ${u.name}`, candlesBySymbol[u.symbol] ?? []))
        .sort((a, b) => {
          const order = (s: number) => (s === 3 ? 0 : s === 2 ? 1 : s === 1 ? 2 : s === 4 ? 3 : s === 5 ? 4 : s === 9 ? 5 : 6);
          return order(a.stage) - order(b.stage) || a.symbol.localeCompare(b.symbol);
        });

      setCrtResults(computed);
      setLastScanTime(new Date().toLocaleTimeString('en-IN', { hour12: true }));
      if (computed.length > 0 && !computed.some((c) => c.symbol === selectedSymbol)) {
        setSelectedSymbol(computed[0].symbol);
      }
      if (errors.length > 0 && received.length === 0) {
        setCrtError(`Yahoo Finance unavailable for ${errors.length} symbols.`);
      }
    } catch (err) {
      setCrtError(err instanceof Error ? err.message : 'Failed to run India CRT Setup scan.');
    } finally {
      setCrtLoading(false);
    }
  }, [activeUniverseList, historyRange, selectedSymbol]);

  // 2. Run MTF CRT -> 15M CISD -> 5M FVG Retest + 1H Structure
  const runMtfInspection = useCallback(async (symToInspect: string, label?: string) => {
    const clean = symToInspect.trim().toUpperCase();
    if (!clean) return;
    setMtfSymbol(clean);
    setMtfLoading(true);
    setMtfError(null);
    try {
      const [r1h, r15m, r5m, r1d, r1wk] = await Promise.all([
        fetchScannerCandles([clean], '1h', '1mo'),
        fetchScannerCandles([clean], '15m', '1mo'),
        fetchScannerCandles([clean], '5m', '5d'),
        fetchScannerCandles([clean], '1d', '1y'),
        fetchScannerCandles([clean], '1wk', '2y'),
      ]);
      const b1h = r1h.candlesBySymbol[clean] ?? [];
      const b15m = r15m.candlesBySymbol[clean] ?? [];
      const b5m = r5m.candlesBySymbol[clean] ?? [];
      const b1d = r1d.candlesBySymbol[clean] ?? [];
      const b1wk = r1wk.candlesBySymbol[clean] ?? [];

      setMtfRows(analyzeMTFCisdConfluence(b1h, b15m, b5m, b1d, b1wk));
      if (b1d.length >= 25 && b1h.length >= 15 && b15m.length >= 15) {
        setIntradayStruct(analyzeIntradayStructure(clean, label || clean, b1d, b1h, b15m));
      } else {
        setIntradayStruct(null);
      }
    } catch (err) {
      setMtfError(err instanceof Error ? err.message : 'Failed to load MTF CISD analysis.');
      setMtfRows([]);
      setIntradayStruct(null);
    } finally {
      setMtfLoading(false);
    }
  }, []);

  // 3. Run Multi-Symbol 1H / 15M OB+FVG Screener
  const runMultiScreener = useCallback(async () => {
    setScreenerLoading(true);
    setScreenerError(null);
    try {
      const targets = [
        ...INDIA_CRT_CORE_UNIVERSE.slice(0, 7),
        ...NSE_UNIVERSE.slice(0, 8),
      ];
      const syms = targets.map((t) => t.symbol);
      const [dRes, hRes, m15Res] = await Promise.all([
        fetchScannerCandles(syms, '1d', '3mo'),
        fetchScannerCandles(syms, '1h', '1mo'),
        fetchScannerCandles(syms, '15m', '5d'),
      ]);

      const rows: MultiScreenerRow[] = [];
      for (const item of targets) {
        const b1d = dRes.candlesBySymbol[item.symbol] ?? [];
        const b1h = hRes.candlesBySymbol[item.symbol] ?? [];
        const b15m = m15Res.candlesBySymbol[item.symbol] ?? [];
        if (b1d.length < 25 || b1h.length < 15 || b15m.length < 15) continue;
        const st = analyzeIntradayStructure(item.symbol, `${item.shortCode} · ${item.name}`, b1d, b1h, b15m);
        const latestZ = st.zones[0];
        rows.push({
          symbol: st.symbol,
          name: st.name,
          dailyClose: st.lastDailyClose,
          dailyBias: st.dailyBias,
          dailyBreakout: st.dailyBreakout,
          hourlyBias: st.hourlyBias,
          hourlyChoch: st.hourlyChoch,
          fifteenMinClose: st.fifteenMinClose,
          activeZonesCount: st.zones.length,
          latestZoneLabel: latestZ ? `${latestZ.type} (₹${latestZ.low}–₹${latestZ.high})` : 'None',
          retestConfirmed: st.zones.some((z) => z.status.toLowerCase().includes('retest')),
        });
      }
      setScreenerRows(rows);
    } catch (err) {
      setScreenerError(err instanceof Error ? err.message : 'Multi-symbol screener scan failed.');
    } finally {
      setScreenerLoading(false);
    }
  }, []);

  // 4. Run Historical CRT Backtest OR 12-Algo Research
  const runBacktestOrResearch = useCallback(async () => {
    setBtLoading(true);
    setBtError(null);
    try {
      const { candlesBySymbol } = await fetchScannerCandles([btSymbol], '1d', btRange);
      const bars = candlesBySymbol[btSymbol] ?? [];
      if (bars.length < 40) {
        throw new Error(`Not enough daily candles returned for ${btSymbol}.`);
      }
      if (researchMode === 'CRT_BACKTEST') {
        const report = runHistoricalCRTBacktest(btSymbol, btSymbol, bars, 100000, btChargesBps, btSlippageBps);
        setCrtBtReport(report);
      } else {
        if (selectedAlgos.length === 0) {
          throw new Error('Select at least one algorithm to benchmark.');
        }
        const summaries = runAlgoResearchBacktest(bars, selectedAlgos, btChargesBps, btSlippageBps);
        setAlgoSummaries(summaries);
      }
    } catch (err) {
      setBtError(err instanceof Error ? err.message : 'Backtest / research execution failed.');
    } finally {
      setBtLoading(false);
    }
  }, [btSymbol, btRange, researchMode, btChargesBps, btSlippageBps, selectedAlgos]);

  // Auto-load primary CRT Dashboard + MTF NIFTY 50 on mount
  useEffect(() => {
    runCrtScan();
    runMtfInspection('^NSEI', 'NIFTY 50 Index');
  }, [runCrtScan, runMtfInspection]);

  // Auto-load tab data on first visit
  useEffect(() => {
    if (activeTab === 'multi-screener' && screenerRows.length === 0 && !screenerLoading) {
      runMultiScreener();
    }
    if (activeTab === 'backtest-research' && !crtBtReport && algoSummaries.length === 0 && !btLoading) {
      runBacktestOrResearch();
    }
  }, [activeTab, screenerRows.length, screenerLoading, crtBtReport, algoSummaries.length, btLoading, runMultiScreener, runBacktestOrResearch]);

  // Filtered CRT Rows
  const filteredCrtRows = useMemo(() => {
    return crtResults.filter((r) => {
      if (stageFilter === 'ACTIONABLE' && r.stage !== 3 && r.stage !== 2) return false;
      if (stageFilter === 'BUY' && r.setup !== 'BUY') return false;
      if (stageFilter === 'SELL' && r.setup !== 'SELL') return false;
      if (stageFilter === 'WAIT_STAGES' && r.stage !== 1 && r.stage !== 2) return false;
      if (stageFilter === 'BULLISH' && r.bias !== 'Bullish') return false;
      if (stageFilter === 'BEARISH' && r.bias !== 'Bearish') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!r.symbol.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q) && !r.setup.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [crtResults, stageFilter, searchQuery]);

  // Dashboard KPI Counts (exact parity with india-crt-setup-scanner/app.py)
  const kpiCounts = useMemo(() => {
    const buy = crtResults.filter((r) => r.setup === 'BUY').length;
    const sell = crtResults.filter((r) => r.setup === 'SELL').length;
    const waitChoch = crtResults.filter((r) => r.stage === 1).length;
    const waitZones = crtResults.filter((r) => r.stage === 2).length;
    const active = crtResults.filter((r) => r.stage === 3).length;
    const targetHit = crtResults.filter((r) => r.stage === 4).length;
    const slHit = crtResults.filter((r) => r.stage === 5).length;
    const earlierTrend = crtResults.filter((r) => r.stage === 9).length;
    return { buy, sell, waitChoch, waitZones, active, targetHit, slHit, earlierTrend };
  }, [crtResults]);

  const selectedCrtRow = useMemo(() => {
    return crtResults.find((r) => r.symbol === selectedSymbol) || filteredCrtRows[0] || crtResults[0] || null;
  }, [crtResults, filteredCrtRows, selectedSymbol]);

  const pineScriptText = useMemo(() => {
    return selectedCrtRow ? generateCrtPineScript(selectedCrtRow) : '';
  }, [selectedCrtRow]);

  const handleCopyPine = () => {
    if (!pineScriptText) return;
    navigator.clipboard.writeText(pineScriptText);
    setCopiedPine(true);
    setTimeout(() => setCopiedPine(false), 2500);
  };

  const handleDownloadCsv = () => {
    if (filteredCrtRows.length === 0) return;
    const csv = buildCrtResultsCsv(filteredCrtRows);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'india_crt_scan_results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Build unified equity comparison chart data for Algo Research
  const algoChartData = useMemo(() => {
    if (algoSummaries.length === 0) return [];
    const base = algoSummaries[0].curve;
    return base.map((pt, idx) => {
      const row: Record<string, string | number> = {
        date: pt.date,
        Benchmark: pt.benchmark,
      };
      algoSummaries.forEach((s) => {
        row[s.algo] = s.curve[idx]?.equity ?? 1;
      });
      return row;
    });
  }, [algoSummaries]);

  const stageBadgeClass = (stage: number, setup: string) => {
    if (setup === 'BUY' || stage === 4) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (setup === 'SELL' || stage === 5) return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    if (stage === 2 || stage === 9) return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    if (stage === 1) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  };

  return (
    <div className="hud-panel rounded-2xl p-5 lg:p-6 border border-cyan-500/20 space-y-5">
      {/* Header Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider">
            <Radar size={13} className="animate-spin text-cyan-400" />
            <span>INDIA CRT SETUP SCANNER · FULL STRATEGY SUITE</span>
            <span>·</span>
            <span className="text-emerald-400">MONTHLY CRT + CHoCH + FVG/OB/BOB + 15M CISD</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight mt-1">
            🇮🇳 India CRT Strategy Scanner &amp; Multi-Timeframe Radar
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Complete integration of Monthly M1/M2/M3 CRT sweeps, Daily CHoCH, FVG/IFVG/OB/BOB retests, 15M CISD, Gold/FX Futures &amp; 12-Algo Research.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/5 dark:bg-black/40 p-1 rounded-xl border border-black/5 dark:border-white/10 font-mono text-[11px] font-bold">
          {[
            { id: 'crt-dashboard' as RepoTab, icon: Crosshair, label: 'CRT Dashboard' },
            { id: 'mtf-cisd' as RepoTab, icon: Layers, label: 'MTF CISD & Gold/FX' },
            { id: 'multi-screener' as RepoTab, icon: BarChart3, label: '1H/15M Screener' },
            { id: 'backtest-research' as RepoTab, icon: FlaskConical, label: 'Backtest & 12 Algos' },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  active
                    ? 'bg-cyan-500 text-black font-extrabold shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: MONTHLY-DAILY CRT STRATEGY SCANNER (app.py + scanner.py)       */}
      {/* ===================================================================== */}
      {activeTab === 'crt-dashboard' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-3 bg-black/5 dark:bg-white/[0.02] p-3.5 rounded-xl border border-black/5 dark:border-white/10 font-mono text-xs">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Market Universe</label>
                <select
                  value={universeMode}
                  onChange={(e) => setUniverseMode(e.target.value as UniverseMode)}
                  className="bg-white dark:bg-[#070c1d] border border-black/10 dark:border-white/15 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-cyan-400"
                >
                  <option value="CORE_CRT">Core India + Gold CRT (24)</option>
                  <option value="ALL_INDICES">All Indian Indices + VIX (25)</option>
                  <option value="NSE_BLUECHIPS">NSE Equity Bluechips (30)</option>
                  <option value="BSE_SCRIPS">BSE Sensex Scrips (20)</option>
                  <option value="GOLD_GLOBAL_FUTURES">Gold / Metals / FX / Crypto CISD (10)</option>
                  <option value="CUSTOM">Custom Symbols</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">History</label>
                <select
                  value={historyRange}
                  onChange={(e) => setHistoryRange(e.target.value as '6mo' | '1y' | '2y')}
                  className="bg-white dark:bg-[#070c1d] border border-black/10 dark:border-white/15 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-cyan-400"
                >
                  <option value="6mo">6 Months</option>
                  <option value="1y">1 Year</option>
                  <option value="2y">2 Years</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Stage Filter</label>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value as CrtStageFilter)}
                  className="bg-white dark:bg-[#070c1d] border border-black/10 dark:border-white/15 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-cyan-400"
                >
                  <option value="ALL">All Stages ({crtResults.length})</option>
                  <option value="ACTIONABLE">Actionable (BUY/SELL/Retest)</option>
                  <option value="BUY">BUY Active ({kpiCounts.buy})</option>
                  <option value="SELL">SELL Active ({kpiCounts.sell})</option>
                  <option value="WAIT_STAGES">Waiting CHoCH / Zones ({kpiCounts.waitChoch + kpiCounts.waitZones})</option>
                  <option value="BULLISH">Bullish Bias</option>
                  <option value="BEARISH">Bearish Bias</option>
                </select>
              </div>

              <div className="relative min-w-[190px]">
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Search Symbol</label>
                <Search size={13} className="absolute left-3 bottom-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="NIFTY, GOLD, RELIANCE..."
                  className="w-full bg-white dark:bg-[#070c1d] border border-black/10 dark:border-white/15 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={runCrtScan}
                disabled={crtLoading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-95 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={13} className={crtLoading ? 'animate-spin' : ''} />
                <span>{crtLoading ? 'SCANNING CRT...' : 'RUN CRT SCAN'}</span>
              </button>

              <button
                onClick={handleDownloadCsv}
                disabled={filteredCrtRows.length === 0}
                className="px-3 py-2 rounded-lg bg-black/10 dark:bg-white/5 hover:bg-black/20 dark:hover:bg-white/10 border border-black/10 dark:border-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Download size={13} />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {universeMode === 'CUSTOM' && (
            <div className="flex items-center gap-2 font-mono text-xs">
              <input
                type="text"
                value={customSymbolsInput}
                onChange={(e) => setCustomSymbolsInput(e.target.value)}
                placeholder="Comma-separated symbols (e.g. RELIANCE.NS, SBIN.NS, ^NSEI, GC=F)"
                className="flex-1 bg-white dark:bg-[#070c1d] border border-cyan-500/30 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
          )}

          {/* 10-Metric KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 font-mono">
            {[
              { label: 'Universe', value: universeTotalCount || activeUniverseList.length, color: 'text-slate-200' },
              { label: 'Data OK', value: dataReceivedCount, color: 'text-cyan-400' },
              { label: 'Wait CHoCH', value: kpiCounts.waitChoch, color: 'text-amber-400' },
              { label: 'Wait Zones', value: kpiCounts.waitZones, color: 'text-cyan-300' },
              { label: 'Active Entry', value: kpiCounts.active, color: 'text-emerald-300' },
              { label: 'BUY Active', value: kpiCounts.buy, color: 'text-emerald-400' },
              { label: 'SELL Active', value: kpiCounts.sell, color: 'text-rose-400' },
              { label: 'Target Hit', value: kpiCounts.targetHit, color: 'text-emerald-400' },
              { label: 'SL Hit', value: kpiCounts.slHit, color: 'text-rose-400' },
              { label: 'Active Trend', value: kpiCounts.earlierTrend, color: 'text-indigo-400' },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="p-2.5 rounded-xl bg-black/5 dark:bg-[#070c1d]/90 border border-black/5 dark:border-white/10"
              >
                <div className="text-[9px] text-slate-400 uppercase font-bold truncate">{kpi.label}</div>
                <div className={`text-base font-black mt-0.5 ${kpi.color}`}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {crtError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{crtError}</span>
            </div>
          )}

          {/* Setup Results Data Table */}
          <div className="overflow-x-auto rounded-xl border border-black/5 dark:border-white/10">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead className="bg-black/5 dark:bg-white/[0.04] text-[10px] text-slate-400 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Symbol / Name</th>
                  <th className="py-2.5 px-3">Bias</th>
                  <th className="py-2.5 px-3">Setup Stage</th>
                  <th className="py-2.5 px-3 text-right">LTP</th>
                  <th className="py-2.5 px-3 text-right">Entry</th>
                  <th className="py-2.5 px-3 text-right">SL</th>
                  <th className="py-2.5 px-3 text-right">T1 (2R)</th>
                  <th className="py-2.5 px-3 text-right">M1 Target</th>
                  <th className="py-2.5 px-3">Zone</th>
                  <th className="py-2.5 px-3">M1 H / L</th>
                  <th className="py-2.5 px-3">Last Candle</th>
                  <th className="py-2.5 px-3 text-right">TV Chart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {crtLoading && filteredCrtRows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-8 text-center text-slate-400">
                      Scanning Monthly M1/M2/M3 sweeps, Daily CHoCH &amp; FVG/OB zones...
                    </td>
                  </tr>
                ) : filteredCrtRows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-8 text-center text-slate-400">
                      No setups match the selected filter. Try switching History to 1 Year or Stage Filter to All Stages.
                    </td>
                  </tr>
                ) : (
                  filteredCrtRows.map((row) => {
                    const isSelected = selectedCrtRow?.symbol === row.symbol;
                    return (
                      <tr
                        key={row.symbol}
                        onClick={() => {
                          setSelectedSymbol(row.symbol);
                          runMtfInspection(row.symbol, row.name);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-cyan-500/10'
                            : 'hover:bg-black/5 dark:hover:bg-white/[0.03]'
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-extrabold text-slate-900 dark:text-white">{row.name}</div>
                          <div className="text-[10px] text-slate-400">{row.symbol} · {row.sweepType}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.bias === 'Bullish'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : row.bias === 'Bearish'
                                ? 'bg-rose-500/15 text-rose-400'
                                : 'bg-slate-500/15 text-slate-400'
                            }`}
                          >
                            {row.bias === 'Bullish' && <TrendingUp size={10} />}
                            {row.bias === 'Bearish' && <TrendingDown size={10} />}
                            {row.bias}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${stageBadgeClass(row.stage, row.setup)}`}>
                            {row.setup}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                          {row.ltp > 0 ? row.ltp.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                          {row.entry !== null ? row.entry.toLocaleString('en-IN') : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-rose-400">
                          {row.sl !== null ? row.sl.toLocaleString('en-IN') : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-cyan-400">
                          {row.t1 !== null ? row.t1.toLocaleString('en-IN') : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-purple-400 font-bold">
                          {row.target !== null ? row.target.toLocaleString('en-IN') : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {row.entryZoneType !== '—' ? row.entryZoneType : row.availableZones.join('/') || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-[10px] text-slate-400">
                          {row.m1High > 0 ? `${row.m1High.toLocaleString('en-IN')} / ${row.m1Low.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-[10px] text-slate-400">{row.lastCandleDate}</td>
                        <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={toTradingViewUrl(row.symbol)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold"
                            title={`Open ${toTradingViewSymbol(row.symbol)} on TradingView`}
                          >
                            <span>TV</span>
                            <ExternalLink size={10} />
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Selected Symbol Deep Inspector + Pine Script v5 + MTF CISD */}
          {selectedCrtRow && (
            <div className="p-4 rounded-xl bg-black/5 dark:bg-[#070c1d]/80 border border-cyan-500/20 space-y-4 font-mono text-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-cyan-400 font-bold uppercase">
                    SELECTED SETUP INSPECTOR · {selectedCrtRow.m1Month} → {selectedCrtRow.m2Month} → {selectedCrtRow.m3Month}
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {selectedCrtRow.name} ({selectedCrtRow.symbol})
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {selectedCrtRow.setupReason} · {selectedCrtRow.chochRule}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowPineScript((v) => !v)}
                    className="px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold text-[11px] flex items-center gap-1.5"
                  >
                    <Code2 size={13} />
                    <span>Pine Script v5 Overlay</span>
                    {showPineScript ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  <a
                    href={toTradingViewUrl(selectedCrtRow.symbol)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 font-bold text-[11px] flex items-center gap-1.5"
                  >
                    <span>Open {toTradingViewSymbol(selectedCrtRow.symbol)}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Pine Script v5 Code Drawer */}
              {showPineScript && (
                <div className="p-3 rounded-xl bg-black/60 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-purple-300 font-bold uppercase">
                      TradingView Pine Editor v5 · CRT M1/M2/Entry/SL/Target Script
                    </span>
                    <button
                      onClick={handleCopyPine}
                      className="px-2.5 py-1 rounded bg-purple-500 text-white text-[10px] font-bold flex items-center gap-1"
                    >
                      {copiedPine ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedPine ? 'Copied!' : 'Copy Script'}</span>
                    </button>
                  </div>
                  <pre className="text-[11px] text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
                    {pineScriptText}
                  </pre>
                </div>
              )}

              {/* Embedded MTF CISD Quick Matrix for Selected Symbol */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    MTF CRT → 15M CISD → 5M FVG Retest Confluence ({mtfSymbol})
                  </span>
                  {mtfLoading && <span className="text-[10px] text-cyan-400 animate-pulse">Loading 1H/15M/5M...</span>}
                </div>
                {mtfRows.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {mtfRows.map((row) => (
                      <div key={row.timeframe} className="p-3 rounded-xl bg-black/20 border border-white/10 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-white">{row.timeframe} CRT</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                              row.alignment === 'A+ ALIGNED'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : row.alignment === 'CISD READY'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'bg-slate-500/20 text-slate-400'
                            }`}
                          >
                            {row.alignment}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">Sweep: <strong className="text-slate-200">{row.crtSweep}</strong></div>
                        <div className="text-[10px] text-slate-400">15M CISD: <strong className="text-cyan-300">{row.cisdStatus}</strong></div>
                        <div className="text-[10px] text-slate-400">5M FVG: <strong className="text-emerald-300">{row.fvgRetestStatus}</strong></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {lastScanTime && (
            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>Source: Yahoo Finance OHLCV (india-crt-setup-scanner rules) · Last Scan: {lastScanTime}</span>
              <span>Click any row to copy Pine Script &amp; inspect 15M CISD + 5M FVG Retest</span>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: MTF CISD & MULTI-ASSET FUTURES (mtf_analysis + gold_cisd)      */}
      {/* ===================================================================== */}
      {activeTab === 'mtf-cisd' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-2 bg-black/5 dark:bg-white/[0.02] p-3.5 rounded-xl border border-black/5 dark:border-white/10">
            {[
              { sym: '^NSEI', label: 'NIFTY 50' },
              { sym: '^NSEBANK', label: 'BANK NIFTY' },
              { sym: '^BSESN', label: 'SENSEX' },
              { sym: 'GC=F', label: 'GOLD (GC=F)' },
              { sym: 'SI=F', label: 'SILVER (SI=F)' },
              { sym: 'CL=F', label: 'CRUDE (CL=F)' },
              { sym: 'YM=F', label: 'DOW (YM=F)' },
              { sym: '6E=F', label: 'EURO FX' },
              { sym: 'BTC-USD', label: 'BTC/USD' },
              { sym: 'ETH-USD', label: 'ETH/USD' },
            ].map((preset) => (
              <button
                key={preset.sym}
                onClick={() => runMtfInspection(preset.sym, preset.label)}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                  mtfSymbol === preset.sym
                    ? 'bg-cyan-500 text-black border-cyan-400'
                    : 'bg-black/10 dark:bg-white/5 border-white/10 text-slate-300 hover:border-cyan-400/40'
                }`}
              >
                {preset.label}
              </button>
            ))}

            <div className="flex items-center gap-1.5 ml-auto">
              <input
                type="text"
                value={mtfCustomSymbol}
                onChange={(e) => setMtfCustomSymbol(e.target.value)}
                placeholder="RELIANCE.NS / TSLA..."
                className="bg-white dark:bg-[#070c1d] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white w-40 outline-none"
              />
              <button
                onClick={() => runMtfInspection(mtfCustomSymbol || mtfSymbol)}
                disabled={mtfLoading}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-extrabold text-xs flex items-center gap-1"
              >
                <RefreshCw size={12} className={mtfLoading ? 'animate-spin' : ''} />
                <span>Inspect</span>
              </button>
            </div>
          </div>

          {mtfError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              {mtfError}
            </div>
          )}

          {/* MTF Matrix Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.04] text-[10px] text-slate-400 uppercase">
                <tr>
                  <th className="py-2.5 px-3">HTF Timeframe</th>
                  <th className="py-2.5 px-3">CRT Sweep</th>
                  <th className="py-2.5 px-3">15M CISD Status</th>
                  <th className="py-2.5 px-3 text-right">CISD Line</th>
                  <th className="py-2.5 px-3">5M FVG Retest</th>
                  <th className="py-2.5 px-3 text-right">Entry</th>
                  <th className="py-2.5 px-3 text-right">SL</th>
                  <th className="py-2.5 px-3 text-right">Target (3R)</th>
                  <th className="py-2.5 px-3">Confluence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mtfRows.map((row) => (
                  <tr key={row.timeframe} className="hover:bg-white/[0.03]">
                    <td className="py-2.5 px-3 font-extrabold text-white">{row.timeframe}</td>
                    <td className="py-2.5 px-3 text-slate-300">{row.crtSweep}</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">{row.cisdStatus}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{row.cisdLine ?? '—'}</td>
                    <td className="py-2.5 px-3 text-emerald-300">{row.fvgRetestStatus}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">{row.entry ?? '—'}</td>
                    <td className="py-2.5 px-3 text-right text-rose-400">{row.sl ?? '—'}</td>
                    <td className="py-2.5 px-3 text-right text-purple-400 font-bold">{row.target3R ?? '—'}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.alignment === 'A+ ALIGNED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : row.alignment === 'CISD READY'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {row.alignment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 1H Structure + 15M OB/FVG Candidate Zones */}
          {intradayStruct && (
            <div className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-extrabold text-white text-sm">
                  1H Structure &amp; 15M OB/FVG Candidate Zones — {intradayStruct.name}
                </span>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400">
                    Daily Bias: {intradayStruct.dailyBias}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300">
                    1H Bias: {intradayStruct.hourlyBias} {intradayStruct.hourlyChoch ? '(CHoCH Confirmed)' : ''}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">
                    20D S/R: {intradayStruct.support20} / {intradayStruct.resistance20}
                  </span>
                </div>
              </div>

              {intradayStruct.zones.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {intradayStruct.zones.slice(0, 6).map((z, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-black/30 border border-white/10">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-cyan-400">{z.type}</span>
                        <span className="text-[10px] text-emerald-400">{z.status}</span>
                      </div>
                      <div className="text-white font-bold mt-1">
                        Zone: {z.low.toLocaleString('en-IN')} – {z.high.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Formed: {z.formed} · Retest: {z.retest}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-[11px]">No unmitigated 15M OB/FVG candidates in latest session bars.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: MULTI-SYMBOL 1H/15M SCREENER (multi_symbol_scanner.py)         */}
      {/* ===================================================================== */}
      {activeTab === 'multi-screener' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-[11px]">
              Multi-symbol scan combining Daily 20-Session Breakout, 1H CHoCH Structure, and 15M OB/FVG Candidate Zones.
            </p>
            <button
              onClick={runMultiScreener}
              disabled={screenerLoading}
              className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-extrabold text-xs flex items-center gap-1.5"
            >
              <RefreshCw size={12} className={screenerLoading ? 'animate-spin' : ''} />
              <span>{screenerLoading ? 'Scanning 15 Symbols...' : 'Rescan Universe'}</span>
            </button>
          </div>

          {screenerError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">{screenerError}</div>
          )}

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.04] text-[10px] text-slate-400 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3 text-right">Daily Close</th>
                  <th className="py-2.5 px-3">Daily Bias</th>
                  <th className="py-2.5 px-3">20D Breakout</th>
                  <th className="py-2.5 px-3">1H Bias &amp; CHoCH</th>
                  <th className="py-2.5 px-3 text-right">15M LTP</th>
                  <th className="py-2.5 px-3">Active OB/FVG Zone</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {screenerRows.map((r) => (
                  <tr key={r.symbol} className="hover:bg-white/[0.03]">
                    <td className="py-2.5 px-3 font-bold text-white">{r.name}</td>
                    <td className="py-2.5 px-3 text-right text-slate-200">{r.dailyClose.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3">
                      <span className={r.dailyBias === 'Bullish' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {r.dailyBias}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={r.dailyBreakout ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                        {r.dailyBreakout ? 'BREAKOUT' : 'Inside Range'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={r.hourlyBias === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}>
                        {r.hourlyBias}
                      </span>{' '}
                      {r.hourlyChoch && (
                        <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                          CHoCH
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200">{r.fifteenMinClose.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-[11px] text-cyan-300">
                      {r.latestZoneLabel} ({r.activeZonesCount})
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setActiveTab('mtf-cisd');
                          runMtfInspection(r.symbol, r.name);
                        }}
                        className="px-2.5 py-1 rounded bg-cyan-500/15 text-cyan-400 font-bold text-[10px]"
                      >
                        MTF Scan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: HISTORICAL CRT BACKTEST & 12-ALGO RESEARCH                     */}
      {/* ===================================================================== */}
      {activeTab === 'backtest-research' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex flex-wrap items-end justify-between gap-3 bg-black/5 dark:bg-white/[0.02] p-3.5 rounded-xl border border-black/5 dark:border-white/10">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Engine Mode</label>
                <div className="flex bg-black/30 p-0.5 rounded-lg border border-white/10">
                  <button
                    onClick={() => setResearchMode('CRT_BACKTEST')}
                    className={`px-3 py-1.5 rounded text-[11px] font-bold ${
                      researchMode === 'CRT_BACKTEST' ? 'bg-cyan-500 text-black' : 'text-slate-400'
                    }`}
                  >
                    CRT Backtest
                  </button>
                  <button
                    onClick={() => setResearchMode('ALGO_RESEARCH')}
                    className={`px-3 py-1.5 rounded text-[11px] font-bold ${
                      researchMode === 'ALGO_RESEARCH' ? 'bg-emerald-500 text-black' : 'text-slate-400'
                    }`}
                  >
                    12-Algo Research
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Symbol</label>
                <select
                  value={btSymbol}
                  onChange={(e) => setBtSymbol(e.target.value)}
                  className="bg-[#070c1d] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="^NSEI">NIFTY 50 (^NSEI)</option>
                  <option value="^NSEBANK">BANK NIFTY (^NSEBANK)</option>
                  <option value="^BSESN">SENSEX (^BSESN)</option>
                  <option value="GC=F">GOLD (GC=F)</option>
                  <option value="RELIANCE.NS">RELIANCE.NS</option>
                  <option value="HDFCBANK.NS">HDFCBANK.NS</option>
                  <option value="TCS.NS">TCS.NS</option>
                  <option value="ICICIBANK.NS">ICICIBANK.NS</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Period</label>
                <select
                  value={btRange}
                  onChange={(e) => setBtRange(e.target.value as '1y' | '2y' | '3y' | '5y')}
                  className="bg-[#070c1d] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="1y">1 Year</option>
                  <option value="2y">2 Years</option>
                  <option value="3y">3 Years</option>
                  <option value="5y">5 Years</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Charges / Slippage (bps)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={btChargesBps}
                    onChange={(e) => setBtChargesBps(Number(e.target.value) || 0)}
                    className="w-16 bg-[#070c1d] border border-white/15 rounded-lg px-2 py-2 text-xs text-white"
                  />
                  <input
                    type="number"
                    value={btSlippageBps}
                    onChange={(e) => setBtSlippageBps(Number(e.target.value) || 0)}
                    className="w-16 bg-[#070c1d] border border-white/15 rounded-lg px-2 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={runBacktestOrResearch}
              disabled={btLoading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-xs flex items-center gap-1.5"
            >
              <Play size={12} fill="currentColor" />
              <span>{btLoading ? 'SIMULATING...' : researchMode === 'CRT_BACKTEST' ? 'RUN CRT BACKTEST' : 'RUN 12-ALGO BENCHMARK'}</span>
            </button>
          </div>

          {researchMode === 'ALGO_RESEARCH' && (
            <div className="flex flex-wrap gap-1.5">
              {ALGO_RESEARCH_NAMES.map((name) => {
                const active = selectedAlgos.includes(name);
                return (
                  <button
                    key={name}
                    onClick={() =>
                      setSelectedAlgos((prev) =>
                        prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name].slice(0, 6)
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-black/20 border-white/10 text-slate-400'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}

          {btError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">{btError}</div>
          )}

          {researchMode === 'CRT_BACKTEST' && crtBtReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                {[
                  { label: 'Total Trades', val: crtBtReport.totalTrades, cls: 'text-white' },
                  { label: 'Wins / Losses', val: `${crtBtReport.wins}W / ${crtBtReport.losses}L`, cls: 'text-emerald-400' },
                  { label: 'Win Rate', val: `${crtBtReport.winRatePct}%`, cls: 'text-cyan-400' },
                  { label: 'Profit Factor', val: crtBtReport.profitFactor, cls: 'text-amber-400' },
                  { label: 'Net Return', val: `${crtBtReport.totalReturnPct >= 0 ? '+' : ''}${crtBtReport.totalReturnPct}%`, cls: crtBtReport.totalReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400' },
                  { label: 'Max Drawdown', val: `${crtBtReport.maxDrawdownPct}%`, cls: 'text-rose-400' },
                ].map((m) => (
                  <div key={m.label} className="p-3 rounded-xl bg-black/20 border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase">{m.label}</div>
                    <div className={`text-base font-black mt-0.5 ${m.cls}`}>{m.val}</div>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/[0.04] text-[10px] text-slate-400 uppercase">
                    <tr>
                      <th className="py-2 px-3">Month</th>
                      <th className="py-2 px-3">Direction</th>
                      <th className="py-2 px-3">Zone</th>
                      <th className="py-2 px-3">Entry Date</th>
                      <th className="py-2 px-3">Exit Date</th>
                      <th className="py-2 px-3 text-right">Entry</th>
                      <th className="py-2 px-3 text-right">Exit</th>
                      <th className="py-2 px-3">Outcome</th>
                      <th className="py-2 px-3 text-right">Net %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {crtBtReport.trades.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-6 text-center text-slate-400">
                          No historical Monthly-Daily CRT trades triggered in this window. Try 5 Years or another symbol.
                        </td>
                      </tr>
                    ) : (
                      crtBtReport.trades.map((t, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.03]">
                          <td className="py-2 px-3 text-slate-300">{t.m3Month}</td>
                          <td className="py-2 px-3 font-bold text-cyan-400">{t.direction}</td>
                          <td className="py-2 px-3 text-slate-300">{t.zoneType}</td>
                          <td className="py-2 px-3 text-slate-400">{t.entryDate}</td>
                          <td className="py-2 px-3 text-slate-400">{t.exitDate}</td>
                          <td className="py-2 px-3 text-right text-white">{t.entryPrice}</td>
                          <td className="py-2 px-3 text-right text-slate-200">{t.exitPrice}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                t.outcome === 'WIN'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : t.outcome === 'LOSS'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {t.outcome}
                            </span>
                          </td>
                          <td className={`py-2 px-3 text-right font-bold ${t.netReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {t.netReturnPct >= 0 ? '+' : ''}{t.netReturnPct}%
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {researchMode === 'ALGO_RESEARCH' && algoSummaries.length > 0 && (
            <div className="space-y-4">
              {algoChartData.length > 0 && (
                <div className="h-[260px] w-full p-3 rounded-xl bg-black/20 border border-white/10">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={algoChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} minTickGap={30} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#070c1d',
                          borderColor: 'rgba(255,255,255,0.12)',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Line type="monotone" dataKey="Benchmark" stroke="#94a3b8" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
                      {algoSummaries.map((s, idx) => (
                        <Line
                          key={s.algo}
                          type="monotone"
                          dataKey={s.algo}
                          stroke={ALGO_LINE_COLORS[idx % ALGO_LINE_COLORS.length]}
                          dot={false}
                          strokeWidth={2}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/[0.04] text-[10px] text-slate-400 uppercase">
                    <tr>
                      <th className="py-2 px-3">Algorithm</th>
                      <th className="py-2 px-3 text-right">Total Return %</th>
                      <th className="py-2 px-3 text-right">CAGR %</th>
                      <th className="py-2 px-3 text-right">Max DD %</th>
                      <th className="py-2 px-3 text-right">Win Rate %</th>
                      <th className="py-2 px-3 text-right">Profit Factor</th>
                      <th className="py-2 px-3 text-right">Trades</th>
                      <th className="py-2 px-3 text-right">Buy &amp; Hold %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[...algoSummaries]
                      .sort((a, b) => b.totalReturnPct - a.totalReturnPct)
                      .map((s) => (
                        <tr key={s.algo} className="hover:bg-white/[0.03]">
                          <td className="py-2 px-3 font-bold text-white">{s.algo}</td>
                          <td className={`py-2 px-3 text-right font-bold ${s.totalReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {s.totalReturnPct >= 0 ? '+' : ''}{s.totalReturnPct}%
                          </td>
                          <td className="py-2 px-3 text-right text-cyan-400">{s.cagrPct}%</td>
                          <td className="py-2 px-3 text-right text-rose-400">{s.maxDrawdownPct}%</td>
                          <td className="py-2 px-3 text-right text-slate-200">{s.winRatePct}%</td>
                          <td className="py-2 px-3 text-right text-amber-400">{s.profitFactor}</td>
                          <td className="py-2 px-3 text-right text-slate-300">{s.trades}</td>
                          <td className="py-2 px-3 text-right text-slate-400">{s.benchmarkReturnPct}%</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
