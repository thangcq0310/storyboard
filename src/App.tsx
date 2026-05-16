import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Wand2, LayoutGrid, ImageIcon, Film, Music, Settings2, Download,
  Upload, BarChart2, Loader2, Play, FastForward, CheckCircle2,
  Sliders, Sparkles, Square, Zap, ChevronDown, ChevronRight, Copy,
} from 'lucide-react';

import type { Scene, WorkflowMode, WorkflowCase, Mode, TabType, AnalyticsStats, JobEntry, BatchItem, ExportSummary, SeedancePrompt } from './types';

import { initApiClient } from './lib/api';
import { getCategories, getPromptsByCategory } from './prompts/seedancePrompts';
import { analyzeVideoProfile } from './lib/caseRouter';
import { analyzeSafety } from './lib/safetyAnalyzer';
import { buildAllPrompts } from './lib/promptBuilder';
import { SAMPLE_WORKFLOWS, loadRecentWorkflows, saveWorkflowToHistory } from './lib/sampleWorkflows';
import type { WorkflowHistoryItem } from './lib/sampleWorkflows';

import TabBar from './components/TabBar';
import StoryboardPreview from './components/StoryboardPreview';
import CaseTemplateCard from './components/CaseTemplateCard';
import WorkflowPipeline from './components/WorkflowPipeline';
import AIReasoningPanel from './components/AIReasoningPanel';
import RenderSafetyPanel from './components/RenderSafetyPanel';
import PromptArchitecturePanel from './components/PromptArchitecturePanel';
import PromptOutputPanel from './components/PromptOutputPanel';
import FinalVideoPlan from './components/FinalVideoPlan';
import RecentWorkflows from './components/RecentWorkflows';
import AccordionSection from './components/AccordionSection';
import ExportPanel from './components/ExportPanel';
import SettingsModal from './components/SettingsModal';
import AnalyticsModal from './components/AnalyticsModal';
import BatchModal from './components/BatchModal';

const sceneTemplates = [
  { label: 'Establishing Shot', value: 'Wide angle establishing shot of the environment, highly detailed, cinematic lighting.' },
  { label: 'Close-up on Character', value: "Extreme close up on the character's face showing emotion, shallow depth of field." },
  { label: 'Action/Dance Sequence', value: 'Dynamic action shot, character performing a dance move, motion blur, energetic atmosphere.' },
  { label: 'Environmental Transition', value: 'Camera pans across the environment, transitioning between locations, smooth movement.' },
];

function App() {
  // ── Mode & Tabs ──
  const [mode, setMode] = useState<Mode>('creator');
  const [activeTab, setActiveTab] = useState<TabType>('storyboard');

  // ── Stepper ──
  const [currentStep, setCurrentStep] = useState(1);

  // ── Processing ──
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'scenes' | 'prompts' | 'images'>('idle');

  // ── API Client ──
  const apiClient = useRef(initApiClient());
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showBatch, setShowBatch] = useState(false);

  // ── Input State ──
  const [storyIdea, setStoryIdea] = useState('');
  const [subject, setSubject] = useState('');
  const [environment, setEnvironment] = useState('');
  const [numScenes, setNumScenes] = useState(4);
  const [artStyle, setArtStyle] = useState('Cinematic');
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>('full');
  const [workflowCase, setWorkflowCase] = useState<WorkflowCase>('case1');
  const [mood, setMood] = useState('Dramatic');
  const [visualStyle, setVisualStyle] = useState('Cinematic');
  const [motionLevel, setMotionLevel] = useState(70);
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [platform, setPlatform] = useState('YouTube');
  const [budgetMode, setBudgetMode] = useState(false);

  // ── Scene State ──
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [charConsistency] = useState(true);

  // ── Image Generation ──
  const [imageModel, setImageModel] = useState(() => apiClient.current.getModelConfig().imageModel);
  const [_imageQuality, _setImageQuality] = useState('1024px');
  const [selectedImages, setSelectedImages] = useState<Record<string, boolean>>({});

  // ── Video State ──
  const [videoModel, setVideoModel] = useState(() => apiClient.current.getModelConfig().videoModel);
  const [addMusic, setAddMusic] = useState(false);
  const [danceStyle, setDanceStyle] = useState('Smooth / Cinematic');
  const [motionIntensity, setMotionIntensity] = useState(75);
  const [videosDone, setVideosDone] = useState(0);

  // ── Prompt Selector ──
  const [promptCategory, setPromptCategory] = useState('All');
  const [selectedPrompt, setSelectedPrompt] = useState<SeedancePrompt | null>(null);

  // ── Assembly ──
  const [transitionEffect, setTransitionEffect] = useState('Fade');
  const [transitionDuration, setTransitionDuration] = useState(10);
  const [addSubtitles, setAddSubtitles] = useState(true);
  const [subtitleText, setSubtitleText] = useState('');
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);

  // ── Export ──
  const [exportQuality, setExportQuality] = useState('1080p');
  const [exportFormat, setExportFormat] = useState('MP4 (H.264)');
  const [exportComplete, setExportComplete] = useState(false);

  // ── Batch ──
  const [batchQueue, setBatchQueue] = useState<BatchItem[]>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchCurrentIndex, setBatchCurrentIndex] = useState(0);

  // ── Recent Workflows ──
  const [recentWorkflows, setRecentWorkflows] = useState<WorkflowHistoryItem[]>(() => {
    const saved = loadRecentWorkflows();
    return saved.length > 0 ? saved : SAMPLE_WORKFLOWS;
  });

  // ── Analytics ──
  const [stats, setStats] = useState<AnalyticsStats>({
    totalImages: 0, totalVideos: 0,
    successfulImages: 0, successfulVideos: 0,
    failedImages: 0, failedVideos: 0,
    totalCost: 0, batchJobs: 0, lastUpdated: Date.now(),
  });
  const [jobHistory, setJobHistory] = useState<JobEntry[]>([]);

  useEffect(() => {
    const savedStats = localStorage.getItem('fusionfact_stats');
    if (savedStats) { try { setStats(JSON.parse(savedStats)); } catch {} }
    const savedHistory = localStorage.getItem('fusionfact_history');
    if (savedHistory) { try { setJobHistory(JSON.parse(savedHistory)); } catch {} }
  }, []);

  useEffect(() => { localStorage.setItem('fusionfact_stats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('fusionfact_history', JSON.stringify(jobHistory)); }, [jobHistory]);

  // ── AI Analysis (computed) ──
  const aiAnalysis = useMemo(() =>
    analyzeVideoProfile(mood, motionLevel, duration, numScenes, budgetMode),
    [mood, motionLevel, duration, numScenes, budgetMode]
  );

  const safetyResults = useMemo(() =>
    analyzeSafety(motionLevel, duration, numScenes, budgetMode),
    [motionLevel, duration, numScenes, budgetMode]
  );

  // ── Built prompts ──
  const builtPrompts = useMemo(() =>
    buildAllPrompts(scenes.filter(s => selectedImages[s.id]), artStyle, mood),
    [scenes, selectedImages, artStyle, mood]
  );

  // ── Update workflow case based on AI analysis ──
  useEffect(() => {
    const analysis = aiAnalysis;
    if (analysis.workflowMatch.includes('Case 1')) setWorkflowCase('case1');
    else if (analysis.workflowMatch.includes('Case 2')) setWorkflowCase('case2');
    else if (analysis.workflowMatch.includes('Case 10')) setWorkflowCase('case10');
    else if (analysis.workflowMatch.includes('Case 19')) setWorkflowCase('case19');
  }, [aiAnalysis]);

  // ── Helpers ──
  const updateStats = (type: 'image' | 'video', success: boolean, provider: string) => {
    const cost = type === 'image' ? 0.003 : 0.05;
    const newEntry: JobEntry = { id: `job-${Date.now()}`, type, provider, status: success ? 'success' : 'failed', timestamp: Date.now(), cost: success ? cost : 0 };
    setJobHistory(prev => [newEntry, ...prev].slice(0, 10));
    setStats(prev => ({
      ...prev,
      totalImages: type === 'image' ? prev.totalImages + 1 : prev.totalImages,
      totalVideos: type === 'video' ? prev.totalVideos + 1 : prev.totalVideos,
      successfulImages: type === 'image' && success ? prev.successfulImages + 1 : prev.successfulImages,
      successfulVideos: type === 'video' && success ? prev.successfulVideos + 1 : prev.successfulVideos,
      failedImages: type === 'image' && !success ? prev.failedImages + 1 : prev.failedImages,
      failedVideos: type === 'video' && !success ? prev.failedVideos + 1 : prev.failedVideos,
      totalCost: prev.totalCost + (success ? cost : 0),
      lastUpdated: Date.now(),
    }));
  };

  const updateBatchStats = (imagesCount: number, videosCount: number, successCount: number) => {
    setStats(prev => ({
      ...prev,
      totalImages: prev.totalImages + imagesCount,
      totalVideos: prev.totalVideos + videosCount,
      successfulImages: prev.successfulImages + successCount,
      failedImages: prev.failedImages + (imagesCount - successCount),
      batchJobs: prev.batchJobs + 1,
      totalCost: prev.totalCost + (0.003 * successCount) + (0.05 * successCount),
      lastUpdated: Date.now(),
    }));
  };

  const clearStats = () => {
    setStats({ totalImages: 0, totalVideos: 0, successfulImages: 0, successfulVideos: 0, failedImages: 0, failedVideos: 0, totalCost: 0, batchJobs: 0, lastUpdated: Date.now() });
    setJobHistory([]);
  };

  // ── Batch CSV ──
  const parseCSV = (csvText: string): BatchItem[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const storyIdx = headers.indexOf('story');
    const scenesIdx = headers.indexOf('scenes');
    const styleIdx = headers.indexOf('style');
    if (storyIdx === -1) return [];
    const items: BatchItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values[storyIdx]) {
        items.push({
          id: `batch-${i}`,
          story: values[storyIdx],
          scenes: scenesIdx !== -1 ? Math.min(Math.max(parseInt(values[scenesIdx]) || 4, 3), 10) : 4,
          style: styleIdx !== -1 ? values[styleIdx] || 'Cinematic' : 'Cinematic',
          status: 'pending', images: [], videos: [],
        });
      }
    }
    return items;
  };

  const handleLoadCSV = (csv: string) => {
    const items = parseCSV(csv);
    if (items.length === 0) { alert('Invalid CSV format.'); return; }
    setBatchQueue(items);
  };

  const handleRemoveFromBatch = (id: string) => setBatchQueue(prev => prev.filter(item => item.id !== id));

  const processBatchItem = async (item: BatchItem, index: number): Promise<BatchItem> => {
    if (!apiClient.current.isConfigured()) return { ...item, status: 'failed', error: 'API not configured' };
    setBatchCurrentIndex(index);
    setBatchQueue(prev => prev.map((q, i) => i === index ? { ...q, status: 'processing' as const } : q));

    const generatedScenes = Array.from({ length: item.scenes }).map((_, i) => ({
      id: `scene-${item.id}-${i}`,
      description: `Scene ${i + 1}: Based on "${item.story}"`,
      prompt: `Detailed prompt for Scene ${i + 1}. ${item.story}. Style: ${item.style}, high quality, detailed lighting.`,
    }));

    const imageUrls: string[] = [];
    for (let i = 0; i < generatedScenes.length; i++) {
      setProgress(Math.round(((i + 1) / (generatedScenes.length * 2)) * 100));
      const result = await apiClient.current.image.generateImage(generatedScenes[i].prompt, imageModel, { resolution: '1 MP' as const, aspect_ratio: '16:9' });
      if (result.data?.url) { imageUrls.push(result.data.url); updateStats('image', true, 'FLUX'); }
      else { updateStats('image', false, 'FLUX'); }
    }

    const danceStyleTags: Record<string, string> = {
      'Smooth / Cinematic': 'smooth cinematic movement, flowing motion, graceful',
      'Hip Hop': 'hip hop dance, street style, energetic moves, rhythm',
      'Ballet': 'ballet dance, elegant, precise movements, poise',
      'Freestyle': 'freestyle dance, dynamic, spontaneous movement',
      'Cinematic': 'smooth cinematic movement, flowing motion, graceful',
      'Anime': 'anime style, vibrant, dynamic movement',
      'Realistic': 'realistic natural movement, subtle motion',
      'Abstract': 'abstract art, mesmerizing patterns, flowing colors',
    };

    const videoUrls: string[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
      setProgress(Math.round(((generatedScenes.length + i + 1) / (generatedScenes.length * 2)) * 100));
      const result = await apiClient.current.video.generateVideo(imageUrls[i], videoModel, { duration: 5 }, danceStyleTags[item.style] || item.style);
      if (result.data?.url) { videoUrls.push(result.data.url); updateStats('video', true, 'Seedance2'); }
      else { updateStats('video', false, 'Seedance2'); }
    }

    updateBatchStats(generatedScenes.length, imageUrls.length, imageUrls.length);
    setProgress(100);
    return { ...item, status: 'completed' as const, images: imageUrls, videos: videoUrls };
  };

  const handleStartBatch = async () => {
    if (batchQueue.length === 0) return;
    if (!apiClient.current.isConfigured()) { alert('Configure Replicate API key first.'); return; }
    setBatchProcessing(true);
    setProgress(0);
    try {
      for (let i = 0; i < batchQueue.length; i++) {
        if (!batchProcessing) break;
        const processedItem = await processBatchItem(batchQueue[i], i);
        setBatchQueue(prev => prev.map((q, j) => j === i ? processedItem : q));
      }
    } catch (error) { console.error('Batch error:', error); alert('Batch processing error.'); }
    finally { setBatchProcessing(false); setProgress(100); }
  };

  const handleCancelBatch = () => {
    setBatchProcessing(false);
    setBatchQueue(prev => prev.map(item => item.status === 'processing' ? { ...item, status: 'pending' as const } : item));
  };

  // ── Generate Storyboard ──
  const handleGenerateStoryboard = async () => {
    if (!apiClient.current.isConfigured()) { alert('Configure Replicate API key first.'); return; }
    setIsProcessing(true);
    setGenerationStatus('scenes');

    setTimeout(() => {
      const generatedScenes: Scene[] = Array.from({ length: numScenes }).map((_, i) => ({
        id: `scene-${i + 1}`, description: '', prompt: '',
      }));
      setScenes(generatedScenes);
      setGenerationStatus('prompts');

      if (workflowMode === 'videos') { setIsProcessing(false); setCurrentStep(5); return; }

      setTimeout(() => {
        const updatedScenes = generatedScenes.map((s, idx) => {
          const charRef = charConsistency ? 'Maintain consistent character appearance across all scenes. Same subject, same face, same clothing.' : '';
          const composition = idx === 0 ? 'Wide shot establishing scene' : idx === generatedScenes.length - 1 ? 'Close-up final moment' : 'Medium shot';
          return { ...s, prompt: `${charRef} ${s.description}. Style: ${artStyle}, ${composition}, professional photography, high quality, detailed lighting, cinematic color grading, 8k resolution, masterpiece.` };
        });
        setScenes(updatedScenes);
        setGenerationStatus('images');

        // Save to recent workflows
        saveWorkflowToHistory({ title: storyIdea.slice(0, 40) || 'Untitled', storyIdea, subject, artStyle, workflowCase: workflowCase });

        if (workflowMode === 'full' || workflowMode === 'images') {
          handleGenerateImagesInternal(updatedScenes);
        }
      }, 1000);
    }, 1000);
  };

  const handleGenerateImagesInternal = async (scenesToProcess: Scene[]) => {
    const resolutionMap: Record<string, '1 MP' | '4 MP'> = { '1024px': '1 MP', '2048px (Slow)': '4 MP' };
    const resolution = resolutionMap[_imageQuality] || '1 MP';

    try {
      const updatedScenes: Scene[] = [];
      setProgress(0);
      for (let i = 0; i < scenesToProcess.length; i++) {
        setProgress(Math.round(((i + 1) / scenesToProcess.length) * 100));
        let fullPrompt = scenesToProcess[i].prompt;
        if (charConsistency) fullPrompt += ', same character, consistent appearance, high detail';
        const result = await apiClient.current.image.generateImage(fullPrompt, imageModel, { resolution, aspect_ratio: aspectRatio === '1:1' ? '1:1' : aspectRatio === '9:16' ? '9:16' : '16:9' });
        if (result.data?.url) { updateStats('image', true, 'FLUX'); updatedScenes.push({ ...scenesToProcess[i], imageUrl: result.data.url }); }
        else { updateStats('image', false, 'FLUX'); updatedScenes.push({ ...scenesToProcess[i], imageUrl: '' }); }
      }
      setScenes(updatedScenes);
      const initialSelected: Record<string, boolean> = {};
      updatedScenes.forEach(s => initialSelected[s.id] = !!s.imageUrl);
      setSelectedImages(initialSelected);
      setGenerationStatus('idle');
      setCurrentStep(2);
      const failedCount = updatedScenes.filter(s => !s.imageUrl).length;
      if (failedCount > 0) alert(`Warning: ${failedCount} image(s) failed.`);
    } catch (error) { console.error('Image gen error:', error); alert('Failed to generate images.'); }
    finally { setIsProcessing(false); }
  };

  // ── Generate Videos ──
  const handleGenerateVideos = async () => {
    if (!apiClient.current.isConfigured()) { alert('Configure API key first.'); return; }
    const totalSelected = Object.values(selectedImages).filter(Boolean).length;
    if (totalSelected === 0) { alert('Select at least one image.'); return; }

    setIsProcessing(true);
    setVideosDone(0);
    setProgress(0);
    setCurrentStep(5);

    const danceStyleTags: Record<string, string> = {
      'Smooth / Cinematic': 'smooth cinematic movement, flowing motion, graceful',
      'Hip Hop': 'hip hop dance, street style, energetic moves, rhythm',
      'Ballet': 'ballet dance, elegant, precise movements, poise',
      'Freestyle': 'freestyle dance, dynamic, spontaneous movement',
    };
    const prompt = selectedPrompt?.prompt || danceStyleTags[danceStyle] || danceStyle;

    try {
      const selectedSceneIndices = scenes.map((s, i) => (selectedImages[s.id] ? i : -1)).filter(i => i >= 0);
      for (let i = 0; i < selectedSceneIndices.length; i++) {
        const sceneIdx = selectedSceneIndices[i];
        const scene = scenes[sceneIdx];
        setVideosDone(i);
        setProgress(Math.round(((i + 1) / totalSelected) * 100));
        const result = await apiClient.current.video.generateVideo(scene.imageUrl || '', videoModel, { duration }, prompt);
        if (result.error) updateStats('video', false, videoModel);
        else if (result.data?.url) updateStats('video', true, videoModel);
      }
      setVideosDone(totalSelected);
      setProgress(100);
      setCurrentStep(6);
    } catch (error) { console.error('Video error:', error); alert('Failed to generate videos.'); }
    finally { setIsProcessing(false); }
  };

  const toggleImageSelect = (id: string) => setSelectedImages(prev => ({ ...prev, [id]: !prev[id] }));

  // ── Load sample workflow ──
  const loadWorkflow = useCallback((item: WorkflowHistoryItem) => {
    setStoryIdea(item.storyIdea);
    setSubject(item.subject || '');
    setArtStyle(item.artStyle);
    if (item.workflowCase) setWorkflowCase(item.workflowCase as WorkflowCase);
  }, []);

  // ── Prompt architecture click → switch to prompts tab ──
  const handlePromptTagClick = (label: string) => {
    setActiveTab('prompts');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)'
      }} />

      {/* ── Header ── */}
      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Storyboard SaaS</h1>
              <div className="text-[10px] text-violet-300 font-medium">Storyboard Techniques Only</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode switch */}
            <div className="glass-panel flex p-0.5">
              {(['creator', 'production'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    mode === m ? 'bg-violet-500/20 text-violet-300' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {m === 'creator' ? 'Creator' : 'Production'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button className="btn-ghost text-xs" onClick={() => setShowBatch(true)}><Upload size={12} /> Batch</button>
              <button className="btn-ghost text-xs hidden sm:flex" onClick={() => setShowAnalytics(true)}><BarChart2 size={12} /> Analytics</button>
              <button className="btn-ghost text-xs" onClick={() => setShowSettings(true)}><Settings2 size={12} /> Settings</button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 py-5 flex flex-col lg:flex-row gap-6"
        style={{ minHeight: 'calc(100vh - 56px)' }}
      >
        {/* ═══ LEFT PANEL (35%) ═══ */}
        <div className="w-full lg:w-[35%] space-y-3">
          {/* Subtitle */}
          <div className="glass-panel p-3">
            <p className="text-xs text-gray-500 leading-relaxed">
              Generate storyboard workflows, GPT Image prompts, and Seedance animation prompts automatically.
            </p>
          </div>

          {/* Recent Workflows */}
          <RecentWorkflows items={recentWorkflows} onLoad={loadWorkflow} />

          {/* Case Selector */}
          <CaseTemplateCard selected={workflowCase} onSelect={setWorkflowCase} />

          {/* ── ACCORDION SECTIONS ── */}
          <AccordionSection title="Scene Concept" defaultOpen={true}>
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">Video Idea</label>
              <textarea
                className="input-field min-h-[56px] text-xs resize-none"
                placeholder="Describe your story idea..."
                value={storyIdea}
                onChange={(e) => setStoryIdea(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Subject</label>
                <input className="input-field text-xs" placeholder="e.g. A dancer"
                  value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Environment</label>
                <input className="input-field text-xs" placeholder="e.g. Snowy forest"
                  value={environment} onChange={(e) => setEnvironment(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-1.5 pt-1">
              {(['full', 'images', 'videos'] as const).map((wm) => (
                <button
                  key={wm}
                  onClick={() => setWorkflowMode(wm)}
                  className={`flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-all ${
                    workflowMode === wm
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'bg-white/[0.03] text-gray-500 border border-white/[0.06]'
                  }`}
                >
                  {wm === 'full' ? '🎬 Full' : wm === 'images' ? '🖼️ Images' : '🎥 Video'}
                </button>
              ))}
            </div>
          </AccordionSection>

          <AccordionSection title="Cinematic Style" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Mood</label>
                <select className="select-field text-xs" value={mood} onChange={e => setMood(e.target.value)}>
                  <option>Dramatic</option><option>Joyful</option><option>Mysterious</option>
                  <option>Melancholic</option><option>Energetic</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Visual Style</label>
                <select className="select-field text-xs" value={artStyle} onChange={e => setArtStyle(e.target.value)}>
                  <option>Cinematic</option><option>Anime</option><option>Realistic</option><option>Abstract</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 mb-1 flex justify-between">
                <span>Motion Level</span><span className="text-violet-400">{motionLevel}%</span>
              </label>
              <input type="range" min="0" max="100" value={motionLevel} onChange={e => setMotionLevel(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 mb-1 flex justify-between">
                <span>Scenes</span><span className="text-violet-400">{numScenes}</span>
              </label>
              <input type="range" min="3" max="10" value={numScenes} onChange={e => setNumScenes(Number(e.target.value))} />
            </div>
          </AccordionSection>

          <AccordionSection title="Production" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Duration</label>
                <select className="select-field text-xs" value={duration} onChange={e => setDuration(Number(e.target.value))}>
                  <option value={3}>3s</option><option value={5}>5s</option><option value={8}>8s</option><option value={10}>10s</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Aspect</label>
                <select className="select-field text-xs" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)}>
                  <option value="16:9">16:9</option><option value="9:16">9:16</option><option value="1:1">1:1</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Platform</label>
                <select className="select-field text-xs" value={platform} onChange={e => setPlatform(e.target.value)}>
                  <option>YouTube</option><option>TikTok</option><option>Instagram</option><option>Web</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Image Model</label>
                <select className="select-field text-xs" value={imageModel} onChange={e => setImageModel(e.target.value)}>
                  <option value="Nano Banana Pro">Nano Banana</option>
                  <option value="FLUX.2 Pro">FLUX.2 Pro</option>
                  <option value="SD3.0">SD3.0</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-amber-400" />
                <span className="text-xs text-gray-300">Budget Mode</span>
              </div>
              <button onClick={() => setBudgetMode(!budgetMode)}
                className={`w-9 h-5 rounded-full transition-all ${budgetMode ? 'bg-amber-500' : 'bg-white/[0.1]'} relative`}>
                <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-all ${budgetMode ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
          </AccordionSection>

          {/* ── STICKY GENERATE BUTTON ── */}
          <div className="sticky bottom-4 pt-2">
            <button
              className="relative w-full py-3 rounded-xl font-semibold text-sm text-white overflow-hidden group
                bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600
                hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-300 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
              onClick={handleGenerateStoryboard}
              disabled={isProcessing || !storyIdea.trim()}
            >
              {/* Shimmer overlay */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000
                bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="relative flex items-center justify-center gap-2">
                {isProcessing ? (
                  <><Loader2 size={15} className="animate-spin" /> Generating Storyboard…</>
                ) : scenes.length > 0 ? (
                  <><Sparkles size={15} /> Regenerate Storyboard</>
                ) : (
                  <><Sparkles size={15} /> Generate Storyboard</>
                )}
              </div>
            </button>
            {isProcessing && (
              <div className="mt-2 w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT PANEL (65%) ═══ */}
        <div className="flex-1 min-w-0 space-y-4">
          <TabBar active={activeTab} onChange={setActiveTab} />

          {/* ── STORYBOARD TAB ── */}
          {activeTab === 'storyboard' && (
            <div className="space-y-4">
              {/* Storyboard Preview */}
              <StoryboardPreview
                scenes={scenes}
                caseId={workflowCase}
                selectedImages={selectedImages}
                onToggleSelect={toggleImageSelect}
                isGenerating={isProcessing}
                generationProgress={progress}
              />

              {/* Final Video Plan */}
              <FinalVideoPlan
                caseId={workflowCase}
                numScenes={numScenes}
                duration={duration}
                aspectRatio={aspectRatio}
                motionLevel={motionLevel}
                hasImages={scenes.some(s => s.imageUrl)}
              />

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <WorkflowPipeline currentStep={currentStep} />
                <div className="xl:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AIReasoningPanel result={aiAnalysis} caseId={workflowCase} />
                    <RenderSafetyPanel results={safetyResults} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PromptArchitecturePanel onTagClick={handlePromptTagClick} />
                    <div className="glass-panel p-4" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── VIDEO MOTION TAB ── */}
          {activeTab === 'video-motion' && (
            <div className="space-y-4">
              <div className="glass-panel p-4">
                <div className="section-label mb-3">Animation Motion</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Video Model</label>
                    <select className="select-field text-xs" value={videoModel} onChange={e => setVideoModel(e.target.value)}>
                      <option value="Veo 3.1 Lite">Veo 3.1 Lite</option>
                      <option value="Seedance 2.0">Seedance 2.0</option>
                      <option value="Happy Horse">Happy Horse</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Dance Style</label>
                    <select className="select-field text-xs" value={danceStyle} onChange={e => setDanceStyle(e.target.value)}>
                      <option>Smooth / Cinematic</option><option>Hip Hop</option><option>Ballet</option><option>Freestyle</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs text-gray-400 mb-1 flex justify-between">
                    <span>Motion Intensity</span><span className="text-violet-400">{motionIntensity}%</span>
                  </label>
                  <input type="range" min="0" max="100" value={motionIntensity} onChange={e => setMotionIntensity(Number(e.target.value))} />
                </div>
              </div>

              <div className="glass-panel p-4">
                <div className="section-label mb-3 flex items-center gap-2"><Sparkles size={12} /> Curated Prompts</div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {getCategories().map(cat => (
                    <button key={cat} onClick={() => { setPromptCategory(cat); setSelectedPrompt(null); }}
                      className={`px-2.5 py-1 text-[10px] font-medium rounded-full transition-all ${
                        promptCategory === cat
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                          : 'bg-white/[0.03] text-gray-500 border border-white/[0.06]'
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                  {getPromptsByCategory(promptCategory).map(p => (
                    <button key={p.id} onClick={() => setSelectedPrompt(p)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-all ${
                        selectedPrompt?.id === p.id
                          ? 'bg-violet-500/20 border border-violet-500/30'
                          : 'bg-white/[0.02] border border-white/[0.04]'
                      }`}>
                      <div className="font-medium text-white">{p.name}</div>
                      <div className="text-[9px] text-gray-500">{p.category} — {p.author}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="section-label mb-0">Background Audio</div>
                  <button onClick={() => setAddMusic(!addMusic)}
                    className={`w-9 h-5 rounded-full transition-all ${addMusic ? 'bg-violet-500' : 'bg-white/[0.1]'} relative`}>
                    <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-all ${addMusic ? 'left-5' : 'left-1'}`} />
                  </button>
                </div>
                {addMusic ? (
                  <div className="border-2 border-dashed border-white/[0.08] rounded-lg p-6 text-center cursor-pointer hover:border-violet-500/30">
                    <Upload className="mx-auto mb-2 text-gray-500" size={20} />
                    <p className="text-xs text-gray-400">Upload Background Music</p>
                    <p className="text-[10px] text-gray-500 mt-1">MP3, WAV up to 10MB</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 text-center py-3">Audio disabled</p>
                )}
              </div>

              <button className="btn-primary w-full py-3" onClick={handleGenerateVideos}
                disabled={isProcessing || Object.values(selectedImages).filter(Boolean).length === 0}>
                {isProcessing ? <><Loader2 size={14} className="animate-spin" /> Generating Videos…</>
                  : <><Play size={14} /> Generate Videos</>}
              </button>
            </div>
          )}

          {/* ── SHOTLIST TAB ── */}
          {activeTab === 'shotlist' && (
            <div className="glass-panel p-4">
              <div className="section-label mb-3">Shot List</div>
              {scenes.filter(s => selectedImages[s.id]).length > 0 ? (
                <div className="space-y-2">
                  {scenes.filter(s => selectedImages[s.id]).map((scene, idx) => (
                    <div key={scene.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="w-14 aspect-video rounded-md overflow-hidden bg-white/[0.03] flex-shrink-0">
                        {scene.imageUrl ? <img src={scene.imageUrl} className="w-full h-full object-cover" /> : (
                          <div className="w-full h-full flex items-center justify-center"><ImageIcon size={14} className="text-gray-500" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white">Shot {idx + 1}</div>
                        <div className="text-[9px] text-gray-500 truncate">{scene.prompt?.slice(0, 80) || 'No prompt'}</div>
                      </div>
                      <div className="text-[10px] text-gray-500 flex-shrink-0">4.0s</div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-xs text-gray-500 text-center py-8">Generate to see shot list</div>}
            </div>
          )}

          {/* ── PROMPTS TAB ── */}
          {activeTab === 'prompts' && (
            <PromptOutputPanel prompts={builtPrompts} />
          )}

          {/* ── EXPORT TAB ── */}
          {activeTab === 'export' && (
            <ExportPanel
              scenes={scenes.filter(s => selectedImages[s.id])}
              storyIdea={storyIdea}
              artStyle={artStyle}
              imageModel={imageModel}
              videoModel={videoModel}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <SettingsModal client={apiClient} onClose={() => setShowSettings(false)}
          imageModel={imageModel} videoModel={videoModel}
          onImageModelChange={setImageModel} onVideoModelChange={setVideoModel} />
      )}
      {showAnalytics && (
        <AnalyticsModal stats={stats} jobHistory={jobHistory}
          onClose={() => setShowAnalytics(false)} onClear={clearStats} />
      )}
      <BatchModal show={showBatch} onClose={() => setShowBatch(false)}
        batchQueue={batchQueue} batchProcessing={batchProcessing} batchCurrentIndex={batchCurrentIndex}
        onLoadCSV={handleLoadCSV} onRemove={handleRemoveFromBatch}
        onStart={handleStartBatch} onClear={() => setBatchQueue([])}
        onExport={() => alert('Batch Complete!')} onCancel={handleCancelBatch} />
    </div>
  );
}

export default App;