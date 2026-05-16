import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Sparkles } from 'lucide-react';

const architectureItems = [
  { label: 'Cinematic Style', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  { label: 'Camera Direction', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  { label: 'Subject Consistency', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { label: 'Motion Guidance', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { label: 'Lighting Control', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
];

interface Props {
  onTagClick: (label: string) => void;
}

export default function PromptArchitecturePanel({ onTagClick }: Props) {
  const [activeLabel, setActiveLabel] = useState('Cinematic Style');
  const handleClick = (label: string) => {
    setActiveLabel(label);
    onTagClick(label);
  };

  return (
    <div className="glass-panel p-4">
      <div className="section-label mb-3 flex items-center gap-1.5">
        <Code size={12} /> Prompt Architecture
      </div>
      <div className="mb-3 rounded-lg border border-white/[0.06] bg-black/20 p-2.5">
        <div className="flex items-center gap-1.5 text-[10px] text-violet-200">
          <Sparkles size={11} />
          Cinematic prompt stack
        </div>
        <div className="mt-2 space-y-1">
          {architectureItems.map((item, idx) => (
            <button
              key={`row-${item.label}`}
              onClick={() => handleClick(item.label)}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 ${
                activeLabel === item.label ? 'bg-violet-500/12 text-violet-100' : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <span>{idx + 1}. {item.label}</span>
              <span className="h-1.5 w-10 rounded-full bg-gradient-to-r from-violet-500/60 to-blue-500/20" />
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {architectureItems.map((item) => (
          <motion.button
            key={item.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleClick(item.label)}
            className={`cursor-pointer rounded-full border px-2.5 py-1 text-[10px] font-medium transition-[opacity,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 hover:opacity-90 ${
              activeLabel === item.label ? 'shadow-[0_0_18px_rgba(124,58,237,0.18)] ring-1 ring-white/15' : ''
            } ${item.color}`}
          >
            {item.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
