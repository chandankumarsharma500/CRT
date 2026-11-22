import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Layers,
  Crosshair,
  ExternalLink,
  Copy,
  Check,
  Upload,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  NSE_UNIVERSE,
  BSE_UNIVERSE,
  INDIA_CRT_CORE_UNIVERSE,
  UniverseItem,
  MonthlyDailyCRTResult,
  MTFCisdRow,
  IntradayStructureResult,
  Scanner5DailyResult,
  Scanner5IntradayORBResult,
  DerivativesRow,
  RiskAuditInput,
  fetchScannerCandles,
  analyzeMonthlyDailyCRT,
  analyzeMTFCisdConfluence,
  analyzeIntradayStructure,
  analyzeScanner5Daily,
  analyzeScanner5IntradayORB,
  computeSectorStrength,
  auditTradeRisk,
  parseDerivativesCsv,
} from '../services/scanner5Service';
import { ClaudeService } from '../services/claudeService';

type ScannerTab = 'crt-cisd' | 'equity-5' | 'intraday-orb' | 'sectors-fo' | 'risk-guard';

const SETUP_LABELS: Record<string, string> = {
  breakout_20d: '20D Breakout',
  bull_flag: 'Bull Flag',
  reclaim_ma20: 'MA20 Reclaim',
  oversold: 'RSI < 30',
  oversold_bounce: 'Oversold Bounce',
};

export const Scanner5Hub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ScannerTab>('crt-cisd');

  // --- CRT & CISD State ---
  const [crtResults, setCrtResults] = useState<MonthlyDailyCRTResult[]>([]);
  const [crtLoading, setCrtLoading] = useState(false);
  const [crtError, setCrtError] = useState<string | null>(null);
  const [crtFilter, setCrtFilter] = useState<'ALL' | 'ACTIONABLE' | 'BULLISH' | 'BEARISH'>('ALL');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('^NSEI');
  const [mtfRows, setMtfRows] = useState<MTFCisdRow[]>([]);
  const [intradayStruct, setIntradayStruct] = useState<IntradayStructureResult | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [copiedSetup, setCopiedSetup] = useState(false);

  // --- Scanner 5.0 NSE/BSE Daily State ---
  const [exchange, setExchange] = useState<'NSE' | 'BSE'>('NSE');
  const [customTickersInput, setCustomTickersInput] = useState('');
  const [dailyResults, setDailyResults] = useState<Scanner5DailyResult[]>([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [equitySearch, setEquitySearch] = useState('');
  const [setupFilter, setSetupFilter] = useState<string>('ALL');
  const [conservativeOnly, setConservativeOnly] = useState(false);

  // --- Intraday 15m ORB State ---
  const [orbResults, setOrbResults] = useState<Scanner5IntradayORBResult[]>([]);
  const [orbLoading, setOrbLoading] = useState(false);
  const [orbError, setOrbError] = useState<string | null>(null);
  const [volumeMultiple, setVolumeMultiple] = useState<number>(1.5);
  const [orbFilterConfirmed, setOrbFilterConfirmed] = useState(false);

  // --- Derivatives F&O CSV State ---
  const [foCsvText, setFoCsvText] = useState('');
  const [foRows, setFoRows] = useState<DerivativesRow[]>([]);
  const [foErrors, setFoErrors] = useState<string[]>([]);

  // --- Risk Guard State ---
  const [riskInput, setRiskInput] = useState<RiskAuditInput>({
    capital: 500000,
    cashAvailable: 350000,
    cashBufferPct: 15,
    maxPositionPct: 25,
    maxLossPerTrade: 7500,
    maxDailyLoss: 20000,
    dailyLossUsed: 0,
    tradesToday: 1,
    maxTradesPerDay: 5,
    minRewardRisk: 2.0,
    requireStop: true,
    allowShort: true,
    symbol: '^NSEI',
    side: 'BUY',
    entryPrice: 25800,
    stopLoss: 25680,
    targetPrice: 26100,
    quantity: 50,
  });

  // 1. Run Monthly-Daily CRT Scan across Core India + Gold Universe
  const runCrtUniverseScan = useCallback(async () => {
    setCrtLoading(true);
    setCrtError(null);
    try {
      const syms = INDIA_CRT_CORE_UNIVERSE.map((u) => u.symbol);
      const { candlesBySymbol, errors } = await fetchScannerCandles(syms, '1d', '6mo');
      const computed = INDIA_CRT_CORE_UNIVERSE.map((u) =>
        analyzeMonthlyDailyCRT(u.symbol, `${u.shortCode} · ${u.name}`, candlesBySymbol[u.symbol] ?? [])
      );
      setCrtResults(computed);
      if (errors.length > 0 && computed.every((c) => c.ltp === 0)) {
        setCrtError(`Yahoo Finance returned errors for ${errors.length} symbols.`);
      }
    } catch (err) {
      setCrtError(err instanceof Error ? err.message : 'Failed to run CRT universe scan.');
    } finally {
      setCrtLoading(false);
    }
  }, []);

  // 2. Inspect MTF CRT + 15M CISD + 5M FVG Retest + 1H Structure for Selected Symbol
  const inspectSymbolMTF = useCallback(async (sym: string, label?: string) => {
    setSelectedSymbol(sym);
    setDetailLoading(true);
    try {
      const [r1h, r15m, r5m, r1d, r1wk] = await Promise.all([
        fetchScannerCandles([sym], '1h', '1mo'),
        fetchScannerCandles([sym], '15m', '1mo'),
        fetchScannerCandles([sym], '5m', '5d'),
        fetchScannerCandles([sym], '1d', '1y'),
        fetchScannerCandles([sym], '1wk', '2y'),
      ]);
      const b1h = r1h.candlesBySymbol[sym] ?? [];
      const b15m = r15m.candlesBySymbol[sym] ?? [];
      const b5m = r5m.candlesBySymbol[sym] ?? [];
      const b1d = r1d.candlesBySymbol[sym] ?? [];
      const b1wk = r1wk.candlesBySymbol[sym] ?? [];

      setMtfRows(analyzeMTFCisdConfluence(b1h, b15m, b5m, b1d, b1wk));
      if (b1d.length >= 25 && b1h.length >= 15 && b15m.length >= 15) {
        setIntradayStruct(analyzeIntradayStructure(sym, label || sym, b1d, b1h, b15m));
      } else {
        setIntradayStruct(null);
      }
    } catch {
      setMtfRows([]);
      setIntradayStruct(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // 3. Run Scanner 5.0 Daily NSE / BSE Equity Scan
  const runEquityScan = useCallback(async () => {
    setDailyLoading(true);
    setDailyError(null);
    try {
      const baseList: UniverseItem[] = exchange === 'NSE' ? NSE_UNIVERSE : BSE_UNIVERSE;
      const extraTokens = customTickersInput
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, 5)
        .map((raw): UniverseItem => {
          const hasSuffix = raw.includes('.') || raw.startsWith('^') || raw.includes('=');
          const sym = hasSuffix ? raw : exchange === 'NSE' ? `${raw}.NS` : `${raw}.BO`;
          return {
            symbol: sym,
            shortCode: raw.replace(/\.(NS|BO)$/, ''),
            name: `${raw} Custom`,
            sector: 'Custom',
            exchange,
          };
        });

      const merged = [...baseList];
      for (const ex of extraTokens) {
        if (!merged.some((m) => m.symbol === ex.symbol)) merged.push(ex);
      }

      const { candlesBySymbol, errors } = await fetchScannerCandles(
        merged.map((m) => m.symbol),
        '1d',
        '3mo'
      );
      const out = merged.map((item) => analyzeScanner5Daily(item, candlesBySymbol[item.symbol] ?? []));
      setDailyResults(out);
      if (errors.length > 0 && out.every((o) => o.status === 'insufficient_data')) {
        setDailyError(`Data unavailable for ${errors.length} symbols.`);
      }
    } catch (err) {
      setDailyError(err instanceof Error ? err.message : 'Failed to run NSE/BSE Scanner 5.0.');
    } finally {
      setDailyLoading(false);
    }
  }, [exchange, customTickersInput]);

  // 4. Run Scanner 5.0 Intraday 15m ORB + 5m Volume Surge
  const runIntradayOrbScan = useCallback(async () => {
    setOrbLoading(true);
    setOrbError(null);
    try {
      const list = exchange === 'NSE' ? NSE_UNIVERSE.slice(0, 24) : BSE_UNIVERSE;
      const { candlesBySymbol } = await fetchScannerCandles(
        list.map((u) => u.symbol),
        '5m',
        '5d'
      );
      const out = list.map((item) =>
        analyzeScanner5IntradayORB(item, candlesBySymbol[item.symbol] ?? [], volumeMultiple)
      );
      setOrbResults(out);
    } catch (err) {
      setOrbError(err instanceof Error ? err.message : 'Failed to run Intraday ORB scan.');
    } finally {
      setOrbLoading(false);
    }
  }, [exchange, volumeMultiple]);

  // Initial load for primary CRT tab
  useEffect(() => {
    runCrtUniverseScan();
    inspectSymbolMTF('^NSEI', 'NIFTY 50 Index');
  }, [runCrtUniverseScan, inspectSymbolMTF]);

  // Auto-load Equity / Sector scan when switching to equity-5 or sectors-fo if empty
  useEffect(() => {
    if ((activeTab === 'equity-5' || activeTab === 'sectors-fo') && dailyResults.length === 0 && !dailyLoading) {
      runEquityScan();
    }
    if (activeTab === 'intraday-orb' && orbResults.length === 0 && !orbLoading) {
      runIntradayOrbScan();
    }
  }, [activeTab, dailyResults.length, dailyLoading, orbResults.length, orbLoading, runEquityScan, runIntradayOrbScan]);

  // Re-evaluate ORB volume threshold locally when user adjusts threshold
  const orbComputedRows = useMemo(() => {
    return orbResults.map((row) => ({
      ...row,
      volumeConfirmed: row.volumeMultiple !== null && row.volumeMultiple >= volumeMultiple,
      paperWatch:
        row.orbDirection === 'BULLISH_ORB' &&
        row.volumeMultiple !== null &&
        row.volumeMultiple >= volumeMultiple,
    }));
  }, [orbResults, volumeMultiple]);

  const filteredCrtResults = useMemo(() => {
    return crtResults.filter((r) => {
      if (crtFilter === 'BULLISH') return r.bias === 'Bullish';
      if (crtFilter === 'BEARISH') return r.bias === 'Bearish';
      if (crtFilter === 'ACTIONABLE') return [1, 2, 3, 9].includes(r.stage);
      return true;
    });
  }, [crtResults, crtFilter]);

  const filteredDailyResults = useMemo(() => {
    return dailyResults.filter((r) => {
      if (conservativeOnly && !r.conservativeWatch) return false;
      if (setupFilter !== 'ALL' && !r.setups.includes(setupFilter)) return false;
      if (equitySearch.trim()) {
        const q = equitySearch.trim().toLowerCase();
        if (
          !r.shortCode.toLowerCase().includes(q) &&
          !r.name.toLowerCase().includes(q) &&
          !r.sector.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [dailyResults, conservativeOnly, setupFilter, equitySearch]);

  const filteredOrbRows = useMemo(() => {
    const base = orbFilterConfirmed ? orbComputedRows.filter((r) => r.paperWatch) : orbComputedRows;
    return [...base].sort((a, b) => Number(b.paperWatch) - Number(a.paperWatch) || (b.volumeMultiple ?? 0) - (a.volumeMultiple ?? 0));
  }, [orbComputedRows, orbFilterConfirmed]);

  const sectorRows = useMemo(() => computeSectorStrength(dailyResults), [dailyResults]);
  const riskResult = useMemo(() => auditTradeRisk(riskInput), [riskInput]);

  const selectedCrtRow = useMemo(
    () => crtResults.find((r) => r.symbol === selectedSymbol) ?? null,
    [crtResults, selectedSymbol]
  );

  const handleSendToRiskGuard = (symbol: string, side: 'BUY' | 'SELL', entry: number, sl: number, target: number) => {
    setRiskInput((prev) => ({
      ...prev,
      symbol,
      side,
      entryPrice: Number(entry.toFixed(2)),
      stopLoss: Number(sl.toFixed(2)),
      targetPrice: Number(target.toFixed(2)),
    }));
    setActiveTab('risk-guard');
  };

  const handleCopySetupForAI = () => {
    const summaryLines = [
      `INDIA CRT + SCANNER 5.0 LIVE BRIEF (${selectedSymbol})`,
      selectedCrtRow
        ? `Monthly-Daily CRT: ${selectedCrtRow.setup} · Bias: ${selectedCrtRow.bias} · LTP: ${selectedCrtRow.ltp} · M1 Range: [${selectedCrtRow.m1Low}, ${selectedCrtRow.m1High}] · Entry: ${selectedCrtRow.entry ?? 'Pending'} · SL: ${selectedCrtRow.sl ?? 'Pending'} · Target: ${selectedCrtRow.target ?? 'Pending'}`
        : '',
      'MTF CISD Matrix:',
      ...mtfRows.map(
        (m) => `- ${m.timeframe}: ${m.crtSweep} | 15M CISD: ${m.cisdStatus} | 5M FVG: ${m.fvgRetestStatus} | Status: ${m.alignment}`
      ),
      intradayStruct
        ? `1H Structure: Bias ${intradayStruct.hourlyBias} · 20D Support ${intradayStruct.support20} / Res ${intradayStruct.resistance20} · CHoCH: ${intradayStruct.hourlyChoch ? 'YES' : 'NO'}`
        : '',
      'Analyze this multi-timeframe CRT + CISD + Scanner 5.0 setup and state exact trade validation, invalidation level, and risk sizing.',
    ]
      .filter(Boolean)
      .join('\n');

    ClaudeService.copyContextToClipboard(summaryLines);
    setCopiedSetup(true);
    setTimeout(() => setCopiedSetup(false), 3000);
  };

  const handleFoCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setFoCsvText(text);
      const parsed = parseDerivativesCsv(text);
      setFoRows(parsed.rows);
      setFoErrors(parsed.errors);
    };
    reader.readAsText(file);
  };

  const handleAnalyzeFoText = () => {
    const parsed = parseDerivativesCsv(foCsvText);
    setFoRows(parsed.rows);
    setFoErrors(parsed.errors);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header & Tab Bar */}
      <div className="hud-panel border border-black/10 dark:border-white/10 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>India CRT Setup Scanner</span>
            <span aria-hidden="true">·</span>
            <span>Scanner 5.0 (NSE &amp; BSE)</span>
            <span aria-hidden="true">·</span>
            <span>Live Yahoo Finance OHLCV</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            India CRT, CISD &amp; Scanner 5.0 Terminal
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-black/5 dark:bg-white/[0.04] border border-black/10 dark:border-white/10">
          {(
            [
              { id: 'crt-cisd', label: 'CRT + CISD (MTF)' },
              { id: 'equity-5', label: 'NSE / BSE Scanner 5.0' },
              { id: 'intraday-orb', label: '15m ORB + Volume' },
              { id: 'sectors-fo', label: 'Sectors & F&O' },
              { id: 'risk-guard', label: 'Risk Guard' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-mono font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: INDIA CRT + CISD & MTF ALIGNMENT (india-crt-setup-scanner)   */}
      {/* =================================================================== */}
      {activeTab === 'crt-cisd' && (
        <div className="space-y-6">
          {/* Controls Toolbar */}
          <div className="hud-panel border border-black/10 dark:border-white/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['ALL', 'ACTIONABLE', 'BULLISH', 'BEARISH'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setCrtFilter(f)}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    crtFilter === f
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950'
                      : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  {f === 'ALL'
                    ? `All Instruments (${crtResults.length})`
                    : f === 'ACTIONABLE'
                      ? 'Active / Waiting Entry'
                      : f === 'BULLISH'
                        ? 'Bullish Sweeps'
                        : 'Bearish Sweeps'}
                </button>
              ))}
            </div>

            <button
              onClick={runCrtUniverseScan}
              disabled={crtLoading}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 text-xs font-mono font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors"
            >
              <RefreshCw size={14} className={crtLoading ? 'animate-spin' : ''} />
              <span>{crtLoading ? 'Scanning Yahoo OHLCV...' : 'Rescan CRT Universe'}</span>
            </button>
          </div>

          {crtError && (
            <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs font-mono">
              {crtError}
            </div>
          )}

          {/* Split Workspace: Universe Table (Left) + Selected Symbol MTF/CISD Inspector (Right) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-7 hud-panel border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Monthly–Daily CRT Scanner (Indices, Gold Futures &amp; NSE Leaders)
                </h2>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  Click a row to run 1H/4H/1D/1W CISD
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400 bg-black/[0.02] dark:bg-white/[0.02]">
                      <th className="py-2.5 px-3 font-semibold">Instrument</th>
                      <th className="py-2.5 px-3 font-semibold text-right">LTP</th>
                      <th className="py-2.5 px-3 font-semibold">Bias</th>
                      <th className="py-2.5 px-3 font-semibold">CRT Setup</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Entry / Zone</th>
                      <th className="py-2.5 px-3 font-semibold text-right">SL</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {crtLoading && crtResults.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          Fetching 6-month daily candles from Yahoo Finance...
                        </td>
                      </tr>
                    ) : filteredCrtResults.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No instruments match this CRT filter.{' '}
                          <button onClick={() => setCrtFilter('ALL')} className="text-cyan-400 underline ml-1">
                            Show all
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredCrtResults.map((row) => {
                        const isSelected = row.symbol === selectedSymbol;
                        return (
                          <tr
                            key={row.symbol}
                            onClick={() => inspectSymbolMTF(row.symbol, row.name)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-cyan-500/10 dark:bg-cyan-500/15'
                                : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900 dark:text-white">{row.name.split(' · ')[0]}</div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">{row.symbol}</div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">
                              {row.ltp > 0 ? row.ltp.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '—'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={
                                  row.bias === 'Bullish'
                                    ? 'text-emerald-500 font-bold'
                                    : row.bias === 'Bearish'
                                      ? 'text-rose-500 font-bold'
                                      : 'text-slate-400'
                                }
                              >
                                {row.bias}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200">{row.setup}</td>
                            <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-200">
                              {row.entry !== null
                                ? `${row.entry.toLocaleString('en-IN')} (${row.entryZoneType})`
                                : row.availableZones.join('/') || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right text-rose-400">
                              {row.sl !== null ? row.sl.toLocaleString('en-IN') : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right text-emerald-400">
                              {row.target !== null ? row.target.toLocaleString('en-IN') : '—'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Panel: Selected Symbol MTF -> 15M CISD -> 5M FVG Inspector */}
            <div className="xl:col-span-5 hud-panel border border-black/10 dark:border-white/10 rounded-xl p-5 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-4">
                <div>
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Sequential MTF CISD &amp; Structure Drilldown
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedCrtRow?.name ?? selectedSymbol}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySetupForAI}
                    className="px-3 py-1.5 rounded border border-black/15 dark:border-white/15 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    {copiedSetup ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedSetup ? 'Copied' : 'Copy Brief'}</span>
                  </button>
                  <a
                    href={ClaudeService.CHATGPT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleCopySetupForAI}
                    className="px-3 py-1.5 rounded bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/25 text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <span>ChatGPT</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {selectedCrtRow && (
                <div className="space-y-3 text-xs font-mono">
                  <div className="grid grid-cols-3 gap-3 py-2 border-b border-black/5 dark:border-white/5 tabular-nums">
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">M1 Range ({selectedCrtRow.m1Month})</div>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {selectedCrtRow.m1Low.toLocaleString('en-IN')} – {selectedCrtRow.m1High.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">M2 Close ({selectedCrtRow.m2Month})</div>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {selectedCrtRow.m2Close.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Daily CHoCH</div>
                      <div className="font-bold text-cyan-400 mt-0.5">
                        {selectedCrtRow.chochLevel !== null ? selectedCrtRow.chochLevel.toLocaleString('en-IN') : 'Pending'}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedCrtRow.setupReason}</p>
                  {selectedCrtRow.entry !== null && selectedCrtRow.sl !== null && (
                    <button
                      onClick={() =>
                        handleSendToRiskGuard(
                          selectedCrtRow.symbol,
                          selectedCrtRow.bias === 'Bearish' ? 'SELL' : 'BUY',
                          selectedCrtRow.entry!,
                          selectedCrtRow.sl!,
                          selectedCrtRow.target ?? selectedCrtRow.t1 ?? selectedCrtRow.entry! * 1.02
                        )
                      }
                      className="px-3 py-1.5 rounded bg-cyan-500/15 border border-cyan-500/35 text-cyan-400 hover:bg-cyan-500/25 font-bold flex items-center gap-1.5"
                    >
                      <ShieldCheck size={14} />
                      <span>Send Entry / SL / Target to Risk Guard</span>
                    </button>
                  )}
                </div>
              )}

              {/* MTF CRT -> 15M CISD -> 5M FVG Table */}
              <div>
                <div className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  HTF CRT Sweep → 15m CISD → 5m FVG Retest
                </div>
                {detailLoading ? (
                  <div className="py-6 text-center text-xs font-mono text-slate-400">
                    Loading 1H / 15m / 5m / Daily / Weekly OHLCV...
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-black/10 dark:border-white/10 rounded-lg">
                    <table className="w-full text-left text-xs font-mono tabular-nums">
                      <thead>
                        <tr className="border-b border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400 bg-black/[0.02] dark:bg-white/[0.02]">
                          <th className="py-2 px-2.5">TF</th>
                          <th className="py-2 px-2.5">CRT Sweep</th>
                          <th className="py-2 px-2.5">15m CISD</th>
                          <th className="py-2 px-2.5">5m FVG</th>
                          <th className="py-2 px-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {mtfRows.map((m) => (
                          <tr key={m.timeframe}>
                            <td className="py-2 px-2.5 font-bold text-slate-900 dark:text-white">{m.timeframe}</td>
                            <td
                              className={`py-2 px-2.5 ${
                                m.crtDirection === 'BULLISH'
                                  ? 'text-emerald-400'
                                  : m.crtDirection === 'BEARISH'
                                    ? 'text-rose-400'
                                    : 'text-slate-500'
                              }`}
                            >
                              {m.crtSweep}
                            </td>
                            <td className="py-2 px-2.5 text-slate-700 dark:text-slate-300">
                              {m.cisdStatus}
                              {m.cisdLine !== null ? ` (${m.cisdLine})` : ''}
                            </td>
                            <td className="py-2 px-2.5 text-slate-700 dark:text-slate-300">
                              {m.entry !== null ? `Entry ${m.entry}` : m.fvgRetestStatus}
                            </td>
                            <td className="py-2 px-2.5 text-right font-bold text-cyan-400">{m.alignment}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Intraday Structure 1H CHoCH + FVG/OB Zones */}
              {intradayStruct && !detailLoading && (
                <div className="pt-2 border-t border-black/10 dark:border-white/10 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">1H Structure &amp; Active Zones</span>
                    <span className="text-slate-700 dark:text-slate-200 tabular-nums">
                      Daily: {intradayStruct.dailyBias} · 1H CHoCH: {intradayStruct.hourlyChoch ? 'YES' : 'NO'}
                    </span>
                  </div>
                  {intradayStruct.zones.length === 0 ? (
                    <div className="text-slate-500">No active recent FVG/OB zones detected on 1H.</div>
                  ) : (
                    <div className="space-y-1.5">
                      {intradayStruct.zones.slice(0, 4).map((z, idx) => (
                        <div
                          key={`${z.type}-${z.formed}-${idx}`}
                          className="flex items-center justify-between py-1.5 px-2.5 rounded bg-black/[0.03] dark:bg-white/[0.03] tabular-nums"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {z.type} · {z.low} – {z.high}
                          </span>
                          <span
                            className={
                              z.status === 'RETEST CANDIDATE' ? 'text-emerald-400 font-bold' : 'text-slate-400'
                            }
                          >
                            {z.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: SCANNER 5.0 NSE / BSE EQUITY SCANNER (india.py & bse.py)     */}
      {/* =================================================================== */}
      {activeTab === 'equity-5' && (
        <div className="space-y-6">
          <div className="hud-panel border border-black/10 dark:border-white/10 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center p-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                {(['NSE', 'BSE'] as const).map((ex) => (
                  <button
                    key={ex}
                    onClick={() => {
                      setExchange(ex);
                      setDailyResults([]);
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
                      exchange === ex
                        ? 'bg-cyan-500 text-slate-950'
                        : 'text-slate-600 dark:text-slate-300 hover:text-white'
                    }`}
                  >
                    {ex === 'NSE' ? 'NSE (.NS 30 Stocks)' : 'BSE (.BO 20 Scrips)'}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={equitySearch}
                  onChange={(e) => setEquitySearch(e.target.value)}
                  placeholder="Filter symbol or sector..."
                  className="pl-8 pr-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400 w-48"
                />
              </div>

              <select
                value={setupFilter}
                onChange={(e) => setSetupFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-black/5 dark:bg-[#0b1224] border border-black/10 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="ALL">All Setups</option>
                <option value="breakout_20d">20D Breakout</option>
                <option value="bull_flag">Bull Flag</option>
                <option value="reclaim_ma20">MA20 Reclaim</option>
                <option value="oversold">RSI Oversold (&lt;30)</option>
                <option value="oversold_bounce">Oversold Bounce</option>
              </select>

              <label className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={conservativeOnly}
                  onChange={(e) => setConservativeOnly(e.target.checked)}
                  className="rounded border-slate-500 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Conservative Watch (Ext ≤ 5%)</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customTickersInput}
                onChange={(e) => setCustomTickersInput(e.target.value)}
                placeholder="Add tickers (e.g. ZOMATO, TRENT)"
                className="px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400 w-52"
              />
              <button
                onClick={runEquityScan}
                disabled={dailyLoading}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 text-xs font-mono font-bold flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <RefreshCw size={14} className={dailyLoading ? 'animate-spin' : ''} />
                <span>{dailyLoading ? 'Scanning...' : `Scan ${exchange}`}</span>
              </button>
            </div>
          </div>

          {dailyError && (
            <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs font-mono">
              {dailyError}
            </div>
          )}

          <div className="hud-panel border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400 bg-black/[0.02] dark:bg-white/[0.02]">
                    <th className="py-2.5 px-3">Symbol</th>
                    <th className="py-2.5 px-3">Sector</th>
                    <th className="py-2.5 px-3 text-right">Close</th>
                    <th className="py-2.5 px-3 text-right">Day %</th>
                    <th className="py-2.5 px-3 text-right">MA20</th>
                    <th className="py-2.5 px-3 text-right">Ext %</th>
                    <th className="py-2.5 px-3 text-right">RSI(14)</th>
                    <th className="py-2.5 px-3 text-right">ATR(14)</th>
                    <th className="py-2.5 px-3 text-right">Vol Ratio</th>
                    <th className="py-2.5 px-3">Matched Setups</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {dailyLoading && dailyResults.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-10 text-center text-slate-400">
                        Running Scanner 5.0 technical analysis across {exchange} universe...
                      </td>
                    </tr>
                  ) : filteredDailyResults.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-10 text-center text-slate-400">
                        No equities match active filters.{' '}
                        <button
                          onClick={() => {
                            setSetupFilter('ALL');
                            setConservativeOnly(false);
                            setEquitySearch('');
                          }}
                          className="text-cyan-400 underline ml-1"
                        >
                          Reset filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredDailyResults.map((row) => {
                      const isUp = row.changePct >= 0;
                      const suggestedSl = row.atr14 ? row.close - row.atr14 * 1.5 : row.close * 0.98;
                      const suggestedTarget = row.atr14 ? row.close + row.atr14 * 3.0 : row.close * 1.04;
                      return (
                        <tr key={row.symbol} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03]">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 dark:text-white">{row.shortCode}</div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[160px]">{row.name}</div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{row.sector}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">
                            ₹{row.close.toLocaleString('en-IN')}
                          </td>
                          <td className={`py-2.5 px-3 text-right font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isUp ? '+' : ''}
                            {row.changePct.toFixed(2)}%
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                            {row.ma20 !== null ? row.ma20.toLocaleString('en-IN') : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                            {row.extensionFromMa20Pct !== null ? `${row.extensionFromMa20Pct}%` : '—'}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-semibold ${
                              (row.rsi14 ?? 50) < 30
                                ? 'text-emerald-400'
                                : (row.rsi14 ?? 50) > 70
                                  ? 'text-amber-400'
                                  : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {row.rsi14 !== null ? row.rsi14.toFixed(1) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-500">
                            {row.atr14 !== null ? row.atr14.toFixed(1) : '—'}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right ${
                              (row.volumeRatio ?? 0) >= 1.5 ? 'text-cyan-400 font-bold' : 'text-slate-500'
                            }`}
                          >
                            {row.volumeRatio !== null ? `${row.volumeRatio}x` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200">
                            {row.setups.length > 0
                              ? row.setups.map((s) => SETUP_LABELS[s] || s).join(' · ')
                              : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() =>
                                handleSendToRiskGuard(row.shortCode, 'BUY', row.close, suggestedSl, suggestedTarget)
                              }
                              className="text-cyan-400 hover:text-cyan-300 font-bold whitespace-nowrap"
                            >
                              Audit Risk
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: INTRADAY 15m ORB + 5m VOLUME SURGE (Scanner 5.0 intraday.py) */}
      {/* =================================================================== */}
      {activeTab === 'intraday-orb' && (
        <div className="space-y-6">
          <div className="hud-panel border border-black/10 dark:border-white/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300">
                <SlidersHorizontal size={14} className="text-cyan-400" />
                <span>Min Volume Surge vs Prior Median:</span>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  value={volumeMultiple}
                  onChange={(e) => setVolumeMultiple(Math.max(1.0, Number(e.target.value) || 1.5))}
                  className="w-16 px-2 py-1 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white font-bold tabular-nums"
                />
                <span>x</span>
              </div>

              <label className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={orbFilterConfirmed}
                  onChange={(e) => setOrbFilterConfirmed(e.target.checked)}
                  className="rounded border-slate-500 text-cyan-500"
                />
                <span>Paper-Watch Confirmed ORB Only</span>
              </label>
            </div>

            <button
              onClick={runIntradayOrbScan}
              disabled={orbLoading}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 text-xs font-mono font-bold flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <RefreshCw size={14} className={orbLoading ? 'animate-spin' : ''} />
              <span>{orbLoading ? 'Fetching 5m Bars...' : 'Scan 15m ORB + Volume'}</span>
            </button>
          </div>

          {orbError && (
            <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs font-mono">
              {orbError}
            </div>
          )}

          <div className="hud-panel border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400 bg-black/[0.02] dark:bg-white/[0.02]">
                    <th className="py-2.5 px-3">Symbol</th>
                    <th className="py-2.5 px-3">Session</th>
                    <th className="py-2.5 px-3 text-right">15m ORB Low</th>
                    <th className="py-2.5 px-3 text-right">15m ORB High</th>
                    <th className="py-2.5 px-3 text-right">Last 5m Close</th>
                    <th className="py-2.5 px-3">ORB Signal</th>
                    <th className="py-2.5 px-3 text-right">Vol Multiple</th>
                    <th className="py-2.5 px-3">Trigger Time</th>
                    <th className="py-2.5 px-3 text-right">Paper Watch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {orbLoading && orbResults.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400">
                        Scanning 5-minute completed NSE session bars for 09:15–09:30 IST ORB...
                      </td>
                    </tr>
                  ) : filteredOrbRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400">
                        No ORB setups match the current volume filter ({volumeMultiple}x).
                      </td>
                    </tr>
                  ) : (
                    filteredOrbRows.map((row) => (
                      <tr key={row.symbol} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03]">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 dark:text-white">{row.shortCode}</div>
                          <div className="text-[11px] text-slate-500">{row.sector}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{row.sessionDate}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                          {row.rangeLow !== null ? `₹${row.rangeLow.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                          {row.rangeHigh !== null ? `₹${row.rangeHigh.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">
                          {row.lastClose !== null ? `₹${row.lastClose.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={
                              row.orbDirection === 'BULLISH_ORB'
                                ? 'text-emerald-400 font-bold'
                                : row.orbDirection === 'BEARISH_ORB'
                                  ? 'text-rose-400 font-bold'
                                  : 'text-slate-400'
                            }
                          >
                            {row.orbDirection}
                          </span>
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold ${
                            row.volumeConfirmed ? 'text-cyan-400' : 'text-slate-500'
                          }`}
                        >
                          {row.volumeMultiple !== null ? `${row.volumeMultiple}x` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{row.breakoutTime ?? '—'}</td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          {row.paperWatch ? (
                            <span className="text-emerald-400">CONFIRMED</span>
                          ) : (
                            <span className="text-slate-500">WAIT</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: SECTOR RELATIVE STRENGTH & F&O BUILDUP                       */}
      {/* =================================================================== */}
      {activeTab === 'sectors-fo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sector Relative Strength */}
          <div className="lg:col-span-6 hud-panel border border-black/10 dark:border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 size={16} className="text-cyan-400" />
                  <span>{exchange} Sector Relative Strength</span>
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  Aggregated from live Yahoo Finance daily returns across {dailyResults.length} constituents
                </p>
              </div>
              <button
                onClick={runEquityScan}
                disabled={dailyLoading}
                className="px-3 py-1.5 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
              >
                <RefreshCw size={12} className={dailyLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {sectorRows.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-slate-400">
                Loading sector performance data...
              </div>
            ) : (
              <div className="divide-y divide-black/5 dark:divide-white/5 font-mono text-xs tabular-nums">
                {sectorRows.map((sec) => {
                  const isUp = sec.averageChangePct >= 0;
                  return (
                    <div key={sec.sector} className="py-3 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{sec.sector}</span>
                          <span className="text-slate-500">· {sec.members} stocks</span>
                        </div>
                        <span className={`font-bold flex items-center gap-1 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {isUp ? '+' : ''}
                          {sec.averageChangePct.toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                        {sec.constituents.slice(0, 4).map((c) => (
                          <span key={c.symbol}>
                            {c.shortCode}{' '}
                            <span className={c.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {c.changePct >= 0 ? '+' : ''}
                              {c.changePct.toFixed(2)}%
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* F&O Bhavcopy Derivatives Classifier */}
          <div className="lg:col-span-6 hud-panel border border-black/10 dark:border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers size={16} className="text-cyan-400" />
                  <span>NSE F&amp;O Futures OI Buildup Classifier</span>
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  Upload or paste normalized NSE Bhavcopy CSV (Long/Short Buildup, Short Covering, Unwinding)
                </p>
              </div>
              <label className="px-3 py-1.5 rounded bg-cyan-500/15 border border-cyan-500/35 text-cyan-400 hover:bg-cyan-500/25 text-xs font-mono font-bold cursor-pointer flex items-center gap-1.5">
                <Upload size={13} />
                <span>Upload CSV</span>
                <input type="file" accept=".csv,text/csv" onChange={handleFoCsvUpload} className="hidden" />
              </label>
            </div>

            <textarea
              rows={4}
              value={foCsvText}
              onChange={(e) => setFoCsvText(e.target.value)}
              placeholder="Paste CSV with columns: symbol,instrument,expiry,open_interest,change_in_oi,volume,close,underlying_close,previous_underlying_close"
              className="w-full p-3 rounded-lg bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleAnalyzeFoText}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold"
              >
                Classify OI Buildup
              </button>
              {foErrors.length > 0 && <span className="text-xs font-mono text-rose-400">{foErrors[0]}</span>}
            </div>

            {foRows.length > 0 && (
              <div className="overflow-x-auto border border-black/10 dark:border-white/10 rounded-lg max-h-80">
                <table className="w-full text-left text-xs font-mono tabular-nums">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400 bg-black/[0.02] dark:bg-white/[0.02]">
                      <th className="py-2 px-3">Symbol</th>
                      <th className="py-2 px-3 text-right">Price %</th>
                      <th className="py-2 px-3 text-right">OI Chg %</th>
                      <th className="py-2 px-3 text-right">Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {foRows.slice(0, 40).map((r, idx) => (
                      <tr key={`${r.symbol}-${r.expiry}-${idx}`}>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                          {r.symbol} · {r.expiry}
                        </td>
                        <td
                          className={`py-2 px-3 text-right ${
                            (r.priceChangePct ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {r.priceChangePct !== null ? `${r.priceChangePct}%` : '—'}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          {r.oiChangePct !== null ? `${r.oiChangePct}%` : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-cyan-400">
                          {r.buildup.replace(/_/g, ' ').toUpperCase()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: TRADER-RISK PRE-TRADE AUDITOR (Scanner 5.0 trader-risk)      */}
      {/* =================================================================== */}
      {activeTab === 'risk-guard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 hud-panel border border-black/10 dark:border-white/10 rounded-xl p-5 space-y-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-3">
              <Crosshair size={16} className="text-cyan-400" />
              <span>Order &amp; Portfolio Risk Policy Parameters</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <label className="space-y-1">
                <span className="text-slate-500">Symbol</span>
                <input
                  type="text"
                  value={riskInput.symbol}
                  onChange={(e) => setRiskInput({ ...riskInput, symbol: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white font-bold"
                />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500">Side</span>
                <select
                  value={riskInput.side}
                  onChange={(e) => setRiskInput({ ...riskInput, side: e.target.value as 'BUY' | 'SELL' })}
                  className="w-full px-3 py-2 rounded bg-black/5 dark:bg-[#0b1224] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white font-bold"
                >
                  <option value="BUY">BUY (LONG)</option>
                  <option value="SELL">SELL (SHORT)</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-slate-500">Quantity (Shares / Units)</span>
                <input
                  type="number"
                  value={riskInput.quantity}
                  onChange={(e) => setRiskInput({ ...riskInput, quantity: Math.max(0, Number(e.target.value)) })}
                  className="w-full px-3 py-2 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white tabular-nums"
                />
              </label>

              <label className="space-y-1">
                <span className="text-slate-500">Entry Price (₹)</span>
                <input
                  type="number"
                  step="0.05"
                  value={riskInput.entryPrice}
                  onChange={(e) => setRiskInput({ ...riskInput, entryPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white tabular-nums"
                />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500">Stop Loss (₹)</span>
                <input
                  type="number"
                  step="0.05"
                  value={riskInput.stopLoss}
                  onChange={(e) => setRiskInput({ ...riskInput, stopLoss: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-rose-400 tabular-nums"
                />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500">Target Price (₹)</span>
                <input
                  type="number"
                  step="0.05"
                  value={riskInput.targetPrice}
                  onChange={(e) => setRiskInput({ ...riskInput, targetPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-emerald-400 tabular-nums"
                />
              </label>

              <label className="space-y-1">
                <span className="text-slate-500">Total Capital (₹)</span>
                <input
                  type="number"
                  value={riskInput.capital}
                  onChange={(e) => setRiskInput({ ...riskInput, capital: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white tabular-nums"
                />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500">Available Cash (₹)</span>
                <input
                  type="number"
                  value={riskInput.cashAvailable}
                  onChange={(e) => setRiskInput({ ...riskInput, cashAvailable: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white tabular-nums"
                />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500">Max Loss / Trade (₹)</span>
                <input
                  type="number"
                  value={riskInput.maxLossPerTrade}
                  onChange={(e) => setRiskInput({ ...riskInput, maxLossPerTrade: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white tabular-nums"
                />
              </label>

              <label className="space-y-1">
                <span className="text-slate-500">Max Position Cap (%)</span>
                <input
                  type="number"
                  value={riskInput.maxPositionPct}
                  onChange={(e) => setRiskInput({ ...riskInput, maxPositionPct: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white tabular-nums"
                />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500">Min Reward : Risk</span>
                <input
                  type="number"
                  step="0.1"
                  value={riskInput.minRewardRisk}
                  onChange={(e) => setRiskInput({ ...riskInput, minRewardRisk: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white tabular-nums"
                />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500">Cash Buffer (%)</span>
                <input
                  type="number"
                  value={riskInput.cashBufferPct}
                  onChange={(e) => setRiskInput({ ...riskInput, cashBufferPct: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white tabular-nums"
                />
              </label>
            </div>
          </div>

          {/* Live PASS / BLOCK Verdict Panel */}
          <div className="lg:col-span-5 hud-panel border border-black/10 dark:border-white/10 rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div>
                <div className="text-xs font-mono text-slate-500">Pre-Trade Risk Verdict</div>
                <div
                  className={`text-2xl font-mono font-black mt-0.5 flex items-center gap-2 ${
                    riskResult.verdict === 'PASS' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {riskResult.verdict === 'PASS' ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                  <span>{riskResult.verdict}</span>
                </div>
              </div>
              <button
                onClick={() => setRiskInput((p) => ({ ...p, quantity: riskResult.recommendedQty }))}
                className="px-3 py-1.5 rounded bg-cyan-500/15 border border-cyan-500/35 text-cyan-400 hover:bg-cyan-500/25 text-xs font-mono font-bold tabular-nums"
              >
                Use Recommended Qty ({riskResult.recommendedQty})
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono tabular-nums">
              <div>
                <div className="text-slate-500">Order Exposure</div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  ₹{riskResult.orderValue.toLocaleString('en-IN')} ({riskResult.positionPct}%)
                </div>
              </div>
              <div>
                <div className="text-slate-500">Max Stop-Loss Risk</div>
                <div className="text-base font-bold text-rose-400">
                  ₹{riskResult.maxLoss.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Reward : Risk Ratio</div>
                <div className="text-base font-bold text-emerald-400">
                  {riskResult.rewardRisk !== null ? `1 : ${riskResult.rewardRisk}` : '—'}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Post-Trade Cash</div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  ₹{riskResult.afterCash.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {riskResult.reasons.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-black/10 dark:border-white/10">
                <div className="text-xs font-mono font-bold text-rose-400">Blocking Violations</div>
                {riskResult.reasons.map((r, i) => (
                  <div key={i} className="text-xs font-mono text-rose-300 flex items-start gap-2">
                    <TrendingDown size={13} className="shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            )}

            {riskResult.warnings.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-mono font-bold text-amber-400">Advisory Warnings</div>
                {riskResult.warnings.map((w, i) => (
                  <div key={i} className="text-xs font-mono text-amber-300">
                    {w}
                  </div>
                ))}
              </div>
            )}

            {riskResult.reasons.length === 0 && (
              <div className="pt-3 border-t border-black/10 dark:border-white/10 text-xs font-mono text-emerald-400 flex items-center gap-2">
                <TrendingUp size={14} />
                <span>All capital, stop-loss, R:R, and position limits cleared.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
