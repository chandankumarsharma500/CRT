
import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle, Wallet, RefreshCw, FileSpreadsheet, Link2, Zap, Key, Sparkles, Download, FileArchive, Terminal, ShieldCheck } from 'lucide-react';
import { dhanService } from '../services/dhanService';
import { googleSheetService } from '../services/googleSheetService';
import { downloadProjectZip, downloadPythonStrategy } from '../services/projectExporter';
import { BrokerProfile, GoogleSheetConfig } from '../types';

export const Settings: React.FC = () => {
  const [dhanClientId, setDhanClientId] = useState('');
  const [sheetEnabled, setSheetEnabled] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('SMC_Trades');

  const [isConnected, setIsConnected] = useState(false);
  const [profile, setProfile] = useState<BrokerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const dConfig = dhanService.getConfig();
    if (dConfig) setDhanClientId(dConfig.clientId);

    const sConfig = googleSheetService.getConfig();
    if (sConfig) {
        setSheetEnabled(sConfig.enabled);
        setSheetUrl(sConfig.webhookUrl);
        setSheetName(sConfig.sheetName);
    }
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (!dhanService.isConfigured()) return;
    try {
      const profileData = await dhanService.getProfile();
      setProfile(profileData);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
        if (!dhanClientId) throw new Error("Dhan Client ID is required");
        
        dhanService.saveConfig(dhanClientId, undefined, 'PRODUCTION');
        googleSheetService.saveConfig({
            enabled: sheetEnabled,
            webhookUrl: sheetUrl,
            sheetName: sheetName
        });
        
        await checkConnection();
        setMessage({ type: 'success', text: "Settings Updated & Cloud Synced!" });
    } catch (error: any) {
        setMessage({ type: 'error', text: error.message });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">System Console</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Logic & Cloud Configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Google Sheets Sync */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-400">
                    <FileSpreadsheet size={18} />
                </div>
                <h3 className="text-lg font-bold text-white">Google Sheets Sync</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={sheetEnabled} onChange={(e) => setSheetEnabled(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            
            <div className={`space-y-4 transition-opacity ${sheetEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Apps Script Webhook URL</label>
                <input 
                  type="text" 
                  value={sheetUrl} 
                  onChange={(e) => setSheetUrl(e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors font-mono text-xs" 
                  placeholder="https://script.google.com/macros/s/..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Target Sheet Name</label>
                <input 
                  type="text" 
                  value={sheetName} 
                  onChange={(e) => setSheetName(e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors font-mono text-xs" 
                />
              </div>
              <p className="text-[9px] text-slate-500 font-bold italic">* Apps Script mein `doPost(e)` function setup karein data receive karne ke liye.</p>
            </div>
          </div>

          {/* Dhan Configuration */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">D</div>
              <h3 className="text-lg font-bold text-white">Broker Authentication</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Dhan Client ID</label>
                <input 
                  type="text" 
                  value={dhanClientId} 
                  onChange={(e) => setDhanClientId(e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500 transition-colors font-mono" 
                  placeholder="10000..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
            <div className={`bg-slate-800/50 border rounded-2xl p-6 ${isConnected ? 'border-emerald-500/30' : 'border-slate-700'}`}>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Active Profile</h3>
                {isConnected && profile ? (
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xl">{profile.name.charAt(0)}</div>
                        <div>
                            <p className="text-white font-black uppercase tracking-tighter">{profile.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">ID: {profile.client_id}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg"><CheckCircle size={12} /> ONLINE</div>
                    </div>
                ) : (
                    <div className="h-20 flex flex-col items-center justify-center text-slate-600 opacity-30"><Wallet size={32} className="mb-1"/><p className="text-xs font-black">BRIDGE DISCONNECTED</p></div>
                )}
            </div>

            {/* Codebase & Strategy Archive Export */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">
                        <FileArchive size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-tight">Codebase & Strategy Export</h3>
                      <p className="text-[10px] text-slate-400">Download complete project files as ZIP or standalone Python script</p>
                    </div>
                </div>

                <div className="space-y-2 mt-4">
                  <button 
                    onClick={() => downloadProjectZip('smc-vega-quant-code.zip')}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    <Download size={15} /> Download All Code (.ZIP)
                  </button>
                  <button 
                    onClick={() => downloadPythonStrategy('vega_trading_strategy.py')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all border border-slate-700 active:scale-95"
                  >
                    <Terminal size={15} className="text-emerald-400" /> Download Python Strategy (.py)
                  </button>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center gap-2 text-[10px] text-slate-400">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  <span>Google AI Studio top menu se bhi <strong>"Export &gt; Download ZIP"</strong> kar sakte hain.</span>
                </div>
            </div>

            <div className="space-y-3">
                {message && (
                    <div className={`p-4 rounded-2xl text-[11px] font-black flex items-center gap-2 border animate-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        {message.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />} {message.text.toUpperCase()}
                    </div>
                )}
                <button onClick={handleSave} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 uppercase text-xs tracking-widest">
                    {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} Deploy Configuration
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
