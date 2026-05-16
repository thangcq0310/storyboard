import { Scene, WorkflowCase } from '../types';

export interface BuiltPrompt {
  system: string;
  style: string;
  camera: string;
  motion: string;
  negative: string;
  seedance?: string;
}

const workflowPromptConfig: Record<WorkflowCase, {
  title: string;
  panelCount: number;
  strategy: string;
  cameraPattern: string[];
  motionPattern: string[];
}> = {
  case1: {
    title: '6-panel linear storyboard',
    panelCount: 6,
    strategy: 'linear narrative progression with clear establishing, development, and payoff beats',
    cameraPattern: ['Wide establishing shot', 'Medium subject introduction', 'Over-the-shoulder continuity shot', 'Close-up emotional beat', 'Tracking action shot', 'Hero final frame'],
    motionPattern: ['subtle ambient drift', 'gentle push-in', 'smooth lateral pan', 'controlled dolly-in', 'motivated subject movement', 'slow settle into final composition'],
  },
  case2: {
    title: '3x3 grid storyboard',
    panelCount: 9,
    strategy: '3x3 continuity grid preserving direction, screen position, and motion flow between panels',
    cameraPattern: ['Grid cell wide shot', 'Matched medium shot', 'Close continuity insert', 'Lateral tracking shot', 'Center anchor shot', 'Reverse angle match', 'Motion bridge shot', 'Rhythm cutaway', 'Resolution frame'],
    motionPattern: ['left-to-right continuity', 'matched subject velocity', 'stable eyeline movement', 'consistent direction of travel', 'center-weighted motion anchor', 'smooth reverse transition', 'motion bridge', 'tempo-preserving cut', 'continuity lock-off'],
  },
  case10: {
    title: '12-frame fast-cut montage',
    panelCount: 12,
    strategy: 'rapid fast-cut montage with high-energy shot variety and readable visual rhythm',
    cameraPattern: ['Impact wide', 'Snap close-up', 'Whip-pan insert', 'Low-angle action', 'Texture cutaway', 'Push-in beat', 'Top shot', 'Fast tracking shot', 'Reaction close-up', 'Motion blur frame', 'Hero flash', 'Final impact frame'],
    motionPattern: ['fast kinetic entry', 'sharp accent motion', 'whip transition', 'high-energy movement', 'micro detail motion', 'accelerating push', 'directional snap', 'rapid tracking', 'reaction beat', 'controlled blur', 'peak action', 'hard stop'],
  },
  case19: {
    title: '8-panel cost-control storyboard',
    panelCount: 8,
    strategy: 'cost-controlled storyboard that maximizes reuse, stable framing, and minimal render passes',
    cameraPattern: ['Reusable master shot', 'Static product angle', 'Medium continuity shot', 'Detail insert', 'Hold frame variation', 'Minimal pan shot', 'Clean transition frame', 'Final reusable hero frame'],
    motionPattern: ['static with subtle atmosphere', 'minimal product movement', 'small controlled motion', 'detail-only animation', 'held pose with ambient drift', 'short efficient pan', 'simple transition', 'stable final hold'],
  },
};

export function getWorkflowPromptConfig(workflowCase: WorkflowCase) {
  return workflowPromptConfig[workflowCase];
}

export function buildPromptForScene(scene: Scene, idx: number, artStyle: string, mood: string, workflowCase: WorkflowCase): BuiltPrompt {
  const style = scene.description || `Scene ${idx + 1} of the story`;
  const config = workflowPromptConfig[workflowCase];
  const panelNumber = (idx % config.panelCount) + 1;
  const cameraDirection = config.cameraPattern[idx % config.cameraPattern.length];
  const motionDirection = config.motionPattern[idx % config.motionPattern.length];

  return {
    system: `You are a cinematic prompt engineer creating a ${config.title}. Follow this workflow strategy: ${config.strategy}. Panel ${panelNumber} must remain coherent with the surrounding storyboard.`,
    style: `${style}. Style: ${artStyle}, mood: ${mood}, ${config.title}, professional photography, high quality, detailed lighting, cinematic color grading, 8k.`,
    camera: `Camera: ${cameraDirection}. Preserve composition logic for ${config.title}. Shallow depth of field only when it supports the beat.`,
    motion: `Motion: ${motionDirection}. ${workflowCase === 'case2' ? 'Maintain motion continuity across the 3x3 grid.' : workflowCase === 'case10' ? 'Keep cuts fast, legible, and rhythmic.' : workflowCase === 'case19' ? 'Prefer economical movement and reusable framing.' : 'Smooth cinematic movement.'}`,
    negative: 'blurry, low quality, distorted, watermark, text, logo, oversaturated, unnatural colors, lens flare, grain',
    seedance: seedancePromptForScene(style, artStyle, workflowCase, motionDirection),
  };
}

function seedancePromptForScene(description: string, artStyle: string, workflowCase: WorkflowCase, motionDirection: string): string {
  const workflowMotion: Record<WorkflowCase, string> = {
    case1: 'linear storyboard motion, smooth scene-to-scene progression',
    case2: '3x3 grid continuity, consistent direction of travel, matched motion between frames',
    case10: 'fast-cut montage rhythm, energetic camera changes, controlled motion blur',
    case19: 'cost-controlled subtle motion, stable framing, reusable shot language',
  };
  return `${workflowMotion[workflowCase]}, ${motionDirection}, ${artStyle.toLowerCase()} look, ${description.slice(0, 80)}, natural motion blur, cinematic atmosphere`;
}

export function buildAllPrompts(scenes: Scene[], artStyle: string, mood: string, workflowCase: WorkflowCase): BuiltPrompt[] {
  return scenes.map((s, i) => buildPromptForScene(s, i, artStyle, mood, workflowCase));
}
