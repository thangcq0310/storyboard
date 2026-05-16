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
  return (
    <div className="glass-panel p-4">
      <div className="section-label mb-3 flex items-center gap-1.5">
        <Code size={12} /> Prompt Architecture
      </div>
      <div className="flex flex-wrap gap-1.5">
        {architectureItems.map((item) => (
          <motion.button
            key={item.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTagClick(item.label)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium border cursor-pointer hover:opacity-80 transition-opacity ${item.color}`}
          >
            {item.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}