import { motion } from 'framer-motion';
import { ImageIcon, Video, TrendingUp, DollarSign, Clock, X, Trash2, BarChart2 } from 'lucide-react';
import { AnalyticsStats, JobEntry } from '../types';

interface Props {
  stats: AnalyticsStats;
  jobHistory: JobEntry[];
  onClose: () => void;
  onClear: () => void;
}

export default function AnalyticsModal({ stats, jobHistory, onClose, onClear }: Props) {
  const successRate =
    stats.totalImages + stats.totalVideos > 0
      ? Math.round(
          ((stats.successfulImages + stats.successfulVideos) /
            (stats.totalImages + stats.totalVideos)) *
            100
        )
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
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
            <BarChart2 size={18} className="text-violet-400" />
            Analytics
          </h2>
          <button className="btn-ghost p-1.5" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: ImageIcon, label: 'Images', value: stats.totalImages, color: 'text-pink-400' },
            { icon: Video, label: 'Videos', value: stats.totalVideos, color: 'text-purple-400' },
            { icon: TrendingUp, label: 'Success Rate', value: `${successRate}%`, color: 'text-emerald-400' },
            { icon: DollarSign, label: 'Est. Cost', value: `$${stats.totalCost.toFixed(2)}`, color: 'text-amber-400' },
          ].map((item) => (
            <div key={item.label} className="glass-panel p-4 text-center">
              <item.icon size={20} className={`mx-auto mb-2 ${item.color}`} />
              <div className="text-xl font-bold text-white">{item.value}</div>
              <div className="text-xs text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Provider Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-panel p-4">
            <div className="text-xs text-pink-400 font-semibold mb-3 flex items-center gap-1.5">
              <ImageIcon size={12} /> Image Generation
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Successful</span>
                <span className="text-emerald-400">{stats.successfulImages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Failed</span>
                <span className="text-red-400">{stats.failedImages}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-white/[0.06]">
                <span className="text-gray-500">Cost</span>
                <span className="text-amber-400">${(stats.successfulImages * 0.003).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="glass-panel p-4">
            <div className="text-xs text-purple-400 font-semibold mb-3 flex items-center gap-1.5">
              <Video size={12} /> Video Generation
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Successful</span>
                <span className="text-emerald-400">{stats.successfulVideos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Failed</span>
                <span className="text-red-400">{stats.failedVideos}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-white/[0.06]">
                <span className="text-gray-500">Cost</span>
                <span className="text-amber-400">${(stats.successfulVideos * 0.05).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Batch Jobs */}
        <div className="glass-panel p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Batch Jobs</span>
            <span className="text-xl font-bold text-white">{stats.batchJobs}</span>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="glass-panel p-4 mb-6">
          <h3 className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-1.5">
            <Clock size={12} /> Recent Jobs
          </h3>
          {jobHistory.length > 0 ? (
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar">
              {jobHistory.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between text-xs bg-white/[0.02] p-2 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {job.type === 'image' ? (
                      <ImageIcon size={11} className="text-pink-400" />
                    ) : (
                      <Video size={11} className="text-purple-400" />
                    )}
                    <span className="text-gray-300">{job.provider}</span>
                    <span
                      className={
                        job.status === 'success' ? 'text-emerald-400' : 'text-red-400'
                      }
                    >
                      {job.status === 'success' ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500">
                    <span>${job.cost.toFixed(2)}</span>
                    <span>{new Date(job.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-4">No jobs recorded</p>
          )}
        </div>

        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={onClear}>
            <Trash2 size={14} /> Clear Stats
          </button>
          <button className="btn-primary flex-1" onClick={onClose}>
            <X size={14} /> Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}