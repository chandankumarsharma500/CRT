import React from 'react';

interface SMCLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'full' | 'icon' | 'compact' | 'header';
}

export const SMCLogo: React.FC<SMCLogoProps> = ({
  size = 44,
  className = '',
  showText = false,
  variant = 'icon'
}) => {
  return (
    <div className={`inline-flex items-center gap-3.5 select-none ${className}`}>
      {/* Unique Quantum Apex Falcon / Multi-Layered Diamond Emblem */}
      <div 
        className="relative flex items-center justify-center shrink-0 group cursor-pointer"
        style={{ width: size, height: size }}
      >
        {/* Multilayered Ambient Radial Pulse Aura */}
        <div 
          className="absolute -inset-1.5 bg-gradient-to-tr from-cyan-500 via-indigo-600 to-emerald-400 rounded-2xl blur-xl opacity-40 group-hover:opacity-85 transition-all duration-700 -z-10 animate-pulse-slow" 
        />
        <div 
          className="absolute inset-0 bg-slate-950/90 rounded-2xl border border-indigo-500/40 shadow-inner -z-0"
        />

        {/* Master SVG Emblem */}
        <svg
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5 transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_4px_20px_rgba(99,102,241,0.6)] z-10"
        >
          <defs>
            {/* Primary Crystalline Hologram Gradient */}
            <linearGradient id="smcApexHolo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="35%" stopColor="#6366f1" />
              <stop offset="70%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            {/* Bullish Institutional Emerald Laser Gradient */}
            <linearGradient id="smcBullLaser" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Radiant Golden Vector Gradient */}
            <linearGradient id="smcGoldApex" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* High-Tech Dark Carbon Facet Gradient */}
            <linearGradient id="smcDarkFacet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>

            {/* Core Fusion Singularity */}
            <radialGradient id="smcFusionCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>

            {/* Glow Filter */}
            <filter id="apexGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Layer 1: Outer Precision Octagonal Shield Perimeter */}
          <polygon
            points="70,8 116,26 132,70 116,114 70,132 24,114 8,70 24,26"
            fill="url(#smcDarkFacet)"
            stroke="url(#smcApexHolo)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Layer 2: Concentric Radar Crosshair Calibrations */}
          <circle cx="70" cy="70" r="54" stroke="#334155" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
          <circle cx="70" cy="70" r="38" stroke="#475569" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
          
          {/* Sniper Alignment Ticks */}
          <line x1="70" y1="12" x2="70" y2="24" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="70" y1="116" x2="70" y2="128" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="12" y1="70" x2="24" y2="70" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="116" y1="70" x2="128" y2="70" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Layer 3: Dynamic 3D Interlocking Falcon Wings / SMC Liquidity Chevrons */}
          {/* Left Wing Facet (Buy-Side Liquidity Pool) */}
          <polygon
            points="28,48 70,24 64,52 38,64"
            fill="#3b82f6"
            fillOpacity="0.3"
            stroke="#60a5fa"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Right Wing Facet (Sell-Side Liquidity Pool) */}
          <polygon
            points="112,48 70,24 76,52 102,64"
            fill="#8b5cf6"
            fillOpacity="0.3"
            stroke="#a78bfa"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Layer 4: Signature "SMC Apex Bolt" (Institutional Orderflow Breakout) */}
          <path
            d="M42,42 L98,42 L68,66 L94,66 L44,104 L58,76 L38,76 Z"
            fill="url(#smcBullLaser)"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinejoin="round"
            filter="url(#apexGlow)"
          />

          {/* Layer 5: Golden Bullish Divergence Arrow Head Piercing Upward */}
          <path
            d="M84,32 L112,32 L112,60"
            stroke="url(#smcGoldApex)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="112"
            y1="32"
            x2="78"
            y2="66"
            stroke="url(#smcGoldApex)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Layer 6: Core Quantum Singularity Center */}
          <circle cx="70" cy="70" r="16" fill="url(#smcFusionCore)" />
          <circle cx="70" cy="70" r="3.5" fill="#ffffff" />
          <circle cx="70" cy="70" r="1.5" fill="#38bdf8" />

          {/* Satellite Data Quantum Nodes */}
          <circle cx="116" cy="26" r="3" fill="#38bdf8" className="animate-pulse" />
          <circle cx="132" cy="70" r="3" fill="#a855f7" />
          <circle cx="116" cy="114" r="3" fill="#10b981" />
          <circle cx="24" cy="114" r="3" fill="#f59e0b" />
          <circle cx="8" cy="70" r="3" fill="#06b6d4" />
          <circle cx="24" cy="26" r="3" fill="#ec4899" className="animate-pulse" />
        </svg>
      </div>

      {/* Typography & Brand Title */}
      {(showText || variant === 'full' || variant === 'header') && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 dark:text-white tracking-tighter text-lg leading-tight flex items-center">
              SMC <span className="ml-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 bg-clip-text text-transparent font-black">APEX</span>
            </span>
            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-indigo-500/15 text-indigo-500 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE PRO
            </span>
          </div>
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-[0.24em] uppercase mt-0.5">
            Smart Money Quant Terminal
          </span>
        </div>
      )}
    </div>
  );
};
