import { Sparkles } from 'lucide-react';
import type { WorkflowState } from '../lib/useWorkflowState';
import { PROMPT_SETS, type PromptSetId } from '../lib/promptSets';
import { useEffect } from 'react';
import { getPromptSet } from '../lib/promptSets';

interface WorkflowSettingsFormProps {
  state: WorkflowState;
  updateState: (updates: Partial<WorkflowState>) => void;
  panelCount: number;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export default function WorkflowSettingsForm({
  state,
  updateState,
  panelCount,
  onGenerate,
  isGenerating = false,
}: WorkflowSettingsFormProps) {
  const activePromptSet = getPromptSet(state.promptSet);

  useEffect(() => {
    if (state.promptSet === 'custom') return;
    const preset = getPromptSet(state.promptSet);
    updateState({
      cinematicStylePrompt: preset.cinematicStylePrompt,
      cameraPrompt: preset.cameraPrompt,
      motionPrompt: preset.motionPrompt,
      negativePrompt: preset.negativePrompt,
      additionalInstruction: preset.additionalInstruction,
    });
  }, [state.promptSet, updateState]);

  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="section-label mb-1">Steps 2-4</div>
          <h2 className="text-base font-semibold">Enter Idea & Settings</h2>
          <p className="mt-1 text-xs text-gray-500">Only the fields needed to generate this workflow.</p>
        </div>
        <div className="badge-violet text-[10px]">{panelCount} panels</div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-400">Main idea</label>
          <textarea
            className="input-field min-h-[92px] resize-none text-sm"
            value={state.storyIdea}
            onChange={(e) => updateState({ storyIdea: e.target.value })}
            placeholder="Describe the video idea..."
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-400">Subject</label>
            <input
              className="input-field text-sm"
              value={state.subject}
              onChange={(e) => updateState({ subject: e.target.value })}
              placeholder="Main character or product"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-400">Setting / Environment</label>
            <input
              className="input-field text-sm"
              value={state.environment}
              onChange={(e) => updateState({ environment: e.target.value })}
              placeholder="Location and atmosphere"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-gray-400">Mood</span>
            <select
              className="select-field text-sm"
              value={state.mood}
              onChange={(e) => updateState({ mood: e.target.value })}
              aria-label="Mood"
            >
              <option>Dramatic</option>
              <option>Joyful</option>
              <option>Mysterious</option>
              <option>Melancholic</option>
              <option>Energetic</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-gray-400">Visual style</span>
            <select
              className="select-field text-sm"
              value={state.artStyle}
              onChange={(e) => updateState({ artStyle: e.target.value })}
              aria-label="Visual style"
            >
              <option>Cinematic</option>
              <option>Anime</option>
              <option>Realistic</option>
              <option>Abstract</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-gray-400">Duration</span>
            <input
              className="input-field text-sm"
              type="number"
              min={3}
              max={60}
              value={state.duration}
              onChange={(e) => updateState({ duration: Number(e.target.value) })}
              aria-label="Duration"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-gray-400">Aspect ratio</span>
            <select
              className="select-field text-sm"
              value={state.aspectRatio}
              onChange={(e) => updateState({ aspectRatio: e.target.value as '16:9' | '9:16' | '1:1' })}
              aria-label="Aspect ratio"
            >
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
              <option value="1:1">1:1</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-gray-400">Platform</span>
            <select
              className="select-field text-sm"
              value={state.platform}
              onChange={(e) => updateState({ platform: e.target.value })}
              aria-label="Platform"
            >
              <option>YouTube</option>
              <option>TikTok</option>
              <option>Instagram</option>
              <option>Web</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-gray-400">Detail level</span>
            <select
              className="select-field text-sm"
              value={state.detailLevel}
              onChange={(e) => updateState({ detailLevel: e.target.value })}
              aria-label="Detail level"
            >
              <option>Concise</option>
              <option>Detailed</option>
              <option>Production-grade</option>
            </select>
          </label>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
          <div className="mb-3 text-xs font-semibold text-white">Prompt Details</div>
          <label className="mb-3 block">
            <span className="mb-1 block text-[11px] font-medium text-gray-400">Prompt set</span>
            <select
              className="select-field text-sm"
              value={state.promptSet}
              onChange={(e) => updateState({ promptSet: e.target.value as PromptSetId })}
              aria-label="Prompt set"
            >
              {PROMPT_SETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
          <div className="mb-3 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2 text-[11px] text-gray-400">
            <span className="block font-medium text-gray-200">{activePromptSet.category}</span>
            <span className="block mt-0.5">{activePromptSet.description}</span>
          </div>
          <div className="space-y-3">
            <input
              className="input-field text-sm"
              value={state.cinematicStylePrompt}
              onChange={(e) => updateState({ cinematicStylePrompt: e.target.value })}
              placeholder="Cinematic style prompt"
            />
            <input
              className="input-field text-sm"
              value={state.cameraPrompt}
              onChange={(e) => updateState({ cameraPrompt: e.target.value })}
              placeholder="Camera prompt"
            />
            <input
              className="input-field text-sm"
              value={state.motionPrompt}
              onChange={(e) => updateState({ motionPrompt: e.target.value })}
              placeholder="Motion prompt"
            />
            <input
              className="input-field text-sm"
              value={state.negativePrompt}
              onChange={(e) => updateState({ negativePrompt: e.target.value })}
              placeholder="Negative prompt"
            />
            <textarea
              className="input-field min-h-[72px] resize-none text-sm"
              value={state.additionalInstruction}
              onChange={(e) => updateState({ additionalInstruction: e.target.value })}
              placeholder="Additional instruction"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-gray-400">Language</span>
            <select
              className="select-field text-sm"
              value={state.language}
              onChange={(e) => updateState({ language: e.target.value })}
              aria-label="Language"
            >
              <option>English</option>
              <option>Vietnamese</option>
              <option>Japanese</option>
              <option>Korean</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateState({ generateShotlist: !state.generateShotlist })}
            className={`rounded-lg border px-3 py-2 text-xs ${
              state.generateShotlist
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-white/[0.07] text-gray-500'
            }`}
          >
            Shotlist {state.generateShotlist ? 'On' : 'Off'}
          </button>
          <button
            type="button"
            onClick={() => updateState({ generateSeedancePrompt: !state.generateSeedancePrompt })}
            className={`rounded-lg border px-3 py-2 text-xs ${
              state.generateSeedancePrompt
                ? 'border-violet-500/30 bg-violet-500/10 text-violet-200'
                : 'border-white/[0.07] text-gray-500'
            }`}
          >
            Seedance {state.generateSeedancePrompt ? 'On' : 'Off'}
          </button>
        </div>

        <button
          className="btn-primary min-h-[48px] w-full"
          onClick={onGenerate}
          disabled={!state.storyIdea.trim() || isGenerating}
        >
          <Sparkles size={15} className={isGenerating ? 'animate-pulse' : ''} /> 
          {isGenerating ? 'Generating...' : 'Generate Workflow'}
        </button>
      </div>
    </>
  );
}
