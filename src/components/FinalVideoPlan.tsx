import { motion } from 'framer-motion';
import { Film, Clock, Maximize, Activity, Shield, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { WorkflowCase, WorkflowCaseInfo } from '../types';
import { getCaseInfo } from '../lib/workflowCases';

interface Props {
  caseId: WorkflowCase;
  numScenes: number;
  duration: number;
  aspectRatio: string;
  motionLevel: number;
  hasImages: boolean;
}

export default function FinalVideoPlan({ caseId, numScenes, duration, aspectRatio, motionLevel, hasImages }: Props) {
  const info = getCaseInfo(caseId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4 border-violet-500/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <Film size={14} className="text-violet-400" />
        <div className="section-label mb-0">Final Video Plan</div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 flex items-center gap-1"><Film size={10} /> Workflow</span>
          <span className="text-white font-medium">{info.title}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 flex items-center gap-1"><Activity size={10} /> Panels</span>
          <span className="text-white font-medium">{info.panels}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 flex items-center gap-1"><Clock size={10} /> Duration</span>
          <span className="text-white font-medium">~{numScenes * duration}s</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 flex items-center gap-1"><Maximize size={10} /> Aspect</span>
          <span className="text-white font-medium">{aspectRatio}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 flex items-center gap-1"><Activity size={10} /> Motion</span>
          <span className={`font-medium ${motionLevel > 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {motionLevel > 70 ? 'High' : motionLevel > 40 ? 'Medium' : 'Low'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 flex items-center gap-1"><Shield size={10} /> Stability</span>
          <span className="text-emerald-400 font-medium">{info.stability}%</span>
        </div>
        <div className="flex items-center justify-between col-span-2 pt-1 border-t border-white/[0.06]">
          <span className="text-gray-500 flex items-center gap-1"><Sparkles size={10} /> Seedance</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 size={10} /> Optimized
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-white/[0.06]">
        <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
          <ArrowRight size={10} className="text-violet-400" />
          {hasImages
            ? 'Ready for video generation — proceed to Video Motion tab'
            : 'Configure scene and generate to start production'}
        </div>
      </div>
    </motion.div>
  );
}