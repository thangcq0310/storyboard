import { WorkflowCase } from '../types';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Shield, DollarSign, Sparkles, Target, Film } from 'lucide-react';
import { WORKFLOW_CASES } from '../lib/workflowCases';

function MiniThumbnail({ panels, cols, rows }: { panels: number; cols: number; rows: number }) {
  const total = Math.min(panels, cols * rows);
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="aspect-video rounded-[4px] bg-white/[0.06] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-indigo-500/10 to-blue-500/10" />
          <div className="absolute inset-x-1 bottom-1 h-[2px] rounded bg-white/[0.08]" />
          <span className="absolute top-[2px] left-[3px] text-[6px] text-white/40 font-mono">{i + 1}</span>
        </div>
      ))}
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone }: { icon: any; label: string; value?: number; tone: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-2">
      <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-gray-400">
        <Icon size={11} className={tone} />
        <span className="truncate">{label}</span>
      </div>
      <div className={`text-[11px] font-semibold ${tone}`}>{value}%</div>
    </div>
  );
}

const caseLayouts: Record<WorkflowCase, { cols: number; rows: number }> = {
  case1: { cols: 3, rows: 2 },
  case2: { cols: 3, rows: 3 },
  case10: { cols: 4, rows: 3 },
  case19: { cols: 4, rows: 2 },
};

export default function CaseTemplateCard({
  selected,
  onSelect,
}: {
  selected: WorkflowCase;
  onSelect: (c: WorkflowCase) => void;
}) {
  const selectedCase = WORKFLOW_CASES.find((c) => c.id === selected) || WORKFLOW_CASES[0];
  const selectedLayout = caseLayouts[selectedCase.id];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="section-label">AI Selected Workflow</div>
        <div className="badge-violet text-[10px]"><Sparkles size={10} /> Best match</div>
      </div>

      <motion.div
        key={selectedCase.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border border-violet-500/25 bg-violet-500/[0.07] p-3"
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_90%_0%,rgba(99,102,241,0.18),transparent_38%)]" />
        <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-[92px_1fr]">
          <div className="rounded-lg border border-white/[0.07] bg-black/20 p-2">
            <MiniThumbnail panels={selectedCase.panels} cols={selectedLayout.cols} rows={selectedLayout.rows} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white leading-tight">{selectedCase.title}</div>
                <div className="mt-1 text-[10px] text-gray-400">{selectedCase.description}</div>
              </div>
              <div className="badge-emerald w-fit shrink-0 text-[10px]"><CheckCircle2 size={10} /> Selected</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <Metric icon={Target} label="Match" value={selectedCase.match} tone="text-emerald-400" />
              <Metric icon={Zap} label="Coherence" value={selectedCase.coherence} tone="text-violet-300" />
              <Metric icon={Shield} label="Stability" value={selectedCase.stability} tone="text-blue-300" />
              <Metric icon={DollarSign} label="Efficiency" value={selectedCase.efficiency} tone="text-amber-300" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-1 px-1">
        {WORKFLOW_CASES.map((c) => {
          const isActive = selected === c.id;
          const layout = caseLayouts[c.id];

          return (
            <motion.button
              key={c.id}
              layout
              onClick={() => onSelect(c.id)}
              className={`relative min-h-[148px] w-[176px] flex-shrink-0 rounded-xl border p-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 ${
                isActive
                  ? 'border-violet-500/40 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15]'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Mini layout thumbnail */}
              <div className="mb-2 rounded-lg bg-black/20 p-1.5" style={{ height: 58 }}>
                <MiniThumbnail panels={c.panels} cols={layout.cols} rows={layout.rows} />
              </div>

              <div className="mb-1 text-xs font-semibold leading-snug text-white">{c.title}</div>
              <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[9px] text-gray-500">
                <span className="flex items-center gap-1"><Film size={8} /> {c.panels} panels</span>
                {c.tags.slice(0, 2).map(t => (
                  <span key={t} className="bg-white/[0.04] px-1.5 py-0.5 rounded-full">{t}</span>
                ))}
              </div>

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
