import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Plus, Play, X, ListChecks, Trash2, Download, Loader2, Check, Loader
} from 'lucide-react';
import { BatchItem } from '../types';
import { useState } from 'react';

interface Props {
  show: boolean;
  onClose: () => void;
  batchQueue: BatchItem[];
  batchProcessing: boolean;
  batchCurrentIndex: number;
  onLoadCSV: (csv: string) => void;
  onRemove: (id: string) => void;
  onStart: () => void;
  onClear: () => void;
  onExport: () => void;
  onCancel: () => void;
}

export default function BatchModal({
  show, onClose, batchQueue, batchProcessing, batchCurrentIndex,
  onLoadCSV, onRemove, onStart, onClear, onExport, onCancel,
}: Props) {
  const [csvInput, setCsvInput] = useState('');

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => !batchProcessing && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-panel w-full max-w-2xl mx-4 p-6 max-h-[85vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Upload size={18} className="text-violet-400" />
                Batch Mode
              </h2>
              {!batchProcessing && (
                <button className="btn-ghost p-1.5" onClick={onClose}>
                  <X size={16} />
                </button>
              )}
            </div>

            {/* CSV Input */}
            {!batchProcessing && batchQueue.length === 0 && (
              <div className="space-y-3 mb-6">
                <label className="text-xs text-gray-400 flex items-center gap-2">
                  <FileText size={12} /> Paste CSV Content
                </label>
                <textarea
                  className="textarea-field font-mono text-sm min-h-[120px]"
                  placeholder={`story,scenes,style\nA girl dancing in the snow,4,Cinematic\nA boy surfing waves,6,Anime`}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                />
                <button
                  className="btn-primary w-full"
                  onClick={() => {
                    onLoadCSV(csvInput);
                  }}
                  disabled={!csvInput.trim()}
                >
                  <Plus size={14} /> Load from CSV
                </button>
              </div>
            )}

            {/* Queue */}
            {batchQueue.length > 0 && (
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-400 flex items-center gap-2">
                    <ListChecks size={12} /> Queue ({batchQueue.length})
                  </h3>
                  {!batchProcessing && (
                    <button className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1" onClick={onClear}>
                      <Trash2 size={10} /> Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-[240px] overflow-y-auto custom-scrollbar">
                  {batchQueue.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                        item.status === 'processing'
                          ? 'bg-violet-500/10 border-violet-500/30'
                          : item.status === 'completed'
                            ? 'bg-emerald-500/10 border-emerald-500/20'
                            : item.status === 'failed'
                              ? 'bg-red-500/10 border-red-500/20'
                              : 'bg-white/[0.02] border-white/[0.06]'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center text-[10px] font-bold text-gray-400">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.story}</p>
                        <p className="text-[10px] text-gray-500">{item.scenes} scenes | {item.style}</p>
                      </div>
                      <div>
                        {item.status === 'processing' && <Loader2 size={13} className="animate-spin text-violet-400" />}
                        {item.status === 'completed' && <Check size={13} className="text-emerald-400" />}
                        {item.status === 'failed' && <X size={13} className="text-red-400" />}
                        {item.status === 'pending' && !batchProcessing && (
                          <button className="text-gray-500 hover:text-red-400" onClick={() => onRemove(item.id)}>
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {batchProcessing && (
                  <div className="glass-panel p-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-400">Processing batch...</span>
                      <span className="text-gray-300">{batchCurrentIndex + 1} / {batchQueue.length}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${((batchCurrentIndex + 1) / batchQueue.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {!batchProcessing ? (
                <>
                  <button className="btn-primary flex-1" onClick={onStart} disabled={batchQueue.length === 0}>
                    <Play size={14} /> Start Batch
                  </button>
                  <button className="btn-secondary" onClick={() => { setCsvInput(''); onClose(); }}>
                    <X size={14} /> Close
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-primary flex-1 bg-red-500 hover:bg-red-600" onClick={onCancel}>
                    <X size={14} /> Cancel
                  </button>
                  <button className="btn-secondary" onClick={onExport}>
                    <Download size={14} /> Export
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}