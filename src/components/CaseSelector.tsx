import { WorkflowCase, WorkflowCaseInfo } from '../types';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Shield, DollarSign, Sparkles } from 'lucide-react';

const cases: WorkflowCaseInfo[] = [
  {
    id: 'case1',
    title: 'Standard Storyboard → Video',
    panels: 6,
    description: 'Linear storyboard with sequential scene generation and video synthesis',
    tags: ['General purpose', 'Narrative', 'Balanced'],
    match: 96,
    coherence: 92,
    stability: 88,
    efficiency: 85,
  },
  {
    id: 'case2',
    title: '3×3 Grid Storyboard',
    panels: 9,
    description: 'Matrix-based storyboard grid for parallel concept exploration',
    tags: ['Exploration', 'Grid', 'Multi-concept'],
    match: 78,
    coherence: 85,
    stability: 72,
    efficiency: 90,
  },
  {
    id: 'case10',
    title: 'Multi-Frame Fast-Cut',
    panels: 12,
    description: 'Rapid-fire multi-frame montage for high-energy sequences',
    tags: ['Fast paced', 'Montage', 'Dynamic'],
    match: 65,
    coherence: 60,
    stability: 70,
    efficiency: 75,
  },
  {
    id: 'case19',
    title: 'Storyboard-First Cost Control',
    panels: 4,
    description: 'Budget-optimized workflow with minimal render passes',
    tags: ['Budget', 'Efficient', 'Minimal'],
    match: 88,
    coherence: 90,
    stability: 95,
    efficiency: 98,
  },
];

export default function CaseSelector({
  selected,
  onSelect,
}: {
  selected: WorkflowCase;
  onSelect: (c: WorkflowCase) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="section-label">AI Selected Workflow</div>
        <div className="badge-violet text-[10px]">
          <Sparkles size={10} /> Auto-detected
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {cases.map((c) => {
          const isActive = selected === c.id;
          return (
            <motion.button
              key={c.id}
              layout
              onClick={() => onSelect(c.id)}
              className={`relative flex-shrink-0 w-[160px] p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-violet-500/40 bg-violet-500/10'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Mini thumbnail preview */}
              <div className="flex gap-[2px] mb-2">
                {Array.from({ length: Math.min(c.panels, 6) }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded-sm ${
                      isActive
                        ? i % 2 === 0
                          ? 'bg-violet-500/30'
                          : 'bg-violet-500/15'
                        : i % 2 === 0
                          ? 'bg-white/[0.06]'
                          : 'bg-white/[0.03]'
                    }`}
                  />
                ))}
              </div>

              <div className="text-xs font-semibold text-white mb-1 truncate">
                {c.title}
              </div>
              <div className="text-[10px] text-gray-500 mb-2">{c.panels} panels</div>

              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1"
                >
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <CheckCircle2 size={8} /> {c.match}% match
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-violet-400">
                    <Zap size={8} /> {c.coherence}% coherence
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-blue-400">
                    <Shield size={8} /> {c.stability}% stability
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-amber-400">
                    <DollarSign size={8} /> {c.efficiency}% efficiency
                  </div>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}