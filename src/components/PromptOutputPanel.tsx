import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, ChevronDown, ChevronRight, Download, Sparkles } from 'lucide-react';
import type { BuiltPrompt } from '../lib/promptBuilder';

interface Props {
  prompts: BuiltPrompt[];
}

const sections: { key: keyof BuiltPrompt; label: string; desc: string; color: string }[] = [
  { key: 'system', label: 'SYSTEM PROMPT', desc: 'AI role and behavior context', color: 'border-violet-500/20 bg-violet-500/5' },
  { key: 'style', label: 'STYLE PROMPT', desc: 'Visual aesthetic and mood', color: 'border-pink-500/20 bg-pink-500/5' },
  { key: 'camera', label: 'CAMERA PROMPT', desc: 'Camera movement and framing', color: 'border-blue-500/20 bg-blue-500/5' },
  { key: 'motion', label: 'MOTION PROMPT', desc: 'Subject and scene motion', color: 'border-emerald-500/20 bg-emerald-500/5' },
  { key: 'negative', label: 'NEGATIVE PROMPT', desc: 'What to avoid in generation', color: 'border-rose-500/20 bg-rose-500/5' },
  { key: 'seedance', label: 'SEEDANCE PROMPT', desc: 'Animation motion guidance', color: 'border-amber-500/20 bg-amber-500/5' },
];

const emptyPreviewContent: Partial<Record<keyof BuiltPrompt, string>> = {
  system: 'Workflow-aware cinematic prompt engineer role, storyboard rules, panel count, and continuity requirements.',
  style: 'Art style, mood, lighting, cinematic color grade, production texture, and storyboard-specific composition.',
  camera: 'Shot type, lens language, camera movement, framing, depth of field, and read-order continuity.',
  motion: 'Subject movement, camera motion, transition behavior, Seedance readiness, and temporal rhythm.',
  negative: 'Low quality, blur, distortion, watermarks, text artifacts, continuity breaks, and unstable anatomy.',
  seedance: 'Animation prompt with motion continuity, natural blur, cinematic atmosphere, and workflow-specific movement.',
};

export default function PromptOutputPanel({ prompts }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const copyText = (text: string) => navigator.clipboard?.writeText(text).catch(() => undefined);

  if (prompts.length === 0) {
    return (
      <div className="glass-panel p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="section-label mb-1">Prompt Architecture Preview</div>
            <p className="text-xs text-gray-500">Generate Storyboard to create prompt pack.</p>
          </div>
          <div className="badge-violet w-fit text-[10px]"><Sparkles size={10} /> Awaiting storyboard</div>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {sections.map((section) => (
            <div key={section.key} className={`rounded-lg border p-3 ${section.color}`}>
              <div className="text-[10px] font-semibold tracking-wider text-white/90">{section.label}</div>
              <div className="mt-1 text-[10px] leading-relaxed text-gray-400">
                {emptyPreviewContent[section.key]}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const toggleSection = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const copyAll = () => {
    const text = prompts.map((p, i) =>
      `Scene ${i + 1}\n${sections.map(s => `${s.label}\n${p[s.key] || ''}`).join('\n\n')}`
    ).join('\n\n---\n\n');
    copyText(text);
  };

  const exportPromptPack = () => {
    const text = prompts.map((p, i) =>
      `Scene ${i + 1}\n${sections.map(s => `${s.label}\n${p[s.key] || ''}`).join('\n\n')}`
    ).join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-pack-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Copy All bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="section-label mb-0">Prompt Output</div>
        <div className="flex gap-2">
          <button type="button" onClick={copyAll} className="btn-ghost min-h-9 text-xs gap-1.5">
            <Copy size={11} /> Copy All
          </button>
          <button type="button" onClick={exportPromptPack} className="btn-ghost min-h-9 text-xs gap-1.5">
            <Download size={11} /> Export Pack
          </button>
        </div>
      </div>

      {prompts.map((prompt, sceneIdx) => (
        <div key={sceneIdx} className="glass-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-white">Scene {sceneIdx + 1} Prompts</div>
            <button
              onClick={() => {
                const text = sections.map(s => `${s.label}\n${prompt[s.key] || ''}`).join('\n\n');
                copyText(text);
              }}
              className="rounded px-2 py-1 text-[10px] text-gray-500 transition-colors hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
            >
              Copy scene
            </button>
          </div>

          <div className="space-y-1.5">
            {sections.map((section) => {
              const content = prompt[section.key];
              const isExpanded = expanded[`${sceneIdx}-${section.key}`] !== false; // default open

              return (
                <div
                  key={section.key}
                  data-prompt-section={section.key}
                  className={`rounded-lg border overflow-hidden ${section.color}`}
                >
                  <div className="flex w-full items-center justify-between gap-2 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleSection(`${sceneIdx}-${section.key}`)}
                      className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
                      aria-expanded={isExpanded}
                    >
                      <span className="block text-[10px] font-semibold tracking-wider">{section.label}</span>
                      <span className="mt-0.5 block truncate text-[9px] text-gray-500">{section.desc}</span>
                    </button>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Copy ${section.label.toLowerCase()}`}
                        onClick={() => copyText(content || '')}
                        className="rounded p-1 text-gray-500 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        type="button"
                        aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
                        onClick={() => toggleSection(`${sceneIdx}-${section.key}`)}
                        className="rounded p-1 text-gray-500 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
                      >
                        {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </button>
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="px-3 pb-2">
                          <div className="rounded bg-black/30 p-2">
                            <code className="block whitespace-pre-wrap break-words font-mono text-[10px] leading-relaxed text-gray-300">
                              {content || 'N/A'}
                            </code>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
