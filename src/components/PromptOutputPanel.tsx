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

export default function PromptOutputPanel({ prompts }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (prompts.length === 0) {
    return (
      <div className="glass-panel p-8 text-center">
        <Sparkles size={24} className="mx-auto mb-3 text-gray-500" />
        <p className="text-xs text-gray-500">Generate scenes to see segmented prompts</p>
      </div>
    );
  }

  const toggleSection = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const copyAll = () => {
    const text = prompts.map((p, i) =>
      `Scene ${i + 1}\n${sections.map(s => `${s.label}\n${p[s.key] || ''}`).join('\n\n')}`
    ).join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      {/* Copy All bar */}
      <div className="flex items-center justify-between">
        <div className="section-label mb-0">Prompt Output</div>
        <button onClick={copyAll} className="btn-ghost text-xs gap-1.5">
          <Copy size={11} /> Copy All
        </button>
      </div>

      {prompts.map((prompt, sceneIdx) => (
        <div key={sceneIdx} className="glass-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-white">Scene {sceneIdx + 1} Prompts</div>
            <button
              onClick={() => {
                const text = sections.map(s => `${s.label}\n${prompt[s.key] || ''}`).join('\n\n');
                navigator.clipboard.writeText(text);
              }}
              className="text-[10px] text-gray-500 hover:text-white transition-colors"
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
                  className={`rounded-lg border overflow-hidden ${section.color}`}
                >
                  <button
                    onClick={() => toggleSection(`${sceneIdx}-${section.key}`)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left"
                  >
                    <div>
                      <span className="text-[10px] font-semibold tracking-wider">{section.label}</span>
                      <span className="text-[9px] text-gray-500 ml-2">{section.desc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(content || '');
                        }}
                        className="text-[9px] text-gray-500 hover:text-white"
                      >
                        <Copy size={10} />
                      </button>
                      {isExpanded ? <ChevronDown size={11} className="text-gray-500" /> : <ChevronRight size={11} className="text-gray-500" />}
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="px-3 pb-2">
                          <div className="bg-black/30 rounded p-2">
                            <code className="text-[10px] text-gray-300 font-mono leading-relaxed whitespace-pre-wrap break-all">
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