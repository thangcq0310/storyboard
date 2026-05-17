import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, Film, ImageIcon, Eye, Play, Clapperboard, Loader2, Video, AlertCircle } from 'lucide-react';
import { Scene, WorkflowCase } from '../types';

const gridConfig: Record<WorkflowCase, { cols: number; rows: number; label: string; panels: number }> = {
  case1: { cols: 3, rows: 2, label: '6 Panel Storyboard', panels: 6 },
  case2: { cols: 3, rows: 3, label: '3x3 Grid Storyboard', panels: 9 },
  case10: { cols: 4, rows: 3, label: '12 Frame Montage', panels: 12 },
  case19: { cols: 4, rows: 2, label: '8 Panel Editorial', panels: 8 },
};

const shotMetadata: Record<WorkflowCase, Array<{ shotType: string; camera: string; beat: string }>> = {
  case1: [
    { shotType: 'Wide', camera: 'Static drift', beat: 'Setup' },
    { shotType: 'Medium', camera: 'Push-in', beat: 'Subject' },
    { shotType: 'OTS', camera: 'Pan', beat: 'Context' },
    { shotType: 'Close', camera: 'Dolly-in', beat: 'Emotion' },
    { shotType: 'Tracking', camera: 'Follow', beat: 'Action' },
    { shotType: 'Hero', camera: 'Settle', beat: 'Payoff' },
  ],
  case2: [
    { shotType: 'Grid W', camera: 'Anchor', beat: 'A1' },
    { shotType: 'Grid M', camera: 'Match', beat: 'A2' },
    { shotType: 'Insert', camera: 'Cut-in', beat: 'A3' },
    { shotType: 'Track', camera: 'Lateral', beat: 'B1' },
    { shotType: 'Center', camera: 'Lock', beat: 'B2' },
    { shotType: 'Reverse', camera: 'Match', beat: 'B3' },
    { shotType: 'Bridge', camera: 'Pan', beat: 'C1' },
    { shotType: 'Cutaway', camera: 'Snap', beat: 'C2' },
    { shotType: 'Resolve', camera: 'Hold', beat: 'C3' },
  ],
  case10: [
    { shotType: 'Impact', camera: 'Punch-in', beat: 'Hit 01' },
    { shotType: 'Close', camera: 'Snap', beat: 'Hit 02' },
    { shotType: 'Insert', camera: 'Whip', beat: 'Hit 03' },
    { shotType: 'Low', camera: 'Rise', beat: 'Hit 04' },
    { shotType: 'Texture', camera: 'Cut', beat: 'Hit 05' },
    { shotType: 'Push', camera: 'Drive', beat: 'Hit 06' },
    { shotType: 'Top', camera: 'Drop', beat: 'Hit 07' },
    { shotType: 'Track', camera: 'Run', beat: 'Hit 08' },
    { shotType: 'React', camera: 'Crash', beat: 'Hit 09' },
    { shotType: 'Blur', camera: 'Sweep', beat: 'Hit 10' },
    { shotType: 'Flash', camera: 'Burst', beat: 'Hit 11' },
    { shotType: 'Final', camera: 'Stop', beat: 'Hit 12' },
  ],
  case19: [
    { shotType: 'Master', camera: 'Static', beat: 'Reuse 1' },
    { shotType: 'Product', camera: 'Hold', beat: 'Reuse 2' },
    { shotType: 'Medium', camera: 'Minimal', beat: 'Proof' },
    { shotType: 'Detail', camera: 'Insert', beat: 'Value' },
    { shotType: 'Variant', camera: 'Hold', beat: 'Reuse 3' },
    { shotType: 'Pan', camera: 'Short', beat: 'Move' },
    { shotType: 'Bridge', camera: 'Simple', beat: 'Transition' },
    { shotType: 'Hero', camera: 'Stable', beat: 'CTA' },
  ],
};

interface Props {
  scenes: Scene[];
  caseId: WorkflowCase;
  selectedImages: Record<string, boolean>;
  onToggleSelect: (id: string) => void;
  isGenerating: boolean;
  generationProgress: number;
  onGenerateImage?: (sceneId: string) => void;
  onGenerateVideo?: (sceneId: string) => void;
  isBatchRunning?: boolean;
  batchDone?: number;
  batchTotal?: number;
}

export default function StoryboardPreview({
  scenes,
  caseId,
  selectedImages,
  onToggleSelect,
  isGenerating,
  generationProgress,
  onGenerateImage,
  onGenerateVideo,
  isBatchRunning = false,
  batchDone = 0,
  batchTotal = 0,
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

  const getShotMeta = (idx: number) => shotMetadata[caseId][idx % shotMetadata[caseId].length];

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
      <div className="absolute inset-x-1 bottom-5 hidden rounded bg-black/35 px-1.5 py-1 text-[7px] leading-tight text-gray-500 sm:block">
        {getShotMeta(idx).shotType} / {getShotMeta(idx).camera}
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
                <div className="absolute bottom-1 right-1 max-w-[62%] truncate rounded bg-black/40 px-1 py-0.5 text-[7px] text-gray-500">
                  {getShotMeta(i).beat}
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

      {/* ── Batch progress bar ── */}
      {isBatchRunning && batchTotal > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
            <span className="flex items-center gap-1"><Loader2 size={9} className="animate-spin text-violet-300" /> Rendering scenes sequentially…</span>
            <span className="text-violet-300 font-mono">{batchDone} / {batchTotal}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400"
              animate={{ width: `${batchTotal > 0 ? (batchDone / batchTotal) * 100 : 0}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      <div className="relative rounded-xl border border-white/[0.07] bg-black/20 p-2.5 sm:p-3">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_0%,rgba(124,58,237,0.16),transparent_30%),radial-gradient(circle_at_85%_100%,rgba(16,185,129,0.08),transparent_30%)]" />
        <div className="relative grid gap-2" style={gridStyle}>
          {visibleScenes.map((scene, idx) => (
            <motion.div
              key={scene.id}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: shouldReduceMotion ? 0 : idx * 0.035 }}
              className="group relative flex flex-col gap-1"
            >
              {/* ── Main panel ── */}
              <div
                className={`relative aspect-video cursor-pointer overflow-hidden rounded-lg border transition-[border-color,box-shadow] ${
                  selectedImages[scene.id]
                    ? 'border-violet-400/50 shadow-[0_0_24px_rgba(124,58,237,0.18)] ring-1 ring-violet-500/20'
                    : 'border-white/[0.06] hover:border-violet-300/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.14)]'
                }`}
                role="button"
                tabIndex={0}
                onClick={() => onToggleSelect(scene.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleSelect(scene.id); } }}
                aria-pressed={!!selectedImages[scene.id]}
                aria-label={`Toggle scene ${idx + 1}`}
              >
                {/* Video player (shown if videoUrl exists) */}
                {scene.videoUrl ? (
                  <video
                    src={scene.videoUrl}
                    className="h-full w-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : scene.imageUrl ? (
                  <img src={scene.imageUrl} alt={`Scene ${idx + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/10 to-indigo-500/5">
                    <ImageIcon size={18} className="text-white/[0.08]" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                {/* Scene number */}
                <div className="absolute bottom-1 left-1">
                  <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold">S{idx + 1}</span>
                </div>

                {/* Shot meta */}
                <div className="absolute bottom-1 right-1 max-w-[64%] truncate rounded bg-black/60 px-1.5 py-0.5 text-[8px] text-gray-300">
                  {getShotMeta(idx).shotType} / {getShotMeta(idx).beat}
                </div>

                {/* Read-order arrow */}
                <div className="absolute right-1 top-1 rounded bg-black/45 p-1 text-white/50">
                  {readOrderIcon(idx)}
                </div>

                {/* Selected check */}
                {selectedImages[scene.id] && (
                  <div className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500">
                    <span className="text-[8px] font-bold text-white">✓</span>
                  </div>
                )}

                {/* Video badge */}
                {scene.videoUrl && !scene.isGeneratingVideo && (
                  <div className="absolute right-1 bottom-5 rounded bg-emerald-500/80 px-1.5 py-0.5 text-[8px] font-semibold text-white flex items-center gap-0.5">
                    <Video size={8} /> Video
                  </div>
                )}
              </div>

              {/* ── Action buttons ── */}
              <div className="flex gap-1">
                {/* Render Image button */}
                <button
                  type="button"
                  disabled={scene.isGeneratingImage || scene.isGeneratingVideo}
                  onClick={() => onGenerateImage?.(scene.id)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] py-1 text-[9px] font-medium text-gray-300 transition-all hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  title={scene.imageUrl ? 'Re-render image' : 'Generate image with AI'}
                >
                  {scene.isGeneratingImage ? (
                    <><Loader2 size={9} className="animate-spin" /> Rendering…</>
                  ) : (
                    <><ImageIcon size={9} /> {scene.imageUrl ? 'Re-render' : 'Render'}</>
                  )}
                </button>

                {/* Generate Video button – only enabled when imageUrl exists */}
                <button
                  type="button"
                  disabled={!scene.imageUrl || scene.isGeneratingImage || scene.isGeneratingVideo}
                  onClick={() => onGenerateVideo?.(scene.id)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] py-1 text-[9px] font-medium text-gray-300 transition-all hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  title={!scene.imageUrl ? 'Render an image first' : 'Generate video from this image'}
                >
                  {scene.isGeneratingVideo ? (
                    <><Loader2 size={9} className="animate-spin" /> Generating…</>
                  ) : (
                    <><Film size={9} /> {scene.videoUrl ? 'Re-generate' : 'Video'}</>
                  )}
                </button>
              </div>

              {/* ── Error messages ── */}
              {(scene.imageError || scene.videoError) && (
                <div className="flex items-start gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[9px] text-red-300">
                  <AlertCircle size={9} className="mt-0.5 flex-shrink-0" />
                  <span className="break-all">{scene.imageError || scene.videoError}</span>
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
