import { useState, useEffect } from 'react';
import type { PromptSetId } from './promptSets';

export interface WorkflowState {
  storyIdea: string;
  subject: string;
  environment: string;
  artStyle: string;
  mood: string;
  duration: number;
  motionLevel: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
  platform: string;
  cinematicStylePrompt: string;
  cameraPrompt: string;
  motionPrompt: string;
  negativePrompt: string;
  additionalInstruction: string;
  promptSet: PromptSetId;
  language: string;
  detailLevel: string;
  generateShotlist: boolean;
  generateSeedancePrompt: boolean;
}

const DEFAULT_STATE: WorkflowState = {
  storyIdea: '',
  subject: '',
  environment: '',
  artStyle: 'Cinematic',
  mood: 'Dramatic',
  duration: 8,
  motionLevel: 55,
  aspectRatio: '16:9',
  platform: 'YouTube',
  cinematicStylePrompt: '',
  cameraPrompt: '',
  motionPrompt: '',
  negativePrompt: '',
  additionalInstruction: '',
  promptSet: 'custom',
  language: 'English',
  detailLevel: 'Detailed',
  generateShotlist: true,
  generateSeedancePrompt: true,
};

const STORAGE_KEY = 'storyboard_workflow_state';

export function useWorkflowState() {
  const [state, setState] = useState<WorkflowState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_STATE, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to parse stored workflow state', e);
    }
    return DEFAULT_STATE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateState = (updates: Partial<WorkflowState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  return { state, updateState };
}
