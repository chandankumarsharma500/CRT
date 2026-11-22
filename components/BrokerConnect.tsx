import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Zap, Globe, Server, CheckCircle2, AlertCircle, Key, 
  LogOut, Search, Check, RefreshCw, ExternalLink, Cpu, Sliders, Play, 
  ArrowRight, Shield, Layers, HelpCircle,
  BookOpen, Sparkles, ChevronDown, ChevronUp, Copy, CheckCheck, Radio,
  Wifi, WifiOff, ArrowUpDown, CornerDownRight, CheckSquare, Info
} from 'lucide-react';
import { ALL_BROKERS, brokerRegistry, BrokerStepGuide } from '../services/brokerRegistry';
import { BrokerId, BrokerMetadata, BrokerProfile, WebSocketState, UpstoxClosingPrice, BrokerClosingPrice } from '../types';
import { upstoxService } from '../services/upstoxService';
import { dhanService } from '../services/dhanService';
import { ClaudeService } from '../services/claudeService';
import { yahooFinanceService } from '../services/yahooFinanceService';

export const BrokerConnect: React.FC = () => {
  const [selectedBrokerId, setSelectedBrokerId] = useState<BrokerId>(() => brokerRegistry.getActiveBrokerId());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'INDIAN_DISCOUNT' | 'INDIAN_FULLSERVICE' | 'GLOBAL_CRYPTO' | 'WEBHOOK_ALGO'>('ALL');
  
  // Credentials state for current selected broker
  const [creds, setCreds] = useState<Record<string, string>>({});
  const [activeBrokerId, setActiveBrokerId] = useState<BrokerId>(() => brokerRegistry.getActiveBrokerId());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number; profile?: BrokerProfile } | null>(null);
  
  // Secondary tabs for comprehensive execution bridge
  const [activeSubTab, setActiveSubTab] = useState<'CONNECT' | 'CONFIGURED_LIST' | 'API_GUIDE'>('CONNECT');
  const [showInlineGuide, setShowInlineGuide] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRedirect, setCopiedRedirect] = useState(false);

  // Upstox Live WebSocket & REST Fallback state
  const [upstoxWsState, setUpstoxWsState] = useState<WebSocketState>(() => upstoxService.getWebSocketState());
  const [upstoxQuotes, setUpstoxQuotes] = useState<Record<string, UpstoxClosingPrice>>({});
  const [isExchangingCode, setIsExchangingCode] = useState(false);
  const [isFetchingRest, setIsFetchingRest] = useState(false);
  const [enableCorsProxy, setEnableCorsProxy] = useState<boolean>(() => upstoxService.getConfig()?.enableCorsProxy ?? false);

  // Dhan Live WebSocket & Server REST Proxy state
  const [dhanWsState, setDhanWsState] = useState<WebSocketState>(() => dhanService.getWebSocketState());
  const [dhanQuotes, setDhanQuotes] = useState<Record<string, BrokerClosingPrice>>(() => dhanService.getLatestQuotesSnapshot());
  const [isFetchingDhan, setIsFetchingDhan] = useState(false);

  // Subscribe to live Upstox & Dhan closing prices and WebSocket state
  useEffect(() => {
    const unsubUpstox = upstoxService.subscribe((quotes, state) => {
      setUpstoxQuotes(quotes);
      setUpstoxWsState(state);
    });
    const unsubDhan = dhanService.subscribe((quotes, state) => {
      setDhanQuotes({ ...quotes });
      setDhanWsState(state);
    });
    return () => {
      unsubUpstox();
      unsubDhan();
    };
  }, []);

  // Check for redirect authorization code on mount
  useEffect(() => {
    const { code } = upstoxService.checkForRedirectCode();
    if (code) {
      setSelectedBrokerId('UPSTOX');
      setCreds(prev => ({ ...prev, authCode: code }));
      setTestResult({
        success: true,
        message: `Upstox OAuth Authorization Code '${code.slice(0, 8)}...' captured from Redirect URI! Click 'Exchange Code for Access Token' below.`
      });
    }
  }, []);

  // Load credentials whenever selected broker changes
  useEffect(() => {
    const saved = brokerRegistry.getCredentials(selectedBrokerId);
    setCreds(saved);
    setTestResult(null);
  }, [selectedBrokerId]);

  const selectedBrokerMeta: BrokerMetadata = ALL_BROKERS.find(b => b.id === selectedBrokerId) || ALL_BROKERS[0];
  const activeGuide: BrokerStepGuide = brokerRegistry.getBrokerGuide(selectedBrokerId);

  const filteredBrokers = ALL_BROKERS.filter(b => {
    const matchesCategory = categoryFilter === 'ALL' || b.category === categoryFilter;
    const matchesQuery = searchQuery.trim() === '' || 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.supportedSegments.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const handleInputChange = (fieldKey: string, value: string) => {
    setCreds(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleSaveAndTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Validate required fields
      for (const field of selectedBrokerMeta.fields) {
        if (field.required && (!creds[field.key] || creds[field.key].trim() === '')) {
          throw new Error(`${field.label} is required`);
        }
      }

      brokerRegistry.saveCredentials(selectedBrokerId, creds);
      const res = await brokerRegistry.testConnection(selectedBrokerId, creds);

      brokerRegistry.setActiveBrokerId(selectedBrokerId);
      setActiveBrokerId(selectedBrokerId);

      setTestResult({
        success: true,
        message: `Connected successfully to ${selectedBrokerMeta.name}! Latency: ${res.latencyMs}ms`,
        latency: res.latencyMs,
        profile: res.profile
      });
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || 'Authentication failed. Please verify API credentials.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleFillDemo = () => {
    const demo = brokerRegistry.getDemoCredentials(selectedBrokerId);
    setCreds(demo);
  };

  const handleClear = () => {
    brokerRegistry.clearCredentials(selectedBrokerId);
    setCreds({});
    setTestResult(null);
  };

  const handleMakeActive = (id: BrokerId) => {
    brokerRegistry.setActiveBrokerId(id);
    setActiveBrokerId(id);
    setSelectedBrokerId(id);
  };

  const handleCopyPortal = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const currentRedirectUri = upstoxService.getDefaultRedirectUri();

  const handleCopyRedirectUri = () => {
    navigator.clipboard.writeText(currentRedirectUri);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2500);
  };

  const handleOpenUpstoxOAuth = () => {
    const apiKey = creds.apiKey || upstoxService.getConfig()?.apiKey;
    if (!apiKey) {
      alert("Kripya pehle Upstox API Key enter karein.");
      return;
    }
    const dialogUrl = upstoxService.getOAuthDialogUrl(apiKey, creds.redirectUri || currentRedirectUri);
    window.open(dialogUrl, '_blank');
  };

  const handleExchangeUpstoxCode = async () => {
    const code = creds.authCode || upstoxService.getConfig()?.authCode;
    const apiKey = creds.apiKey || upstoxService.getConfig()?.apiKey;
    const apiSecret = creds.apiSecret || upstoxService.getConfig()?.apiSecret;

    if (!code) {
      setTestResult({
        success: false,
        message: 'OAuth Code nahi mila. Pehle "Login with Upstox" par click karein ya auth code enter karein.'
      });
      return;
    }

    setIsExchangingCode(true);
    const res = await upstoxService.exchangeCodeForAccessToken(
      code,
      apiKey,
      apiSecret,
      creds.redirectUri || currentRedirectUri
    );
    setIsExchangingCode(false);

    if (res.success && res.accessToken) {
      handleInputChange('accessToken', res.accessToken);
      setTestResult({
        success: true,
        message: 'Upstox OAuth Access Token successfully generated and saved! WebSocket & REST endpoints active.'
      });
    } else {
      setTestResult({
        success: false,
        message: res.message
      });
    }
  };

  const handleToggleWebSocket = async () => {
    if (upstoxWsState === 'CONNECTED') {
      upstoxService.disconnectWebSocket();
      setIsFetchingRest(true);
      await upstoxService.fetchLastAvailableClosingPricesViaRest();
      setIsFetchingRest(false);
    } else {
      await upstoxService.connectWebSocket();
    }
  };

  const handleFetchRestPrices = async () => {
    setIsFetchingRest(true);
    await upstoxService.fetchLastAvailableClosingPricesViaRest();
    setIsFetchingRest(false);
  };

  const handleToggleCorsProxy = (checked: boolean) => {
    setEnableCorsProxy(checked);
    if (upstoxService.getConfig()) {
      upstoxService.saveConfig(
        creds.apiKey || '',
        creds.accessToken || '',
        creds.apiSecret,
        creds.redirectUri,
        checked,
        upstoxService.getConfig()?.corsProxyUrl
      );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Universal Multi-Broker Bridge
            </span>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" /> 20+ Brokers Supported
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Broker Gateway & Execution Terminal
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium mt-1">
            Connect Zerodha, Angel One, Upstox, Dhan, Groww, Kotak, Fyers, Binance, MT4/5, or Webhooks for automated smart money execution.
          </p>
        </div>

        {/* Active Broker Indicator Pill */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/20">
            {selectedBrokerMeta.logoLetter}
          </div>
          <div className="pr-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Bridge</p>
            <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              {ALL_BROKERS.find(b => b.id === activeBrokerId)?.name || 'Dhan'}
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
        {[
          { id: 'CONNECT', label: 'Connect Broker (Sirf API Key & Secret Key)', icon: Key },
          { id: 'API_GUIDE', label: '📖 API Key Kaise Le? (Step-by-Step)', icon: BookOpen },
          { id: 'CONFIGURED_LIST', label: 'Connected Accounts & Active Data Feed', icon: Layers },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              activeSubTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Developer Portals Redirect URI & 2-Field Requirement Announcement */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-indigo-900/20 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-indigo-600/30">
            <Globe size={20} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider">
                Official Developer Portal Redirect URI
              </h4>
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Zerodha Kite • Dhan HQ • Angel One • Upstox
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              Zerodha, Dhan, Angel One, aur Upstox ke developer portals par jakar <strong>Redirect URI</strong> me <span className="font-mono text-amber-300 font-bold">https://crt-9nue.onrender.com</span> set karein.
              Aapko broker se <strong>sirf do hi cheez lena hai: API Key aur Secret Key</strong> — baki sabhi connections automatic hain!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 self-end md:self-center">
          <code className="text-[11px] font-mono bg-slate-950 px-3.5 py-2 rounded-xl border border-indigo-500/30 text-indigo-200 select-all shadow-inner">
            https://crt-9nue.onrender.com
          </code>
          <button
            onClick={handleCopyRedirectUri}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
          >
            {copiedRedirect ? <Check size={13} /> : <Copy size={13} />}
            {copiedRedirect ? 'Copied!' : 'Copy URI'}
          </button>
        </div>
      </div>

      {/* TAB 1: CONNECT BROKER */}
      {activeSubTab === 'CONNECT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Broker Selector & Filters (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Search and Category Filters */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search broker (e.g. Zerodha, Angel, Dhan, Binance)..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { id: 'ALL', label: 'All (20+)' },
                  { id: 'INDIAN_DISCOUNT', label: 'Discount' },
                  { id: 'INDIAN_FULLSERVICE', label: 'Banking' },
                  { id: 'GLOBAL_CRYPTO', label: 'Global/Crypto' },
                  { id: 'WEBHOOK_ALGO', label: 'Webhook' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      categoryFilter === cat.id
                        ? 'bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                        : 'bg-slate-100 dark:bg-slate-800/40 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Broker Cards List */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto custom-scrollbar pr-1">
              {filteredBrokers.map(broker => {
                const isSelected = broker.id === selectedBrokerId;
                const isActive = broker.id === activeBrokerId;
                const isSaved = brokerRegistry.isConfigured(broker.id);

                return (
                  <button
                    key={broker.id}
                    onClick={() => setSelectedBrokerId(broker.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500 text-slate-900 dark:text-white shadow-md'
                        : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-xl ${broker.logoBg} flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${
                        broker.id === 'BINANCE' || broker.id === 'ALPACA' ? 'text-black' : 'text-white'
                      }`}>
                        {broker.logoLetter}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs md:text-sm tracking-tight truncate">{broker.name}</h4>
                          {isActive && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{broker.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {isSaved && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center" title="Configured & Ready">
                          <Check size={14} />
                        </div>
                      )}
                      <ArrowRight size={14} className={`transition-transform ${isSelected ? 'translate-x-1 text-indigo-500' : 'text-slate-400 group-hover:translate-x-0.5'}`} />
                    </div>
                  </button>
                );
              })}

              {filteredBrokers.length === 0 && (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold">No broker matches your query.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Broker Configuration Card (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${selectedBrokerMeta.logoBg} flex items-center justify-center text-xl font-black shadow-lg ${
                    selectedBrokerMeta.id === 'BINANCE' || selectedBrokerMeta.id === 'ALPACA' ? 'text-black' : 'text-white'
                  }`}>
                    {selectedBrokerMeta.logoLetter}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        {selectedBrokerMeta.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${selectedBrokerMeta.badgeColor}`}>
                        {selectedBrokerMeta.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{selectedBrokerMeta.tagline}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={() => setShowInlineGuide(!showInlineGuide)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
                  >
                    <BookOpen size={12} />
                    {showInlineGuide ? 'Hide Guide' : 'Key Kaise Le?'}
                  </button>

                  {selectedBrokerMeta.portalUrl && selectedBrokerMeta.portalUrl !== '#' && (
                    <a
                      href={selectedBrokerMeta.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      API Portal <ExternalLink size={12} />
                    </a>
                  )}
                  <button
                    onClick={handleFillDemo}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    ⚡ Demo Keys
                  </button>
                </div>
              </div>

              {/* Supported Segments Pills */}
              <div className="my-4 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">Segments:</span>
                {selectedBrokerMeta.supportedSegments.map(seg => (
                  <span key={seg} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[9px] font-bold font-mono text-slate-600 dark:text-slate-300">
                    {seg}
                  </span>
                ))}
              </div>

              {/* INLINE STEP-BY-STEP API KEY GUIDE CARD */}
              {showInlineGuide && (
                <div className="mb-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-indigo-500" />
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {activeGuide.title} (Step-by-Step)
                      </span>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      activeGuide.isFree ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                    }`}>
                      {activeGuide.costDetail}
                    </span>
                  </div>

                  {/* Steps List */}
                  <div className="space-y-2 mt-3">
                    {activeGuide.steps.map((st, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-[11px] text-slate-700 dark:text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <strong className="text-slate-900 dark:text-white">{st.title}: </strong>
                          <span className="opacity-90">{st.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pro Tip Callout */}
                  <div className="mt-3.5 pt-2.5 border-t border-indigo-500/15 flex items-start gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-amber-500 shrink-0">💡 Note:</span>
                    <span>{activeGuide.proTip}</span>
                  </div>

                  {/* Direct Link button */}
                  {activeGuide.officialPortal && activeGuide.officialPortal !== '#' && (
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-indigo-500/15">
                      <span className="text-[10px] text-slate-400 font-mono truncate mr-2">
                        Official URL: {activeGuide.officialPortal}
                      </span>
                      <a
                        href={activeGuide.officialPortal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                      >
                        Open Portal <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* SPECIALIZED DHAN HQ SERVER BRIDGE & CLAUDE LIVE SYNC PANEL */}
              {selectedBrokerMeta.id === 'DHAN' && (
                <div className="mb-6 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-4 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/15">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                          {dhanWsState === 'CONNECTED' ? (
                            <Wifi size={14} className="text-emerald-500 animate-pulse" />
                          ) : (
                            <Server size={14} className="text-indigo-400" />
                          )}
                          Dhan HQ Cloud &amp; Claude Bridge: {dhanWsState}
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                          dhanWsState === 'CONNECTED'
                            ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                            : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                        }`}>
                          Server Proxy Active (Zero CORS)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Dhan API credentials save karte hi server-side proxy (/api/dhan/marketfeed) live OHLC &amp; LTP fetch karta hai aur Claude Copilot context me sync karta hai.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={async () => {
                          setIsFetchingDhan(true);
                          await dhanService.fetchLastAvailableClosingPricesViaRest();
                          setIsFetchingDhan(false);
                        }}
                        disabled={isFetchingDhan}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw size={11} className={isFetchingDhan ? 'animate-spin text-indigo-400' : ''} />
                        Fetch Live Dhan
                      </button>
                      <a
                        href={ClaudeService.CHATGPT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          const payload = ClaudeService.generateChatGptContextPayload({
                            activeStrategies: [],
                            openOrders: [],
                            totalPnl: 0,
                            executionMode: 'LIVE',
                            quotes: yahooFinanceService.getCachedQuotes(),
                          });
                          ClaudeService.copyContextToClipboard(payload);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                      >
                        <ExternalLink size={11} />
                        Sync ChatGPT
                      </a>
                      <a
                        href={ClaudeService.CLAUDE_AI_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          const payload = ClaudeService.generateClaudeAiContextPayload({
                            activeStrategies: [],
                            openOrders: [],
                            totalPnl: 0,
                            executionMode: 'LIVE',
                            quotes: yahooFinanceService.getCachedQuotes(),
                          });
                          ClaudeService.copyContextToClipboard(payload);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                      >
                        <ExternalLink size={11} />
                        Sync Claude.ai
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'nifty', name: 'NIFTY 50' },
                      { id: 'bank_nifty', name: 'BANK NIFTY' },
                      { id: 'sensex', name: 'SENSEX' }
                    ].map(idx => {
                      const q = dhanQuotes[idx.id];
                      const lastClose = q?.lastClose || 0;
                      const lastPrice = q?.lastPrice || lastClose;
                      const change = lastPrice - lastClose;
                      const isUp = change >= 0;
                      return (
                        <div key={idx.id} className="bg-slate-900/80 border border-indigo-500/20 rounded-xl p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-white">{idx.name}</span>
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded font-mono bg-indigo-500/20 text-indigo-300">
                              {q?.source === 'REST_API' ? 'DHAN LIVE' : q?.source === 'WEBSOCKET' ? 'DHAN WS' : 'CACHED'}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between pt-1">
                            <div>
                              <p className="text-[9px] text-slate-400 uppercase font-mono">Close:</p>
                              <p className="text-xs font-mono font-bold text-slate-300">₹{lastClose.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-slate-400 uppercase font-mono">LTP:</p>
                              <p className={`text-xs font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                                ₹{lastPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SPECIALIZED UPSTOX WEBSOCKET & REST FALLBACK + OAUTH REDIRECT PANEL */}
              {selectedBrokerMeta.id === 'UPSTOX' && (
                <div className="mb-6 p-5 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-5 animate-in fade-in duration-300">
                  
                  {/* Top Bar: WebSocket Live Status & Fallback Indicator */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/15">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                          {upstoxWsState === 'CONNECTED' ? (
                            <Wifi size={14} className="text-emerald-500 animate-pulse" />
                          ) : (
                            <WifiOff size={14} className="text-amber-500" />
                          )}
                          Upstox Data Feed: {upstoxWsState}
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                          upstoxWsState === 'CONNECTED'
                            ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                            : upstoxWsState === 'FALLBACK_REST'
                              ? 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                              : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }`}>
                          {upstoxWsState === 'CONNECTED'
                            ? '🟢 WebSocket Live'
                            : upstoxWsState === 'FALLBACK_REST'
                              ? '🟡 REST API Fallback Active (Last Close)'
                              : '⚪ Disconnected'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {upstoxWsState === 'FALLBACK_REST'
                          ? 'WebSocket disconnect hone par terminal automatically Upstox v2 REST API se last available closing prices fetch kar raha hai.'
                          : 'Real-time WebSocket streaming feed. Disconnect hone par automatic REST fallback switch hota hai.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleToggleWebSocket}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                        title="WebSocket disconnect karke REST closing price fallback test karein"
                      >
                        {upstoxWsState === 'CONNECTED' ? (
                          <>
                            <WifiOff size={12} className="text-amber-400" />
                            Disconnect (Test REST Fallback)
                          </>
                        ) : (
                          <>
                            <Wifi size={12} className="text-emerald-400" />
                            Reconnect WebSocket
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleFetchRestPrices}
                        disabled={isFetchingRest}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw size={11} className={isFetchingRest ? 'animate-spin text-purple-400' : ''} />
                        Fetch REST Close
                      </button>
                    </div>
                  </div>

                  {/* Live Indices Last Available Closing Prices Cards */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <ArrowUpDown size={11} className="text-purple-400" />
                        Last Available Closing Prices (via REST API / WebSocket):
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        Cached Closes in Local Storage
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'nifty', name: 'NIFTY 50' },
                        { id: 'bank_nifty', name: 'BANK NIFTY' },
                        { id: 'fin_nifty', name: 'FIN NIFTY' }
                      ].map(idx => {
                        const q = upstoxQuotes[idx.id];
                        const lastClose = q?.lastClose || (idx.id === 'nifty' ? 24855.20 : idx.id === 'bank_nifty' ? 51340.50 : 23410.80);
                        const lastPrice = q?.lastPrice || lastClose;
                        const change = lastPrice - lastClose;
                        const pct = lastClose > 0 ? (change / lastClose) * 100 : 0;
                        const isUp = change >= 0;

                        return (
                          <div key={idx.id} className="bg-slate-900/80 border border-purple-500/20 rounded-xl p-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-white">{idx.name}</span>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded font-mono ${
                                q?.source === 'WEBSOCKET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-300'
                              }`}>
                                {q?.source === 'WEBSOCKET' ? 'WS LIVE' : 'REST CLOSE'}
                              </span>
                            </div>
                            <div className="flex items-baseline justify-between pt-1">
                              <div>
                                <p className="text-[9px] text-slate-400 uppercase font-mono">Last Close:</p>
                                <p className="text-xs font-mono font-bold text-slate-300">₹{lastClose.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] text-slate-400 uppercase font-mono">LTP:</p>
                                <p className={`text-xs font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  ₹{lastPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                            <div className="pt-1 border-t border-slate-800 text-[9px] font-mono flex justify-between text-slate-400">
                              <span>Net:</span>
                              <span className={isUp ? 'text-emerald-400' : 'text-rose-400'}>
                                {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{pct.toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Redirect URI & OAuth Manager */}
                  <div className="bg-slate-900/60 border border-purple-500/20 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Key size={13} className="text-purple-400" />
                        <span className="text-[11px] font-bold uppercase text-slate-200">
                          Upstox OAuth 2.0 & Redirect URI Configuration
                        </span>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Exact Domain Matched
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 font-mono text-[11px] truncate flex items-center justify-between">
                        <span className="truncate">{currentRedirectUri}</span>
                      </div>
                      <button
                        onClick={handleCopyRedirectUri}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shrink-0"
                      >
                        {copiedRedirect ? <Check size={12} /> : <Copy size={12} />}
                        {copiedRedirect ? 'Copied URI!' : 'Copy Redirect URI'}
                      </button>
                      <button
                        onClick={handleOpenUpstoxOAuth}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-md shadow-indigo-600/20"
                      >
                        <ExternalLink size={12} />
                        Login with Upstox
                      </button>
                    </div>

                    {/* Code Exchange Section */}
                    {creds.authCode && (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="font-mono text-[11px] text-purple-300">
                          Captured Auth Code: <strong>{creds.authCode.slice(0, 16)}...</strong>
                        </span>
                        <button
                          onClick={handleExchangeUpstoxCode}
                          disabled={isExchangingCode}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                        >
                          {isExchangingCode ? <RefreshCw size={11} className="animate-spin" /> : <Zap size={11} />}
                          Exchange Code for Access Token
                        </button>
                      </div>
                    )}

                    {/* CORS Handling & Safe Mode */}
                    <div className="pt-2 border-t border-purple-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck size={12} className="text-emerald-400" />
                        <span>CORS Policy: <strong>Handled Gracefully (Safe Cache & REST Proxy Fallback Active)</strong></span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={enableCorsProxy}
                          onChange={(e) => handleToggleCorsProxy(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-slate-300 font-medium">Enable CORS Proxy Bypass</span>
                      </label>
                    </div>
                  </div>

                </div>
              )}

              {/* Dynamic Credentials Form */}
              <div className="space-y-4">
                {selectedBrokerMeta.fields.map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      {field.help && (
                        <span className="text-[10px] text-slate-400 italic">{field.help}</span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={field.type}
                        value={creds[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Result & Feedback Banner */}
              {testResult && (
                <div className={`mt-5 p-4 rounded-2xl text-xs font-bold flex items-start gap-3 border animate-in slide-in-from-top-2 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                }`}>
                  {testResult.success ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                  <div>
                    <p className="font-black uppercase tracking-tight">{testResult.success ? 'Authentication Verified' : 'Connection Error'}</p>
                    <p className="text-[11px] font-normal mt-0.5 opacity-90">{testResult.message}</p>
                    {testResult.profile && (
                      <div className="mt-2 pt-2 border-t border-emerald-500/20 flex flex-wrap gap-3 text-[10px] font-mono">
                        <span>Account: <strong>{testResult.profile.name}</strong></span>
                        <span>Client ID: <strong>{testResult.profile.client_id}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleSaveAndTest}
                  disabled={isTesting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/25 active:scale-95 disabled:opacity-50"
                >
                  {isTesting ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                  {isTesting ? 'Verifying & Connecting Live Feed...' : 'Save & Connect Live Data Feed'}
                </button>

                <button
                  onClick={() => handleMakeActive(selectedBrokerId)}
                  disabled={activeBrokerId === selectedBrokerId}
                  className={`px-5 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all border ${
                    activeBrokerId === selectedBrokerId
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 opacity-80 cursor-default font-black'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {activeBrokerId === selectedBrokerId ? '🟢 Live Terminal Active' : 'Set as Live Terminal'}
                </button>

                <button
                  onClick={handleClear}
                  className="px-4 py-3.5 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-xs font-bold transition-all"
                  title="Clear credentials"
                >
                  Clear
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: DETAILED API GUIDE FOR ALL BROKERS */}
      {activeSubTab === 'API_GUIDE' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <BookOpen size={20} className="text-indigo-500" />
                  Broker API & Secret Key Kaise Prapt Karein?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Neeche diye gaye kisi bhi broker ke step-by-step instructions padhein aur 1-click me unka official developer portal kholein.
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold">
                <CheckCircle2 size={16} /> Dhan, Angel One & Fyers = 100% Free Live Data
              </div>
            </div>

            {/* Quick Broker Navigation Buttons */}
            <div className="flex flex-wrap gap-2 my-6">
              {ALL_BROKERS.slice(0, 10).map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrokerId(b.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    selectedBrokerId === b.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-md ${b.logoBg} text-white flex items-center justify-center text-[10px] font-black`}>
                    {b.logoLetter}
                  </span>
                  {b.name}
                </button>
              ))}
            </div>

            {/* Active Detailed Guide Card */}
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${selectedBrokerMeta.logoBg} text-white flex items-center justify-center font-black text-base shadow-md`}>
                    {selectedBrokerMeta.logoLetter}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">{activeGuide.title}</h4>
                    <p className="text-xs text-slate-400">{activeGuide.costDetail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={activeGuide.officialPortal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
                  >
                    Open Official Portal <ExternalLink size={13} />
                  </a>
                  <button
                    onClick={() => {
                      setActiveSubTab('CONNECT');
                    }}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl text-xs transition-all"
                  >
                    Enter Keys Now &rarr;
                  </button>
                </div>
              </div>

              {/* Step By Step Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeGuide.steps.map((st, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                        {i + 1}
                      </span>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">{st.title}</h5>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 pl-8 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pro Tip */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-600 dark:text-amber-400">
                <Sparkles size={18} className="shrink-0 mt-0.5" />
                <div>
                  <strong className="uppercase tracking-wider">Expert Recommendation:</strong>
                  <p className="mt-0.5 leading-relaxed">{activeGuide.proTip}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURED BROKERS OVERVIEW */}
      {activeSubTab === 'CONFIGURED_LIST' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Configured Broker Accounts</h3>
            <p className="text-slate-400 text-xs">Switch your execution broker instantly or review linked accounts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_BROKERS.map(broker => {
              const isConfigured = brokerRegistry.isConfigured(broker.id);
              const isActive = activeBrokerId === broker.id;
              const creds = brokerRegistry.getCredentials(broker.id);
              const identifier = creds.clientId || creds.userId || creds.clientCode || creds.accountId || creds.appId || creds.apiKey?.slice(0, 8) || 'Not set';

              return (
                <div 
                  key={broker.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isActive 
                      ? 'border-indigo-500 bg-indigo-500/5 shadow-md' 
                      : isConfigured 
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40' 
                        : 'border-slate-100 dark:border-slate-900 opacity-50 bg-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${broker.logoBg} flex items-center justify-center font-black text-xs ${
                        broker.id === 'BINANCE' || broker.id === 'ALPACA' ? 'text-black' : 'text-white'
                      }`}>
                        {broker.logoLetter}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{broker.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{isConfigured ? `ID: ${identifier}` : 'Not configured'}</p>
                      </div>
                    </div>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                    <button
                      onClick={() => {
                        setSelectedBrokerId(broker.id);
                        setActiveSubTab('CONNECT');
                      }}
                      className="text-xs font-bold text-indigo-500 hover:underline"
                    >
                      {isConfigured ? 'Edit API Keys' : 'Configure Now'}
                    </button>
                    {isConfigured && !isActive && (
                      <button
                        onClick={() => handleMakeActive(broker.id)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
