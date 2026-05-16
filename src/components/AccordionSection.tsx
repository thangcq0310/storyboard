import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccordionSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function AccordionSection({ title, defaultOpen = true, children }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className="glass-panel overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex min-h-12 w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-white/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-400/60"
      >
        <span className="section-label mb-0 truncate">{title}</span>
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-4 pb-4 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
