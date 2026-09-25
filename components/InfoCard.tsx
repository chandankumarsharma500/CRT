import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, value, subValue, icon: Icon, trend, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    slate: "bg-slate-700/30 text-slate-400 border-slate-600/30"
  };

  const selectedColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className={`p-4 rounded-xl border ${selectedColor.split(" ")[2]} bg-slate-800/50 backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${selectedColor}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-slate-100">{value}</span>
        {subValue && <span className="text-xs text-slate-500 mt-1">{subValue}</span>}
      </div>
    </div>
  );
};