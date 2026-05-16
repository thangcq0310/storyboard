import { WorkflowCase, WorkflowCaseInfo } from '../types';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Shield, DollarSign, Sparkles } from 'lucide-react';
import { WORKFLOW_CASES } from '../lib/workflowCases';

function MiniThumbnail({ panels, cols, rows }: { panels: number; cols: number; rows: number }) {
  const total = Math.min(panels, cols * rows);
  return (
    <div className="grid gap-[1px]" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="aspect-square rounded-sm bg-white/[0.06] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-indigo-500/5" />
          <span className="absolute bottom-[1px] right-[2px] text-[6px] text-gray-500 font-mono">{i + 1}</span>
        </div>
      ))}
    </div>
  );
}

const caseLayouts: Record<WorkflowCase, { cols: number; rows: number }> = {
  case1: { cols: 3, rows: 2 },
  case2: { cols: 3, rows: 3 },
  case10: { cols: 4, rows: 3 },
  case19: { cols: 2, rows: 2 },
};

export default function CaseTemplateCard({
  selected,
  onSelect,
}: {
  selected: WorkflowCase;
  onSelect: (c: WorkflowCase) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="section-label">AI Selected Workflow</div>
        <div className="badge-violet text-[10px]"><Sparkles size={10} /> Auto-detected</div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-1 px-1">
        {WORKFLOW_CASES.map((c) => {
          const isActive = selected === c.id;
          const layout = caseLayouts[c.id];

          return (
            <motion.button
              key={c.id}
              layout
              onClick={() => onSelect(c.id)}
              className={`relative flex-shrink-0 w-[180px] p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-violet-500/40 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15]'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Mini layout thumbnail */}
              <div className="mb-2" style={{ height: 72 }}>
                <MiniThumbnail panels={c.panels} cols={layout.cols} rows={layout.rows} />
              </div>

              <div className="text-xs font-semibold text-white mb-0.5 truncate">{c.title}</div>
              <div className="flex items-center gap-2 text-[9px] text-gray-500 mb-1">
                <span>{c.panels} panels</span>
                {c.tags.slice(0, 2).map(t => (
                  <span key={t} className="bg-white/[0.04] px-1.5 py-0.5 rounded-full">{t}</span>
                ))}
              </div>

              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-0.5 pt-1.5 border-t border-violet-500/20"
                >
                  <div className="flex items-center gap-1 text-[9px] text-emerald-400"><CheckCircle2 size={7} /> {c.match}% match</div>
                  <div className="flex items-center gap-1 text-[9px] text-violet-400"><Zap size={7} /> {c.coherence}% coherence</div>
                  <div className="flex items-center gap-1 text-[9px] text-blue-400"><Shield size={7} /> {c.stability}% stability</div>
                  <div className="flex items-center gap-1 text-[9px] text-amber-400"><DollarSign size={7} /> {c.efficiency}% efficiency</div>
                </motion.div>
              )}

              {/* Active badge */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-white" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}