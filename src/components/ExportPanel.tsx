import { motion } from 'framer-motion';
import { Download, FileText, Package, FileJson, FileBadge2 } from 'lucide-react';
import { Scene } from '../types';

export default function ExportPanel({
  scenes,
  storyIdea,
  artStyle,
  imageModel,
  videoModel,
}: {
  scenes: Scene[];
  storyIdea: string;
  artStyle: string;
  imageModel: string;
  videoModel: string;
}) {
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
        const md = `# Storyboard Workflow: "${storyIdea || 'Untitled'}"\n\n## Settings\n- Style: ${artStyle}\n- Image Model: ${imageModel}\n- Video Model: ${videoModel}\n- Scenes: ${scenes.length}\n\n## Scenes\n${scenes.map((s, i) => `### Scene ${i + 1}\n- Description: ${s.description || 'N/A'}\n- Prompt: ${s.prompt?.slice(0, 100) || 'N/A'}...\n`).join('\n')}`;
        downloadText(md, 'text/markdown', `workflow-${Date.now()}.md`);
      },
    },
    {
      label: 'JSON Export',
      icon: FileJson,
      desc: 'Machine-readable data',
      action: () => {
        const data = { storyIdea, artStyle, imageModel, videoModel, scenes, exportedAt: new Date().toISOString() };
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
        const brief = `<!doctype html><html><head><title>Production Brief</title><style>body{font-family:Inter,Arial,sans-serif;padding:40px;color:#111827}h1{font-size:28px}section{margin-top:24px}.scene{border-top:1px solid #e5e7eb;padding:12px 0}small{color:#6b7280}</style></head><body><small>Storyboard-to-Video Automation</small><h1>${escapeHtml(storyIdea || 'Untitled Production Brief')}</h1><section><strong>Style:</strong> ${escapeHtml(artStyle)}<br/><strong>Models:</strong> ${escapeHtml(imageModel)} to ${escapeHtml(videoModel)}<br/><strong>Scenes:</strong> ${scenes.length}</section><section>${scenes.map((s, i) => `<div class="scene"><strong>Scene ${i + 1}</strong><p>${escapeHtml(s.prompt || 'N/A')}</p></div>`).join('')}</section></body></html>`;
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

      {scenes.length > 0 && (
        <div className="glass-panel p-4 mt-4">
          <div className="section-label mb-3">Quality & Format</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Quality</label>
              <select className="select-field text-sm">
                <option>1080p</option>
                <option>4K Ultra HD</option>
                <option>720p</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Format</label>
              <select className="select-field text-sm">
                <option>MP4 (H.264)</option>
                <option>MOV</option>
                <option>WebM</option>
              </select>
            </div>
          </div>

          <button className="btn-primary w-full mt-4" onClick={() => alert('Export initiated! All assets ready for final render.')}>
            <Download size={15} /> Export Final Video
          </button>
        </div>
      )}
    </div>
  );
}
