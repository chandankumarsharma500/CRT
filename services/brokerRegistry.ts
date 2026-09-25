import { BrokerId, BrokerMetadata, BrokerProfile, BrokerHolding } from '../types';

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
      { key: 'clientId', label: 'Zerodha User ID', placeholder: 'e.g. AB1234', type: 'text', required: true, help: 'Your 6-character Kite User ID' },
      { key: 'apiKey', label: 'Kite API Key', placeholder: 'e.g. 29xkd028472910...', type: 'password', required: true, help: 'Generated from Kite Developer Console' },
      { key: 'apiSecret', label: 'Kite API Secret', placeholder: '••••••••••••••••••••••••', type: 'password', required: true, help: 'Keep confidential' },
      { key: 'accessToken', label: 'Enctoken / Access Token / TOTP', placeholder: 'Access token from morning auth', type: 'password', required: true, help: 'Daily Kite access token or TOTP key' }
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
      { key: 'clientId', label: 'Dhan Client ID', placeholder: 'e.g. 1000123456', type: 'text', required: true, help: 'Found in Dhan profile header' },
      { key: 'accessToken', label: 'Dhan Access Token (JWT)', placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', type: 'password', required: true, help: 'Generated from Dhan web > Profile > Access Tokens' },
      { key: 'environment', label: 'Environment', placeholder: 'PRODUCTION', type: 'text', defaultValue: 'PRODUCTION', help: 'PRODUCTION or SANDBOX' }
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
      { key: 'clientId', label: 'Client Code', placeholder: 'e.g. A123456', type: 'text', required: true, help: 'Angel One trading account code' },
      { key: 'pin', label: 'Trading PIN / MPIN', placeholder: 'e.g. 1234', type: 'password', required: true, help: 'Your 4-digit Angel One MPIN' },
      { key: 'apiKey', label: 'SmartAPI Key', placeholder: 'e.g. 3B8xF291...', type: 'password', required: true, help: 'Created under SmartAPI dashboard apps' },
      { key: 'totpSecret', label: 'TOTP Secret Key / JWT Token', placeholder: 'Authenticator TOTP seed key', type: 'password', required: true, help: 'Used for automatic 2FA session renewal' }
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
      { key: 'apiKey', label: 'Upstox API Key', placeholder: 'e.g. 8492048b-3028-4091...', type: 'text', required: true },
      { key: 'apiSecret', label: 'API Secret', placeholder: '••••••••••••••••', type: 'password', required: true },
      { key: 'redirectUri', label: 'Redirect URI', placeholder: 'http://localhost:3000', type: 'text', defaultValue: 'http://localhost:3000' },
      { key: 'accessToken', label: 'OAuth Access Token', placeholder: 'OAuth 2.0 Bearer access token', type: 'password', required: true }
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
      { key: 'clientId', label: 'Groww User / Mobile ID', placeholder: 'e.g. 9876543210', type: 'text', required: true },
      { key: 'apiKey', label: 'Partner API Key', placeholder: 'e.g. GRW-API-8274...', type: 'password', required: true },
      { key: 'accessToken', label: 'Bearer Auth Token', placeholder: 'Session auth token or TOTP', type: 'password', required: true }
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
      { key: 'appId', label: 'App ID (Client ID - App)', placeholder: 'e.g. XC12345-100', type: 'text', required: true, help: 'From Fyers API Dashboard' },
      { key: 'secretKey', label: 'App Secret Key', placeholder: '••••••••••••••••••••••••', type: 'password', required: true },
      { key: 'accessToken', label: 'Access Token', placeholder: 'Fyers API v3 generated token', type: 'password', required: true }
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
      { key: 'userId', label: 'Shoonya User ID', placeholder: 'e.g. FA12345', type: 'text', required: true },
      { key: 'password', label: 'Account Password', placeholder: '••••••••', type: 'password', required: true },
      { key: 'vendorKey', label: 'Vendor / API Key', placeholder: 'e.g. 9f848201...', type: 'password', required: true },
      { key: 'twoFa', label: 'TOTP / 2FA Key', placeholder: '6-digit TOTP secret', type: 'password', required: true }
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
      { key: 'userId', label: 'Alice Blue User ID', placeholder: 'e.g. 543210', type: 'text', required: true },
      { key: 'apiKey', label: 'ANT Plus API Key', placeholder: '••••••••••••••••', type: 'password', required: true },
      { key: 'encryptionKey', label: 'Encryption Key / Session Token', placeholder: 'Auto generated session', type: 'password' }
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
      { key: 'clientCode', label: 'Client Code', placeholder: 'e.g. 50012345', type: 'text', required: true },
      { key: 'userKey', label: 'User Key', placeholder: 'From 5Paisa Developer Portal', type: 'password', required: true },
      { key: 'encryptionKey', label: 'Encryption Key', placeholder: 'Secret encryption key', type: 'password', required: true },
      { key: 'password', label: 'PIN / Password', placeholder: '••••••••', type: 'password', required: true }
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
      { key: 'apiKey', label: 'API Key', placeholder: 'Paytm Money API Key', type: 'text', required: true },
      { key: 'apiSecret', label: 'API Secret', placeholder: '••••••••••••••••', type: 'password', required: true },
      { key: 'accessToken', label: 'Request Token / JWT', placeholder: 'Session accessToken', type: 'password', required: true }
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
      { key: 'clientId', label: 'Client ID', placeholder: 'e.g. FT1234', type: 'text', required: true },
      { key: 'apiKey', label: 'API Key', placeholder: 'Flat Trade API Key', type: 'password', required: true },
      { key: 'accessToken', label: 'Secret Token', placeholder: '••••••••••••', type: 'password', required: true }
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
      { key: 'consumerKey', label: 'Consumer Key', placeholder: 'Kotak API Consumer Key', type: 'text', required: true },
      { key: 'consumerSecret', label: 'Consumer Secret', placeholder: '••••••••••••••••', type: 'password', required: true },
      { key: 'mobile', label: 'Registered Mobile Number', placeholder: '+919876543210', type: 'text', required: true },
      { key: 'password', label: 'Neo Password', placeholder: '••••••••', type: 'password', required: true }
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
      { key: 'appKey', label: 'Breeze App Key', placeholder: 'From Breeze API portal', type: 'text', required: true },
      { key: 'secretKey', label: 'Secret Key', placeholder: '••••••••••••••••', type: 'password', required: true },
      { key: 'sessionToken', label: 'Session Token (Login Token)', placeholder: 'Daily 2FA session token', type: 'password', required: true }
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
      { key: 'clientId', label: 'HDFC Sky User ID', placeholder: 'e.g. SKY12345', type: 'text', required: true },
      { key: 'apiKey', label: 'API Key', placeholder: 'HDFC Sky API Key', type: 'password', required: true },
      { key: 'accessToken', label: 'Access Token', placeholder: '••••••••••••••••', type: 'password', required: true }
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
      { key: 'clientCode', label: 'Client Code', placeholder: 'e.g. MO12345', type: 'text', required: true },
      { key: 'apiKey', label: 'API Key', placeholder: 'MOSL Trade API Key', type: 'password', required: true },
      { key: 'password', label: 'Trading Password', placeholder: '••••••••', type: 'password', required: true }
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
      { key: 'apiSecret', label: 'API Secret Key', placeholder: '••••••••••••••••••••••••••••••••', type: 'password', required: true },
      { key: 'testnet', label: 'Environment', placeholder: 'mainnet', type: 'text', defaultValue: 'mainnet', help: 'mainnet or testnet' }
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
      { key: 'apiSecret', label: 'API Secret', placeholder: '••••••••••••••••••••••••', type: 'password', required: true },
      { key: 'testnet', label: 'Network', placeholder: 'mainnet', type: 'text', defaultValue: 'mainnet' }
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
      { key: 'accountId', label: 'IBKR Account ID', placeholder: 'e.g. U1234567', type: 'text', required: true },
      { key: 'host', label: 'Gateway Host', placeholder: '127.0.0.1', type: 'text', defaultValue: '127.0.0.1' },
      { key: 'port', label: 'TWS / Gateway Port', placeholder: '7497', type: 'text', defaultValue: '7497', help: '7497 for TWS paper, 7496 for live, 4001 for IB Gateway' },
      { key: 'clientId', label: 'Client ID', placeholder: '1', type: 'text', defaultValue: '1' }
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
      { key: 'apiSecret', label: 'Secret Key', placeholder: '••••••••••••••••••••••••••••••••', type: 'password', required: true },
      { key: 'paper', label: 'Environment', placeholder: 'paper', type: 'text', defaultValue: 'paper', help: 'paper or live' }
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
      { key: 'server', label: 'MT Server Name', placeholder: 'e.g. Exness-Real10 or FTMO-Server', type: 'text', required: true },
      { key: 'login', label: 'MT Account Login ID', placeholder: 'e.g. 5092049', type: 'text', required: true },
      { key: 'password', label: 'Trader Password', placeholder: '••••••••••••', type: 'password', required: true },
      { key: 'bridgePort', label: 'Bridge / ZeroMQ Port', placeholder: '5555', type: 'text', defaultValue: '5555' }
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
      { key: 'webhookUrl', label: 'Execution Webhook URL', placeholder: 'https://your-bot-server.com/api/trade', type: 'text', required: true, help: 'POST endpoint receiving JSON payload' },
      { key: 'token', label: 'Bearer Token / Secret Key', placeholder: '••••••••••••••••', type: 'password', help: 'Authorization header secret' },
      { key: 'format', label: 'Payload Format', placeholder: 'JSON', type: 'text', defaultValue: 'JSON', help: 'JSON or Custom Text' }
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
    title: 'Dhan HQ API & Token Guide',
    isFree: true,
    costDetail: '100% FREE (No monthly fees, Free Live WebSocket Data)',
    officialPortal: 'https://web.dhan.co',
    steps: [
      { title: 'Step 1: Dhan Web Login', desc: 'web.dhan.co par apna account login karein.' },
      { title: 'Step 2: Access DhanHQ APIs', desc: 'Top-right corner me Profile avatar par click karein aur "DhanHQ Trading APIs" par click karein.' },
      { title: 'Step 3: Generate Access Token', desc: '"Access Tokens" tab me jayein aur "Generate Access Token" par click karein (Validity: 30 days select karein).' },
      { title: 'Step 4: Copy & Paste', desc: 'Apna "Client ID" aur "Access Token" copy karke terminal me paste karein aur Save karein.' }
    ],
    proTip: '⭐ RECOMMENDED: Dhan HQ sabse best hai kyunki ye 100% FREE live tick data deta hai bina kisi subscription charge ke.'
  },
  ANGELONE: {
    brokerId: 'ANGELONE',
    title: 'Angel One SmartAPI Setup Guide',
    isFree: true,
    costDetail: '100% FREE (Zero charges for SmartAPI access)',
    officialPortal: 'https://smartapi.angelone.in',
    steps: [
      { title: 'Step 1: SmartAPI Portal Register/Login', desc: 'smartapi.angelone.in par jayein aur apne Angel One account se log in karein.' },
      { title: 'Step 2: Create App', desc: '"My Apps" par click karein > "Create an app" chunein > App Name: "SMC Quant" daalein.' },
      { title: 'Step 3: Redirect URL Configuration', desc: 'Redirect URL me "http://localhost:3000" enter karein aur app save karein.' },
      { title: 'Step 4: Keys & TOTP', desc: 'Generat hui "API Key", apna "Client Code", "Trading PIN" aur Google Authenticator ka "TOTP" daalein.' }
    ],
    proTip: 'Angel One SmartAPI par options chain aur order execution free hai.'
  },
  ZERODHA: {
    brokerId: 'ZERODHA',
    title: 'Zerodha Kite Connect 3.0 Guide',
    isFree: false,
    costDetail: 'Official Kite Connect: ₹2000/month (या Free Browser Enctoken)',
    officialPortal: 'https://kite.trade',
    steps: [
      { title: 'Step 1: Kite Developer Portal', desc: 'kite.trade par developer account banayein aur log in karein.' },
      { title: 'Step 2: Create App', desc: '"Create New App" par click karein, Redirect URL: "http://localhost:3000" daalein.' },
      { title: 'Step 3: Copy API Key & Secret', desc: 'App generate hone par API Key aur API Secret yahan paste karein.' },
      { title: 'Step 4: Free Session Enctoken (Optional)', desc: 'Agar ₹2000 nahi dena hai to Kite Web login karein > F12 (Inspect Element) > Application > Cookies me se "enctoken" copy karke Access Token me daal sakte hain.' }
    ],
    proTip: 'Zerodha ₹2000/month charge karta hai. Agar aapko free data chahiye to Dhan ya Angel One use karein.'
  },
  UPSTOX: {
    brokerId: 'UPSTOX',
    title: 'Upstox Pro API v2 Guide',
    isFree: true,
    costDetail: 'FREE Market Data & v2 REST API',
    officialPortal: 'https://developer.upstox.com',
    steps: [
      { title: 'Step 1: Upstox Developer Portal', desc: 'developer.upstox.com par apne Upstox number se log in karein.' },
      { title: 'Step 2: Create App', desc: '"New App" banayein, Redirect URL: "http://localhost:3000" set karein.' },
      { title: 'Step 3: Copy Credentials', desc: 'Generat hui "API Key" aur "API Secret" copy karein.' },
      { title: 'Step 4: Daily Access Token', desc: 'Morning login authorize karke Access Token copy karke paste karein.' }
    ],
    proTip: 'Upstox v2 API NSE Indices aur Option Chain ke liye fast aur accurate hai.'
  },
  FYERS: {
    brokerId: 'FYERS',
    title: 'Fyers API v3 Setup Guide',
    isFree: true,
    costDetail: '100% FREE for Fyers traders',
    officialPortal: 'https://myapi.fyers.in',
    steps: [
      { title: 'Step 1: Fyers API Login', desc: 'myapi.fyers.in par apne Fyers account se login karein.' },
      { title: 'Step 2: Create App', desc: '"Create App" par click karein aur App Name & Redirect URL enter karein.' },
      { title: 'Step 3: App ID & Secret', desc: 'App ID (e.g. XC12345-100) aur Secret Key copy karein.' },
      { title: 'Step 4: Generate Token', desc: 'Daily access token generate karke yahan paste karein.' }
    ],
    proTip: 'Fyers API v3 algorithmic traders ke liye ultra-fast low latency execution offer karti hai.'
  },
  KOTAK_NEO: {
    brokerId: 'KOTAK_NEO',
    title: 'Kotak Neo API Guide',
    isFree: true,
    costDetail: 'FREE for Kotak Securities accounts',
    officialPortal: 'https://neo.kotaksecurities.com',
    steps: [
      { title: 'Step 1: Kotak API Portal', desc: 'api.kotaksecurities.com par log in karein.' },
      { title: 'Step 2: Consumer Keys', desc: 'Trade API section se "Consumer Key" aur "Consumer Secret" generate karein.' },
      { title: 'Step 3: Login Credentials', desc: 'Apna Registered Mobile Number aur Neo Password daalkar verify karein.' }
    ],
    proTip: 'Kotak Neo intraday traders ke liye zero brokerage aur free API provide karta hai.'
  },
  BINANCE: {
    brokerId: 'BINANCE',
    title: 'Binance Futures & Spot API Guide',
    isFree: true,
    costDetail: '100% FREE Crypto API',
    officialPortal: 'https://www.binance.com/en/my/settings/api-management',
    steps: [
      { title: 'Step 1: API Management', desc: 'Binance profile avatar par click karein > "API Management" chunein.' },
      { title: 'Step 2: Create API Key', desc: '"Create API" button dabayein aur label daalein.' },
      { title: 'Step 3: Set Permissions', desc: 'Enable "Reading" aur "Enable Futures / Spot Trading".' },
      { title: 'Step 4: Withdrawals Disabled', desc: 'Hamesha Withdrawals ko DISABLED rakhein for safety. API Key aur Secret copy karein.' }
    ],
    proTip: 'Crypto automated execution ke liye Binance Testnet aur Mainnet dono support karta hai.'
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
      title: `${meta.name} API Setup Guide`,
      isFree: true,
      costDetail: 'Standard Broker Developer API',
      officialPortal: meta.portalUrl || '#',
      steps: [
        { title: 'Step 1: Developer Portal par jayein', desc: `${meta.name} ke official developer / API portal par account login karein.` },
        { title: 'Step 2: Create App / Generate Keys', desc: 'Naya API App create karein aur Redirect URL "http://localhost:3000" daalein.' },
        { title: 'Step 3: Copy Credentials', desc: 'API Key, Secret Key aur User ID copy karke terminal inputs me enter karein.' },
        { title: 'Step 4: Authenticate & Link', desc: '"Save & Link Broker" button par click karke live feed connect karein.' }
      ],
      proTip: `Agar aapke paas active keys nahi hain to "⚡ Demo Keys" par click karke test mode me check kar sakte hain.`
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
    localStorage.setItem(`broker_creds_${brokerId}`, JSON.stringify(data));
    // Also save in broker-specific keys if needed for backward compatibility
    if (brokerId === 'DHAN') {
      localStorage.setItem('dhan_config', JSON.stringify({
        clientId: data.clientId || '',
        accessToken: data.accessToken || '',
        environment: data.environment || 'PRODUCTION'
      }));
    } else if (brokerId === 'ZERODHA') {
      localStorage.setItem('zerodha_config', JSON.stringify({
        apiKey: data.apiKey || '',
        apiSecret: data.apiSecret || '',
        accessToken: data.accessToken || ''
      }));
    } else if (brokerId === 'UPSTOX') {
      localStorage.setItem('upstox_config', JSON.stringify({
        apiKey: data.apiKey || '',
        accessToken: data.accessToken || '',
        apiSecret: data.apiSecret || '',
        redirectUri: data.redirectUri || 'http://localhost:3000'
      }));
    }
  }

  getCredentials(brokerId: BrokerId): Record<string, string> {
    const stored = localStorage.getItem(`broker_creds_${brokerId}`);
    if (stored) {
      try {
        return JSON.parse(stored);
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
          return { clientId: parsed.clientId || '', accessToken: parsed.accessToken || '', environment: parsed.environment || 'PRODUCTION' };
        } catch (e) {}
      }
    } else if (brokerId === 'ZERODHA') {
      const z = localStorage.getItem('zerodha_config');
      if (z) {
        try {
          const parsed = JSON.parse(z);
          return { clientId: 'ZERODHA_USER', apiKey: parsed.apiKey || '', apiSecret: parsed.apiSecret || '', accessToken: parsed.accessToken || '' };
        } catch (e) {}
      }
    } else if (brokerId === 'UPSTOX') {
      const u = localStorage.getItem('upstox_config');
      if (u) {
        try {
          const parsed = JSON.parse(u);
          return { apiKey: parsed.apiKey || '', accessToken: parsed.accessToken || '', apiSecret: parsed.apiSecret || '' };
        } catch (e) {}
      }
    }
    return {};
  }

  isConfigured(brokerId: BrokerId): boolean {
    const creds = this.getCredentials(brokerId);
    return Object.keys(creds).length > 0 && Object.values(creds).some(val => val.trim().length > 0);
  }

  clearCredentials(brokerId: BrokerId) {
    localStorage.removeItem(`broker_creds_${brokerId}`);
    if (brokerId === 'DHAN') localStorage.removeItem('dhan_config');
    if (brokerId === 'ZERODHA') localStorage.removeItem('zerodha_config');
    if (brokerId === 'UPSTOX') localStorage.removeItem('upstox_config');
  }

  async testConnection(brokerId: BrokerId, creds: Record<string, string>): Promise<{ success: boolean; profile: BrokerProfile; latencyMs: number }> {
    const start = performance.now();
    await new Promise(r => setTimeout(r, 600)); // Network simulation
    const latency = Math.round(performance.now() - start);

    const brokerMeta = this.getBrokerMetadata(brokerId);
    const identifier = creds.clientId || creds.userId || creds.clientCode || creds.accountId || creds.appId || creds.apiKey?.slice(0, 8) || 'QUANT_OPERATOR';

    const profile: BrokerProfile = {
      name: `${brokerMeta.name} Terminal Account`,
      email: `${identifier.toLowerCase()}@${brokerMeta.id.toLowerCase()}.trader`,
      client_id: identifier,
      userType: 'HIGH_PRECISION_TRADER',
      broker: (brokerId === 'DHAN' || brokerId === 'UPSTOX' || brokerId === 'ZERODHA') ? brokerId : undefined
    };

    return {
      success: true,
      profile,
      latencyMs: latency
    };
  }

  getDemoCredentials(brokerId: BrokerId): Record<string, string> {
    switch (brokerId) {
      case 'ZERODHA':
        return { clientId: 'DEMO_KITE_USER', apiKey: 'kite_demo_key_9941', apiSecret: 'demo_secret_xyz123', accessToken: 'enctoken_active_simulated' };
      case 'DHAN':
        return { clientId: '1000889922', accessToken: 'dhan_demo_jwt_token_auth_verified', environment: 'PRODUCTION' };
      case 'ANGELONE':
        return { clientId: 'ANGEL_DEMO_A5', pin: '4321', apiKey: 'smart_api_demo_key', totpSecret: 'totp_secret_auto' };
      case 'UPSTOX':
        return { apiKey: 'upstox_pro_demo', apiSecret: 'upstox_sec_99', redirectUri: 'http://localhost:3000', accessToken: 'upstox_oauth_token_verified' };
      case 'GROWW':
        return { clientId: 'GROWW_DEMO_99', apiKey: 'grw_key_demo_live', accessToken: 'grw_token_simulated' };
      case 'FYERS':
        return { appId: 'FYERS_DEMO-100', secretKey: 'fyers_sec_demo', accessToken: 'fyers_token_v3' };
      case 'KOTAK_NEO':
        return { consumerKey: 'kotak_neo_demo_key', consumerSecret: 'neo_secret_xyz', mobile: '+919876543210', password: 'neo_password_demo' };
      case 'FINVASIA':
        return { userId: 'SHOONYA_DEMO', password: 'shoonya_pass', vendorKey: 'vendor_key_99', twoFa: '123456' };
      case 'BINANCE':
        return { apiKey: 'binance_futures_api_key_demo', apiSecret: 'binance_sec_key_demo', testnet: 'mainnet' };
      case 'BYBIT':
        return { apiKey: 'bybit_v5_key_demo', apiSecret: 'bybit_sec_demo', testnet: 'mainnet' };
      case 'IBKR':
        return { accountId: 'U8899001', host: '127.0.0.1', port: '7497', clientId: '1' };
      case 'ALPACA':
        return { apiKey: 'PKDEMO1234567890', apiSecret: 'alpaca_secret_demo', paper: 'paper' };
      case 'METATRADER':
        return { server: 'Demo-SMC-Server', login: '689201', password: 'mt_demo_pass', bridgePort: '5555' };
      case 'WEBHOOK':
        return { webhookUrl: 'https://webhook.site/demo-smc-sniper', token: 'bearer_secret_123', format: 'JSON' };
      default:
        return { clientId: 'DEMO_USER_01', apiKey: 'demo_api_key', accessToken: 'demo_token' };
    }
  }
}

export const brokerRegistry = new BrokerRegistryService();
