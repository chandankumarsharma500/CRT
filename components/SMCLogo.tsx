import React from 'react';

interface SMCLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'full' | 'icon' | 'compact' | 'header';
}

export const SMCLogo: React.FC<SMCLogoProps> = ({
  size = 40,
  className = '',
  showText = false,
  variant = 'icon'
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Precision Quantum Faceted Diamond Emblem */}
      <div 
        className="relative flex items-center justify-center shrink-0 group cursor-pointer"
        style={{ width: size, height: size }}
      >
        {/* Ambient Chromatic Core Glow */}
        <div 
          className="absolute -inset-1 bg-gradient-to-tr from-cyan-400 via-emerald-400 to-indigo-500 rounded-xl blur-md opacity-40 group-hover:opacity-80 transition-all duration-500 -z-10" 
        />
        <div 
          className="absolute inset-0 bg-[#050814] rounded-xl border border-white/10 shadow-inner -z-0"
        />

        {/* Master SVG Vector */}
        <svg
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5 transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_2px_12px_rgba(0,229,255,0.4)] z-10"
        >
          <defs>
            <linearGradient id="apexLaserCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="50%" stopColor="#00f59b" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            <linearGradient id="apexCoreEmerald" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f59b" />
              <stop offset="100%" stopColor="#00e5ff" />
            </linearGradient>

            <linearGradient id="apexAmberGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Precision Diamond Polygon Frame */}
          <polygon
            points="70,10 125,42 125,98 70,130 15,98 15,42"
            fill="#080d1e"
            stroke="url(#apexLaserCyan)"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Micro Grid Alignment Calibrations */}
          <line x1="70" y1="14" x2="70" y2="34" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />
          <line x1="70" y1="106" x2="70" y2="126" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="70" x2="38" y2="70" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />
          <line x1="102" y1="70" x2="122" y2="70" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />

          {/* Central CRT Liquidity Triangles */}
          <polygon
            points="34,50 70,28 66,54 44,64"
            fill="#00e5ff"
            fillOpacity="0.25"
            stroke="#00e5ff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polygon
            points="106,50 70,28 74,54 96,64"
            fill="#8b5cf6"
            fillOpacity="0.25"
            stroke="#a78bfa"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* High-Impact Apex Lightning Bolt (Candle Range Surge) */}
          <path
            d="M45,46 L95,46 L68,68 L92,68 L48,102 L60,76 L40,76 Z"
            fill="url(#apexCoreEmerald)"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Golden Target Crosshairs Arrow */}
          <polyline points="86,30 110,30 110,54" fill="none" stroke="url(#apexAmberGold)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="110" y1="30" x2="78" y2="62" stroke="url(#apexAmberGold)" strokeWidth="3.5" strokeLinecap="round" />

          {/* Central Fusion Core */}
          <circle cx="70" cy="70" r="4" fill="#ffffff" />
          <circle cx="70" cy="70" r="1.5" fill="#00e5ff" />
        </svg>
      </div>

      {/* Modern High-Impact Brand Typography */}
      {(showText || variant === 'full' || variant === 'header') && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-slate-900 dark:text-white tracking-tight text-base lg:text-lg leading-tight flex items-center">
              APEX <span className="ml-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 font-extrabold">QUANTUM</span>
            </span>
            <span className="font-mono text-[9px] font-bold tracking-widest text-cyan-500 dark:text-cyan-400 uppercase bg-cyan-500/10 border border-cyan-500/25 px-1.5 py-0.5 rounded">
              V5.0
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-400 dark:text-slate-400 tracking-wider font-mono">
            <span>CRT ENGINE</span>
            <span>·</span>
            <span className="text-emerald-500 font-semibold">YAHOO LIVE</span>
          </div>
        </div>
      )}
    </div>
  );
};

