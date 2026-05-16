import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Activity, ArrowRight } from 'lucide-react';
import type { AIAnalysisResult } from '../lib/caseRouter';

interface Props {
  result: AIAnalysisResult;
  caseId: string;
}

function ScoreBadge({ label, value, className }: { label: string; value: string; className?: string }) {
  const colorMap: Record<string, string> = {
    Low: 'text-emerald-400',
    Medium: 'text-amber-400',
    High: 'text-rose-400',
    Safe: 'text-emerald-400',
    Caution: 'text-amber-400',
    Risk: 'text-rose-400',
  };
  return (
    <div className={`flex items-center justify-between text-xs ${className}`}>
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${colorMap[value] || 'text-white'}`}>{value}</span>
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

      <div className="space-y-1.5 mb-3">
        <ScoreBadge label="Motion Complexity" value={result.motionComplexity} />
        <ScoreBadge label="Narrative Density" value={result.narrativeDensity} />
        <ScoreBadge label="Continuity Requirement" value={result.continuityRequirement} />
        <ScoreBadge label="Scene Transition Risk" value={result.sceneTransitionRisk} />
        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.06]">
          <span className="text-gray-500">Workflow Match</span>
          <span className="font-medium text-violet-300">{result.workflowMatch}</span>
        </div>
      </div>

      <motion.div
        key={caseId}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-2.5"
      >
        <div className="text-[10px] text-gray-400 leading-relaxed">{result.explanation}</div>
      </motion.div>
    </div>
  );
}