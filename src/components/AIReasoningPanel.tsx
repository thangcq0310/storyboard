import { motion } from 'framer-motion';
import { Activity, ArrowRight, Sparkles } from 'lucide-react';
import type { AIAnalysisResult } from '../lib/caseRouter';

interface Props {
  result: AIAnalysisResult;
  caseId: string;
}

function ScoreBadge({ label, value }: { label: string; value: string }) {
  const colorMap: Record<string, string> = {
    Low: 'text-emerald-400',
    Medium: 'text-amber-400',
    High: 'text-rose-400',
    Safe: 'text-emerald-400',
    Caution: 'text-amber-400',
    Risk: 'text-rose-400',
  };
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] text-gray-500">
        <Activity size={10} />
        <span className="truncate">{label}</span>
      </div>
      <div className={`text-xs font-semibold ${colorMap[value] || 'text-white'}`}>{value}</div>
    </div>
  );
}

export default function AIReasoningPanel({ result, caseId }: Props) {
  return (
    <div className="glass-panel p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-violet-400" />
        <div className="section-label mb-0">AI Analysis</div>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ScoreBadge label="Motion Complexity" value={result.motionComplexity} />
        <ScoreBadge label="Narrative Density" value={result.narrativeDensity} />
        <ScoreBadge label="Continuity Requirement" value={result.continuityRequirement} />
        <ScoreBadge label="Scene Transition Risk" value={result.sceneTransitionRisk} />
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/[0.06] p-2.5 sm:col-span-2">
          <div className="mb-1 text-[10px] uppercase tracking-[0.12em] text-gray-500">Workflow Match</div>
          <div className="text-xs font-medium leading-snug text-violet-200">{result.workflowMatch}</div>
        </div>
      </div>

      <motion.div
        key={caseId}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-3"
      >
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-violet-200">
          <ArrowRight size={10} />
          Why this workflow?
        </div>
        <div className="text-[11px] leading-relaxed text-gray-400">{result.explanation}</div>
      </motion.div>
    </div>
  );
}
