import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, Film, ImageIcon, Eye, Play, Clapperboard } from 'lucide-react';
import { Scene, WorkflowCase } from '../types';

const gridConfig: Record<WorkflowCase, { cols: number; rows: number; label: string; panels: number }> = {
  case1: { cols: 3, rows: 2, label: '6 Panel Storyboard', panels: 6 },
  case2: { cols: 3, rows: 3, label: '3x3 Grid Storyboard', panels: 9 },
  case10: { cols: 4, rows: 3, label: '12 Frame Montage', panels: 12 },
  case19: { cols: 4, rows: 2, label: '8 Panel Editorial', panels: 8 },
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
  const shouldReduceMotion = useReducedMotion();
  const config = gridConfig[caseId];
  const totalPanels = config.panels;
  const filledCount = Math.min(scenes.length, totalPanels);
  const visibleScenes = scenes.slice(0, totalPanels);
  const gridStyle = { gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))` };

  const readOrderIcon = (idx: number) => {
    if (idx >= totalPanels - 1) return null;
    return (idx + 1) % config.cols === 0
      ? <ArrowDown size={10} aria-hidden="true" />
      : <ArrowRight size={10} aria-hidden="true" />;
  };

  const renderPlaceholderPanel = (idx: number, variant: 'empty' | 'loading' | 'remaining' = 'empty') => (
    <motion.div
      key={`${variant}-${idx}`}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: shouldReduceMotion ? 0 : idx * 0.025 }}
      className="group relative aspect-video overflow-hidden rounded-lg border border-white/[0.06] bg-gradient-to-br from-violet-500/[0.08] via-indigo-500/[0.035] to-blue-500/[0.04] shadow-inner"
    >
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.05)_38%,transparent_76%)] opacity-0 transition-opacity group-hover:opacity-100" />
      {variant === 'loading' && (
        <motion.div
          className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={shouldReduceMotion ? undefined : { x: ['0%', '300%'] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <ImageIcon size={20} className="text-white/[0.08]" />
      </div>
      <div className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-mono text-gray-400">
        S{idx + 1}
      </div>
      <div className="absolute right-1 top-1 rounded bg-black/40 p-1 text-gray-500">
        {readOrderIcon(idx)}
      </div>
    </motion.div>
  );

  // Show placeholder grid when no scenes
  if (scenes.length === 0 && !isGenerating) {
    return (
      <div className="glass-panel p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="section-label mb-0 truncate">{config.label}</div>
          <div className="badge-violet text-[10px]"><Eye size={10} /> Preview</div>
        </div>
        <div className="grid gap-2" style={gridStyle}>
          {Array.from({ length: totalPanels }).map((_, i) => renderPlaceholderPanel(i))}
        </div>
      </div>
    );
  }

  // Generating state: show panel-by-panel fill
  if (isGenerating) {
    return (
      <div className="glass-panel p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="section-label mb-0">{config.label}</div>
          <div className="badge-violet text-[10px]"><Film size={10} /> Building cinematic storyboard</div>
        </div>
        <div className="grid gap-2" style={gridStyle}>
          {Array.from({ length: totalPanels }).map((_, i) => {
            const isFilled = i < filledCount;
            const isCurrent = i === filledCount;

            return (
              <motion.div
                key={`gen-${i}`}
                className="relative aspect-video overflow-hidden rounded-lg border border-white/[0.06]"
                initial={shouldReduceMotion ? false : { opacity: 0.2, scale: 0.98 }}
                animate={
                  isFilled
                    ? { opacity: 1, scale: 1 }
                    : isCurrent
                      ? { opacity: shouldReduceMotion ? 0.6 : [0.35, 0.7, 0.35], scale: 1 }
                      : { opacity: 0.35, scale: 1 }
                }
                transition={isCurrent && !shouldReduceMotion ? { repeat: Infinity, duration: 1.5 } : { duration: 0.25, delay: i * 0.03 }}
              >
                {isFilled ? (
                  <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-indigo-500/10" />
                ) : (
                  <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-violet-500/[0.08] via-indigo-500/[0.035] to-blue-500/[0.04]">
                    <motion.div
                      className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={shouldReduceMotion ? undefined : { x: ['0%', '300%'] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon size={18} className="text-white/[0.08]" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-1 left-1 text-[8px] font-mono text-gray-500 bg-black/40 px-1 py-0.5 rounded">
                  S{i + 1}
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

      <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-black/20 p-2.5 sm:p-3">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_0%,rgba(124,58,237,0.16),transparent_30%),radial-gradient(circle_at_85%_100%,rgba(16,185,129,0.08),transparent_30%)]" />
        <div className="relative grid gap-2" style={gridStyle}>
          {visibleScenes.map((scene, idx) => (
            <motion.div
              key={scene.id}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: shouldReduceMotion ? 0 : idx * 0.035 }}
              className={`group relative aspect-video cursor-pointer overflow-hidden rounded-lg border transition-[border-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 ${
                selectedImages[scene.id]
                  ? 'border-violet-400/50 shadow-[0_0_24px_rgba(124,58,237,0.18)] ring-1 ring-violet-500/20'
                  : 'border-white/[0.06] hover:border-violet-300/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.14)]'
              }`}
              role="button"
              tabIndex={0}
              onClick={() => onToggleSelect(scene.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onToggleSelect(scene.id);
                }
              }}
              aria-pressed={!!selectedImages[scene.id]}
              aria-label={`Toggle scene ${idx + 1}`}
            >
              {scene.imageUrl ? (
                <img src={scene.imageUrl} alt={`Scene ${idx + 1}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/10 to-indigo-500/5">
                  <ImageIcon size={18} className="text-white/[0.08]" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="absolute bottom-1 left-1">
                <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold">S{idx + 1}</span>
              </div>
              <div className="absolute right-1 top-1 rounded bg-black/45 p-1 text-white/50">
                {readOrderIcon(idx)}
              </div>

              {selectedImages[scene.id] && (
                <div className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500">
                  <span className="text-[8px] font-bold text-white">✓</span>
                </div>
              )}
            </motion.div>
          ))}
        {/* Remaining placeholder panels */}
        {scenes.length < totalPanels && Array.from({ length: totalPanels - scenes.length }).map((_, i) => (
          renderPlaceholderPanel(scenes.length + i, 'remaining')
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
              type="button"
              onClick={() => scene && onToggleSelect(scene.id)}
              disabled={!scene}
              aria-label={`Scene sequence ${idx + 1}${scene ? '' : ' empty'}`}
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
