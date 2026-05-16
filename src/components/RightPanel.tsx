import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Zap,
  Camera,
  Users,
  Move,
  Layers,
  ArrowRight,
} from 'lucide-react';

const workflowSteps = [
  { id: 'idea', label: 'Idea', icon: Sparkles },
  { id: 'storyboard', label: 'Storyboard Strategy', icon: Camera },
  { id: 'gpt-image', label: 'GPT Image 2', icon: Layers },
  { id: 'review', label: 'Storyboard Review', icon: Users },
  { id: 'seedance', label: 'Seedance 2.0', icon: Move },
  { id: 'video', label: 'Final Video', icon: Zap },
];

export function WorkflowGraph({ currentStep }: { currentStep: number }) {
  return (
    <div className="glass-panel p-4">
      <div className="section-label mb-3">AI Workflow Pipeline</div>
      <div className="flex flex-col gap-1.5">
        {workflowSteps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isPast = idx < currentStep;
          const isFuture = idx > currentStep;

          return (
            <div key={step.id}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-violet-500/15 border border-violet-500/30'
                    : isPast
                      ? 'bg-emerald-500/5 border border-emerald-500/15'
                      : 'bg-white/[0.02] border border-white/[0.04]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-violet-500/20 text-violet-400 animate-pulse'
                      : isPast
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/[0.04] text-gray-500'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <step.icon size={13} />
                  )}
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : isPast
                        ? 'text-emerald-300'
                        : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
                {isActive && (
                  <span className="ml-auto">
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-violet-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                    </span>
                  </span>
                )}
              </div>
              {idx < workflowSteps.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowRight size={10} className="text-white/[0.08]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AIReasoning({ caseId }: { caseId: string }) {
  const reasons: Record<string, { motion: string; duration: string; continuity: string }> = {
    case1: { motion: 'Medium', duration: 'Short', continuity: 'Strong' },
    case2: { motion: 'Low', duration: 'Medium', continuity: 'Moderate' },
    case10: { motion: 'High', duration: 'Very short', continuity: 'Weak' },
    case19: { motion: 'Low', duration: 'Long', continuity: 'Strong' },
  };

  const r = reasons[caseId] || reasons.case1;

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-violet-400" />
        <div className="section-label mb-0">AI Reasoning</div>
      </div>
      <div className="text-xs text-gray-400 space-y-2">
        <p>
          Your video contains <span className="font-medium text-white">{r.motion}</span> motion,{' '}
          <span className="font-medium text-white">{r.duration}</span> duration,{' '}
          <span className="font-medium text-white">{r.continuity}</span> continuity requirement.
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={caseId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-2.5 mt-2"
          >
            <div className="font-medium text-violet-300 text-xs flex items-center gap-1.5">
              <Sparkles size={11} /> Recommended workflow
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {caseId === 'case1' && 'Standard Storyboard → Video — best for narrative projects with balanced production needs.'}
              {caseId === 'case2' && '3×3 Grid Storyboard — ideal for concept exploration and parallel style testing.'}
              {caseId === 'case10' && 'Multi-Frame Fast-Cut — optimized for high-energy, rapid sequence content.'}
              {caseId === 'case19' && 'Storyboard-First Cost Control — best for budget-conscious projects with minimal render passes.'}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function RenderSafety() {
  const items = [
    { label: 'Character consistency', status: 'safe' as const },
    { label: 'Motion complexity', status: 'safe' as const },
    { label: 'Frame drift risk', status: 'warning' as const },
    { label: 'Seedance compatibility', status: 'safe' as const },
    { label: 'Scene transition stability', status: 'safe' as const },
  ];

  return (
    <div className="glass-panel p-4">
      <div className="section-label mb-3 flex items-center gap-1.5">
        <Shield size={12} /> Render Safety
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <span className="text-gray-400">{item.label}</span>
            {item.status === 'safe' ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 size={11} /> Safe
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400">
                <AlertTriangle size={11} /> Caution
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PromptArchitecture() {
  const items = [
    { label: 'Cinematic Style', color: 'bg-pink-500/20 text-pink-300' },
    { label: 'Camera Direction', color: 'bg-violet-500/20 text-violet-300' },
    { label: 'Subject Consistency', color: 'bg-blue-500/20 text-blue-300' },
    { label: 'Motion Guidance', color: 'bg-emerald-500/20 text-emerald-300' },
    { label: 'Lighting Control', color: 'bg-amber-500/20 text-amber-300' },
  ];

  return (
    <div className="glass-panel p-4">
      <div className="section-label mb-3">Prompt Architecture</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item.label}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${item.color}`}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}