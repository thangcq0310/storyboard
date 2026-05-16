import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Sparkles, Camera, Layers, Users, Move, CheckCircle2 } from 'lucide-react';

const workflowSteps = [
  { id: 'idea', label: 'Idea', icon: Sparkles },
  { id: 'storyboard', label: 'Storyboard Strategy', icon: Camera },
  { id: 'gpt-image', label: 'GPT Image 2', icon: Layers },
  { id: 'review', label: 'Storyboard Review', icon: Users },
  { id: 'seedance', label: 'Seedance 2.0', icon: Move },
  { id: 'video', label: 'Final Video', icon: Zap },
];

const statusTexts = [
  'Analyzing cinematic structure…',
  'Building prompt hierarchy…',
  'Optimizing render stability…',
  'Preparing Seedance motion plan…',
  'Ready for export',
];

interface Props {
  currentStep: number;
}

export default function WorkflowPipeline({ currentStep }: Props) {
  return (
    <div className="glass-panel p-4">
      <div className="section-label mb-3">AI Workflow Pipeline</div>
      <div className="flex flex-col gap-1">
        {workflowSteps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isPast = idx < currentStep;
          const isFuture = idx > currentStep;

          return (
            <div key={step.id}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative ${
                  isActive
                    ? 'bg-violet-500/15 border border-violet-500/30 shadow-sm'
                    : isPast
                      ? 'bg-emerald-500/5 border border-emerald-500/15'
                      : 'bg-white/[0.02] border border-white/[0.04]'
                }`}
              >
                {/* Gradient line for completed steps */}
                {isPast && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full" />
                )}

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-violet-500/20 text-violet-400'
                      : isPast
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/[0.04] text-gray-500'
                  }`}
                >
                  {isPast ? <CheckCircle2 size={13} /> : <step.icon size={13} />}
                </div>

                <div className="flex-1 min-w-0">
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isActive ? 'text-white' : isPast ? 'text-emerald-300' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[9px] text-violet-300/60 mt-0.5"
                    >
                      {statusTexts[idx] || 'Processing…'}
                    </motion.div>
                  )}
                </div>

                {isActive && (
                  <span className="flex h-2.5 w-2.5 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-violet-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500" />
                  </span>
                )}
              </div>

              {idx < workflowSteps.length - 1 && (
                <div className="flex justify-center py-0.5 relative">
                  {/* Gradient connector for past steps */}
                  {isPast && idx + 1 <= currentStep ? (
                    <div className="w-0.5 h-5 bg-gradient-to-b from-emerald-500/40 to-emerald-500/10" />
                  ) : (
                    <ArrowRight size={10} className="text-white/[0.06]" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}