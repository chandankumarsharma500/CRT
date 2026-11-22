export interface ScannerBar {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface UniverseItem {
  symbol: string;
  shortCode: string;
  name: string;
  sector: string;
  exchange: 'NSE' | 'BSE' | 'INDEX' | 'COMMODITY';
}

export const NSE_SECTORS: Record<string, string> = {
  RELIANCE: 'Energy',
  ONGC: 'Energy',
  COALINDIA: 'Energy',
  NTPC: 'Utilities',
  POWERGRID: 'Utilities',
  TCS: 'IT',
  INFY: 'IT',
  WIPRO: 'IT',
  HCLTECH: 'IT',
  TECHM: 'IT',
  HDFCBANK: 'Banks',
  ICICIBANK: 'Banks',
  SBIN: 'Banks',
  AXISBANK: 'Banks',
  KOTAKBANK: 'Banks',
  BHARTIARTL: 'Telecom',
  ITC: 'FMCG',
  HINDUNILVR: 'FMCG',
  ASIANPAINT: 'Consumer',
  TITAN: 'Consumer',
  MARUTI: 'Auto',
  TRENT: 'Consumer',
  BAJFINANCE: 'Financials',
  BAJAJFINSV: 'Financials',
  SUNPHARMA: 'Pharma',
  CIPLA: 'Pharma',
  DRREDDY: 'Pharma',
  LT: 'Industrials',
  ADANIENT: 'Industrials',
  ADANIPORTS: 'Industrials',
  ULTRACEMCO: 'Materials',
  TATASTEEL: 'Materials',
  GRASIM: 'Materials',
};

export const BSE_SECTORS: Record<string, string> = {
  RELIANCE: 'Energy',
  TCS: 'IT',
  HDFCBANK: 'Banks',
  ICICIBANK: 'Banks',
  INFY: 'IT',
  SBIN: 'Banks',
  BHARTIARTL: 'Telecom',
  ITC: 'FMCG',
  LT: 'Industrials',
  AXISBANK: 'Banks',
  KOTAKBANK: 'Banks',
  HINDUNILVR: 'FMCG',
  BAJFINANCE: 'Financials',
  MARUTI: 'Auto',
  SUNPHARMA: 'Pharma',
  TITAN: 'Consumer',
  NTPC: 'Utilities',
  POWERGRID: 'Utilities',
  ONGC: 'Energy',
  TATASTEEL: 'Materials',
};

export const NSE_UNIVERSE: UniverseItem[] = [
  { symbol: 'RELIANCE.NS', shortCode: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy', exchange: 'NSE' },
  { symbol: 'TCS.NS', shortCode: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', exchange: 'NSE' },
  { symbol: 'HDFCBANK.NS', shortCode: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banks', exchange: 'NSE' },
  { symbol: 'ICICIBANK.NS', shortCode: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banks', exchange: 'NSE' },
  { symbol: 'INFY.NS', shortCode: 'INFY', name: 'Infosys', sector: 'IT', exchange: 'NSE' },
  { symbol: 'SBIN.NS', shortCode: 'SBIN', name: 'State Bank of India', sector: 'Banks', exchange: 'NSE' },
  { symbol: 'BHARTIARTL.NS', shortCode: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom', exchange: 'NSE' },
  { symbol: 'ITC.NS', shortCode: 'ITC', name: 'ITC', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'LT.NS', shortCode: 'LT', name: 'Larsen & Toubro', sector: 'Industrials', exchange: 'NSE' },
  { symbol: 'AXISBANK.NS', shortCode: 'AXISBANK', name: 'Axis Bank', sector: 'Banks', exchange: 'NSE' },
  { symbol: 'KOTAKBANK.NS', shortCode: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banks', exchange: 'NSE' },
  { symbol: 'HINDUNILVR.NS', shortCode: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'BAJFINANCE.NS', shortCode: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'Financials', exchange: 'NSE' },
  { symbol: 'MARUTI.NS', shortCode: 'MARUTI', name: 'Maruti Suzuki', sector: 'Auto', exchange: 'NSE' },
  { symbol: 'SUNPHARMA.NS', shortCode: 'SUNPHARMA', name: 'Sun Pharmaceutical', sector: 'Pharma', exchange: 'NSE' },
  { symbol: 'TITAN.NS', shortCode: 'TITAN', name: 'Titan Company', sector: 'Consumer', exchange: 'NSE' },
  { symbol: 'NTPC.NS', shortCode: 'NTPC', name: 'NTPC', sector: 'Utilities', exchange: 'NSE' },
  { symbol: 'POWERGRID.NS', shortCode: 'POWERGRID', name: 'Power Grid Corp', sector: 'Utilities', exchange: 'NSE' },
  { symbol: 'ONGC.NS', shortCode: 'ONGC', name: 'ONGC', sector: 'Energy', exchange: 'NSE' },
  { symbol: 'TRENT.NS', shortCode: 'TRENT', name: 'Trent Ltd', sector: 'Consumer', exchange: 'NSE' },
  { symbol: 'TATASTEEL.NS', shortCode: 'TATASTEEL', name: 'Tata Steel', sector: 'Materials', exchange: 'NSE' },
  { symbol: 'WIPRO.NS', shortCode: 'WIPRO', name: 'Wipro', sector: 'IT', exchange: 'NSE' },
  { symbol: 'HCLTECH.NS', shortCode: 'HCLTECH', name: 'HCL Technologies', sector: 'IT', exchange: 'NSE' },
  { symbol: 'ADANIENT.NS', shortCode: 'ADANIENT', name: 'Adani Enterprises', sector: 'Industrials', exchange: 'NSE' },
  { symbol: 'ADANIPORTS.NS', shortCode: 'ADANIPORTS', name: 'Adani Ports', sector: 'Industrials', exchange: 'NSE' },
  { symbol: 'ULTRACEMCO.NS', shortCode: 'ULTRACEMCO', name: 'UltraTech Cement', sector: 'Materials', exchange: 'NSE' },
  { symbol: 'ASIANPAINT.NS', shortCode: 'ASIANPAINT', name: 'Asian Paints', sector: 'Consumer', exchange: 'NSE' },
  { symbol: 'BAJAJFINSV.NS', shortCode: 'BAJAJFINSV', name: 'Bajaj Finserv', sector: 'Financials', exchange: 'NSE' },
  { symbol: 'COALINDIA.NS', shortCode: 'COALINDIA', name: 'Coal India', sector: 'Energy', exchange: 'NSE' },
  { symbol: 'GRASIM.NS', shortCode: 'GRASIM', name: 'Grasim Industries', sector: 'Materials', exchange: 'NSE' },
];

export const BSE_UNIVERSE: UniverseItem[] = [
  { symbol: 'RELIANCE.BO', shortCode: '500325', name: 'Reliance Industries (BSE)', sector: 'Energy', exchange: 'BSE' },
  { symbol: 'TCS.BO', shortCode: '532540', name: 'Tata Consultancy Services (BSE)', sector: 'IT', exchange: 'BSE' },
  { symbol: 'HDFCBANK.BO', shortCode: '500180', name: 'HDFC Bank (BSE)', sector: 'Banks', exchange: 'BSE' },
  { symbol: 'ICICIBANK.BO', shortCode: '532174', name: 'ICICI Bank (BSE)', sector: 'Banks', exchange: 'BSE' },
  { symbol: 'INFY.BO', shortCode: '500209', name: 'Infosys (BSE)', sector: 'IT', exchange: 'BSE' },
  { symbol: 'SBIN.BO', shortCode: '500112', name: 'State Bank of India (BSE)', sector: 'Banks', exchange: 'BSE' },
  { symbol: 'BHARTIARTL.BO', shortCode: '532454', name: 'Bharti Airtel (BSE)', sector: 'Telecom', exchange: 'BSE' },
  { symbol: 'ITC.BO', shortCode: '500875', name: 'ITC (BSE)', sector: 'FMCG', exchange: 'BSE' },
  { symbol: 'LT.BO', shortCode: '500510', name: 'Larsen & Toubro (BSE)', sector: 'Industrials', exchange: 'BSE' },
  { symbol: 'AXISBANK.BO', shortCode: '532215', name: 'Axis Bank (BSE)', sector: 'Banks', exchange: 'BSE' },
  { symbol: 'KOTAKBANK.BO', shortCode: '500247', name: 'Kotak Mahindra Bank (BSE)', sector: 'Banks', exchange: 'BSE' },
  { symbol: 'HINDUNILVR.BO', shortCode: '500696', name: 'Hindustan Unilever (BSE)', sector: 'FMCG', exchange: 'BSE' },
  { symbol: 'BAJFINANCE.BO', shortCode: '500034', name: 'Bajaj Finance (BSE)', sector: 'Financials', exchange: 'BSE' },
  { symbol: 'MARUTI.BO', shortCode: '532500', name: 'Maruti Suzuki (BSE)', sector: 'Auto', exchange: 'BSE' },
  { symbol: 'SUNPHARMA.BO', shortCode: '524715', name: 'Sun Pharmaceutical (BSE)', sector: 'Pharma', exchange: 'BSE' },
  { symbol: 'TITAN.BO', shortCode: '500114', name: 'Titan Company (BSE)', sector: 'Consumer', exchange: 'BSE' },
  { symbol: 'NTPC.BO', shortCode: '532555', name: 'NTPC (BSE)', sector: 'Utilities', exchange: 'BSE' },
  { symbol: 'POWERGRID.BO', shortCode: '532898', name: 'Power Grid Corp (BSE)', sector: 'Utilities', exchange: 'BSE' },
  { symbol: 'ONGC.BO', shortCode: '500312', name: 'ONGC (BSE)', sector: 'Energy', exchange: 'BSE' },
  { symbol: 'TATASTEEL.BO', shortCode: '500470', name: 'Tata Steel (BSE)', sector: 'Materials', exchange: 'BSE' },
];

export const INDIA_CRT_CORE_UNIVERSE: UniverseItem[] = [
  { symbol: '^NSEI', shortCode: 'NIFTY 50', name: 'Nifty 50 Index', sector: 'Index', exchange: 'INDEX' },
  { symbol: '^NSEBANK', shortCode: 'BANKNIFTY', name: 'Nifty Bank Index', sector: 'Index', exchange: 'INDEX' },
  { symbol: 'NIFTY_FIN_SERVICE.NS', shortCode: 'FINNIFTY', name: 'Nifty Financial Services', sector: 'Index', exchange: 'INDEX' },
  { symbol: '^BSESN', shortCode: 'SENSEX', name: 'BSE Sensex 30', sector: 'Index', exchange: 'INDEX' },
  { symbol: 'GC=F', shortCode: 'GOLD', name: 'Gold COMEX Futures (USD)', sector: 'Precious Metals', exchange: 'COMMODITY' },
  { symbol: 'SI=F', shortCode: 'SILVER', name: 'Silver Futures (USD)', sector: 'Precious Metals', exchange: 'COMMODITY' },
  { symbol: 'CL=F', shortCode: 'CRUDE', name: 'Crude Oil WTI Futures', sector: 'Energy', exchange: 'COMMODITY' },
  { symbol: '^CNXIT', shortCode: 'NIFTY IT', name: 'Nifty IT Index', sector: 'Sectoral', exchange: 'INDEX' },
  { symbol: '^CNXAUTO', shortCode: 'NIFTY AUTO', name: 'Nifty Auto Index', sector: 'Sectoral', exchange: 'INDEX' },
  { symbol: '^CNXPHARMA', shortCode: 'NIFTY PHARMA', name: 'Nifty Pharma Index', sector: 'Sectoral', exchange: 'INDEX' },
  { symbol: '^CNXMETAL', shortCode: 'NIFTY METAL', name: 'Nifty Metal Index', sector: 'Sectoral', exchange: 'INDEX' },
  { symbol: '^CNXFMCG', shortCode: 'NIFTY FMCG', name: 'Nifty FMCG Index', sector: 'Sectoral', exchange: 'INDEX' },
  ...NSE_UNIVERSE.slice(0, 12),
];

export interface MonthlyDailyCRTResult {
  symbol: string;
  name: string;
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  stage: number;
  setup: string;
  ltp: number;
  entry: number | null;
  sl: number | null;
  t1: number | null;
  target: number | null;
  entryZoneType: string;
  availableZones: string[];
  monthlyStatus: string;
  sweepType: string;
  setupReason: string;
  chochRule: string;
  m1High: number;
  m1Low: number;
  m2High: number;
  m2Low: number;
  m2Close: number;
  m1Month: string;
  m2Month: string;
  m3Month: string;
  chochLevel: number | null;
  zoneLow: number | null;
  zoneHigh: number | null;
  lastCandleDate: string;
}

export interface MTFCisdRow {
  timeframe: '1H' | '4H' | 'Daily' | 'Weekly';
  crtSweep: string;
  crtDirection: 'BULLISH' | 'BEARISH' | 'NONE';
  cisdStatus: string;
  cisdConfirmed: boolean;
  cisdLine: number | null;
  fvgRetestStatus: string;
  fvgConfirmed: boolean;
  entry: number | null;
  sl: number | null;
  target3R: number | null;
  alignment: 'A+ ALIGNED' | 'CISD READY' | 'CRT SWEEP' | 'WAIT';
}

export interface IntradayStructureResult {
  symbol: string;
  name: string;
  lastDailyClose: number;
  dailyBias: 'Bullish' | 'Bearish';
  resistance20: number;
  support20: number;
  dailyBreakout: boolean;
  hourlyBias: 'Bullish' | 'Bearish';
  hourlyChoch: boolean;
  hourlyChochLevel: number | null;
  fifteenMinClose: number;
  zones: Array<{
    type: string;
    low: number;
    high: number;
    formed: string;
    retest: string;
    status: string;
  }>;
}

export interface Scanner5DailyResult {
  symbol: string;
  shortCode: string;
  name: string;
  exchange: 'NSE' | 'BSE' | 'INDEX' | 'COMMODITY';
  sector: string;
  status: 'ok' | 'insufficient_data';
  asOf: string;
  close: number;
  changePct: number;
  ma20: number | null;
  rsi14: number | null;
  atr14: number | null;
  volume: number;
  avgVolume20: number | null;
  volumeRatio: number | null;
  extensionFromMa20Pct: number | null;
  setups: string[];
  conservativeWatch: boolean;
}

export interface Scanner5IntradayORBResult {
  symbol: string;
  shortCode: string;
  name: string;
  sector: string;
  sessionDate: string;
  completedBars: number;
  orbStatus: string;
  orbDirection: 'BULLISH_ORB' | 'BEARISH_ORB' | 'INSIDE_RANGE' | 'INSUFFICIENT_DATA';
  rangeHigh: number | null;
  rangeLow: number | null;
  lastClose: number | null;
  breakoutTime: string | null;
  lastVolume: number;
  medianPriorVolume: number | null;
  volumeMultiple: number | null;
  volumeConfirmed: boolean;
  paperWatch: boolean;
}

export interface SectorStrengthRow {
  sector: string;
  members: number;
  averageChangePct: number;
  constituents: Array<{ symbol: string; shortCode: string; changePct: number }>;
}

export interface RiskAuditInput {
  capital: number;
  cashAvailable: number;
  cashBufferPct: number;
  maxPositionPct: number;
  maxLossPerTrade: number;
  maxDailyLoss: number;
  dailyLossUsed: number;
  tradesToday: number;
  maxTradesPerDay: number;
  minRewardRisk: number;
  requireStop: boolean;
  allowShort: boolean;
  symbol: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  quantity: number;
}

export interface RiskAuditResult {
  verdict: 'PASS' | 'BLOCK';
  reasons: string[];
  warnings: string[];
  orderValue: number;
  positionPct: number;
  riskPerShare: number;
  maxLoss: number;
  rewardRisk: number | null;
  recommendedQty: number;
  afterCash: number;
}

export interface DerivativesRow {
  symbol: string;
  instrument: string;
  expiry: string;
  openInterest: number;
  changeInOi: number;
  oiChangePct: number | null;
  volume: number;
  close: number;
  underlyingClose: number;
  priceChangePct: number | null;
  buildup: 'long_buildup' | 'short_buildup' | 'short_covering' | 'long_unwinding' | 'neutral_or_flat';
}

// ============================================================================
// 1. BATCH YAHOO FINANCE CANDLES FETCHER (via hardened Express /api/scanner)
// ============================================================================
export async function fetchScannerCandles(
  symbols: string[],
  interval: '5m' | '15m' | '1h' | '60m' | '1d' | '1wk' = '1d',
  range: '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' = '3mo'
): Promise<{ candlesBySymbol: Record<string, ScannerBar[]>; errors: Array<{ symbol: string; error: string }> }> {
  const clean = Array.from(new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean)));
  const allCandles: Record<string, ScannerBar[]> = {};
  const allErrors: Array<{ symbol: string; error: string }> = [];

  for (let i = 0; i < clean.length; i += 30) {
    const batch = clean.slice(i, i + 30);
    const resp = await fetch('/api/scanner/candles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols: batch, interval, range }),
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      throw new Error(`Scanner candle fetch failed (${resp.status}): ${txt}`);
    }
    const json = (await resp.json()) as {
      candlesBySymbol?: Record<string, ScannerBar[]>;
      errors?: Array<{ symbol: string; error: string }>;
    };
    Object.assign(allCandles, json.candlesBySymbol ?? {});
    if (Array.isArray(json.errors)) allErrors.push(...json.errors);
  }

  return { candlesBySymbol: allCandles, errors: allErrors };
}

// ============================================================================
// DATE HELPERS (Asia/Kolkata IST)
// ============================================================================
function toIstDateKey(tsMs: number): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(tsMs));
}

function toIstMonthKey(tsMs: number): string {
  return toIstDateKey(tsMs).slice(0, 7); // YYYY-MM
}

function toIstTimeHHMM(tsMs: number): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(tsMs));
  return parts;
}

// ============================================================================
// 2. INDIA CRT SETUP SCANNER: MONTHLY-DAILY CRT + CHoCH + FVG/IFVG/OB/BOB
//    Exact TypeScript port of india-crt-setup-scanner/scanner.py
// ============================================================================
function confirmedPivots(values: number[], left: number, right: number, isHigh: boolean): Array<number | null> {
  const out: Array<number | null> = new Array(values.length).fill(null);
  const width = left + right + 1;
  for (let i = width - 1; i < values.length; i++) {
    const p = i - right;
    const window = values.slice(i - width + 1, i + 1);
    const val = values[p];
    const extreme = isHigh ? Math.max(...window) : Math.min(...window);
    const count = window.filter((v) => v === val).length;
    if (Number.isFinite(val) && val === extreme && count === 1) {
      out[i] = val;
    }
  }
  return out;
}

interface EntryZone {
  type: 'FVG' | 'IFVG' | 'OB' | 'BOB';
  low: number;
  high: number;
  originIndex: number;
  availableIndex: number;
}

const ZONE_PRIORITY: Record<EntryZone['type'], number> = { FVG: 0, IFVG: 1, OB: 2, BOB: 3 };

export function analyzeMonthlyDailyCRT(
  symbol: string,
  name: string,
  rawDailyBars: ScannerBar[]
): MonthlyDailyCRTResult {
  const bars = [...rawDailyBars].sort((a, b) => a.timestamp - b.timestamp);
  if (bars.length < 35) {
    return {
      symbol,
      name,
      bias: 'Neutral',
      stage: 0,
      setup: 'Insufficient Data',
      ltp: bars[bars.length - 1]?.close ?? 0,
      entry: null,
      sl: null,
      t1: null,
      target: null,
      entryZoneType: '—',
      availableZones: [],
      monthlyStatus: 'NEED_3M_HISTORY',
      sweepType: 'No confirmed sweep',
      setupReason: 'At least 3 completed/active months of daily data required.',
      chochRule: 'Daily CHoCH not evaluated',
      m1High: 0,
      m1Low: 0,
      m2High: 0,
      m2Low: 0,
      m2Close: 0,
      m1Month: '—',
      m2Month: '—',
      m3Month: '—',
      chochLevel: null,
      zoneLow: null,
      zoneHigh: null,
      lastCandleDate: bars[bars.length - 1]?.time.slice(0, 10) ?? '—',
    };
  }

  const byMonth = new Map<string, Array<{ bar: ScannerBar; idx: number }>>();
  bars.forEach((bar, idx) => {
    const mKey = toIstMonthKey(bar.timestamp);
    const arr = byMonth.get(mKey) ?? [];
    arr.push({ bar, idx });
    byMonth.set(mKey, arr);
  });

  const months = Array.from(byMonth.keys()).sort();
  if (months.length < 3) {
    const last = bars[bars.length - 1];
    return {
      symbol,
      name,
      bias: 'Neutral',
      stage: 0,
      setup: 'Insufficient Months',
      ltp: last.close,
      entry: null,
      sl: null,
      t1: null,
      target: null,
      entryZoneType: '—',
      availableZones: [],
      monthlyStatus: 'NEED_3_MONTHS',
      sweepType: 'No confirmed sweep',
      setupReason: 'Need M1, M2, and current M3 months to evaluate CRT.',
      chochRule: 'Daily CHoCH not evaluated',
      m1High: last.high,
      m1Low: last.low,
      m2High: last.high,
      m2Low: last.low,
      m2Close: last.close,
      m1Month: '—',
      m2Month: '—',
      m3Month: '—',
      chochLevel: null,
      zoneLow: null,
      zoneHigh: null,
      lastCandleDate: toIstDateKey(last.timestamp),
    };
  }

  const m1Key = months[months.length - 3];
  const m2Key = months[months.length - 2];
  const m3Key = months[months.length - 1];

  const m1Bars = byMonth.get(m1Key)!;
  const m2Bars = byMonth.get(m2Key)!;
  const m3Bars = byMonth.get(m3Key)!;

  const m1High = Math.max(...m1Bars.map((x) => x.bar.high));
  const m1Low = Math.min(...m1Bars.map((x) => x.bar.low));
  const m2High = Math.max(...m2Bars.map((x) => x.bar.high));
  const m2Low = Math.min(...m2Bars.map((x) => x.bar.low));
  const m2Close = m2Bars[m2Bars.length - 1].bar.close;
  const closeInside = m2Close > m1Low && m2Close < m1High;

  const bullRows = m2Bars.filter((x) => x.bar.low < m1Low && x.bar.close > m1Low && x.bar.close < m1High);
  const bearRows = m2Bars.filter((x) => x.bar.high > m1High && x.bar.close < m1High && x.bar.close > m1Low);

  let direction: 1 | -1 | 0 = 0;
  let monthlyStatus = 'NO_M1_LIQUIDITY_SWEEP';
  let sweepItem: { bar: ScannerBar; idx: number } | null = null;

  if (bullRows.length > 0 && bearRows.length > 0) {
    monthlyStatus = 'AMBIGUOUS_BOTH_SIDES_SWEPT';
  } else if (!closeInside) {
    monthlyStatus = 'INVALID_M2_CLOSE_OUTSIDE_M1_RANGE';
  } else if (bullRows.length > 0) {
    direction = 1;
    monthlyStatus = 'VALID_BULLISH_SWEEP';
    sweepItem = bullRows[bullRows.length - 1];
  } else if (bearRows.length > 0) {
    direction = -1;
    monthlyStatus = 'VALID_BEARISH_SWEEP';
    sweepItem = bearRows[bearRows.length - 1];
  }

  const lastIdx = bars.length - 1;
  const m3StartIdx = m3Bars[0].idx;
  let stage = monthlyStatus === 'AMBIGUOUS_BOTH_SIDES_SWEPT' ? 6 : 0;
  let chochIndex: number | null = null;
  let chochLevel: number | null = null;
  let entry: number | null = null;
  let sl: number | null = null;
  let target: number | null = direction === 1 ? m1High : direction === -1 ? m1Low : null;
  let entryZoneType = '—';
  let availableZones: string[] = [];
  let zoneLow: number | null = null;
  let zoneHigh: number | null = null;

  if (direction !== 0 && sweepItem) {
    stage = 1;
    const pivotRight = 3;
    const pivots = confirmedPivots(
      bars.map((b) => (direction === 1 ? b.high : b.low)),
      3,
      pivotRight,
      direction === 1
    );
    const confirmStart = Math.max(0, sweepItem.idx + pivotRight + 1);
    const firstM3Bar = Math.max(m3StartIdx, confirmStart + 1);

    for (let i = firstM3Bar; i <= lastIdx; i++) {
      let latestPivot: number | null = null;
      for (let p = confirmStart; p < i; p++) {
        if (pivots[p] !== null) latestPivot = pivots[p];
      }
      if (latestPivot === null) continue;
      chochLevel = latestPivot;
      const broken = direction === 1 ? bars[i].close > latestPivot : bars[i].close < latestPivot;
      if (broken) {
        chochIndex = i;
        break;
      }
    }

    if (chochIndex !== null) {
      stage = 2;
      const zones: EntryZone[] = [];
      // FVG strictly after CHoCH
      for (let i = Math.max(chochIndex + 1, m3StartIdx + 2, 2); i <= lastIdx; i++) {
        if (direction === 1 && bars[i].low > bars[i - 2].high) {
          zones.push({ type: 'FVG', low: bars[i - 2].high, high: bars[i].low, originIndex: i - 2, availableIndex: i });
        } else if (direction === -1 && bars[i].high < bars[i - 2].low) {
          zones.push({ type: 'FVG', low: bars[i].high, high: bars[i - 2].low, originIndex: i - 2, availableIndex: i });
        }
      }
      // IFVG
      for (let i = Math.max(m3StartIdx + 2, 2); i <= lastIdx; i++) {
        let gap: [number, number] | null = null;
        if (direction === 1 && bars[i].high < bars[i - 2].low) gap = [bars[i].high, bars[i - 2].low];
        else if (direction === -1 && bars[i].low > bars[i - 2].high) gap = [bars[i - 2].high, bars[i].low];
        if (!gap) continue;
        for (let k = Math.max(chochIndex, i + 1); k <= lastIdx; k++) {
          const flipped = direction === 1 ? bars[k].close > gap[1] : bars[k].close < gap[0];
          if (flipped) {
            zones.push({ type: 'IFVG', low: gap[0], high: gap[1], originIndex: i - 2, availableIndex: k });
            break;
          }
        }
      }
      // OB
      const chochBar = bars[chochIndex];
      const chochDir = direction === 1 ? chochBar.close > chochBar.open : chochBar.close < chochBar.open;
      let latestObIdx: number | null = null;
      if (chochDir) {
        const obStart = Math.max(m3StartIdx, chochIndex - 10);
        for (let j = chochIndex - 1; j >= obStart; j--) {
          const opp = direction === 1 ? bars[j].close < bars[j].open : bars[j].close > bars[j].open;
          if (opp) {
            zones.push({ type: 'OB', low: bars[j].low, high: bars[j].high, originIndex: j, availableIndex: chochIndex });
            latestObIdx = j;
            break;
          }
        }
      }
      // BOB
      const bobStart = Math.max(m3StartIdx, chochIndex - 30);
      for (let j = bobStart; j < chochIndex; j++) {
        if (j === latestObIdx) continue;
        const counter = direction === 1 ? bars[j].close < bars[j].open : bars[j].close > bars[j].open;
        if (!counter) continue;
        for (let k = chochIndex; k <= lastIdx; k++) {
          const broken = direction === 1 ? bars[k].close > bars[j].high : bars[k].close < bars[j].low;
          if (broken) {
            zones.push({ type: 'BOB', low: bars[j].low, high: bars[j].high, originIndex: j, availableIndex: k });
            break;
          }
        }
      }

      zones.sort(
        (a, b) =>
          a.availableIndex - b.availableIndex ||
          ZONE_PRIORITY[a.type] - ZONE_PRIORITY[b.type] ||
          a.originIndex - b.originIndex
      );

      const activeZones = zones.filter((z) => {
        for (let i = z.availableIndex + 1; i < bars.length; i++) {
          if (direction === 1 && bars[i].close < z.low) return false;
          if (direction === -1 && bars[i].close > z.high) return false;
        }
        return true;
      });
      availableZones = Array.from(new Set(activeZones.map((z) => z.type)));

      // Retest check (3-day confirmation window)
      const candidates: Array<{ entryIndex: number; zone: EntryZone }> = [];
      for (const z of zones) {
        let touchedAt: number | null = null;
        for (let i = z.availableIndex + 1; i < bars.length; i++) {
          const b = bars[i];
          if (direction === 1 && b.close < z.low) break;
          if (direction === -1 && b.close > z.high) break;
          const touched = b.low <= z.high && b.high >= z.low;
          if (touched && touchedAt === null) touchedAt = i;
          if (touchedAt !== null && i - touchedAt < 3) {
            const confirmed =
              direction === 1
                ? b.close > b.open && b.close > z.high
                : b.close < b.open && b.close < z.low;
            if (confirmed) {
              candidates.push({ entryIndex: i, zone: z });
              break;
            }
          } else if (touchedAt !== null && i - touchedAt >= 3) {
            touchedAt = touched ? i : null;
          }
        }
      }

      if (candidates.length > 0) {
        candidates.sort((a, b) => a.entryIndex - b.entryIndex || ZONE_PRIORITY[a.zone.type] - ZONE_PRIORITY[b.zone.type]);
        const chosen = candidates[0];
        entry = Number(bars[chosen.entryIndex].close.toFixed(2));
        sl = Number((direction === 1 ? sweepItem.bar.low : sweepItem.bar.high).toFixed(2));
        entryZoneType = chosen.zone.type;
        zoneLow = Number(chosen.zone.low.toFixed(2));
        zoneHigh = Number(chosen.zone.high.toFixed(2));
        stage = 3;

        // Post-entry target / SL resolution
        for (let i = chosen.entryIndex + 1; i < bars.length; i++) {
          const b = bars[i];
          const hitTarget = target !== null && (direction === 1 ? b.high >= target : b.low <= target);
          const hitSl = direction === 1 ? b.low <= sl : b.high >= sl;
          if (hitTarget && hitSl) {
            stage = 6;
            break;
          }
          if (hitTarget) {
            stage = 4;
            break;
          }
          if (hitSl) {
            stage = 5;
            break;
          }
        }
        if (stage === 3 && lastIdx - chosen.entryIndex > 0) {
          stage = 9; // Confirmed earlier candle
        }
      }
    }
  }

  const setup =
    stage === 3
      ? direction === 1
        ? 'BUY'
        : 'SELL'
      : stage === 1
        ? 'Wait CHoCH'
        : stage === 2
          ? availableZones.length > 0
            ? 'Wait Retest'
            : 'Wait FVG/OB'
          : stage === 4
            ? 'Target Hit'
            : stage === 5
              ? 'SL Hit'
              : stage === 6
                ? 'Ambiguous'
                : stage === 9
                  ? 'Active Trend (Earlier Entry)'
                  : 'No Valid Monthly Sweep';

  const t1 =
    entry !== null && sl !== null
      ? Number((direction === 1 ? entry + 2 * (entry - sl) : entry - 2 * (sl - entry)).toFixed(2))
      : null;

  return {
    symbol,
    name,
    bias: direction === 1 ? 'Bullish' : direction === -1 ? 'Bearish' : 'Neutral',
    stage,
    setup,
    ltp: Number(bars[lastIdx].close.toFixed(2)),
    entry,
    sl,
    t1,
    target: target !== null ? Number(target.toFixed(2)) : null,
    entryZoneType,
    availableZones,
    monthlyStatus,
    sweepType:
      direction === 1
        ? 'Sell-Side Sweep (SSL)'
        : direction === -1
          ? 'Buy-Side Sweep (BSL)'
          : 'No confirmed sweep',
    setupReason:
      direction === 0
        ? `No clean M2 sweep reclaimed inside ${m1Key} range.`
        : stage === 1
          ? `${direction === 1 ? 'Bullish' : 'Bearish'} M2 sweep inside M1 range; awaiting Daily CHoCH.`
          : stage === 2
            ? `Daily CHoCH confirmed (${chochLevel?.toFixed(2) ?? 'N/A'}); waiting for ${availableZones.join('/') || 'zone'} retest.`
            : `${entryZoneType} retest confirmed near ${zoneLow?.toFixed(2)}–${zoneHigh?.toFixed(2)}.`,
    chochRule:
      chochLevel !== null
        ? `Daily close ${direction === 1 ? 'above' : 'below'} pivot ${chochLevel.toFixed(2)}`
        : 'Daily CHoCH not confirmed',
    m1High: Number(m1High.toFixed(2)),
    m1Low: Number(m1Low.toFixed(2)),
    m2High: Number(m2High.toFixed(2)),
    m2Low: Number(m2Low.toFixed(2)),
    m2Close: Number(m2Close.toFixed(2)),
    m1Month: m1Key,
    m2Month: m2Key,
    m3Month: m3Key,
    chochLevel: chochLevel !== null ? Number(chochLevel.toFixed(2)) : null,
    zoneLow,
    zoneHigh,
    lastCandleDate: toIstDateKey(bars[lastIdx].timestamp),
  };
}

// ============================================================================
// 3. MULTI-TIMEFRAME CRT -> 15M CISD -> 5M FVG RETEST (mtf_analysis.py)
// ============================================================================
function resampleBars(bars: ScannerBar[], bucketMs: number): ScannerBar[] {
  if (bars.length === 0) return [];
  const buckets = new Map<number, ScannerBar>();
  for (const b of bars) {
    const key = Math.floor(b.timestamp / bucketMs) * bucketMs;
    const prev = buckets.get(key);
    if (!prev) {
      buckets.set(key, { ...b, timestamp: key, time: new Date(key).toISOString() });
    } else {
      prev.high = Math.max(prev.high, b.high);
      prev.low = Math.min(prev.low, b.low);
      prev.close = b.close;
      prev.volume += b.volume;
    }
  }
  return Array.from(buckets.values()).sort((a, b) => a.timestamp - b.timestamp);
}

function find15mCisd(
  bars15m: ScannerBar[],
  direction: 1 | -1
): { confirmed: boolean; time: number | null; line: number | null; status: string } {
  const closed = bars15m.length > 1 ? bars15m.slice(0, -1) : [];
  if (closed.length < 4) {
    return { confirmed: false, time: null, line: null, status: 'WAIT 15M CISD' };
  }
  // Scan latest confirmed CISD backwards/chronologically (latest trigger most actionable)
  let latest: { confirmed: boolean; time: number | null; line: number | null; status: string } | null = null;
  for (let i = 1; i < closed.length; i++) {
    const row = closed[i];
    if (direction === 1) {
      if (row.close <= row.open) continue;
      let j = i - 1;
      if (closed[j].close >= closed[j].open) continue;
      while (j > 0 && closed[j - 1].close < closed[j - 1].open) j--;
      const line = closed[j].open;
      if (row.close > line) {
        latest = { confirmed: true, time: row.timestamp, line: Number(line.toFixed(2)), status: 'BULLISH CISD' };
      }
    } else {
      if (row.close >= row.open) continue;
      let j = i - 1;
      if (closed[j].close <= closed[j].open) continue;
      while (j > 0 && closed[j - 1].close > closed[j - 1].open) j--;
      const line = closed[j].open;
      if (row.close < line) {
        latest = { confirmed: true, time: row.timestamp, line: Number(line.toFixed(2)), status: 'BEARISH CISD' };
      }
    }
  }
  return latest ?? { confirmed: false, time: null, line: null, status: 'WAIT 15M CISD' };
}

function find5mFvgRetest(
  bars5m: ScannerBar[],
  direction: 1 | -1,
  cisdTime: number | null
): { confirmed: boolean; status: string; entry: number | null; fvgLow: number | null; fvgHigh: number | null } {
  const closed = bars5m.length > 1 ? bars5m.slice(0, -1) : [];
  if (!cisdTime || closed.length < 5) {
    return { confirmed: false, status: 'WAIT 5M FVG', entry: null, fvgLow: null, fvgHigh: null };
  }
  const after = closed.filter((b) => b.timestamp > cisdTime);
  if (after.length < 4) {
    return { confirmed: false, status: 'WAIT 5M FVG', entry: null, fvgLow: null, fvgHigh: null };
  }
  const zones: Array<{ i: number; low: number; high: number }> = [];
  for (let i = 2; i < after.length; i++) {
    const a = after[i - 2];
    const c = after[i];
    if (direction === 1 && c.low > a.high) zones.push({ i, low: a.high, high: c.low });
    else if (direction === -1 && c.high < a.low) zones.push({ i, low: c.high, high: a.low });
  }
  for (let zIdx = zones.length - 1; zIdx >= 0; zIdx--) {
    const z = zones[zIdx];
    for (let i = z.i + 1; i < after.length; i++) {
      const row = after[i];
      const touched = row.low <= z.high && row.high >= z.low;
      if (!touched) continue;
      const confirmed =
        direction === 1
          ? row.close > row.open && row.close > z.low
          : row.close < row.open && row.close < z.high;
      if (confirmed) {
        return {
          confirmed: true,
          status: '5M FVG RETEST CONFIRMED',
          entry: Number(row.close.toFixed(2)),
          fvgLow: Number(z.low.toFixed(2)),
          fvgHigh: Number(z.high.toFixed(2)),
        };
      }
    }
  }
  const lastZone = zones[zones.length - 1];
  return {
    confirmed: false,
    status: lastZone ? 'WAIT 5M FVG RETEST' : 'NO POST-CISD FVG',
    entry: null,
    fvgLow: lastZone ? Number(lastZone.low.toFixed(2)) : null,
    fvgHigh: lastZone ? Number(lastZone.high.toFixed(2)) : null,
  };
}

export function analyzeMTFCisdConfluence(
  bars1h: ScannerBar[],
  bars15m: ScannerBar[],
  bars5m: ScannerBar[],
  barsDaily: ScannerBar[],
  barsWeekly: ScannerBar[]
): MTFCisdRow[] {
  const frames: Array<{ tf: MTFCisdRow['timeframe']; bars: ScannerBar[] }> = [
    { tf: '1H', bars: bars1h },
    { tf: '4H', bars: resampleBars(bars1h, 4 * 3600 * 1000) },
    { tf: 'Daily', bars: barsDaily },
    { tf: 'Weekly', bars: barsWeekly },
  ];

  return frames.map(({ tf, bars }) => {
    const closed = bars.length > 2 ? bars.slice(0, -1) : bars;
    if (closed.length < 3) {
      return {
        timeframe: tf,
        crtSweep: 'NO DATA',
        crtDirection: 'NONE',
        cisdStatus: '—',
        cisdConfirmed: false,
        cisdLine: null,
        fvgRetestStatus: '—',
        fvgConfirmed: false,
        entry: null,
        sl: null,
        target3R: null,
        alignment: 'WAIT',
      };
    }

    const c1 = closed[closed.length - 2];
    const c2 = closed[closed.length - 1];
    const bullSweep = c2.low < c1.low && c2.close > c1.low && c2.close < c1.high;
    const bearSweep = c2.high > c1.high && c2.close < c1.high && c2.close > c1.low;

    let direction: 1 | -1 | 0 = 0;
    let crtSweep = 'NO CRT SWEEP';
    let crtDirection: MTFCisdRow['crtDirection'] = 'NONE';
    if (bullSweep && !bearSweep) {
      direction = 1;
      crtSweep = 'BULLISH SWEEP (SSL)';
      crtDirection = 'BULLISH';
    } else if (bearSweep && !bullSweep) {
      direction = -1;
      crtSweep = 'BEARISH SWEEP (BSL)';
      crtDirection = 'BEARISH';
    }

    if (direction === 0) {
      return {
        timeframe: tf,
        crtSweep,
        crtDirection,
        cisdStatus: 'WAIT CRT',
        cisdConfirmed: false,
        cisdLine: null,
        fvgRetestStatus: '—',
        fvgConfirmed: false,
        entry: null,
        sl: null,
        target3R: null,
        alignment: 'WAIT',
      };
    }

    const cisd = find15mCisd(bars15m, direction);
    const fvg = cisd.confirmed
      ? find5mFvgRetest(bars5m, direction, cisd.time)
      : { confirmed: false, status: 'WAIT 15M CISD', entry: null, fvgLow: null, fvgHigh: null };

    const sl = Number((direction === 1 ? c2.low : c2.high).toFixed(2));
    const entry = fvg.entry;
    const risk = entry !== null ? Math.abs(entry - sl) : 0;
    const target3R =
      entry !== null && risk > 0
        ? Number((direction === 1 ? entry + 3 * risk : entry - 3 * risk).toFixed(2))
        : null;

    const alignment: MTFCisdRow['alignment'] = fvg.confirmed
      ? 'A+ ALIGNED'
      : cisd.confirmed
        ? 'CISD READY'
        : 'CRT SWEEP';

    return {
      timeframe: tf,
      crtSweep,
      crtDirection,
      cisdStatus: cisd.status,
      cisdConfirmed: cisd.confirmed,
      cisdLine: cisd.line,
      fvgRetestStatus: fvg.status,
      fvgConfirmed: fvg.confirmed,
      entry,
      sl,
      target3R,
      alignment,
    };
  });
}

// ============================================================================
// 4. INTRADAY STRUCTURE SCANNER (intraday_scanner.py)
// ============================================================================
export function analyzeIntradayStructure(
  symbol: string,
  name: string,
  dailyBars: ScannerBar[],
  hourlyBars: ScannerBar[],
  fifteenBars: ScannerBar[]
): IntradayStructureResult {
  const daily = dailyBars.slice(0, -1);
  const hourly = hourlyBars.slice(0, -1);
  const fifteen = fifteenBars.slice(0, -1);

  const dCloses = daily.map((b) => b.close);
  const hCloses = hourly.map((b) => b.close);
  const dMa20 = sma(dCloses, 20) ?? dCloses[dCloses.length - 1] ?? 0;
  const hMa20 = sma(hCloses, 20) ?? hCloses[hCloses.length - 1] ?? 0;

  const recent20 = daily.slice(-21, -1);
  const resistance20 = recent20.length > 0 ? Math.max(...recent20.map((b) => b.high)) : 0;
  const support20 = recent20.length > 0 ? Math.min(...recent20.map((b) => b.low)) : 0;
  const lastDailyClose = dCloses[dCloses.length - 1] ?? 0;
  const dailyBias: 'Bullish' | 'Bearish' = lastDailyClose > dMa20 ? 'Bullish' : 'Bearish';
  const hourlyBias: 'Bullish' | 'Bearish' = (hCloses[hCloses.length - 1] ?? 0) >= hMa20 ? 'Bullish' : 'Bearish';

  // 1H CHoCH
  const pivHighs = confirmedPivots(hourly.map((b) => b.high), 2, 2, true);
  const pivLows = confirmedPivots(hourly.map((b) => b.low), 2, 2, false);
  let refLevel: number | null = null;
  if (hourlyBias === 'Bullish') {
    for (let i = pivHighs.length - 3; i >= 0; i--) {
      if (pivHighs[i] !== null) {
        refLevel = pivHighs[i];
        break;
      }
    }
  } else {
    for (let i = pivLows.length - 3; i >= 0; i--) {
      if (pivLows[i] !== null) {
        refLevel = pivLows[i];
        break;
      }
    }
  }
  const hLast = hCloses[hCloses.length - 1] ?? 0;
  const hPrev = hCloses[hCloses.length - 2] ?? 0;
  const hourlyChoch =
    refLevel !== null &&
    (hourlyBias === 'Bullish' ? hLast > refLevel && hPrev <= refLevel : hLast < refLevel && hPrev >= refLevel);

  // Latest directional FVGs + OB candidate on 1H
  const zonesRaw: Array<{ type: string; low: number; high: number; formed: string }> = [];
  const start = Math.max(2, hourly.length - 60);
  for (let i = start; i < hourly.length; i++) {
    if (hourlyBias === 'Bullish' && hourly[i].low > hourly[i - 2].high) {
      zonesRaw.push({
        type: 'Bullish FVG',
        low: hourly[i - 2].high,
        high: hourly[i].low,
        formed: toIstDateKey(hourly[i].timestamp) + ' ' + toIstTimeHHMM(hourly[i].timestamp),
      });
    } else if (hourlyBias === 'Bearish' && hourly[i].high < hourly[i - 2].low) {
      zonesRaw.push({
        type: 'Bearish FVG',
        low: hourly[i].high,
        high: hourly[i - 2].low,
        formed: toIstDateKey(hourly[i].timestamp) + ' ' + toIstTimeHHMM(hourly[i].timestamp),
      });
    }
  }

  for (let i = hourly.length - 1; i > Math.max(0, hourly.length - 12); i--) {
    const row = hourly[i];
    const dir = hourlyBias === 'Bullish' ? row.close > row.open : row.close < row.open;
    if (!dir) continue;
    for (let j = i - 1; j >= Math.max(0, i - 8); j--) {
      const opp = hourlyBias === 'Bullish' ? hourly[j].close < hourly[j].open : hourly[j].close > hourly[j].open;
      if (opp) {
        zonesRaw.push({
          type: `${hourlyBias} OB`,
          low: hourly[j].low,
          high: hourly[j].high,
          formed: toIstDateKey(hourly[j].timestamp) + ' ' + toIstTimeHHMM(hourly[j].timestamp),
        });
        break;
      }
    }
    break;
  }

  const tail12 = fifteen.slice(-12);
  const t12Low = tail12.length > 0 ? Math.min(...tail12.map((b) => b.low)) : Infinity;
  const t12High = tail12.length > 0 ? Math.max(...tail12.map((b) => b.high)) : -Infinity;

  const zones = zonesRaw.slice(-6).map((z) => {
    const touched = t12Low <= z.high && t12High >= z.low;
    return {
      type: z.type,
      low: Number(z.low.toFixed(2)),
      high: Number(z.high.toFixed(2)),
      formed: z.formed,
      retest: touched ? 'Touched in last 12 bars (15m)' : 'Not touched recently',
      status: touched ? 'RETEST CANDIDATE' : 'WAITING',
    };
  });

  return {
    symbol,
    name,
    lastDailyClose: Number(lastDailyClose.toFixed(2)),
    dailyBias,
    resistance20: Number(resistance20.toFixed(2)),
    support20: Number(support20.toFixed(2)),
    dailyBreakout: lastDailyClose > resistance20,
    hourlyBias,
    hourlyChoch,
    hourlyChochLevel: refLevel !== null ? Number(refLevel.toFixed(2)) : null,
    fifteenMinClose: Number((fifteen[fifteen.length - 1]?.close ?? hLast).toFixed(2)),
    zones,
  };
}

// ============================================================================
// 5. SCANNER 5.0 DAILY QUANT SCANNER (india.py + bse.py)
// ============================================================================
function sma(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((acc, v) => acc + v, 0) / period;
}

function rsiWilder(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;
  const changes: number[] = [];
  for (let i = 1; i < closes.length; i++) changes.push(closes[i] - closes[i - 1]);
  const gains = changes.map((c) => Math.max(c, 0));
  const losses = changes.map((c) => Math.max(-c, 0));
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }
  if (avgLoss === 0) return avgGain > 0 ? 100 : 50;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function atrWilder(bars: ScannerBar[], period = 14): number | null {
  if (bars.length < period + 1) return null;
  const trs: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const b = bars[i];
    const p = bars[i - 1];
    trs.push(Math.max(b.high - b.low, Math.abs(b.high - p.close), Math.abs(b.low - p.close)));
  }
  if (trs.length < period) return null;
  let val = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trs.length; i++) {
    val = (val * (period - 1) + trs[i]) / period;
  }
  return val;
}

export function analyzeScanner5Daily(
  item: UniverseItem,
  rawBars: ScannerBar[]
): Scanner5DailyResult {
  const bars = [...rawBars].sort((a, b) => a.timestamp - b.timestamp);
  const closes = bars.map((b) => b.close);
  if (closes.length < 21) {
    return {
      symbol: item.symbol,
      shortCode: item.shortCode,
      name: item.name,
      exchange: item.exchange,
      sector: item.sector,
      status: 'insufficient_data',
      asOf: bars[bars.length - 1] ? toIstDateKey(bars[bars.length - 1].timestamp) : '—',
      close: closes[closes.length - 1] ?? 0,
      changePct: 0,
      ma20: null,
      rsi14: null,
      atr14: null,
      volume: 0,
      avgVolume20: null,
      volumeRatio: null,
      extensionFromMa20Pct: null,
      setups: [],
      conservativeWatch: false,
    };
  }

  const last = closes[closes.length - 1];
  const prev = closes[closes.length - 2];
  const changePct = prev > 0 ? ((last / prev) - 1) * 100 : 0;
  const prior20 = closes.slice(-21, -1);
  const ma20 = sma(closes, 20);
  const prevMa20 = sma(closes.slice(0, -1), 20);
  const rsi = rsiWilder(closes, 14);
  const prevRsi = rsiWilder(closes.slice(0, -1), 14);
  const atr = atrWilder(bars, 14);

  const setups: string[] = [];
  if (last > Math.max(...prior20)) setups.push('breakout_20d');
  if (closes.length >= 25) {
    const priorRun = closes.slice(-15, -5);
    const flag = closes.slice(-5);
    if (
      priorRun[0] > 0 &&
      Math.max(...priorRun) / Math.min(...priorRun) - 1 > 0.10 &&
      Math.max(...flag) / Math.min(...flag) - 1 <= 0.05
    ) {
      setups.push('bull_flag');
    }
  }
  if (prevMa20 !== null && ma20 !== null && prev < prevMa20 && last > ma20) {
    setups.push('reclaim_ma20');
  }
  if (rsi !== null && rsi < 30) setups.push('oversold');
  if (prevRsi !== null && prevRsi < 30 && last > prev) setups.push('oversold_bounce');

  const lastVol = bars[bars.length - 1].volume;
  const vols20 = bars.slice(-21, -1).map((b) => b.volume);
  const avgVol20 = vols20.length === 20 ? vols20.reduce((a, b) => a + b, 0) / 20 : null;
  const volRatio = avgVol20 && avgVol20 > 0 ? lastVol / avgVol20 : null;
  const extPct = ma20 ? ((last / ma20) - 1) * 100 : null;

  return {
    symbol: item.symbol,
    shortCode: item.shortCode,
    name: item.name,
    exchange: item.exchange,
    sector: item.sector,
    status: 'ok',
    asOf: toIstDateKey(bars[bars.length - 1].timestamp),
    close: Number(last.toFixed(2)),
    changePct: Number(changePct.toFixed(2)),
    ma20: ma20 !== null ? Number(ma20.toFixed(2)) : null,
    rsi14: rsi !== null ? Number(rsi.toFixed(2)) : null,
    atr14: atr !== null ? Number(atr.toFixed(2)) : null,
    volume: lastVol,
    avgVolume20: avgVol20 !== null ? Math.round(avgVol20) : null,
    volumeRatio: volRatio !== null ? Number(volRatio.toFixed(2)) : null,
    extensionFromMa20Pct: extPct !== null ? Number(extPct.toFixed(2)) : null,
    setups,
    conservativeWatch: setups.length > 0 && (extPct === null || extPct <= 5.0),
  };
}

// ============================================================================
// 6. SCANNER 5.0 INTRADAY 15m ORB + VOLUME SURGE (intraday.py)
// ============================================================================
export function analyzeScanner5IntradayORB(
  item: UniverseItem,
  raw5mBars: ScannerBar[],
  volumeMultipleThreshold = 1.5
): Scanner5IntradayORBResult {
  const bars = [...raw5mBars].sort((a, b) => a.timestamp - b.timestamp);
  if (bars.length < 4) {
    return {
      symbol: item.symbol,
      shortCode: item.shortCode,
      name: item.name,
      sector: item.sector,
      sessionDate: '—',
      completedBars: 0,
      orbStatus: 'insufficient_data',
      orbDirection: 'INSUFFICIENT_DATA',
      rangeHigh: null,
      rangeLow: null,
      lastClose: null,
      breakoutTime: null,
      lastVolume: 0,
      medianPriorVolume: null,
      volumeMultiple: null,
      volumeConfirmed: false,
      paperWatch: false,
    };
  }

  // Group by IST date and inspect most recent session with >= 3 bars
  const byDay = new Map<string, ScannerBar[]>();
  for (const b of bars) {
    const d = toIstDateKey(b.timestamp);
    const list = byDay.get(d) ?? [];
    list.push(b);
    byDay.set(d, list);
  }
  const days = Array.from(byDay.keys()).sort();
  let chosenDay = days[days.length - 1];
  for (let idx = days.length - 1; idx >= 0; idx--) {
    if ((byDay.get(days[idx])?.length ?? 0) >= 6) {
      chosenDay = days[idx];
      break;
    }
  }
  const dayBars = byDay.get(chosenDay) ?? [];
  const opening = dayBars.filter((b) => {
    const t = toIstTimeHHMM(b.timestamp);
    return t >= '09:15' && t < '09:30';
  });
  const after = dayBars.filter((b) => toIstTimeHHMM(b.timestamp) >= '09:30');

  if (opening.length < 3) {
    return {
      symbol: item.symbol,
      shortCode: item.shortCode,
      name: item.name,
      sector: item.sector,
      sessionDate: chosenDay,
      completedBars: dayBars.length,
      orbStatus: 'insufficient_opening_range',
      orbDirection: 'INSUFFICIENT_DATA',
      rangeHigh: null,
      rangeLow: null,
      lastClose: dayBars[dayBars.length - 1]?.close ?? null,
      breakoutTime: null,
      lastVolume: dayBars[dayBars.length - 1]?.volume ?? 0,
      medianPriorVolume: null,
      volumeMultiple: null,
      volumeConfirmed: false,
      paperWatch: false,
    };
  }

  const rangeHigh = Math.max(...opening.map((b) => b.high));
  const rangeLow = Math.min(...opening.map((b) => b.low));

  let breakoutTime: string | null = null;
  let orbDirection: Scanner5IntradayORBResult['orbDirection'] = 'INSIDE_RANGE';
  let orbStatus = 'no_confirmed_breakout';

  for (const b of after) {
    if (b.close > rangeHigh) {
      orbDirection = 'BULLISH_ORB';
      orbStatus = 'confirmed_rule_match';
      breakoutTime = `${chosenDay} ${toIstTimeHHMM(b.timestamp)} IST`;
      break;
    }
    if (b.close < rangeLow) {
      orbDirection = 'BEARISH_ORB';
      orbStatus = 'bearish_orb_breakdown';
      breakoutTime = `${chosenDay} ${toIstTimeHHMM(b.timestamp)} IST`;
      break;
    }
  }

  const vols = dayBars.map((b) => b.volume);
  const prior = vols.slice(0, -1).sort((a, b) => a - b);
  const median = prior.length > 0 ? prior[Math.floor(prior.length / 2)] : 0;
  const lastVol = vols[vols.length - 1] ?? 0;
  const mult = median > 0 ? lastVol / median : null;
  const volumeConfirmed = mult !== null && mult >= volumeMultipleThreshold;

  return {
    symbol: item.symbol,
    shortCode: item.shortCode,
    name: item.name,
    sector: item.sector,
    sessionDate: chosenDay,
    completedBars: dayBars.length,
    orbStatus,
    orbDirection,
    rangeHigh: Number(rangeHigh.toFixed(2)),
    rangeLow: Number(rangeLow.toFixed(2)),
    lastClose: dayBars[dayBars.length - 1]?.close ?? null,
    breakoutTime,
    lastVolume: lastVol,
    medianPriorVolume: median > 0 ? Math.round(median) : null,
    volumeMultiple: mult !== null ? Number(mult.toFixed(2)) : null,
    volumeConfirmed,
    paperWatch: orbDirection === 'BULLISH_ORB' && volumeConfirmed,
  };
}

// ============================================================================
// 7. SECTOR RELATIVE STRENGTH (sectors.py)
// ============================================================================
export function computeSectorStrength(dailyResults: Scanner5DailyResult[]): SectorStrengthRow[] {
  const groups = new Map<string, Array<{ symbol: string; shortCode: string; changePct: number }>>();
  for (const row of dailyResults) {
    if (row.status !== 'ok') continue;
    const arr = groups.get(row.sector) ?? [];
    arr.push({ symbol: row.symbol, shortCode: row.shortCode, changePct: row.changePct });
    groups.set(row.sector, arr);
  }
  return Array.from(groups.entries())
    .map(([sector, members]) => ({
      sector,
      members: members.length,
      averageChangePct: Number((members.reduce((s, m) => s + m.changePct, 0) / members.length).toFixed(2)),
      constituents: [...members].sort((a, b) => b.changePct - a.changePct),
    }))
    .sort((a, b) => b.averageChangePct - a.averageChangePct);
}

// ============================================================================
// 8. TRADER-RISK PRE-TRADE AUDITOR (trader-risk/check.py)
// ============================================================================
export function auditTradeRisk(input: RiskAuditInput): RiskAuditResult {
  const reasons: string[] = [];
  const warnings: string[] = [];

  const orderValue = Number((input.entryPrice * input.quantity).toFixed(2));
  const positionPct = input.capital > 0 ? Number(((orderValue / input.capital) * 100).toFixed(2)) : 0;
  const bufferCapital = (input.capital * input.cashBufferPct) / 100;
  const afterCash = Number((input.cashAvailable - (input.side === 'BUY' ? orderValue : 0)).toFixed(2));

  if (input.quantity <= 0 || input.entryPrice <= 0) {
    reasons.push('Order quantity and entry price must be greater than zero.');
  }

  if (input.side === 'BUY') {
    if (afterCash < 0) {
      reasons.push(`Cash shortfall: requires ₹${orderValue.toLocaleString('en-IN')} but only ₹${input.cashAvailable.toLocaleString('en-IN')} available.`);
    } else if (afterCash < bufferCapital) {
      reasons.push(`Cash buffer breach: post-trade cash ₹${afterCash.toLocaleString('en-IN')} falls below ${input.cashBufferPct}% reserve (₹${bufferCapital.toLocaleString('en-IN')}).`);
    }
    if (positionPct > input.maxPositionPct) {
      reasons.push(`Position cap breach: ${positionPct}% of capital exceeds ${input.maxPositionPct}% limit.`);
    }
  } else if (!input.allowShort) {
    reasons.push('Short selling is disabled in Risk Guard settings.');
  }

  let riskPerShare = 0;
  let maxLoss = 0;
  let rewardRisk: number | null = null;

  if (!input.stopLoss || input.stopLoss <= 0) {
    if (input.requireStop) {
      reasons.push('Missing stop-loss: "require_stop" policy blocks unhedged entries.');
    } else {
      warnings.push('No stop-loss specified; downside is uncapped.');
    }
  } else {
    const validStop = input.side === 'BUY' ? input.stopLoss < input.entryPrice : input.stopLoss > input.entryPrice;
    if (!validStop) {
      reasons.push(
        `Invalid stop-loss ₹${input.stopLoss}: must be ${input.side === 'BUY' ? 'below' : 'above'} entry ₹${input.entryPrice}.`
      );
    } else {
      riskPerShare = Number(Math.abs(input.entryPrice - input.stopLoss).toFixed(2));
      maxLoss = Number((riskPerShare * input.quantity).toFixed(2));

      if (input.maxLossPerTrade > 0 && maxLoss > input.maxLossPerTrade) {
        reasons.push(
          `Per-trade risk ₹${maxLoss.toLocaleString('en-IN')} exceeds max loss cap ₹${input.maxLossPerTrade.toLocaleString('en-IN')}.`
        );
      }

      if (input.maxDailyLoss > 0 && input.dailyLossUsed + maxLoss > input.maxDailyLoss) {
        reasons.push(
          `Daily loss cap breach: used ₹${input.dailyLossUsed.toLocaleString('en-IN')} + ₹${maxLoss.toLocaleString('en-IN')} exceeds ₹${input.maxDailyLoss.toLocaleString('en-IN')}.`
        );
      }

      if (input.targetPrice > 0) {
        const validTarget =
          input.side === 'BUY' ? input.targetPrice > input.entryPrice : input.targetPrice < input.entryPrice;
        if (!validTarget) {
          reasons.push(
            `Target ₹${input.targetPrice} must be ${input.side === 'BUY' ? 'above' : 'below'} entry ₹${input.entryPrice}.`
          );
        } else if (riskPerShare > 0) {
          rewardRisk = Number((Math.abs(input.targetPrice - input.entryPrice) / riskPerShare).toFixed(2));
          if (input.minRewardRisk > 0 && rewardRisk < input.minRewardRisk) {
            reasons.push(`Reward:Risk ${rewardRisk} is below minimum ${input.minRewardRisk}x threshold.`);
          }
        }
      } else if (input.minRewardRisk > 0) {
        warnings.push(`Target price not set; cannot verify minimum ${input.minRewardRisk}x R:R.`);
      }
    }
  }

  if (input.maxTradesPerDay > 0 && input.tradesToday >= input.maxTradesPerDay) {
    reasons.push(`Daily trade count ${input.tradesToday} reached cap of ${input.maxTradesPerDay} trades.`);
  }

  const maxAffordableQty = input.entryPrice > 0 ? Math.floor((input.cashAvailable - bufferCapital) / input.entryPrice) : 0;
  const maxRiskQty = riskPerShare > 0 && input.maxLossPerTrade > 0 ? Math.floor(input.maxLossPerTrade / riskPerShare) : input.quantity;
  const recommendedQty = Math.max(0, Math.min(maxRiskQty, input.side === 'BUY' ? maxAffordableQty : maxRiskQty));

  return {
    verdict: reasons.length === 0 ? 'PASS' : 'BLOCK',
    reasons,
    warnings,
    orderValue,
    positionPct,
    riskPerShare,
    maxLoss,
    rewardRisk,
    recommendedQty,
    afterCash,
  };
}

// ============================================================================
// 9. F&O DERIVATIVES CSV PARSER & BUILDUP CLASSIFIER (derivatives.py)
// ============================================================================
export function parseDerivativesCsv(csvText: string): { rows: DerivativesRow[]; errors: string[] } {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    return { rows: [], errors: ['CSV must contain header row and at least one F&O record.'] };
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const findCol = (aliases: string[]) => headers.findIndex((h) => aliases.includes(h));

  const idxSymbol = findCol(['symbol', 'underlying', 'ticker']);
  const idxInst = findCol(['instrument', 'instrument_type']);
  const idxExpiry = findCol(['expiry', 'expiry_dt', 'expiry_date']);
  const idxOi = findCol(['open_interest', 'open_int', 'oi', 'openint']);
  const idxChgOi = findCol(['change_in_oi', 'chg_in_oi', 'change_oi']);
  const idxVol = findCol(['volume', 'contracts']);
  const idxClose = findCol(['close', 'settle_pr', 'close_price']);
  const idxUnd = findCol(['underlying_close', 'underlying_price', 'underlying_value']);
  const idxPrev = findCol(['previous_underlying_close', 'prev_underlying_close', 'prev_close']);

  if ([idxSymbol, idxInst, idxOi, idxChgOi, idxClose, idxUnd].some((i) => i === -1)) {
    return {
      rows: [],
      errors: ['Missing required columns (symbol, instrument, open_interest, change_in_oi, close, underlying_close).'],
    };
  }

  const rows: DerivativesRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    const inst = (cols[idxInst] || '').toUpperCase();
    if (!['FUTSTK', 'FUTIDX', 'FUTURE', 'FUT'].includes(inst)) continue;

    const oi = Number((cols[idxOi] || '').replace(/,/g, ''));
    const chgOi = Number((cols[idxChgOi] || '').replace(/,/g, ''));
    const vol = idxVol !== -1 ? Number((cols[idxVol] || '0').replace(/,/g, '')) : 0;
    const close = Number((cols[idxClose] || '').replace(/,/g, ''));
    const und = Number((cols[idxUnd] || '').replace(/,/g, ''));
    const prev = idxPrev !== -1 && cols[idxPrev] ? Number(cols[idxPrev].replace(/,/g, '')) : null;

    if (![oi, chgOi, close, und].every(Number.isFinite)) {
      errors.push(`Row ${i + 1}: numeric parse error.`);
      continue;
    }

    const priceChangePct = prev && prev > 0 ? Number((((und / prev) - 1) * 100).toFixed(2)) : null;
    const priorOi = oi - chgOi;
    const oiChangePct = priorOi > 0 ? Number(((chgOi / priorOi) * 100).toFixed(2)) : null;

    let buildup: DerivativesRow['buildup'] = 'neutral_or_flat';
    if (priceChangePct !== null) {
      if (priceChangePct > 0 && chgOi > 0) buildup = 'long_buildup';
      else if (priceChangePct < 0 && chgOi > 0) buildup = 'short_buildup';
      else if (priceChangePct > 0 && chgOi < 0) buildup = 'short_covering';
      else if (priceChangePct < 0 && chgOi < 0) buildup = 'long_unwinding';
    }

    rows.push({
      symbol: (cols[idxSymbol] || '').toUpperCase(),
      instrument: inst,
      expiry: idxExpiry !== -1 ? cols[idxExpiry] || '—' : '—',
      openInterest: oi,
      changeInOi: chgOi,
      oiChangePct,
      volume: vol,
      close,
      underlyingClose: und,
      priceChangePct,
      buildup,
    });
  }

  return { rows, errors };
}
