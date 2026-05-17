import { useMemo, useRef, useState } from 'react';
import { CheckCircle2, Copy, ImageIcon, Loader2, Settings2, Sparkles, Video as VideoIcon } from 'lucide-react';

import type { Scene, WorkflowCase } from './types';
import { initApiClient, PROVIDERS } from './lib/api';
import type { ProviderId } from './lib/api';
import { analyzeVideoProfile } from './lib/caseRouter';
import { analyzeSafety } from './lib/safetyAnalyzer';
import { buildAllPrompts } from './lib/promptBuilder';
import { WORKFLOW_CASES, getCaseInfo } from './lib/workflowCases';
import { getPromptSet } from './lib/promptSets';
import { useWorkflowState } from './lib/useWorkflowState';

import StoryboardPreview from './components/StoryboardPreview';
import AIReasoningPanel from './components/AIReasoningPanel';
import RenderSafetyPanel from './components/RenderSafetyPanel';
import WorkflowPipeline from './components/WorkflowPipeline';
import PromptArchitecturePanel from './components/PromptArchitecturePanel';
import PromptOutputPanel from './components/PromptOutputPanel';
import AccordionSection from './components/AccordionSection';
import ExportPanel from './components/ExportPanel';
import SettingsModal from './components/SettingsModal';
import WorkflowSettingsForm from './components/WorkflowSettingsForm';

type OutputTab = 'storyboard' | 'seedance' | 'shotlist' | 'export';

function App() {
  const apiClient = useRef(initApiClient());

  const [showSettings, setShowSettings] = useState(false);
  const [workflowCase, setWorkflowCase] = useState<WorkflowCase | null>(null);
  
  const { state, updateState } = useWorkflowState();
  const [isGenerating, setIsGenerating] = useState(false);

  const [imageProvider, setImageProvider] = useState<ProviderId>(() => apiClient.current.getModelConfig().imageProvider);
  const [imageModel, setImageModel] = useState(() => apiClient.current.getModelConfig().imageModel);
  const [videoProvider, setVideoProvider] = useState<ProviderId>(() => apiClient.current.getModelConfig().videoProvider);
  const [videoModel, setVideoModel] = useState(() => apiClient.current.getModelConfig().videoModel);

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedImages, setSelectedImages] = useState<Record<string, boolean>>({});
  const [outputTab, setOutputTab] = useState<OutputTab>('storyboard');

  // Batch render state: null = idle, number = scenes completed so far
  const [batchTotal, setBatchTotal] = useState<number>(0);
  const [batchDone, setBatchDone] = useState<number>(0);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [isVideoBatchRunning, setIsVideoBatchRunning] = useState(false);
  const [videoBatchDone, setVideoBatchDone] = useState(0);

  const activePromptSet = getPromptSet(state.promptSet);

  const aiAnalysis = useMemo(
    () => {
      const activeCase = workflowCase || 'case1';
      return analyzeVideoProfile(state.mood, state.motionLevel, state.duration, getCaseInfo(activeCase).panels, activeCase === 'case19');
    },
    [state.mood, state.motionLevel, state.duration, workflowCase],
  );

  const safetyResults = useMemo(
    () => {
      const activeCase = workflowCase || 'case1';
      return analyzeSafety(state.motionLevel, state.duration, getCaseInfo(activeCase).panels, activeCase === 'case19');
    },
    [state.motionLevel, state.duration, workflowCase],
  );

  const builtPrompts = useMemo(
    () => buildAllPrompts(scenes, state.artStyle, state.mood, workflowCase || 'case1').map((prompt) => ({
      ...prompt,
      negative: state.negativePrompt || prompt.negative,
    })),
    [scenes, state.artStyle, state.mood, workflowCase, state.negativePrompt],
  );

  const selectedWorkflow = workflowCase ? getCaseInfo(workflowCase) : null;
  const storyboardPromptText = builtPrompts.map((prompt, idx) => (
    `Scene ${idx + 1}\nSYSTEM: ${prompt.system}\nSTYLE: ${prompt.style}\nCAMERA: ${prompt.camera}\nMOTION: ${prompt.motion}\nNEGATIVE: ${state.negativePrompt || prompt.negative}`
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

    setIsGenerating(true);

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      const panelCount = selectedWorkflow.panels;
      const generatedScenes: Scene[] = Array.from({ length: panelCount }).map((_, idx) => {
        const beatLabel = idx === 0 ? 'Opening beat' : idx === panelCount - 1 ? 'Closing beat' : `Beat ${idx + 1}`;
        const promptParts = [
          `${beatLabel}: ${state.storyIdea || 'Untitled storyboard idea'}`,
          state.subject ? `Subject: ${state.subject}` : '',
          state.environment ? `Setting: ${state.environment}` : '',
          `Visual style: ${state.artStyle}`,
          `Mood: ${state.mood}`,
          `Duration: ${state.duration}s`,
          `Aspect ratio: ${state.aspectRatio}`,
          `Platform: ${state.platform}`,
          `Language: ${state.language}`,
          `Detail level: ${state.detailLevel}`,
          `Prompt set: ${activePromptSet.label}`,
          state.cinematicStylePrompt ? `Cinematic style prompt: ${state.cinematicStylePrompt}` : '',
          state.cameraPrompt ? `Camera prompt: ${state.cameraPrompt}` : '',
          state.motionPrompt ? `Motion prompt: ${state.motionPrompt}` : '',
          state.additionalInstruction ? `Additional instruction: ${state.additionalInstruction}` : '',
        ].filter(Boolean);

        return {
          id: `scene-${idx + 1}`,
          description: `${beatLabel} for ${state.subject || 'the subject'} in ${state.environment || 'the selected setting'}`,
          prompt: promptParts.join('. '),
        };
      });

      setScenes(generatedScenes);
      setSelectedImages(Object.fromEntries(generatedScenes.map((scene) => [scene.id, true])));
      setOutputTab('storyboard');
      setIsGenerating(false);
    }, 600);
  };

  const toggleImageSelect = (id: string) => setSelectedImages((prev) => ({ ...prev, [id]: !prev[id] }));

  /** Render all scenes sequentially, one at a time */
  const handleRenderAllScenes = async () => {
    if (isBatchRunning || scenes.length === 0) return;
    setIsBatchRunning(true);
    setBatchDone(0);
    setBatchTotal(scenes.length);

    for (let i = 0; i < scenes.length; i++) {
      await handleGenerateImage(scenes[i].id);
      setBatchDone(i + 1);
    }

    setIsBatchRunning(false);
  };

  /** Generate an image for a single scene and update its imageUrl in state */
  const handleGenerateImage = async (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    // Mark scene as generating
    setScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, isGeneratingImage: true, imageError: undefined } : s))
    );

    const result = await apiClient.current.image.generateImage(
      scene.prompt,
      imageModel,
      { aspect_ratio: '16:9', resolution: '1 MP' },
      imageProvider,
    );

    setScenes((prev) =>
      prev.map((s) =>
        s.id === sceneId
          ? {
              ...s,
              isGeneratingImage: false,
              imageUrl: result.data?.url ?? s.imageUrl,
              imageError: result.error ?? undefined,
            }
          : s
      )
    );
  };

  /** Generate a video from an already-generated image for a single scene */
  const handleGenerateVideo = async (sceneId: string, customPrompt?: string) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene?.imageUrl) return;

    setScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, isGeneratingVideo: true, videoError: undefined } : s))
    );

    const result = await apiClient.current.video.generateVideo(
      scene.imageUrl,
      videoModel,
      { duration: 5 },
      customPrompt || scene.prompt,
      videoProvider,
    );

    setScenes((prev) =>
      prev.map((s) =>
        s.id === sceneId
          ? {
              ...s,
              isGeneratingVideo: false,
              videoUrl: result.data?.url ?? s.videoUrl,
              videoError: result.error ?? undefined,
            }
          : s
      )
    );
  };

  /** Generate video from all scene images combined into a single output */
  const handleGenerateAllVideos = async () => {
    const scenesWithImages = scenes.filter((s) => s.imageUrl);
    if (isVideoBatchRunning || scenesWithImages.length === 0) return;
    setIsVideoBatchRunning(true);
    setVideoBatchDone(0);

    // Use the first scene's image + all scene prompts combined
    const firstScene = scenesWithImages[0];
    if (!firstScene?.imageUrl) {
      setIsVideoBatchRunning(false);
      return;
    }

    // Build a combined prompt from all scenes
    const combinedPrompt = scenesWithImages
      .map((s, i) => `[Scene ${i + 1}]: ${s.prompt}`)
      .join(' | ');

    // Generate video from the first image with combined prompt
    await handleGenerateVideo(firstScene.id, combinedPrompt);
    setVideoBatchDone(1);

    setIsVideoBatchRunning(false);
  };

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
            <WorkflowSettingsForm
              state={state}
              updateState={updateState}
              panelCount={selectedWorkflow.panels}
              onGenerate={handleGenerateWorkflow}
              isGenerating={isGenerating}
            />
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
                  <div className="flex items-center gap-2">
                    {/* Render All Scenes button */}
                    <button
                      id="render-all-btn"
                      type="button"
                      disabled={isBatchRunning || isGenerating}
                      onClick={handleRenderAllScenes}
                      className="flex items-center gap-1.5 rounded-lg border border-violet-400/40 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-200 transition-all hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isBatchRunning ? (
                        <><Loader2 size={12} className="animate-spin" /> Rendering {batchDone}/{batchTotal}…</>
                      ) : (
                        <><ImageIcon size={12} /> Render All Scenes</>
                      )}
                    </button>
                    <button
                      id="generate-all-video-btn"
                      type="button"
                      disabled={isVideoBatchRunning || scenes.length === 0}
                      onClick={handleGenerateAllVideos}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-all hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isVideoBatchRunning ? (
                        <><Loader2 size={12} className="animate-spin" /> Videos {videoBatchDone}/{scenes.filter(s => s.imageUrl).length}…</>
                      ) : (
                        <><VideoIcon size={12} /> Generate All Videos</>
                      )}
                    </button>
                    <button className="btn-ghost text-xs" onClick={() => navigator.clipboard?.writeText(outputTab === 'seedance' ? seedancePromptText : storyboardPromptText)}>
                      <Copy size={13} /> Copy
                    </button>
                  </div>
                </div>

                <StoryboardPreview
                  scenes={scenes}
                  caseId={workflowCase}
                  selectedImages={selectedImages}
                  onToggleSelect={toggleImageSelect}
                  isGenerating={isGenerating}
                  generationProgress={isGenerating ? 50 : 100}
                  onGenerateImage={handleGenerateImage}
                  isBatchRunning={isBatchRunning}
                  batchDone={batchDone}
                  batchTotal={batchTotal}
                />

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
                      <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-gray-300">{state.generateSeedancePrompt ? seedancePromptText || 'Generate Workflow to create Seedance prompts.' : 'Seedance prompt generation is disabled in settings.'}</pre>
                    </div>
                  )}
                  {outputTab === 'shotlist' && (
                    <div className="space-y-2">
                      {state.generateShotlist ? scenes.map((scene, idx) => (
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
                      storyIdea={state.storyIdea}
                      workflowCase={workflowCase}
                      artStyle={state.artStyle}
                      mood={state.mood}
                      duration={state.duration}
                      aspectRatio={state.aspectRatio}
                      platform={state.platform}
                      language={state.language}
                      detailLevel={state.detailLevel}
                      promptSet={activePromptSet.label}
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
