import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { SafetyResult } from '../lib/safetyAnalyzer';

interface Props {
  results: SafetyResult[];
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? 'from-emerald-500 to-emerald-400' : score >= 45 ? 'from-amber-500 to-amber-400' : 'from-rose-500 to-rose-400';
  const glow = score >= 75 ? 'shadow-emerald-500/20' : score >= 45 ? 'shadow-amber-500/20' : 'shadow-rose-500/20';
  return (
    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mt-1 shadow-inner">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full rounded-full bg-gradient-to-r ${color} shadow-sm ${glow}`}
      />
    </div>
  );
}

export default function RenderSafetyPanel({ results }: Props) {
  const severityIcon = (sev: string) => {
    if (sev === 'safe') return <CheckCircle2 size={12} className="text-emerald-400" />;
    if (sev === 'caution') return <AlertTriangle size={12} className="text-amber-400" />;
    return <AlertTriangle size={12} className="text-rose-400" />;
  };

  const severityLabel = (sev: string) => {
    if (sev === 'safe') return <span className="text-emerald-400">Safe</span>;
    if (sev === 'caution') return <span className="text-amber-400">Caution</span>;
    return <span className="text-rose-400">Risk</span>;
  };

  return (
    <div className="glass-panel p-4">
      <div className="section-label mb-3 flex items-center gap-1.5">
        <Shield size={12} /> Render Safety
      </div>
      <div className="space-y-2.5">
        {results.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                {severityIcon(item.severity)}
                <span className="text-gray-400">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-gray-500 text-[10px]">{item.score}%</span>
                {severityLabel(item.severity)}
              </div>
            </div>
            <ScoreBar score={item.score} />
          </div>
        ))}
      </div>
    </div>
  );
}