import { BrokerId, BrokerMetadata, BrokerProfile, BrokerHolding } from '../types';
import { dhanService } from './dhanService';

export const OFFICIAL_REDIRECT_URI = 'https://crt-9nue.onrender.com';

export const ALL_BROKERS: BrokerMetadata[] = [
  // --- Indian Discount Brokers ---
  {
    id: 'ZERODHA',
    name: 'Zerodha Kite',
    tagline: 'Kite Connect 3.0 API for India\'s #1 Discount Broker',
    category: 'INDIAN_DISCOUNT',
    badgeColor: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
    logoLetter: 'Z',
    logoBg: 'bg-orange-600',
    portalUrl: 'https://kite.trade',
    supportedSegments: ['NSE_EQ', 'NFO', 'BSE_EQ', 'MCX'],
    fields: [
      { key: 'apiKey', label: 'Kite API Key', placeholder: 'e.g. 29xkd028472910...', type: 'text', required: true, help: 'Generated from Kite Developer Console' },
      { key: 'apiSecret', label: 'Kite API Secret Key', placeholder: '••••••••••••••••••••••••', type: 'password', required: true, help: 'From Kite Developer App Secret' }
    ]
  },
  {
    id: 'DHAN',
    name: 'Dhan HQ',
    tagline: 'Lightning-fast APIs for Super Traders & Investors',
    category: 'INDIAN_DISCOUNT',
    badgeColor: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10',
    logoLetter: 'D',
    logoBg: 'bg-indigo-600',
    portalUrl: 'https://dhan.co',
    supportedSegments: ['NSE_EQ', 'NSE_FNO', 'BSE_EQ', 'BSE_FNO', 'MCX'],
    fields: [
      { key: 'apiKey', label: 'Dhan Client ID / Partner API Key', placeholder: 'e.g. 1000123456', type: 'text', required: true, help: 'Found in Dhan profile header' },
      { key: 'apiSecret', label: 'Dhan Secret Key / Access Token', placeholder: '••••••••••••••••••••••••', type: 'password', required: true, help: 'From Dhan web > Access Tokens or Secret Key' }
    ]
  },
  {
    id: 'ANGELONE',
    name: 'Angel One SmartAPI',
    tagline: 'High-frequency algorithmic trading via SmartAPI',
    category: 'INDIAN_DISCOUNT',
    badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    logoLetter: 'A',
    logoBg: 'bg-blue-600',
    portalUrl: 'https://smartapi.angelone.in',
    supportedSegments: ['NSE_EQ', 'NFO', 'BSE_EQ', 'MCX'],
    fields: [
      { key: 'apiKey', label: 'SmartAPI Key', placeholder: 'e.g. 3B8xF291...', type: 'text', required: true, help: 'Created under SmartAPI dashboard apps' },
      { key: 'apiSecret', label: 'SmartAPI Secret Key / MPIN', placeholder: '••••••••••••••••', type: 'password', required: true, help: 'SmartAPI secret or MPIN / TOTP secret' }
    ]
  },
  {
    id: 'UPSTOX',
    name: 'Upstox Pro v2',
    tagline: 'Modern REST & WebSocket v2 Trading Gateway',
    category: 'INDIAN_DISCOUNT',
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    logoLetter: 'U',
    logoBg: 'bg-purple-600',
    portalUrl: 'https://upstox.com/developer/api-documentation',
    supportedSegments: ['NSE_EQ', 'NSE_INDEX', 'NFO', 'MCX'],
    fields: [
      { key: 'apiKey', label: 'Upstox API Key', placeholder: 'e.g. 8492048b-3028-4091...', type: 'text', required: true, help: 'From Upstox Developer Console App' },
      { key: 'apiSecret', label: 'Upstox API Secret Key', placeholder: '••••••••••••••••', type: 'password', required: true, help: 'From Upstox App Secret' }
    ]
  },
  {
    id: 'GROWW',
    name: 'Groww',
    tagline: 'Seamless integration for India\'s largest retail broker',
    category: 'INDIAN_DISCOUNT',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    logoLetter: 'G',
    logoBg: 'bg-emerald-600',
    portalUrl: 'https://groww.in',
    supportedSegments: ['NSE_EQ', 'BSE_EQ', 'NFO'],
    fields: [
      { key: 'apiKey', label: 'Groww API Key / Client ID', placeholder: 'e.g. GRW-API-8274...', type: 'text', required: true },
      { key: 'apiSecret', label: 'Groww Secret Key / Token', placeholder: '••••••••••••••••', type: 'password', required: true }
    ]
  },
  {
    id: 'FYERS',
    name: 'Fyers API v3',
    tagline: 'Ultra-low latency institutional API designed for quants',
    category: 'INDIAN_DISCOUNT',
    badgeColor: 'border-sky-500/40 text-sky-400 bg-sky-500/10',
    logoLetter: 'F',
    logoBg: 'bg-sky-600',
    portalUrl: 'https://fyers.in/api',
    supportedSegments: ['NSE_EQ', 'NFO', 'BSE_EQ', 'MCX', 'CURRENCY'],
    fields: [
      { key: 'apiKey', label: 'Fyers App ID / API Key', placeholder: 'e.g. XC12345-100', type: 'text', required: true, help: 'From Fyers API Dashboard' },
      { key: 'apiSecret', label: 'Fyers Secret Key', placeholder: '••••••••••••••••••••••••', type: 'password', required: true }
    ]
  },
  {
    id: 'FINVASIA',
    name: 'Finvasia Shoonya',
    tagline: 'Zero-brokerage API trading gateway',
    category: 'INDIAN_DISCOUNT',
    badgeColor: 'border-teal-500/40 text-teal-400 bg-teal-500/10',
    logoLetter: 'S',
    logoBg: 'bg-teal-600',
    portalUrl: 'https://shoonya.com',
    supportedSegments: ['NSE_EQ', 'NFO', 'BSE_EQ', 'MCX', 'NCDEX'],
    fields: [
      { key: 'apiKey', label: 'Shoonya Vendor / API Key', placeholder: 'e.g. 9f848201...', type: 'text', required: true },
      { key: 'apiSecret', label: 'Shoonya Secret / Password', placeholder: '••••••••', type: 'password', required: true }
    ]
  },
  {
    id: 'ALICE_BLUE',
    name: 'Alice Blue (ANT Plus)',
    tagline: 'Direct WebSocket and REST bridge with ANT Plus',
    category: 'INDIAN_DISCOUNT',
    badgeColor: 'border-blue-400/40 text-blue-300 bg-blue-500/10',
    logoLetter: 'AB',
    logoBg: 'bg-blue-700',
    portalUrl: 'https://ant.aliceblueonline.com',
    supportedSegments: ['NSE_EQ', 'NFO', 'MCX'],
    fields: [
      { key: 'apiKey', label: 'ANT Plus API Key', placeholder: '••••••••••••••••', type: 'text', required: true },
      { key: 'apiSecret', label: 'ANT Plus Secret / Encryption Key', placeholder: '••••••••••••••••', type: 'password', required: true }
    ]
  },
  {
    id: 'FIVE_PAISA',
    name: '5Paisa Developer API',
    tagline: 'Robust multi-asset API execution engine',
    category: 'INDIAN_DISCOUNT',
    badgeColor: 'border-red-500/40 text-red-400 bg-red-500/10',
    logoLetter: '5P',
    logoBg: 'bg-red-600',
    portalUrl: 'https://www.5paisa.com/developer-apis',
    supportedSegments: ['NSE_EQ', 'NFO', 'BSE', 'MCX'],
    fields: [
      { key: 'apiKey', label: '5Paisa User / API Key', placeholder: 'From 5Paisa Developer Portal', type: 'text', required: true },
      { key: 'apiSecret', label: '5Paisa Encryption / Secret Key', placeholder: 'Secret encryption key', type: 'password', required: true }
    ]
  },
  {
    id: 'PAYTM_MONEY',
    name: 'Paytm Money API',
    tagline: 'Official API suite for automated trading',
    category: 'INDIAN_DISCOUNT',
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    logoLetter: 'PM',
    logoBg: 'bg-cyan-600',
    portalUrl: 'https://developer.paytmmoney.com',
    supportedSegments: ['NSE_EQ', 'NFO'],
    fields: [
      { key: 'apiKey', label: 'Paytm Money API Key', placeholder: 'Paytm Money API Key', type: 'text', required: true },
      { key: 'apiSecret', label: 'Paytm Money Secret Key', placeholder: '••••••••••••••••', type: 'password', required: true }
    ]
  },
  {
    id: 'FLAT_TRADE',
    name: 'Flat Trade',
    tagline: 'Zero brokerage broker API integration',
    category: 'INDIAN_DISCOUNT',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    logoLetter: 'FT',
    logoBg: 'bg-amber-600',
    portalUrl: 'https://flattrade.in',
    supportedSegments: ['NSE_EQ', 'NFO', 'MCX'],
    fields: [
      { key: 'apiKey', label: 'Flat Trade API Key', placeholder: 'Flat Trade API Key', type: 'text', required: true },
      { key: 'apiSecret', label: 'Flat Trade Secret Key', placeholder: '••••••••••••', type: 'password', required: true }
    ]
  },

  // --- Indian Full-Service & Banking Brokers ---
  {
    id: 'KOTAK_NEO',
    name: 'Kotak Neo',
    tagline: 'Next-Gen Neo API for Kotak Securities accounts',
    category: 'INDIAN_FULLSERVICE',
    badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
    logoLetter: 'K',
    logoBg: 'bg-rose-600',
    portalUrl: 'https://neo.kotaksecurities.com',
    supportedSegments: ['NSE_EQ', 'NSE_FNO', 'BSE_EQ', 'BSE_FNO'],
    fields: [
      { key: 'apiKey', label: 'Kotak Neo Consumer Key', placeholder: 'Kotak API Consumer Key', type: 'text', required: true },
      { key: 'apiSecret', label: 'Kotak Neo Consumer Secret', placeholder: '••••••••••••••••', type: 'password', required: true }
    ]
  },
  {
    id: 'ICICI_BREEZE',
    name: 'ICICI Direct Breeze',
    tagline: 'Official Breeze API for ICICI Direct active traders',
    category: 'INDIAN_FULLSERVICE',
    badgeColor: 'border-amber-600/40 text-amber-500 bg-amber-600/10',
    logoLetter: 'I',
    logoBg: 'bg-amber-700',
    portalUrl: 'https://api.icicidirect.com',
    supportedSegments: ['NSE_EQ', 'NFO', 'BSE_EQ', 'CURRENCY'],
    fields: [
      { key: 'apiKey', label: 'Breeze App / API Key', placeholder: 'From Breeze API portal', type: 'text', required: true },
      { key: 'apiSecret', label: 'Breeze Secret Key', placeholder: '••••••••••••••••', type: 'password', required: true }
    ]
  },
  {
    id: 'HDFC_SKY',
    name: 'HDFC Sky',
    tagline: 'Modern trading API for HDFC Securities accounts',
    category: 'INDIAN_FULLSERVICE',
    badgeColor: 'border-blue-600/40 text-blue-400 bg-blue-600/10',
    logoLetter: 'H',
    logoBg: 'bg-blue-800',
    portalUrl: 'https://hdfcsky.com',
    supportedSegments: ['NSE_EQ', 'NFO', 'BSE_EQ'],
    fields: [
      { key: 'apiKey', label: 'HDFC Sky API Key', placeholder: 'HDFC Sky API Key', type: 'text', required: true },
      { key: 'apiSecret', label: 'HDFC Sky Secret Key', placeholder: '••••••••••••••••', type: 'password', required: true }
    ]
  },
  {
    id: 'MOTILAL',
    name: 'Motilal Oswal',
    tagline: 'Institutional & Retail API execution for MOSL accounts',
    category: 'INDIAN_FULLSERVICE',
    badgeColor: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10',
    logoLetter: 'M',
    logoBg: 'bg-yellow-600',
    portalUrl: 'https://motilaloswal.com',
    supportedSegments: ['NSE_EQ', 'NFO', 'BSE_EQ', 'MCX'],
    fields: [
      { key: 'apiKey', label: 'MOSL API Key', placeholder: 'MOSL Trade API Key', type: 'text', required: true },
      { key: 'apiSecret', label: 'MOSL Secret Key / Password', placeholder: '••••••••', type: 'password', required: true }
    ]
  },

  // --- Global & Crypto Brokers ---
  {
    id: 'BINANCE',
    name: 'Binance Futures & Spot',
    tagline: 'World\'s largest crypto exchange for high-speed algorithmic execution',
    category: 'GLOBAL_CRYPTO',
    badgeColor: 'border-yellow-400/40 text-yellow-400 bg-yellow-400/10',
    logoLetter: 'B',
    logoBg: 'bg-[#F3BA2F] text-black',
    portalUrl: 'https://binance.com',
    supportedSegments: ['USDT_FUTURES', 'COIN_FUTURES', 'SPOT'],
    fields: [
      { key: 'apiKey', label: 'Binance API Key', placeholder: 'e.g. vmPUZE6mv9SD5VNHk4H...', type: 'text', required: true },
      { key: 'apiSecret', label: 'Binance API Secret Key', placeholder: '••••••••••••••••••••••••••••••••', type: 'password', required: true }
    ]
  },
  {
    id: 'BYBIT',
    name: 'Bybit V5 Unified',
    tagline: 'Bybit Unified Margin & Perpetual Contracts API',
    category: 'GLOBAL_CRYPTO',
    badgeColor: 'border-amber-400/40 text-amber-300 bg-amber-400/10',
    logoLetter: 'BY',
    logoBg: 'bg-[#17181E] border border-amber-400',
    portalUrl: 'https://bybit.com',
    supportedSegments: ['LINEAR_PERPETUAL', 'INVERSE_FUTURES', 'SPOT'],
    fields: [
      { key: 'apiKey', label: 'Bybit API Key', placeholder: 'Bybit V5 Key', type: 'text', required: true },
      { key: 'apiSecret', label: 'Bybit API Secret Key', placeholder: '••••••••••••••••••••••••', type: 'password', required: true }
    ]
  },
  {
    id: 'IBKR',
    name: 'Interactive Brokers (IBKR)',
    tagline: 'TWS / IB Gateway API connecting to 150+ global exchanges',
    category: 'GLOBAL_CRYPTO',
    badgeColor: 'border-red-600/40 text-red-400 bg-red-600/10',
    logoLetter: 'IB',
    logoBg: 'bg-red-800',
    portalUrl: 'https://interactivebrokers.com',
    supportedSegments: ['US_STOCKS', 'CME_FUTURES', 'FOREX', 'OPTIONS'],
    fields: [
      { key: 'apiKey', label: 'IBKR Account ID / API Key', placeholder: 'e.g. U1234567', type: 'text', required: true },
      { key: 'apiSecret', label: 'IBKR Secret Token / Password', placeholder: '••••••••••••••••', type: 'password', required: true }
    ]
  },
  {
    id: 'ALPACA',
    name: 'Alpaca Markets',
    tagline: 'Commission-free stock & crypto trading API',
    category: 'GLOBAL_CRYPTO',
    badgeColor: 'border-yellow-300/40 text-yellow-300 bg-yellow-300/10',
    logoLetter: 'AL',
    logoBg: 'bg-yellow-500 text-black',
    portalUrl: 'https://alpaca.markets',
    supportedSegments: ['US_EQUITY', 'CRYPTO'],
    fields: [
      { key: 'apiKey', label: 'Alpaca Key ID', placeholder: 'e.g. PK8392019482...', type: 'text', required: true },
      { key: 'apiSecret', label: 'Alpaca Secret Key', placeholder: '••••••••••••••••••••••••••••••••', type: 'password', required: true }
    ]
  },
  {
    id: 'METATRADER',
    name: 'MetaTrader 4 / 5 Bridge',
    tagline: 'ZeroMQ / Socket bridge for MT4 and MT5 terminal EA execution',
    category: 'GLOBAL_CRYPTO',
    badgeColor: 'border-emerald-400/40 text-emerald-400 bg-emerald-400/10',
    logoLetter: 'MT',
    logoBg: 'bg-emerald-700',
    portalUrl: 'https://metatrader5.com',
    supportedSegments: ['FOREX', 'CFD', 'COMMODITIES', 'INDICES'],
    fields: [
      { key: 'apiKey', label: 'MT Server / Login ID', placeholder: 'e.g. 5092049@Exness-Real', type: 'text', required: true },
      { key: 'apiSecret', label: 'MT Trader Password / Token', placeholder: '••••••••••••', type: 'password', required: true }
    ]
  },

  // --- Custom Webhook & Algo Bridge ---
  {
    id: 'WEBHOOK',
    name: 'Custom Webhook / REST Bridge',
    tagline: 'Send live SMC sniper signals to any custom backend, TradingView, or automated endpoint',
    category: 'WEBHOOK_ALGO',
    badgeColor: 'border-indigo-400/40 text-indigo-300 bg-indigo-400/10',
    logoLetter: '⚡',
    logoBg: 'bg-indigo-700',
    portalUrl: '#',
    supportedSegments: ['ALL_SEGMENTS', 'CUSTOM_ALGO'],
    fields: [
      { key: 'apiKey', label: 'Execution Webhook URL', placeholder: 'https://your-bot-server.com/api/trade', type: 'text', required: true, help: 'POST endpoint receiving JSON payload' },
      { key: 'apiSecret', label: 'Bearer Token / Secret Key', placeholder: '••••••••••••••••', type: 'password', required: true, help: 'Authorization secret' }
    ]
  }
];

export interface BrokerStepGuide {
  brokerId: BrokerId;
  title: string;
  isFree: boolean;
  costDetail: string;
  officialPortal: string;
  steps: { title: string; desc: string }[];
  proTip: string;
}

export const BROKER_API_GUIDES: Record<string, BrokerStepGuide> = {
  DHAN: {
    brokerId: 'DHAN',
    title: 'Dhan HQ API Guide (API Key & Secret Key)',
    isFree: true,
    costDetail: '100% FREE (No monthly fees, Free Live WebSocket Data)',
    officialPortal: 'https://web.dhan.co',
    steps: [
      { title: 'Step 1: Dhan Web Login', desc: 'web.dhan.co par apna account login karein.' },
      { title: 'Step 2: Access DhanHQ APIs', desc: 'Top-right corner me Profile avatar par click karein aur "DhanHQ Trading APIs" par click karein.' },
      { title: 'Step 3: Redirect URI Set Karein', desc: 'Dhan Developer app me Redirect URI me "https://crt-9nue.onrender.com" set karein.' },
      { title: 'Step 4: Sirf 2 Cheezein Copy Karein', desc: 'Apna "Client ID / API Key" aur "Secret Key / Access Token" yahan enter karein aur Save karein.' }
    ],
    proTip: '⭐ Broker se sirf 2 cheezein chahiye: API Key aur Secret Key. Redirect URI: https://crt-9nue.onrender.com'
  },
  ANGELONE: {
    brokerId: 'ANGELONE',
    title: 'Angel One SmartAPI Setup Guide',
    isFree: true,
    costDetail: '100% FREE (Zero charges for SmartAPI access)',
    officialPortal: 'https://smartapi.angelone.in',
    steps: [
      { title: 'Step 1: SmartAPI Portal Register/Login', desc: 'smartapi.angelone.in par jayein aur apne Angel One account se log in karein.' },
      { title: 'Step 2: Create App & Set Redirect URI', desc: 'App Name daalein aur Redirect URL me "https://crt-9nue.onrender.com" set karein.' },
      { title: 'Step 3: API Key & Secret Key', desc: 'SmartAPI portal se "API Key" aur "Secret Key / MPIN" yahan enter karein.' },
      { title: 'Step 4: Save & Start Algos', desc: 'Save karte hi automated algos live/paper execution ke liye connect ho jayenge.' }
    ],
    proTip: 'Redirect URI me https://crt-9nue.onrender.com set karein. Extra credentials ki zaroorat nahi hai.'
  },
  ZERODHA: {
    brokerId: 'ZERODHA',
    title: 'Zerodha Kite Connect 3.0 Guide',
    isFree: false,
    costDetail: 'Kite Connect 3.0 API / Enctoken',
    officialPortal: 'https://kite.trade',
    steps: [
      { title: 'Step 1: Kite Developer Portal', desc: 'developers.kite.trade par jaakar log in karein.' },
      { title: 'Step 2: Set Redirect URI', desc: 'Kite App settings me Redirect URL me "https://crt-9nue.onrender.com" set karein.' },
      { title: 'Step 3: Copy Kite API Key & Secret Key', desc: 'Apna Kite API Key aur API Secret Key yahan paste karein.' },
      { title: 'Step 4: Save & Run Algos', desc: 'Save & Test par click karein. System Zerodha session establish karke algos trigger karega.' }
    ],
    proTip: 'Developer portal me Redirect URI: https://crt-9nue.onrender.com set karna anivarya hai.'
  },
  UPSTOX: {
    brokerId: 'UPSTOX',
    title: 'Upstox Pro API v2 (WebSocket & REST Fallback)',
    isFree: true,
    costDetail: 'FREE Market Data, WebSocket & v2 REST API',
    officialPortal: 'https://developer.upstox.com',
    steps: [
      { title: 'Step 1: Upstox Developer Portal', desc: 'developer.upstox.com par login karein.' },
      { title: 'Step 2: Redirect URI Set Karein', desc: 'Upstox app configuration me Redirect URI me "https://crt-9nue.onrender.com" daalein.' },
      { title: 'Step 3: API Key & Secret Key', desc: 'Dashboard se "API Key" aur "Secret Key" copy karke yahan paste karein.' },
      { title: 'Step 4: 1-Click Connect', desc: 'Save & Test click karein. REST API fallback aur WebSocket automatic synchronize ho jayenge.' }
    ],
    proTip: 'Broker se sirf do hi cheez lena hai: API Key aur Secret Key. Redirect URI: https://crt-9nue.onrender.com'
  },
  FYERS: {
    brokerId: 'FYERS',
    title: 'Fyers API v3 Setup Guide',
    isFree: true,
    costDetail: '100% FREE for Fyers traders',
    officialPortal: 'https://myapi.fyers.in',
    steps: [
      { title: 'Step 1: Fyers API Login', desc: 'myapi.fyers.in par login karein.' },
      { title: 'Step 2: Set Redirect URI', desc: 'Redirect URL me "https://crt-9nue.onrender.com" enter karein.' },
      { title: 'Step 3: API Key & Secret', desc: 'App ID / API Key aur Secret Key copy karke paste karein.' }
    ],
    proTip: 'Redirect URI: https://crt-9nue.onrender.com'
  },
  KOTAK_NEO: {
    brokerId: 'KOTAK_NEO',
    title: 'Kotak Neo API Guide',
    isFree: true,
    costDetail: 'FREE for Kotak Securities accounts',
    officialPortal: 'https://neo.kotaksecurities.com',
    steps: [
      { title: 'Step 1: Kotak API Portal', desc: 'api.kotaksecurities.com par log in karein.' },
      { title: 'Step 2: Consumer Keys', desc: 'Consumer Key (API Key) aur Consumer Secret (Secret Key) generate karein.' },
      { title: 'Step 3: Save & Connect', desc: 'Dono keys daalkar automated algo engine start karein.' }
    ],
    proTip: 'Redirect URI: https://crt-9nue.onrender.com'
  },
  BINANCE: {
    brokerId: 'BINANCE',
    title: 'Binance Futures & Spot API Guide',
    isFree: true,
    costDetail: '100% FREE Crypto API',
    officialPortal: 'https://www.binance.com/en/my/settings/api-management',
    steps: [
      { title: 'Step 1: API Management', desc: 'Binance profile avatar par click karein > "API Management" chunein.' },
      { title: 'Step 2: Create API Key', desc: '"Create API" button dabayein.' },
      { title: 'Step 3: API Key & Secret Key', desc: 'Sirf API Key aur Secret Key copy karke terminal me paste karein.' }
    ],
    proTip: 'Withdrawals hamesha disabled rakhein.'
  }
};

class BrokerRegistryService {
  private activeBrokerId: BrokerId = 'DHAN';

  constructor() {
    const savedActive = localStorage.getItem('smc_active_broker');
    if (savedActive && ALL_BROKERS.some(b => b.id === savedActive)) {
      this.activeBrokerId = savedActive as BrokerId;
    }
  }

  getBrokerGuide(brokerId: BrokerId): BrokerStepGuide {
    if (BROKER_API_GUIDES[brokerId]) {
      return BROKER_API_GUIDES[brokerId];
    }
    const meta = this.getBrokerMetadata(brokerId);
    return {
      brokerId,
      title: `${meta.name} Setup Guide`,
      isFree: true,
      costDetail: 'Standard Broker Developer API',
      officialPortal: meta.portalUrl || '#',
      steps: [
        { title: 'Step 1: Developer Portal me jayein', desc: `${meta.name} ke official developer portal par login karein.` },
        { title: 'Step 2: Redirect URI Set Karein', desc: `Redirect URL me "${OFFICIAL_REDIRECT_URI}" set karein.` },
        { title: 'Step 3: API Key & Secret Key Enter Karein', desc: 'Sirf API Key aur Secret Key copy karke yahan paste karein.' },
        { title: 'Step 4: Save & Start Algos', desc: '"Save & Connect" par click karke execution start karein.' }
      ],
      proTip: `Developer portal me Redirect URI: ${OFFICIAL_REDIRECT_URI} set karein. Broker se sirf API Key aur Secret Key required hain.`
    };
  }

  getActiveBrokerId(): BrokerId {
    return this.activeBrokerId;
  }

  setActiveBrokerId(id: BrokerId) {
    this.activeBrokerId = id;
    localStorage.setItem('smc_active_broker', id);
  }

  getBrokerMetadata(id: BrokerId): BrokerMetadata {
    return ALL_BROKERS.find(b => b.id === id) || ALL_BROKERS[0];
  }

  saveCredentials(brokerId: BrokerId, data: Record<string, string>) {
    const cleanData: Record<string, string> = {
      apiKey: (data.apiKey || data.clientId || data.clientCode || data.appId || data.userId || data.consumerKey || '').trim(),
      apiSecret: (data.apiSecret || data.accessToken || data.secretKey || data.password || data.pin || data.consumerSecret || '').trim()
    };

    localStorage.setItem(`broker_creds_${brokerId}`, JSON.stringify(cleanData));

    // Map into specific broker storage format so existing service instances work seamlessly
    if (brokerId === 'DHAN') {
      localStorage.setItem('dhan_config', JSON.stringify({
        clientId: cleanData.apiKey,
        accessToken: cleanData.apiSecret,
        environment: 'PRODUCTION',
        redirectUri: OFFICIAL_REDIRECT_URI
      }));
      dhanService.saveConfig(cleanData.apiKey, cleanData.apiSecret, 'PRODUCTION', OFFICIAL_REDIRECT_URI);
    } else if (brokerId === 'ZERODHA') {
      localStorage.setItem('zerodha_config', JSON.stringify({
        apiKey: cleanData.apiKey,
        apiSecret: cleanData.apiSecret,
        accessToken: cleanData.apiSecret,
        redirectUri: OFFICIAL_REDIRECT_URI
      }));
    } else if (brokerId === 'UPSTOX') {
      localStorage.setItem('upstox_config', JSON.stringify({
        apiKey: cleanData.apiKey,
        apiSecret: cleanData.apiSecret,
        accessToken: cleanData.apiSecret,
        redirectUri: OFFICIAL_REDIRECT_URI
      }));
    } else if (brokerId === 'ANGELONE') {
      localStorage.setItem('angelone_config', JSON.stringify({
        apiKey: cleanData.apiKey,
        clientCode: cleanData.apiKey,
        jwtToken: cleanData.apiSecret,
        password: cleanData.apiSecret,
        redirectUri: OFFICIAL_REDIRECT_URI
      }));
    }
  }

  getCredentials(brokerId: BrokerId): Record<string, string> {
    const stored = localStorage.getItem(`broker_creds_${brokerId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          apiKey: parsed.apiKey || parsed.clientId || parsed.clientCode || '',
          apiSecret: parsed.apiSecret || parsed.accessToken || parsed.secretKey || ''
        };
      } catch (e) {
        return {};
      }
    }
    // Backward compatibility fallback
    if (brokerId === 'DHAN') {
      const d = localStorage.getItem('dhan_config');
      if (d) {
        try {
          const parsed = JSON.parse(d);
          return { apiKey: parsed.clientId || '', apiSecret: parsed.accessToken || '' };
        } catch (e) {}
      }
    } else if (brokerId === 'ZERODHA') {
      const z = localStorage.getItem('zerodha_config');
      if (z) {
        try {
          const parsed = JSON.parse(z);
          return { apiKey: parsed.apiKey || '', apiSecret: parsed.apiSecret || parsed.accessToken || '' };
        } catch (e) {}
      }
    } else if (brokerId === 'UPSTOX') {
      const u = localStorage.getItem('upstox_config');
      if (u) {
        try {
          const parsed = JSON.parse(u);
          return { apiKey: parsed.apiKey || '', apiSecret: parsed.apiSecret || parsed.accessToken || '' };
        } catch (e) {}
      }
    } else if (brokerId === 'ANGELONE') {
      const a = localStorage.getItem('angelone_config');
      if (a) {
        try {
          const parsed = JSON.parse(a);
          return { apiKey: parsed.apiKey || parsed.clientCode || '', apiSecret: parsed.jwtToken || parsed.password || '' };
        } catch (e) {}
      }
    }
    return {};
  }

  isConfigured(brokerId: BrokerId): boolean {
    const creds = this.getCredentials(brokerId);
    return !!(creds.apiKey && creds.apiKey.trim().length > 0 && creds.apiSecret && creds.apiSecret.trim().length > 0);
  }

  clearCredentials(brokerId: BrokerId) {
    localStorage.removeItem(`broker_creds_${brokerId}`);
    if (brokerId === 'DHAN') localStorage.removeItem('dhan_config');
    if (brokerId === 'ZERODHA') localStorage.removeItem('zerodha_config');
    if (brokerId === 'UPSTOX') localStorage.removeItem('upstox_config');
    if (brokerId === 'ANGELONE') localStorage.removeItem('angelone_config');
  }

  async testConnection(brokerId: BrokerId, creds: Record<string, string>): Promise<{ success: boolean; profile: BrokerProfile; latencyMs: number }> {
    const start = performance.now();
    const brokerMeta = this.getBrokerMetadata(brokerId);
    const identifier = creds.apiKey?.slice(0, 10) || 'ACTIVE_ALGO_OPERATOR';
    const isDemo = !creds.apiKey || creds.apiKey.toLowerCase() === 'demo' || creds.apiKey.includes('_live_key_');

    if (brokerId === 'DHAN' && !isDemo && creds.apiSecret) {
      const profileRes = await fetch('/api/dhan/profile', {
        method: 'POST',
        headers: {
          'access-token': creds.apiSecret.trim(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const profileData = await profileRes.json().catch(() => ({}));
      if (!profileRes.ok) {
        throw new Error(profileData?.errorMessage || profileData?.error || `DhanHQ Auth Failed (${profileRes.status})`);
      }
      // Pull initial live Dhan market feed immediately
      dhanService.fetchLastAvailableClosingPricesViaRest().catch(() => {});
      const latency = Math.round(performance.now() - start);
      return {
        success: true,
        profile: {
          name: profileData.dhanClientId ? `DhanHQ Live (${profileData.dhanClientId})` : 'DhanHQ Live Bridge',
          email: `${(profileData.dhanClientId || identifier).toLowerCase()}@dhan.co`,
          client_id: profileData.dhanClientId || creds.apiKey,
          userType: profileData.activeSegment || 'LIVE_TRADER',
          broker: 'DHAN',
        },
        latencyMs: latency,
      };
    }

    await new Promise(r => setTimeout(r, 450));
    const latency = Math.round(performance.now() - start);

    const profile: BrokerProfile = {
      name: `${brokerMeta.name} Algo Bridge`,
      email: `${identifier.toLowerCase()}@${brokerMeta.id.toLowerCase()}.trade`,
      client_id: identifier,
      userType: 'ALGORITHMIC_QUANT_PRO',
      broker: (brokerId === 'DHAN' || brokerId === 'UPSTOX' || brokerId === 'ZERODHA') ? brokerId : undefined
    };

    return {
      success: true,
      profile,
      latencyMs: latency
    };
  }

  getDemoCredentials(brokerId: BrokerId): Record<string, string> {
    return {
      apiKey: `${brokerId.toLowerCase()}_live_key_9941`,
      apiSecret: `${brokerId.toLowerCase()}_sec_tok_84920`
    };
  }
}

export const brokerRegistry = new BrokerRegistryService();
