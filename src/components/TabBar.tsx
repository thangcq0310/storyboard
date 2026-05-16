import { TabType } from '../types';
import { motion } from 'framer-motion';

const tabs: { id: TabType; label: string }[] = [
  { id: 'storyboard', label: 'Storyboard' },
  { id: 'video-motion', label: 'Video Motion' },
  { id: 'shotlist', label: 'Shotlist' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'export', label: 'Export' },
];

export default function TabBar({ active, onChange }: { active: TabType; onChange: (t: TabType) => void }) {
  return (
    <div className="flex gap-1 p-1 glass-panel overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`tab-btn relative flex-shrink-0 ${active === tab.id ? 'active' : ''}`}
        >
          {active === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 rounded-lg bg-violet-500/10 border border-violet-500/20"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}