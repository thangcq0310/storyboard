import { KeyboardEvent } from 'react';
import { TabType } from '../types';
import { motion, useReducedMotion } from 'framer-motion';

const tabs: { id: TabType; label: string }[] = [
  { id: 'storyboard', label: 'Storyboard' },
  { id: 'video-motion', label: 'Video Motion' },
  { id: 'shotlist', label: 'Shotlist' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'export', label: 'Export' },
];

export default function TabBar({ active, onChange }: { active: TabType; onChange: (t: TabType) => void }) {
  const shouldReduceMotion = useReducedMotion();
  const activeIndex = tabs.findIndex((tab) => tab.id === active);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();

    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : event.key === 'ArrowRight'
            ? (index + 1) % tabs.length
            : (index - 1 + tabs.length) % tabs.length;

    onChange(tabs[nextIndex].id);
  };

  return (
    <div
      role="tablist"
      aria-label="Production workspace sections"
      className="glass-panel relative flex gap-1 overflow-x-auto p-1.5 custom-scrollbar"
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          role="tab"
          type="button"
          aria-selected={active === tab.id}
          tabIndex={active === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          className={`tab-btn relative min-h-10 flex-shrink-0 overflow-hidden whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] ${
            active === tab.id ? 'text-white' : ''
          }`}
        >
          {active === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 rounded-lg border border-violet-400/25 bg-gradient-to-b from-violet-500/20 to-indigo-500/10 shadow-[0_0_22px_rgba(124,58,237,0.18)]"
              transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
          {active === tab.id && (
            <motion.span
              layoutId="tab-underline"
              className="absolute bottom-1 left-3 right-3 z-10 h-0.5 rounded-full bg-gradient-to-r from-violet-300 via-indigo-300 to-blue-300"
              transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
            />
          )}
        </button>
      ))}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#11111a] to-transparent sm:hidden" />
    </div>
  );
}
