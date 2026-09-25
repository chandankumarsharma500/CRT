
export type Trend = 'Bullish' | 'Bearish';
export type SignalType = 'BUY' | 'SELL' | 'HOLD';

export interface MarketDataPoint {
  time: string;
  timestamp: number;
  callVega: number;
  putVega: number;
  difference: number;
  trend: Trend;
}

export interface TradingSignal {
  type: SignalType;
  strength: 'STRONG' | 'MODERATE' | 'NONE';
  tag: 'SNIPER' | 'INSTITUTIONAL' | 'SCALP';
  confidence: number;
  reason: string;
  action: string;
  stopLoss: string;
  target: string;
  timestamp: number;
  confluence?: string[];
}

export interface IndexDefinition {
  id: string;
  symbol: string;
  exchange: 'NSE' | 'BSE' | 'GLOBAL' | 'CRYPTO';
  name: string;
}

export interface IndexMarketData {
  definition: IndexDefinition;
  price: number;
  change: number;
  percentChange: number;
  callVega: number;
  putVega: number;
  difference: number;
  trend: Trend;
  source?: string;
}

export interface SMCZone {
    id: string;
    symbol: string;
    pattern: 'FVG' | 'IFVG' | 'OB' | 'BOB';
    trend: Trend;
    timeframe: 'DAILY' | 'WEEKLY' | 'INTRADAY';
    top: number;
    bottom: number;
    candleTime: string;
    isMitigated: boolean;
}

export interface BrokerProfile {
  name: string;
  email: string;
  client_id: string;
  userType: string;
  broker?: 'DHAN' | 'UPSTOX' | 'ZERODHA';
}

export interface OrderRequest {
  tradingSymbol: string;
  transactionType: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  quantity: number;
  productType: 'INTRADAY' | 'DELIVERY';
  // Added optional property for broker specific segments
  exchangeSegment?: string;
}

// Added missing types to resolve compilation errors
export interface BacktestResult {
  data: MarketDataPoint;
  signal: TradingSignal;
}

export type DhanEnv = 'PRODUCTION' | 'SANDBOX';

export interface DhanConfig {
  clientId: string;
  accessToken?: string;
  environment: DhanEnv;
  redirectUri?: string;
  authCode?: string;
  enableCorsProxy?: boolean;
  corsProxyUrl?: string;
}

export interface DhanProfile {
  name: string;
  email: string;
  client_id: string;
  userType: string;
  broker: 'DHAN';
}

export interface DhanHolding {
  tradingSymbol: string;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  pnl: number;
  exchange: string;
}

export type WebSocketState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'FALLBACK_REST';

export interface BrokerClosingPrice {
  instrumentKey: string;
  symbol: string;
  name: string;
  lastClose: number;
  open?: number;
  high?: number;
  low?: number;
  lastPrice: number;
  timestamp: number;
  source: 'WEBSOCKET' | 'REST_API' | 'REST_FALLBACK_CACHE';
  change?: number;
  percentChange?: number;
}

export type UpstoxClosingPrice = BrokerClosingPrice;

export interface UpstoxConfig {
  apiKey: string;
  accessToken: string;
  apiSecret?: string;
  redirectUri?: string;
  authCode?: string;
  enableCorsProxy?: boolean;
  corsProxyUrl?: string;
}

export interface ZerodhaConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  requestToken?: string;
  redirectUri?: string;
  enableCorsProxy?: boolean;
  corsProxyUrl?: string;
}

export interface AngelOneConfig {
  clientCode: string;
  password?: string;
  apiKey: string;
  totpSecret?: string;
  jwtToken?: string;
  feedToken?: string;
  refreshToken?: string;
  enableCorsProxy?: boolean;
  corsProxyUrl?: string;
}

export interface UnifiedBrokerService {
  brokerId: BrokerId;
  getBrokerName(): string;
  isConfigured(): boolean;
  getWebSocketState(): WebSocketState;
  connectWebSocket(): Promise<void> | void;
  disconnectWebSocket(): void;
  fetchLastAvailableClosingPricesViaRest(): Promise<Record<string, BrokerClosingPrice>>;
  fetchIndicesMarketData(): Promise<IndexMarketData[]>;
  getProfile(): Promise<BrokerProfile>;
  getHoldings(): Promise<BrokerHolding[]>;
  placeOrder(order: OrderRequest): Promise<any>;
  getDefaultRedirectUri(): string;
  getOAuthDialogUrl(apiKeyOverride?: string, redirectUriOverride?: string): string;
  checkForRedirectCode(): { code: string | null; state: string | null };
  exchangeCodeForAccessToken?(code: string, ...args: any[]): Promise<{ success: boolean; accessToken?: string; message: string }>;
  subscribe(callback: (data: Record<string, BrokerClosingPrice>, state: WebSocketState) => void): () => void;
  getLastClosingPrice(indexId: string): number;
  getLastAvailablePrice(indexId: string): number;
  isCorsRestricted?(): boolean;
  enableCorsProxy?(enabled: boolean, proxyUrl?: string): void;
  getClosingPrices?(): Record<string, BrokerClosingPrice>;
  loginWithCredentials?(): Promise<{ success: boolean; jwtToken?: string; message: string }>;
}

export interface MultiBrokerStreamData {
  brokerId: BrokerId;
  brokerName: string;
  state: WebSocketState;
  prices: Record<string, BrokerClosingPrice>;
  updatedAt: number;
}

export interface BrokerHolding {
  tradingSymbol: string;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  pnl: number;
  exchange: string;
}

export type BrokerId = 
  | 'DHAN' 
  | 'ZERODHA' 
  | 'ANGELONE' 
  | 'UPSTOX' 
  | 'GROWW' 
  | 'FYERS' 
  | 'KOTAK_NEO' 
  | 'FINVASIA' 
  | 'ALICE_BLUE' 
  | 'ICICI_BREEZE' 
  | 'FIVE_PAISA' 
  | 'PAYTM_MONEY' 
  | 'HDFC_SKY' 
  | 'MOTILAL' 
  | 'FLAT_TRADE' 
  | 'BINANCE' 
  | 'BYBIT' 
  | 'IBKR' 
  | 'ALPACA' 
  | 'METATRADER' 
  | 'WEBHOOK';

export interface BrokerFieldDefinition {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'password';
  required?: boolean;
  help?: string;
  defaultValue?: string;
}

export interface BrokerMetadata {
  id: BrokerId;
  name: string;
  tagline: string;
  category: 'INDIAN_DISCOUNT' | 'INDIAN_FULLSERVICE' | 'GLOBAL_CRYPTO' | 'WEBHOOK_ALGO';
  badgeColor: string;
  logoLetter: string;
  logoBg: string;
  fields: BrokerFieldDefinition[];
  portalUrl?: string;
  supportedSegments: string[];
}

export interface TwelveDataConfig {
  apiKey: string;
  symbol: string;
  interval?: string;
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface MobileBackendConfig {
  enabled: boolean;
  cloudFunctionUrl: string;
  authKey?: string;
}

export type TimeFrame = 'DAILY' | 'WEEKLY' | 'INTRADAY';

export type SMCPatternType = 'FVG' | 'IFVG' | 'OB' | 'BOB';

export interface GlobalAssetData {
  id: string;
  symbol: string;
  name: string;
  category: 'INDEX' | 'CRYPTO';
  price: number;
  change: number;
  percentChange: number;
  trend: Trend;
}

// CRT (Candle Range Theory) Strategy Types
export type CRTTimeframe = 'MONTHLY' | 'WEEKLY' | 'DAILY' | '4H' | '1H';

export type CRTRangeState = 
  | 'INSIDE_RANGE' 
  | 'HIGH_SWEPT' 
  | 'LOW_SWEPT' 
  | 'EXPANDING_BULLISH' 
  | 'EXPANDING_BEARISH';

export type LiquidityPoolType = 'BSL' | 'SSL' | 'EQH' | 'EQL' | 'IDM';

export type KillZoneSession = 
  | 'MORNING_OPEN'       // 09:15 - 10:30 IST (Prime IB Sweep)
  | 'MIDDAY_CHOP'        // 10:30 - 12:30 IST (Avoid / Low Volume Trap)
  | 'EURO_OVERLAP'       // 12:30 - 13:45 IST (London Open Momentum)
  | 'AFTERNOON_POWER'    // 14:00 - 15:15 IST (Power Hour HTF Expansion)
  | 'OFF_HOURS';

export interface CRTKillZoneStatus {
  currentSession: KillZoneSession;
  sessionName: string;
  isHighAccuracyWindow: boolean;
  tradeRecommendation: 'AGGRESSIVE_TRADE' | 'NORMAL_TRADE' | 'REDUCE_SIZE' | 'DO_NOT_TRADE_CHOP';
  timeWindowIST: string;
  reason: string;
  timeRemainingInSession?: string;
}

export interface SweepValidation {
  isWickOnlySweep: boolean; // True: Wick swept level, body closed inside (VALID SWEEP)
  isBodyBreakout: boolean;  // True: Candle body closed outside (BREAKOUT TRAP - DO NOT COUNTER-TRADE)
  wickLengthPoints: number;
  rejectionWickRatio: number; // % of candle that is rejection wick (e.g. 42%)
  status: 'VALID_INSTITUTIONAL_PURGE' | 'DANGEROUS_BODY_BREAKOUT' | 'PENDING_CLOSE';
  details: string;
}

export interface SMTDivergence {
  primarySymbol: string;
  correlatedSymbol: string;
  status: 'BEARISH_SMT' | 'BULLISH_SMT' | 'NEUTRAL_SYNCED';
  title: string;
  description: string;
  primaryAction: string;     // e.g. "NIFTY swept PDH (Higher High)"
  correlatedAction: string;  // e.g. "BANKNIFTY failed to sweep PDH (Lower High)"
  accuracyBoostPercent: number; // e.g. +22%
  isConfirmed: boolean;
}

export interface FiveMinDisplacementMetrics {
  candleBodyRatio: number; // e.g. 76% body
  relativeVolumeDelta: number; // e.g. 2.3x average volume
  displacementQuality: 'INSTITUTIONAL_URGENCY' | 'MODERATE' | 'WEAK_CHOP';
  fvgCleanlinessScore: number; // 0 - 100
}

export interface InstitutionalQualityScore {
  totalScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C_TRAP';
  positionSizing: '100%_FULL_SIZE' | '75%_NORMAL' | '50%_HALF_SIZE' | '0%_AVOID_TRADE';
  estimatedWinRate: string; // e.g. "88% - 94%"
  breakdown: {
    htfSweepPoints: number;      // max 25
    wickValidationPoints: number;// max 20
    smtDivergencePoints: number; // max 20
    killZonePoints: number;      // max 15
    displacementPoints: number;  // max 20
    quantumCorePoints?: number;  // max 15 (IFVG / FVG / OB / BOB confluence)
  };
  summaryVerdict: string;
}

export interface CRTLiquidityPool {
  id: string;
  type: LiquidityPoolType;
  name: string; // e.g., "Daily Buy-Side Liquidity (PDH)", "4H Sell-Side Liquidity (P4H_L)"
  price: number;
  restingOrdersType: 'BUY_STOPS' | 'SELL_STOPS';
  status: 'RESTING' | 'SWEPT' | 'PURGED';
  sweptPoints: number;
  timeframe: CRTTimeframe;
}

export interface FiveMinExecutionModel {
  htfAnchor: CRTTimeframe;
  direction: 'LONG' | 'SHORT';
  setupTitle: string;
  liquiditySwept: string; // e.g. "PDH BSL Swept (+18.4 pts)"
  sweepPrice: number;
  state: 'WAITING_FOR_5M_MSS' | 'MSS_CONFIRMED' | 'FVG_READY' | 'ENTRY_TRIGGERED';
  
  // 5-Minute Structure Levels
  fiveMinMSSLevel: number;
  fiveMinMSSStatus: 'CONFIRMED' | 'PENDING' | 'IN_PROGRESS';
  fiveMinDisplacement: string; // e.g. "Strong 5M Bearish Body Close below 24,810"
  
  // 5-Minute Fair Value Gap (FVG) / Imbalance
  fiveMinFVG: {
    top: number;
    bottom: number;
    consequentEncroachment: number; // 50% midpoint of 5M FVG
    status: 'OPEN' | 'MITIGATING' | 'FILLED';
  };
  
  // Trade Execution Levels
  optimalEntry5M: number;
  stopLoss5M: number;
  riskPoints5M: number;
  tp1EquilibriumHTF: number; // 50% EQ of the HTF candle
  tp2OppositeLiquidityHTF: number; // Opposite HTF BSL or SSL
  rewardPoints1: number;
  rewardPoints2: number;
  riskRewardRatio: string; // e.g. "1:7.8"
  
  // 5-Step Institutional Checklist
  checklist: Array<{
    step: number;
    title: string;
    description: string;
    completed: boolean;
  }>;
}

export interface CRTCandleMarking {
  timeframe: CRTTimeframe;
  periodLabel: string; // e.g. "Current Month", "Current Week", "Current Day", "Current 4H", "Current 1H"
  open: number;
  high: number;
  low: number;
  close: number;
  equilibrium: number; // (high + low) / 2
  rangeSpan: number;   // high - low
  // Levels
  highLabel: string;  // e.g. PMH, PWH, PDH, P4H_H, P1H_H
  lowLabel: string;   // e.g. PML, PWL, PDL, P4H_L, P1H_L
  openLabel: string;  // e.g. MO, WO, DO, 4HO, 1HO
  // Liquidity Pools
  bslPool: CRTLiquidityPool;
  sslPool: CRTLiquidityPool;
  inducementLevel: number;
  // State analysis relative to current price
  currentPrice: number;
  isHighSwept: boolean;
  isLowSwept: boolean;
  zone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';
  state: CRTRangeState;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  target1: number; // 50% EQ
  target2: number; // Range opposite extreme
  invalidationLevel: number;
  // High Accuracy Confluence Filters
  sweepValidation: SweepValidation;
  qualityScore: InstitutionalQualityScore;
  displacementMetrics: FiveMinDisplacementMetrics;
  // Quantum Core Structural Confluence (IFVG, FVG, OB, BOB)
  quantumStructures?: {
    fvgCount: number;
    ifvgCount: number;
    obCount: number;
    bobCount: number;
    accuracyBoost: number;
    highestConfluencePattern?: 'IFVG' | 'FVG' | 'OB' | 'BOB';
  };
  // 5-Minute Sniper Entry Plan for this timeframe
  fiveMinSetup: FiveMinExecutionModel;
}

export interface CRTMultiTFAnalysis {
  symbol: string;
  currentPrice: number;
  markings: Record<CRTTimeframe, CRTCandleMarking>;
  confluentBias: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';
  fiveMinuteSniperSetups: FiveMinExecutionModel[];
  allLiquidityPools: CRTLiquidityPool[];
  killZone: CRTKillZoneStatus;
  smtDivergence: SMTDivergence;
  quantumCore?: {
    fvgCount: number;
    ifvgCount: number;
    obCount: number;
    bobCount: number;
    accuracyBoost: number;
    highestConfluenceZone?: SMCZone;
    confluenceDescription: string;
  };
  overallQualityScore: InstitutionalQualityScore;
  activeSignals: Array<{
    timeframe: CRTTimeframe;
    type: 'BUY_SWEEP' | 'SELL_SWEEP' | 'EQ_RETEST_BUY' | 'EQ_RETEST_SELL';
    title: string;
    description: string;
    entry: number;
    stopLoss: number;
    tp1: number;
    tp2: number;
    riskReward: number;
    confidence: number;
    fiveMinExecutionGuide: string;
    grade: 'A+' | 'A' | 'B';
    killZoneCompliant: boolean;
    smtConfirmed: boolean;
  }>;
  lastUpdated: string;
}

export interface SMCPremiumDiscountMatrix {
  rangeHigh: number;
  rangeLow: number;
  equilibrium: number;
  ote62: number;
  ote705: number;
  ote79: number;
  currentZone: 'DEEP_DISCOUNT' | 'DISCOUNT' | 'EQUILIBRIUM' | 'PREMIUM' | 'DEEP_PREMIUM';
  zoneAction: string;
  percentOfRange: number;
}

export interface SMCLiquidityRaid {
  id: string;
  type: 'BSL_RAID' | 'SSL_RAID' | 'EQH_POOL' | 'EQL_POOL';
  level: number;
  timeframe: string;
  swept: boolean;
  description: string;
  trapWarning: string;
}

export interface SMCOrderFlowDelta {
  cvdDelta: number;
  absorptionState: 'BULLISH_ABSORPTION' | 'BEARISH_ABSORPTION' | 'BALANCED';
  institutionalAggression: 'HIGH_BUY' | 'HIGH_SELL' | 'NEUTRAL';
}

export interface SMCAIRefinedTrade {
  symbol: string;
  currentPrice: number;
  bias: 'STRONG_BUY_CE' | 'STRONG_BUY_PE' | 'STAND_ASIDE';
  convictionScore: number;
  grade: 'A+' | 'A' | 'B';
  entryZone: string;
  exactEntry: number;
  tightStopLoss: number;
  target1: number;
  target2: number;
  riskRewardRatio: string;
  oteMatrix: SMCPremiumDiscountMatrix;
  liquiditySwept: string;
  structureConfluence: string[];
  trapVetoAlert: string;
  hindiAdvice: string;
  englishAdvice: string;
  executionChecklist: string[];
}

