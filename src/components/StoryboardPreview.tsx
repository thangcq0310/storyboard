import { motion, AnimatePresence } from 'framer-motion';
import { Film, ImageIcon, Eye, Play, Clapperboard } from 'lucide-react';
import { Scene, WorkflowCase } from '../types';

const gridConfig: Record<WorkflowCase, { cols: number; rows: number; label: string }> = {
  case1: { cols: 3, rows: 2, label: '6 Panel Storyboard' },
  case2: { cols: 3, rows: 3, label: '3×3 Grid Storyboard' },
  case10: { cols: 4, rows: 3, label: '12 Frame Montage' },
  case19: { cols: 2, rows: 2, label: '4 Panel Editorial' },
};

interface Props {
  scenes: Scene[];
  caseId: WorkflowCase;
  selectedImages: Record<string, boolean>;
  onToggleSelect: (id: string) => void;
  isGenerating: boolean;
  generationProgress: number;
}

export default function StoryboardPreview({
  scenes,
  caseId,
  selectedImages,
  onToggleSelect,
  isGenerating,
  generationProgress,
}: Props) {
  const config = gridConfig[caseId];
  const totalPanels = config.cols * config.rows;
  const filledCount = Math.min(scenes.length, totalPanels);
  const visibleScenes = scenes.slice(0, totalPanels);

  // Show placeholder grid when no scenes
  if (scenes.length === 0 && !isGenerating) {
    return (
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="section-label mb-0">{config.label}</div>
          <div className="badge-violet text-[10px]"><Eye size={10} /> Preview</div>
        </div>
        <div className={`grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${config.cols}, 1fr)` }}>
          {Array.from({ length: totalPanels }).map((_, i) => (
            <motion.div
              key={`ph-${i}`}
              className="relative aspect-video rounded-lg overflow-hidden border border-white/[0.04] bg-gradient-to-br from-violet-500/[0.03] to-indigo-500/[0.02]"
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon size={20} className="text-white/[0.05]" />
              </div>
              <div className="absolute bottom-1 left-1 text-[8px] font-mono text-gray-600 bg-black/40 px-1 py-0.5 rounded">
                {i + 1}
              </div>
              {/* Read order arrow */}
              <div className="absolute top-1 right-1 text-[8px] text-gray-600">
                {i < totalPanels - 1 ? (i % config.cols === config.cols - 1 ? '↓' : '→') : ''}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Generating state: show panel-by-panel fill
  if (isGenerating) {
    return (
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="section-label mb-0">{config.label}</div>
          <div className="badge-violet text-[10px] animate-pulse"><Film size={10} /> Building cinematic storyboard…</div>
        </div>
        <div className={`grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${config.cols}, 1fr)` }}>
          {Array.from({ length: totalPanels }).map((_, i) => {
            const isFilled = i < filledCount;
            const isCurrent = i === filledCount;

            return (
              <motion.div
                key={`gen-${i}`}
                className="relative aspect-video rounded-lg overflow-hidden border border-white/[0.06]"
                initial={{ opacity: 0.2, scale: 0.95 }}
                animate={
                  isFilled
                    ? { opacity: 1, scale: 1 }
                    : isCurrent
                      ? { opacity: [0.3, 0.6, 0.3], scale: 1 }
                      : { opacity: 0.2, scale: 0.95 }
                }
                transition={isCurrent ? { repeat: Infinity, duration: 1.5 } : { duration: 0.4, delay: i * 0.1 }}
              >
                {isFilled ? (
                  <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-indigo-500/10" />
                ) : (
                  <div className="w-full h-full bg-white/[0.02]" />
                )}
                <div className="absolute bottom-1 left-1 text-[8px] font-mono text-gray-500 bg-black/40 px-1 py-0.5 rounded">
                  {i + 1}
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-3 w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
            animate={{ width: `${generationProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    );
  }

  // Rendered state
  if (scenes.length === 0) return null;

  return (
    <div className="glass-panel p-4 border-violet-500/15 bg-white/[0.04]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <div className="section-label mb-1 flex items-center gap-1.5">
            <Clapperboard size={12} /> Storyboard Command View
          </div>
          <div className="text-sm font-semibold text-white">{config.label}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="badge-emerald text-[10px]"><Play size={10} /> Active sequence</div>
          <div className="badge-violet text-[10px]"><Eye size={10} /> Live preview</div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-black/20 p-3">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_0%,rgba(124,58,237,0.16),transparent_30%),radial-gradient(circle_at_85%_100%,rgba(16,185,129,0.08),transparent_30%)]" />
        <div className={`relative grid gap-2`} style={{ gridTemplateColumns: `repeat(${config.cols}, 1fr)` }}>
        {visibleScenes.map((scene, idx) => (
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`relative aspect-video rounded-lg overflow-hidden border transition-all cursor-pointer group ${
              selectedImages[scene.id]
                ? 'border-violet-500/40 ring-1 ring-violet-500/20'
                : 'border-white/[0.06] hover:border-white/[0.2]'
            }`}
            onClick={() => onToggleSelect(scene.id)}
          >
            {scene.imageUrl ? (
              <img src={scene.imageUrl} alt={`Scene ${idx + 1}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-500/10 to-indigo-500/5 flex items-center justify-center">
                <ImageIcon size={18} className="text-white/[0.08]" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="absolute bottom-1 left-1">
              <span className="text-[10px] font-semibold bg-black/60 px-1.5 py-0.5 rounded">S{idx + 1}</span>
            </div>

            {selectedImages[scene.id] && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">✓</span>
              </div>
            )}
          </motion.div>
        ))}
        {/* Remaining placeholder panels */}
        {scenes.length < totalPanels && Array.from({ length: totalPanels - scenes.length }).map((_, i) => (
          <div key={`rem-${i}`} className="aspect-video rounded-lg border border-white/[0.04] bg-white/[0.01]" />
        ))}
        </div>
      </div>

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {Array.from({ length: totalPanels }).map((_, idx) => {
          const scene = visibleScenes[idx];
          const isSelected = scene ? selectedImages[scene.id] : false;
          return (
            <button
              key={`seq-${idx}`}
              onClick={() => scene && onToggleSelect(scene.id)}
              className={`h-8 min-w-[56px] rounded-md border text-[9px] font-mono transition-all ${
                isSelected
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                  : scene
                    ? 'border-white/[0.08] bg-white/[0.03] text-gray-400 hover:border-white/[0.18]'
                    : 'border-white/[0.04] bg-white/[0.01] text-gray-600'
              }`}
            >
              S{idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
