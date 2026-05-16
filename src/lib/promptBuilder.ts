import { Scene } from '../types';

export interface BuiltPrompt {
  system: string;
  style: string;
  camera: string;
  motion: string;
  negative: string;
  seedance?: string;
}

export function buildPromptForScene(scene: Scene, idx: number, artStyle: string, mood: string): BuiltPrompt {
  const style = scene.description || `Scene ${idx + 1} of the story`;
  return {
    system: `You are a cinematic prompt engineer creating detailed scene descriptions for ${artStyle}-style video production.`,
    style: `${style}. Style: ${artStyle}, mood: ${mood}, professional photography, high quality, detailed lighting, cinematic color grading, 8k.`,
    camera: `Camera: ${idx === 0 ? 'Wide establishing shot' : idx % 2 === 0 ? 'Medium shot, 50mm' : 'Close-up, 85mm'}. Shallow depth of field.`,
    motion: `Motion: ${idx === 0 ? 'Static with subtle drift' : idx % 2 === 0 ? 'Slow pan left to right' : 'Dolly in toward subject'}. Smooth, cinematic camera movement.`,
    negative: 'blurry, low quality, distorted, watermark, text, logo, oversaturated, unnatural colors, lens flare, grain',
    seedance: seedancePromptForScene(style, artStyle),
  };
}

function seedancePromptForScene(description: string, _artStyle: string): string {
  return `smooth ${_artStyle.toLowerCase()} movement, ${description.slice(0, 60)}, flowing motion, graceful camera tracking, natural motion blur, cinematic atmosphere, gentle sway and ambient motion`;
}

export function buildAllPrompts(scenes: Scene[], artStyle: string, mood: string): BuiltPrompt[] {
  return scenes.map((s, i) => buildPromptForScene(s, i, artStyle, mood));
}