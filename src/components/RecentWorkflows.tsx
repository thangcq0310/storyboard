import { motion } from 'framer-motion';
import { Clock, History } from 'lucide-react';
import { WorkflowHistoryItem } from '../lib/sampleWorkflows';

interface Props {
  items: WorkflowHistoryItem[];
  onLoad: (item: WorkflowHistoryItem) => void;
}

export default function RecentWorkflows({ items, onLoad }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="glass-panel p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <History size={11} className="text-gray-500" />
        <span className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase">Recent Workflows</span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar -mx-1 px-1">
        {items.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onLoad(item)}
            className="flex-shrink-0 text-left px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] transition-all"
          >
            <div className="text-[11px] font-medium text-white truncate max-w-[100px]">{item.title}</div>
            <div className="flex items-center gap-1 text-[9px] text-gray-500 mt-0.5">
              <Clock size={8} />
              <span>{new Date(item.timestamp).toLocaleDateString()}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}