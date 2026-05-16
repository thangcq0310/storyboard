import { useMemo, useRef, useState } from 'react';
import { CheckCircle2, Copy, Settings2, Sparkles } from 'lucide-react';

import type { Scene, WorkflowCase } from './types';
import { initApiClient, PROVIDERS } from './lib/api';
import type { ProviderId } from './lib/api';
import { analyzeVideoProfile } from './lib/caseRouter';
import { analyzeSafety } from './lib/safetyAnalyzer';
import { buildAllPrompts } from './lib/promptBuilder';
import { WORKFLOW_CASES, getCaseInfo } from './lib/workflowCases';

import StoryboardPreview from './components/StoryboardPreview';
import AIReasoningPanel from './components/AIReasoningPanel';
import RenderSafetyPanel from './components/RenderSafetyPanel';
import WorkflowPipeline from './components/WorkflowPipeline';
import PromptArchitecturePanel from './components/PromptArchitecturePanel';
import PromptOutputPanel from './components/PromptOutputPanel';
import AccordionSection from './components/AccordionSection';
import ExportPanel from './components/ExportPanel';
import SettingsModal from './components/SettingsModal';

type OutputTab = 'storyboard' | 'seedance' | 'shotlist' | 'export';

function App() {
  const apiClient = useRef(initApiClient());

  const [showSettings, setShowSettings] = useState(false);

  const [workflowCase, setWorkflowCase] = useState<WorkflowCase | null>(null);
  const [storyIdea, setStoryIdea] = useState('');
  const [subject, setSubject] = useState('');
  const [environment, setEnvironment] = useState('');
  const [artStyle, setArtStyle] = useState('Cinematic');
  const [mood, setMood] = useState('Dramatic');
  const [duration, setDuration] = useState(8);
  const [motionLevel] = useState(55);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [platform, setPlatform] = useState('YouTube');

  const [cinematicStylePrompt, setCinematicStylePrompt] = useState('');
  const [cameraPrompt, setCameraPrompt] = useState('');
  const [motionPrompt, setMotionPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [additionalInstruction, setAdditionalInstruction] = useState('');

  const [language, setLanguage] = useState('English');
  const [detailLevel, setDetailLevel] = useState('Detailed');
  const [generateShotlist, setGenerateShotlist] = useState(true);
  const [generateSeedancePrompt, setGenerateSeedancePrompt] = useState(true);

  const [imageProvider, setImageProvider] = useState<ProviderId>(() => apiClient.current.getModelConfig().imageProvider);
  const [imageModel, setImageModel] = useState(() => apiClient.current.getModelConfig().imageModel);
  const [videoProvider, setVideoProvider] = useState<ProviderId>(() => apiClient.current.getModelConfig().videoProvider);
  const [videoModel, setVideoModel] = useState(() => apiClient.current.getModelConfig().videoModel);

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedImages, setSelectedImages] = useState<Record<string, boolean>>({});
  const [outputTab, setOutputTab] = useState<OutputTab>('storyboard');

  const aiAnalysis = useMemo(
    () => {
      const activeCase = workflowCase || 'case1';
      return analyzeVideoProfile(mood, motionLevel, duration, getCaseInfo(activeCase).panels, activeCase === 'case19');
    },
    [mood, motionLevel, duration, workflowCase],
  );

  const safetyResults = useMemo(
    () => {
      const activeCase = workflowCase || 'case1';
      return analyzeSafety(motionLevel, duration, getCaseInfo(activeCase).panels, activeCase === 'case19');
    },
    [motionLevel, duration, workflowCase],
  );

  const builtPrompts = useMemo(
    () => buildAllPrompts(scenes, artStyle, mood, workflowCase || 'case1').map((prompt) => ({
      ...prompt,
      negative: negativePrompt || prompt.negative,
    })),
    [scenes, artStyle, mood, workflowCase, negativePrompt],
  );

  const selectedWorkflow = workflowCase ? getCaseInfo(workflowCase) : null;
  const storyboardPromptText = builtPrompts.map((prompt, idx) => (
    `Scene ${idx + 1}\nSYSTEM: ${prompt.system}\nSTYLE: ${prompt.style}\nCAMERA: ${prompt.camera}\nMOTION: ${prompt.motion}\nNEGATIVE: ${negativePrompt || prompt.negative}`
  )).join('\n\n---\n\n');
  const seedancePromptText = builtPrompts.map((prompt, idx) => `Scene ${idx + 1}: ${prompt.seedance || ''}`).join('\n\n');

  const getProvider = (providerId: ProviderId) =>
    PROVIDERS.find((provider) => provider.id === providerId) || PROVIDERS[0];

  const handleSelectWorkflow = (caseId: WorkflowCase) => {
    setWorkflowCase(caseId);
    setScenes([]);
    setSelectedImages({});
    setOutputTab('storyboard');
  };

  const handleImageProviderChange = (providerId: ProviderId) => {
    const provider = getProvider(providerId);
    setImageProvider(providerId);
    setImageModel(provider.imageModels[0]?.id || '');
  };

  const handleVideoProviderChange = (providerId: ProviderId) => {
    const provider = getProvider(providerId);
    setVideoProvider(providerId);
    setVideoModel(provider.videoModels[0]?.id || '');
  };

  const panelPreview = (caseId: WorkflowCase) => {
    const info = getCaseInfo(caseId);
    const columns = caseId === 'case10' || caseId === 'case19' ? 4 : 3;
    return (
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: info.panels }).map((_, idx) => (
          <div key={`${caseId}-${idx}`} className="aspect-video rounded bg-white/[0.06] ring-1 ring-white/[0.04]" />
        ))}
      </div>
    );
  };

  const handleGenerateWorkflow = () => {
    if (!selectedWorkflow || !workflowCase) return;

    const panelCount = selectedWorkflow.panels;
    const generatedScenes: Scene[] = Array.from({ length: panelCount }).map((_, idx) => {
      const beatLabel = idx === 0 ? 'Opening beat' : idx === panelCount - 1 ? 'Closing beat' : `Beat ${idx + 1}`;
      const promptParts = [
        `${beatLabel}: ${storyIdea || 'Untitled storyboard idea'}`,
        subject ? `Subject: ${subject}` : '',
        environment ? `Setting: ${environment}` : '',
        `Visual style: ${artStyle}`,
        `Mood: ${mood}`,
        `Duration: ${duration}s`,
        `Aspect ratio: ${aspectRatio}`,
        `Platform: ${platform}`,
        `Language: ${language}`,
        `Detail level: ${detailLevel}`,
        cinematicStylePrompt ? `Cinematic style prompt: ${cinematicStylePrompt}` : '',
        cameraPrompt ? `Camera prompt: ${cameraPrompt}` : '',
        motionPrompt ? `Motion prompt: ${motionPrompt}` : '',
        additionalInstruction ? `Additional instruction: ${additionalInstruction}` : '',
      ].filter(Boolean);

      return {
        id: `scene-${idx + 1}`,
        description: `${beatLabel} for ${subject || 'the subject'} in ${environment || 'the selected setting'}`,
        prompt: promptParts.join('. '),
      };
    });

    setScenes(generatedScenes);
    setSelectedImages(Object.fromEntries(generatedScenes.map((scene) => [scene.id, true])));
    setOutputTab('storyboard');
  };

  const toggleImageSelect = (id: string) => setSelectedImages((prev) => ({ ...prev, [id]: !prev[id] }));

  const handlePromptTagClick = (label: string) => {
    setOutputTab('storyboard');
    const sectionMap: Record<string, string> = {
      'Cinematic Style': 'style',
      'Camera Direction': 'camera',
      'Subject Consistency': 'system',
      'Motion Guidance': 'motion',
      'Lighting Control': 'style',
    };
    window.setTimeout(() => {
      document.querySelector(`[data-prompt-section="${sectionMap[label] || 'style'}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  };

  return (
    <div className="min-h-screen bg-[#090a10] text-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.18),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(37,99,235,0.10),transparent_30%)]" />

      <header className="relative z-10 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">Storyboard-to-Video AI</div>
            <h1 className="truncate text-lg font-semibold sm:text-xl">Workflow-first cinematic generator</h1>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <button className="btn-ghost text-xs" onClick={() => setShowSettings(true)}><Settings2 size={13} /> Settings</button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-[1480px] grid-cols-1 gap-4 px-4 py-5 sm:px-6 xl:grid-cols-[300px_minmax(420px,1fr)_minmax(420px,1fr)]">
        <section className="glass-panel p-4">
          <div className="mb-4">
            <div className="section-label mb-1">Step 1</div>
            <h2 className="text-base font-semibold">Choose Workflow</h2>
            <p className="mt-1 text-xs text-gray-500">Start by selecting one storyboard structure.</p>
          </div>
          <div className="space-y-2">
            {WORKFLOW_CASES.map((workflow) => (
              <button
                key={workflow.id}
                type="button"
                onClick={() => handleSelectWorkflow(workflow.id)}
                className={`w-full rounded-xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 ${
                  workflowCase === workflow.id
                    ? 'border-violet-400/45 bg-violet-500/12 shadow-[0_0_22px_rgba(124,58,237,0.16)]'
                    : 'border-white/[0.07] bg-white/[0.025] hover:border-white/[0.16]'
                }`}
              >
                <div className="mb-2">{panelPreview(workflow.id)}</div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-snug text-white">{workflow.title}</div>
                    <div className="mt-1 text-[11px] text-gray-500">{workflow.panels} panels</div>
                  </div>
                  {workflowCase === workflow.id && <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-300" />}
                </div>
                <div className="mt-2 text-[11px] leading-relaxed text-gray-400">{workflow.description}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="glass-panel p-4">
          {selectedWorkflow ? (
            <>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="section-label mb-1">Steps 2-4</div>
                  <h2 className="text-base font-semibold">Enter Idea & Settings</h2>
                  <p className="mt-1 text-xs text-gray-500">Only the fields needed to generate this workflow.</p>
                </div>
                <div className="badge-violet text-[10px]">{selectedWorkflow.panels} panels</div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-400">Main idea</label>
                  <textarea className="input-field min-h-[92px] resize-none text-sm" value={storyIdea} onChange={(event) => setStoryIdea(event.target.value)} placeholder="Describe the video idea..." />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-gray-400">Subject</label>
                    <input className="input-field text-sm" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Main character or product" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-gray-400">Setting / Environment</label>
                    <input className="input-field text-sm" value={environment} onChange={(event) => setEnvironment(event.target.value)} placeholder="Location and atmosphere" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <select className="select-field text-sm" value={artStyle} onChange={(event) => setArtStyle(event.target.value)} aria-label="Visual style">
                    <option>Cinematic</option><option>Anime</option><option>Realistic</option><option>Abstract</option>
                  </select>
                  <select className="select-field text-sm" value={mood} onChange={(event) => setMood(event.target.value)} aria-label="Mood">
                    <option>Dramatic</option><option>Joyful</option><option>Mysterious</option><option>Melancholic</option><option>Energetic</option>
                  </select>
                  <input className="input-field text-sm" type="number" min={3} max={60} value={duration} onChange={(event) => setDuration(Number(event.target.value))} aria-label="Duration" />
                  <select className="select-field text-sm" value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value as '16:9' | '9:16' | '1:1')} aria-label="Aspect ratio">
                    <option value="16:9">16:9</option><option value="9:16">9:16</option><option value="1:1">1:1</option>
                  </select>
                  <select className="select-field text-sm" value={platform} onChange={(event) => setPlatform(event.target.value)} aria-label="Platform">
                    <option>YouTube</option><option>TikTok</option><option>Instagram</option><option>Web</option>
                  </select>
                  <select className="select-field text-sm" value={detailLevel} onChange={(event) => setDetailLevel(event.target.value)} aria-label="Detail level">
                    <option>Concise</option><option>Detailed</option><option>Production-grade</option>
                  </select>
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                  <div className="mb-3 text-xs font-semibold text-white">Prompt Details</div>
                  <div className="space-y-3">
                    <input className="input-field text-sm" value={cinematicStylePrompt} onChange={(event) => setCinematicStylePrompt(event.target.value)} placeholder="Cinematic style prompt" />
                    <input className="input-field text-sm" value={cameraPrompt} onChange={(event) => setCameraPrompt(event.target.value)} placeholder="Camera prompt" />
                    <input className="input-field text-sm" value={motionPrompt} onChange={(event) => setMotionPrompt(event.target.value)} placeholder="Motion prompt" />
                    <input className="input-field text-sm" value={negativePrompt} onChange={(event) => setNegativePrompt(event.target.value)} placeholder="Negative prompt" />
                    <textarea className="input-field min-h-[72px] resize-none text-sm" value={additionalInstruction} onChange={(event) => setAdditionalInstruction(event.target.value)} placeholder="Additional instruction" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <select className="select-field text-sm" value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Language">
                    <option>English</option><option>Vietnamese</option><option>Japanese</option><option>Korean</option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setGenerateShotlist(!generateShotlist)} className={`rounded-lg border px-3 py-2 text-xs ${generateShotlist ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-white/[0.07] text-gray-500'}`}>Shotlist {generateShotlist ? 'On' : 'Off'}</button>
                  <button type="button" onClick={() => setGenerateSeedancePrompt(!generateSeedancePrompt)} className={`rounded-lg border px-3 py-2 text-xs ${generateSeedancePrompt ? 'border-violet-500/30 bg-violet-500/10 text-violet-200' : 'border-white/[0.07] text-gray-500'}`}>Seedance {generateSeedancePrompt ? 'On' : 'Off'}</button>
                </div>

                <button className="btn-primary min-h-[48px] w-full" onClick={handleGenerateWorkflow} disabled={!storyIdea.trim()}>
                  <Sparkles size={15} /> Generate Workflow
                </button>
              </div>
            </>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-6 text-center">
              <Sparkles size={22} className="mb-3 text-violet-300" />
              <h2 className="text-base font-semibold">Choose a workflow first</h2>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-gray-500">Select one of the four storyboard cases to reveal the focused generator form.</p>
            </div>
          )}
        </section>

        <section className="space-y-4">
          {scenes.length > 0 && workflowCase ? (
            <>
              <div className="glass-panel p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="section-label mb-1">Step 5</div>
                    <h2 className="text-base font-semibold">Generated Output</h2>
                  </div>
                  <button className="btn-ghost text-xs" onClick={() => navigator.clipboard?.writeText(outputTab === 'seedance' ? seedancePromptText : storyboardPromptText)}>
                    <Copy size={13} /> Copy
                  </button>
                </div>

                <StoryboardPreview scenes={scenes} caseId={workflowCase} selectedImages={selectedImages} onToggleSelect={toggleImageSelect} isGenerating={false} generationProgress={100} />

                <div className="mt-4 flex gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.025] p-1 custom-scrollbar">
                  {[
                    ['storyboard', 'Storyboard Prompt'],
                    ['seedance', 'Seedance Prompt'],
                    ['shotlist', 'Shotlist'],
                    ['export', 'Export'],
                  ].map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setOutputTab(id as OutputTab)} className={`min-h-9 flex-shrink-0 rounded-lg px-3 text-xs transition-all ${outputTab === id ? 'bg-violet-500/20 text-white' : 'text-gray-500 hover:text-white'}`}>
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  {outputTab === 'storyboard' && <PromptOutputPanel prompts={builtPrompts} />}
                  {outputTab === 'seedance' && (
                    <div className="rounded-xl border border-white/[0.06] bg-black/25 p-3">
                      <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-gray-300">{generateSeedancePrompt ? seedancePromptText || 'Generate Workflow to create Seedance prompts.' : 'Seedance prompt generation is disabled in settings.'}</pre>
                    </div>
                  )}
                  {outputTab === 'shotlist' && (
                    <div className="space-y-2">
                      {generateShotlist ? scenes.map((scene, idx) => (
                        <div key={scene.id} className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-3">
                          <div className="text-xs font-semibold text-white">Shot {idx + 1}</div>
                          <div className="mt-1 text-[11px] leading-relaxed text-gray-400">{scene.prompt}</div>
                        </div>
                      )) : <div className="rounded-xl border border-white/[0.06] p-6 text-center text-xs text-gray-500">Shotlist generation is disabled in settings.</div>}
                    </div>
                  )}
                  {outputTab === 'export' && (
                    <ExportPanel
                      scenes={scenes}
                      storyIdea={storyIdea}
                      workflowCase={workflowCase}
                      artStyle={artStyle}
                      mood={mood}
                      duration={duration}
                      aspectRatio={aspectRatio}
                      platform={platform}
                      language={language}
                      detailLevel={detailLevel}
                      imageModel={imageModel}
                      videoModel={videoModel}
                    />
                  )}
                </div>
              </div>

              <AccordionSection title="Advanced" defaultOpen={false}>
                <div className="grid grid-cols-1 gap-3">
                  <AIReasoningPanel result={aiAnalysis} caseId={workflowCase} />
                  <RenderSafetyPanel results={safetyResults} />
                  <WorkflowPipeline currentStep={2} />
                  <PromptArchitecturePanel onTagClick={handlePromptTagClick} />
                </div>
              </AccordionSection>
            </>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-6 text-center">
              <Copy size={20} className="mb-3 text-gray-500" />
              <h2 className="text-base font-semibold text-gray-300">Output appears after Generate</h2>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-gray-500">Storyboard prompt, Seedance prompt, shotlist, and export controls stay hidden until a workflow is generated.</p>
            </div>
          )}
        </section>
      </main>

      {showSettings && (
        <SettingsModal client={apiClient} onClose={() => setShowSettings(false)}
          imageProvider={imageProvider} videoProvider={videoProvider}
          imageModel={imageModel} videoModel={videoModel}
          onImageProviderChange={handleImageProviderChange} onVideoProviderChange={handleVideoProviderChange}
          onImageModelChange={setImageModel} onVideoModelChange={setVideoModel} />
      )}
    </div>
  );
}

export default App;
