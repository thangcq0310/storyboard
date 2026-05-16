import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Zap, Sparkles, Camera, Layers, Users, Move, CheckCircle2, Circle } from 'lucide-react';

const workflowSteps = [
  { id: 'idea', label: 'Idea', icon: Sparkles },
  { id: 'storyboard', label: 'Storyboard Strategy', icon: Camera },
  { id: 'gpt-image', label: 'GPT Image 2', icon: Layers },
  { id: 'review', label: 'Storyboard Review', icon: Users },
  { id: 'seedance', label: 'Seedance 2.0', icon: Move },
  { id: 'video', label: 'Final Video', icon: Zap },
];

const statusTexts = [
  'Analyzing cinematic structure...',
  'Building prompt hierarchy...',
  'Optimizing continuity...',
  'Preparing Seedance plan...',
  'Ready for export',
];

interface Props {
  currentStep: number;
}

export default function WorkflowPipeline({ currentStep }: Props) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="glass-panel p-4">
      <div className="section-label mb-3">AI Workflow Pipeline</div>
      <div className="flex flex-col gap-2">
        {workflowSteps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isPast = idx < currentStep;
          const isWarning = idx === 4 && currentStep < 2;
          const StatusIcon = isPast ? CheckCircle2 : isWarning ? AlertTriangle : isActive ? Circle : step.icon;

          return (
            <div key={step.id} className="relative">
              {idx > 0 && (
                <div
                  className={`absolute -top-2 left-[22px] h-2 w-0.5 rounded-full ${
                    isPast || isActive ? 'bg-gradient-to-b from-emerald-400/60 to-violet-400/50' : 'bg-white/[0.07]'
                  }`}
                />
              )}
              <motion.div
                layout
                className={`relative flex min-h-[58px] items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-300 ${
                  isActive
                    ? 'border-violet-400/35 bg-violet-500/15 shadow-[0_0_22px_rgba(124,58,237,0.14)]'
                    : isPast
                      ? 'border-emerald-500/20 bg-emerald-500/[0.07]'
                      : isWarning
                        ? 'border-amber-500/15 bg-amber-500/[0.04]'
                        : 'border-white/[0.05] bg-white/[0.02]'
                }`}
                animate={isActive && !shouldReduceMotion ? { y: [0, -1, 0] } : { y: 0 }}
                transition={isActive && !shouldReduceMotion ? { repeat: Infinity, duration: 2.4, ease: 'easeInOut' } : { duration: 0.2 }}
              >
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                    isActive
                      ? 'bg-violet-500/20 text-violet-200 ring-1 ring-violet-400/30'
                      : isPast
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isWarning
                          ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-white/[0.04] text-gray-500'
                  }`}
                >
                  <StatusIcon size={15} fill={isActive ? 'currentColor' : 'none'} />
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-medium transition-colors ${
                      isActive ? 'text-white' : isPast ? 'text-emerald-300' : isWarning ? 'text-amber-200' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </div>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-[10px] leading-snug text-violet-200/75"
                    >
                      {statusTexts[idx] || 'Processing…'}
                    </motion.div>
                  )}
                </div>

                {isActive && (
                  <span className="relative flex h-3 w-3 flex-shrink-0" aria-label="Active">
                    {!shouldReduceMotion && <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-violet-400 opacity-45" />}
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-violet-400" />
                  </span>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
