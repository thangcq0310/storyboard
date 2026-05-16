import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { SafetyResult } from '../lib/safetyAnalyzer';

interface Props {
  results: SafetyResult[];
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? 'from-emerald-500 to-emerald-400' : score >= 45 ? 'from-amber-500 to-amber-400' : 'from-rose-500 to-rose-400';
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07] shadow-inner">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
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
          <div key={item.label} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-1.5">
                {severityIcon(item.severity)}
                <span className="truncate text-[11px] text-gray-300">{item.label}</span>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1.5 text-[11px]">
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
