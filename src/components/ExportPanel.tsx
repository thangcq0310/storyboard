import { motion } from 'framer-motion';
import { FileText, Package, FileJson, FileBadge2 } from 'lucide-react';
import { Scene, WorkflowCase } from '../types';
import { getCaseInfo } from '../lib/workflowCases';

export default function ExportPanel({
  scenes,
  storyIdea,
  workflowCase,
  artStyle,
  mood,
  duration,
  aspectRatio,
  platform,
  language,
  detailLevel,
  imageModel,
  videoModel,
}: {
  scenes: Scene[];
  storyIdea: string;
  workflowCase: WorkflowCase;
  artStyle: string;
  mood: string;
  duration: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
  platform: string;
  language: string;
  detailLevel: string;
  imageModel: string;
  videoModel: string;
}) {
  const workflow = getCaseInfo(workflowCase);
  const settings = [
    `Workflow: ${workflow.title}`,
    `Panels: ${workflow.panels}`,
    `Style: ${artStyle}`,
    `Mood: ${mood}`,
    `Duration: ${duration}s`,
    `Aspect ratio: ${aspectRatio}`,
    `Platform: ${platform}`,
    `Language: ${language}`,
    `Detail level: ${detailLevel}`,
    `Image Model: ${imageModel}`,
    `Video Model: ${videoModel}`,
  ];

  const downloadText = (content: string, type: string, filename: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char] || char));

  const exportOptions = [
    {
      label: 'Markdown Workflow',
      icon: FileText,
      desc: 'Readable workflow document',
      action: () => {
        const md = `# Storyboard Workflow: "${storyIdea || 'Untitled'}"\n\n## Settings\n${settings.map((item) => `- ${item}`).join('\n')}\n\n## Scenes\n${scenes.map((s, i) => `### Scene ${i + 1}\n- Description: ${s.description || 'N/A'}\n- Prompt: ${s.prompt || 'N/A'}\n`).join('\n')}`;
        downloadText(md, 'text/markdown', `workflow-${Date.now()}.md`);
      },
    },
    {
      label: 'JSON Export',
      icon: FileJson,
      desc: 'Machine-readable data',
      action: () => {
        const data = {
          storyIdea,
          workflowCase,
          workflow: workflow.title,
          panels: workflow.panels,
          artStyle,
          mood,
          duration,
          aspectRatio,
          platform,
          language,
          detailLevel,
          imageModel,
          videoModel,
          scenes,
          exportedAt: new Date().toISOString(),
        };
        downloadText(JSON.stringify(data, null, 2), 'application/json', `workflow-${Date.now()}.json`);
      },
    },
    {
      label: 'Prompt Pack',
      icon: Package,
      desc: 'All prompts in one file',
      action: () => {
        const prompts = scenes.map((s, i) => `Scene ${i + 1}: ${s.prompt}`).join('\n\n---\n\n');
        downloadText(prompts, 'text/plain', `prompts-${Date.now()}.txt`);
      },
    },
    {
      label: 'Production Brief PDF',
      icon: FileBadge2,
      desc: 'Print-ready production spec',
      action: () => {
        const brief = `<!doctype html><html><head><title>Production Brief</title><style>body{font-family:Inter,Arial,sans-serif;padding:40px;color:#111827}h1{font-size:28px}section{margin-top:24px}.scene{border-top:1px solid #e5e7eb;padding:12px 0}small{color:#6b7280}</style></head><body><small>Storyboard-to-Video AI</small><h1>${escapeHtml(storyIdea || 'Untitled Production Brief')}</h1><section>${settings.map((item) => `<div>${escapeHtml(item)}</div>`).join('')}</section><section>${scenes.map((s, i) => `<div class="scene"><strong>Scene ${i + 1}</strong><p>${escapeHtml(s.prompt || 'N/A')}</p></div>`).join('')}</section></body></html>`;
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(brief);
          win.document.close();
          win.focus();
          win.print();
        } else {
          downloadText(brief, 'text/html', `brief-${Date.now()}.html`);
        }
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="section-label">Export Options</div>
      <div className="grid grid-cols-2 gap-3">
        {exportOptions.map((opt) => (
          <motion.button
            key={opt.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={opt.action}
            className="glass-panel p-4 text-left hover:border-violet-500/30 hover:bg-white/[0.05] transition-all group"
          >
            <opt.icon size={18} className="text-violet-400 mb-2 group-hover:text-violet-300 transition-colors" />
            <div className="text-sm font-medium text-white mb-0.5">{opt.label}</div>
            <div className="text-[10px] text-gray-500">{opt.desc}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
