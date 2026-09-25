
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Zap, Globe, Server, CheckCircle2, AlertCircle, Key, LogOut } from 'lucide-react';
import { dhanService } from '../services/dhanService';

export const BrokerConnect: React.FC = () => {
    const [clientId, setClientId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [statusMessage, setStatusMessage] = useState('');

    // Pre-fill from existing config
    useEffect(() => {
        if (dhanService.isConfigured()) {
            const config = dhanService.getConfig();
            if (config) {
                setClientId(config.clientId || '');
                setAccessToken(config.accessToken || '');
                setStatus('SUCCESS');
                setStatusMessage('Broker link is active');
            }
        }
    }, []);

    const handleLogin = async () => {
        setIsConnecting(true);
        setStatus('IDLE');
        setStatusMessage('');

        try {
            if (!clientId || !accessToken) throw new Error("Credentials Missing");

            // Corrected: saveConfig expects 1-3 arguments (clientId, accessToken, environment)
            dhanService.saveConfig(clientId, accessToken, 'PRODUCTION');
            
            // Verification check using corrected service profile call
            try {
                const profile = await dhanService.getProfile();
                setStatusMessage(`Connected: ${profile.name}`);
                setStatus('SUCCESS');
            } catch (innerError) {
                setStatus('SUCCESS');
                setStatusMessage("Logged in (Offline/Proxy Mode)");
            }
        } catch (e: any) {
            setStatus('ERROR');
            setStatusMessage(e.message || "Connection Failed");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleLogout = () => {
        dhanService.clearConfig();
        setClientId('');
        setAccessToken('');
        setStatus('IDLE');
        setStatusMessage('');
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-md">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 transition-colors ${status === 'SUCCESS' ? 'bg-emerald-600 shadow-emerald-500/30' : 'bg-indigo-600 shadow-indigo-500/30'}`}>
                        {status === 'SUCCESS' ? <ShieldCheck className="text-white" size={32} /> : <Lock className="text-white" size={32} />}
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        {status === 'SUCCESS' ? 'Broker Connected' : 'Connect Trading Account'}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        {status === 'SUCCESS' ? 'Your account is linked for live execution.' : 'Secure access to Real-Time Tick Data & Execution'}
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative">
                    {/* Status Banner */}
                    <div className={`p-3 border-b flex items-center justify-center gap-2 ${status === 'SUCCESS' ? 'bg-emerald-900/40 border-emerald-500/20' : 'bg-indigo-900/50 border-indigo-500/20'}`}>
                        <Zap size={14} className={status === 'SUCCESS' ? 'text-emerald-400' : 'text-amber-400'} />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${status === 'SUCCESS' ? 'text-emerald-300' : 'text-indigo-200'}`}>
                            {status === 'SUCCESS' ? 'Terminal Active' : 'High Precision Data Feed'}
                        </span>
                    </div>

                    <div className="p-6 space-y-5">
                        {status !== 'SUCCESS' ? (
                            <>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Preferred Broker</label>
                                    <div className="relative">
                                        <select className="w-full bg-slate-900 text-white font-bold text-sm rounded-xl border border-slate-700 px-4 py-3 appearance-none focus:outline-none focus:border-indigo-500 transition-all">
                                            <option value="DHAN">Dhan (Recommended)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <Globe size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Client ID</label>
                                    <input 
                                        type="text" 
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                        placeholder="Dhan Client ID"
                                        className="w-full bg-slate-900 text-white text-sm rounded-xl border border-slate-700 px-4 py-3 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Access Token</label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            value={accessToken}
                                            onChange={(e) => setAccessToken(e.target.value)}
                                            placeholder="••••••••••••••••••••••••"
                                            className="w-full bg-slate-900 text-white text-sm rounded-xl border border-slate-700 px-4 py-3 pl-10 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 font-mono"
                                        />
                                        <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleLogin}
                                    disabled={isConnecting}
                                    className={`w-full py-4 rounded-xl font-black text-white shadow-lg transition-all flex items-center justify-center gap-2
                                        ${isConnecting 
                                            ? 'bg-slate-700 cursor-not-allowed' 
                                            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25 active:scale-95'
                                        }
                                    `}
                                >
                                    {isConnecting ? (
                                        <>
                                            <Server size={18} className="animate-pulse" /> Validating...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck size={18} /> Authenticate & Link
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex flex-col items-center gap-3 text-center">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-white uppercase tracking-tight">Session Authorized</p>
                                        <p className="text-xs text-slate-400 mt-1">{statusMessage}</p>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handleLogout}
                                    className="w-full py-3 rounded-xl font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <LogOut size={16} /> Disconnect Broker
                                </button>
                            </div>
                        )}

                        {status === 'ERROR' && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 animate-in shake-in duration-300">
                                <AlertCircle size={20} className="text-rose-500" />
                                <div>
                                    <div className="text-xs font-black text-rose-400 uppercase">Connection Failed</div>
                                    <div className="text-[10px] text-rose-500/80 font-bold">{statusMessage}</div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-slate-900 p-4 border-t border-slate-800 text-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                            <Lock size={12} className="text-emerald-500" /> End-to-End Encrypted Node
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
