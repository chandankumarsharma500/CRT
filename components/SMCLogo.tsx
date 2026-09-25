import React from 'react';

interface SMCLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'full' | 'icon' | 'badge';
}

export const SMCLogo: React.FC<SMCLogoProps> = ({
  size = 36,
  className = '',
  showText = false,
  variant = 'icon'
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Unique Quantum Institutional Hex-Sigma SVG Emblem */}
      <div 
        className="relative flex items-center justify-center shrink-0 group"
        style={{ width: size, height: size }}
      >
        {/* Ambient Neon Glow Aura */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-500 -z-10"
        />

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_12px_rgba(99,102,241,0.5)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Outer Hex Gradient */}
            <linearGradient id="smcShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>

            {/* Inner Neon Core Gradient */}
            <linearGradient id="smcCoreGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Gold Institutional Highlight */}
            <linearGradient id="goldAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Radial Core Glow */}
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Hexagonal Shield Boundary (Precision Institutional Matrix) */}
          <polygon
            points="50,4 92,26 92,74 50,96 8,74 8,26"
            fill="#050816"
            stroke="url(#smcShieldGrad)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Sub-grid Crosshair Reticle Lines (Quant Sniper Optics) */}
          <line x1="50" y1="12" x2="50" y2="28" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
          <line x1="50" y1="72" x2="50" y2="88" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
          <line x1="16" y1="50" x2="30" y2="50" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
          <line x1="70" y1="50" x2="84" y2="50" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />

          {/* Inner Hex Ring with tick marks */}
          <polygon
            points="50,16 80,32 80,68 50,84 20,68 20,32"
            fill="none"
            stroke="#1e293b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Center Glow Ambient Field */}
          <circle cx="50" cy="50" r="22" fill="url(#centerGlow)" />

          {/* Stylized SMC 'Sigma + Lightning Institutional Orderflow' Glyph */}
          {/* Top Shelf of Sigma */}
          <path
            d="M32,32 L68,32 L52,48 L68,68 L32,68"
            stroke="url(#smcCoreGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Institutional Liquidity Sweep Arrow Accent (Bullish Upthrust Delta) */}
          <path
            d="M62,24 L74,24 L74,36"
            stroke="url(#goldAccentGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Quantum Singularity Point (Precision Market Core) */}
          <circle cx="50" cy="50" r="4" fill="#ffffff" />
          <circle cx="50" cy="50" r="2" fill="#06b6d4" />
        </svg>
      </div>

      {/* Optional Brand Typography */}
      {(showText || variant === 'full') && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-slate-900 dark:text-white tracking-tighter text-base sm:text-lg leading-none">
              SMC <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">QUANT</span>
            </span>
            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v6.0
            </span>
          </div>
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-[0.25em] uppercase mt-0.5">
            Institutional Terminal
          </span>
        </div>
      )}
    </div>
  );
};
