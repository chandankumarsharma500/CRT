import React from 'react';
import { 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  Award, 
  Compass, 
  BarChart2, 
  ArrowRight,
  Info,
  Layers
} from 'lucide-react';
import { 
  CRTKillZoneStatus, 
  SMTDivergence, 
  SweepValidation, 
  InstitutionalQualityScore,
  FiveMinDisplacementMetrics,
  CRTTimeframe,
  CRTCandleMarking
} from '../types';

interface KillZoneProps {
  killZone: CRTKillZoneStatus;
}

export const CRTKillZoneView: React.FC<KillZoneProps> = ({ killZone }) => {
  const sessions = [
    {
      id: 'MORNING_OPEN',
      name: 'Morning Open Sweep (Initial Balance)',
      time: '09:15 AM - 10:30 AM IST',
      type: 'PRIME_HIGH_ACCURACY',
      winRate: '88% - 94%',
      riskMultiplier: '100% (Full Size)',
      description: 'The highest liquidity delivery window. Algorithms sweep overnight retail stops (PDH/PDL) and set the High or Low of the day (HOD/LOD).'
    },
    {
      id: 'MIDDAY_CHOP',
      name: 'Mid-Day Algorithmic Chop Trap',
      time: '10:30 AM - 12:30 PM IST',
      type: 'AVOID_NO_TRADE',
      winRate: '<45% (Chop & Fake Sweeps)',
      riskMultiplier: '0% (STRICTLY AVOID)',
      description: 'Volume drops as institutional desks pause. Retail traders get repeatedly stopped out on false wicks and inside range noise. DO NOT TRADE.'
    },
    {
      id: 'EURO_OVERLAP',
      name: 'European Open / London Overlap',
      time: '12:30 PM - 01:45 PM IST',
      type: 'HIGH_ACCURACY',
      winRate: '80% - 86%',
      riskMultiplier: '75% (Normal Size)',
      description: 'London market opening injects fresh foreign institutional liquidity. Perfect for deep 4H and 1H Fair Value Gap (FVG) mitigations.'
    },
    {
      id: 'AFTERNOON_POWER',
      name: 'Afternoon Institutional Power Hour',
      time: '02:00 PM - 03:15 PM IST',
      type: 'PRIME_HIGH_ACCURACY',
      winRate: '85% - 92%',
      riskMultiplier: '100% (Full Size)',
      description: 'Aggressive institutional rebalancing and delivery into HTF 50% Equilibrium and opposite liquidity extremes before cash market close.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Active Session Status Header */}
      <div className={`p-6 rounded-3xl border transition-all ${
        killZone.isHighAccuracyWindow
          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-xl shadow-emerald-950/20'
          : 'bg-amber-950/20 border-amber-500/40 shadow-xl shadow-amber-950/20'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              killZone.isHighAccuracyWindow 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              <Clock size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg ${
                  killZone.isHighAccuracyWindow 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {killZone.isHighAccuracyWindow ? 'HIGH ACCURACY WINDOW ACTIVE' : 'LOW ACCURACY CHOP WINDOW'}
                </span>
                <span className="text-xs font-mono text-slate-400">{killZone.timeWindowIST}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{killZone.sessionName}</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">{killZone.reason}</p>
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shrink-0 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Execution Rule</span>
            <span className={`text-sm font-black font-mono mt-0.5 block ${
              killZone.tradeRecommendation === 'AGGRESSIVE_TRADE'
                ? 'text-emerald-400'
                : killZone.tradeRecommendation === 'NORMAL_TRADE'
                ? 'text-indigo-400'
                : 'text-amber-400'
            }`}>
              {killZone.tradeRecommendation.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Institutional Delivery Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((s) => {
          const isActive = killZone.currentSession === s.id;
          const isAvoid = s.type === 'AVOID_NO_TRADE';

          return (
            <div
              key={s.id}
              className={`p-5 rounded-3xl border transition-all ${
                isActive
                  ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    isAvoid ? 'bg-rose-500' : 'bg-emerald-500'
                  } ${isActive ? 'animate-ping' : ''}`} />
                  <h3 className="text-sm font-bold text-white">{s.name}</h3>
                </div>
                <span className="text-xs font-mono text-indigo-400 font-bold">{s.time}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 my-3 font-mono text-xs">
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Win Rate</span>
                  <span className={`font-bold ${isAvoid ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {s.winRate}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Position Sizing</span>
                  <span className="font-bold text-white">{s.riskMultiplier}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
            </div>
          );
        })}
      </div>

      {/* The "Why Timing Matters" Rule Box */}
      <div className="p-5 rounded-3xl bg-indigo-950/20 border border-indigo-500/30">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
          <Sparkles size={16} className="text-indigo-400" />
          The Golden CRT Timing Rule: Time + Price Confluence
        </h4>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Candle Range Theory is an <strong>algorithmic delivery model</strong>. The algorithms that sweep previous candle wicks only inject institutional volume during specific delivery hours. A sweep that occurs at <strong>11:30 AM (Chop Zone)</strong> has a high probability of failing or getting chopped up. But the exact same sweep at <strong>09:35 AM</strong> or <strong>02:15 PM</strong> produces an explosive 1:8+ Risk-to-Reward move.
        </p>
      </div>
    </div>
  );
};

interface SMTProps {
  smt: SMTDivergence;
}

export const CRTSMTDivergenceView: React.FC<SMTProps> = ({ smt }) => {
  return (
    <div className="space-y-6">
      {/* SMT Divergence Main Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              smt.isConfirmed
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              <Zap size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg ${
                  smt.isConfirmed
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  SMT ACCELERATOR (+{smt.accuracyBoostPercent}% ACCURACY BOOST)
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {smt.primarySymbol} ⟷ {smt.correlatedSymbol}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{smt.title}</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">{smt.description}</p>
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-purple-500/30 text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">SMT Status</span>
            <span className={`text-base font-black font-mono mt-0.5 block ${
              smt.status.includes('BEARISH') ? 'text-rose-400' : smt.status.includes('BULLISH') ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              {smt.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Visual Cross-Index Divergence Schematic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="font-bold text-white">{smt.primarySymbol} (Primary Index)</span>
              <span className="text-amber-400 font-bold">Swept Liquidity</span>
            </div>
            <div className="h-24 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center relative p-3">
              <div className="text-center font-mono">
                <span className="text-xs font-bold text-rose-400 block">{smt.primaryAction}</span>
                <span className="text-[10px] text-slate-500 block mt-1">Stops Purged by Wick (Higher High)</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="font-bold text-white">{smt.correlatedSymbol} (Correlated Sibling)</span>
              <span className="text-purple-400 font-bold">Failed To Sweep</span>
            </div>
            <div className="h-24 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center relative p-3">
              <div className="text-center font-mono">
                <span className="text-xs font-bold text-purple-300 block">{smt.correlatedAction}</span>
                <span className="text-[10px] text-slate-500 block mt-1">Smart Money Footprint: Lack of sponsorship</span>
              </div>
            </div>
          </div>
        </div>

        {/* Institutional Explanation */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
          <strong className="text-white">Why SMT Divergence is the Ultimate Filter: </strong>
          In normal retail conditions, NIFTY and BANKNIFTY move in tandem. When NIFTY makes a new high but BANKNIFTY refuses to follow and prints a lower high, that <em>crack in correlation</em> is caused by institutions silently distributing large short blocks in BANKNIFTY while using NIFTY's high to trap breakout buyers. Taking a CRT 5M Short when SMT is present virtually eliminates false breakouts.
        </div>
      </div>
    </div>
  );
};

interface QualityScoreProps {
  score: InstitutionalQualityScore;
  marking: CRTCandleMarking;
  killZone: CRTKillZoneStatus;
  smt: SMTDivergence;
}

export const CRTQualityScoreView: React.FC<QualityScoreProps> = ({ score, marking, killZone, smt }) => {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/20';
      case 'A': return 'text-indigo-400 border-indigo-500/40 bg-indigo-500/20';
      case 'B': return 'text-amber-400 border-amber-500/40 bg-amber-500/20';
      default: return 'text-rose-400 border-rose-500/40 bg-rose-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Header Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border ${getGradeColor(score.grade)} shadow-lg`}>
              {score.grade}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  INSTITUTIONAL SETUP GRADE
                </span>
                <span className="text-xs font-mono text-slate-400">Composite Score: {score.totalScore}/100</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{score.summaryVerdict}</h2>
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Expected Win Rate</span>
            <span className="text-lg font-black font-mono text-emerald-400 mt-0.5 block">{score.estimatedWinRate}</span>
            <span className="text-[10px] text-slate-400 font-mono">Sizing: {score.positionSizing.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* 6 Confluence Pillars Progress Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">1. HTF Sweep</span>
            <div className="flex items-center justify-between font-mono text-sm font-bold text-white mt-1">
              <span>{score.breakdown.htfSweepPoints}/20 pts</span>
              <span className="text-[10px] text-emerald-400">Active</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${(score.breakdown.htfSweepPoints / 20) * 100}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">2. Wick Acceptance</span>
            <div className="flex items-center justify-between font-mono text-sm font-bold text-white mt-1">
              <span>{score.breakdown.wickValidationPoints}/15 pts</span>
              <span className="text-[10px] text-emerald-400">Valid</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${(score.breakdown.wickValidationPoints / 15) * 100}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">3. Kill Zone Timing</span>
            <div className="flex items-center justify-between font-mono text-sm font-bold text-white mt-1">
              <span>{score.breakdown.killZonePoints}/15 pts</span>
              <span className="text-[10px] text-emerald-400">Prime</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${(score.breakdown.killZonePoints / 15) * 100}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">4. SMT Divergence</span>
            <div className="flex items-center justify-between font-mono text-sm font-bold text-white mt-1">
              <span>{score.breakdown.smtDivergencePoints}/20 pts</span>
              <span className="text-[10px] text-purple-400">+25%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${(score.breakdown.smtDivergencePoints / 20) * 100}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">5. 5M Displacement</span>
            <div className="flex items-center justify-between font-mono text-sm font-bold text-white mt-1">
              <span>{score.breakdown.displacementPoints}/15 pts</span>
              <span className="text-[10px] text-emerald-400">2.4x Vol</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${(score.breakdown.displacementPoints / 15) * 100}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-indigo-500/30 shadow-lg shadow-indigo-500/5">
            <span className="text-[10px] uppercase font-bold text-indigo-400 block">6. Quantum Core</span>
            <div className="flex items-center justify-between font-mono text-sm font-bold text-white mt-1">
              <span>{score.breakdown.quantumCorePoints ?? 12}/15 pts</span>
              <span className="text-[10px] text-indigo-400">IFVG/BOB</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${((score.breakdown.quantumCorePoints ?? 12) / 15) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Position Sizing Rules Table */}
        <div className="mt-6 bg-slate-950/80 rounded-2xl border border-slate-800 p-4">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
            Institutional Risk & Sizing Execution Table
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30">
              <span className="text-emerald-400 font-bold block">A+ Tier (88-100 pts)</span>
              <span className="text-slate-300 text-[11px] block mt-0.5">100% Full Position Size</span>
              <span className="text-[10px] text-slate-500 block">Win rate: 88% - 94%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-indigo-500/30">
              <span className="text-indigo-400 font-bold block">A Tier (74-87 pts)</span>
              <span className="text-slate-300 text-[11px] block mt-0.5">75% Normal Position Size</span>
              <span className="text-[10px] text-slate-500 block">Win rate: 78% - 85%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30">
              <span className="text-amber-400 font-bold block">B Tier (60-73 pts)</span>
              <span className="text-slate-300 text-[11px] block mt-0.5">50% Half Position Size</span>
              <span className="text-[10px] text-slate-500 block">Win rate: 65% - 72%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-rose-500/30">
              <span className="text-rose-400 font-bold block">C Tier / Chop (&lt;60 pts)</span>
              <span className="text-slate-300 text-[11px] block mt-0.5">0% (PASS / DO NOT TRADE)</span>
              <span className="text-[10px] text-slate-500 block">Trap probability &gt; 50%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
