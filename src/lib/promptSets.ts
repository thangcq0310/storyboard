export type PromptSetId =
  | 'custom'
  | 'portrait'
  | 'poster'
  | 'ecommerce'
  | 'adCreative'
  | 'characterDesign'
  | 'uiMockup'
  | 'comparison';

export interface PromptSetPreset {
  id: PromptSetId;
  label: string;
  description: string;
  category: string;
  cinematicStylePrompt: string;
  cameraPrompt: string;
  motionPrompt: string;
  negativePrompt: string;
  additionalInstruction: string;
}

export const PROMPT_SETS: PromptSetPreset[] = [
  {
    id: 'custom',
    label: 'Custom',
    description: 'Start from scratch and write your own prompt structure.',
    category: 'General',
    cinematicStylePrompt: '',
    cameraPrompt: '',
    motionPrompt: '',
    negativePrompt: '',
    additionalInstruction: '',
  },
  {
    id: 'portrait',
    label: 'Portrait / Photography',
    description: 'Close-up character framing with skin texture, light falloff, and editorial polish.',
    category: 'Portrait',
    cinematicStylePrompt: 'Editorial portrait lighting, natural skin texture, high detail, cinematic contrast, refined color grading.',
    cameraPrompt: 'Tight close-up, shallow depth of field, eye-level framing, intimate portrait composition.',
    motionPrompt: 'Subtle movement, slight head turns, soft breath, minimal camera drift.',
    negativePrompt: 'plastic skin, flat lighting, motion blur, low detail, awkward pose, harsh noise, watermark',
    additionalInstruction: 'Prioritize facial expression, texture fidelity, and elegant framing.',
  },
  {
    id: 'poster',
    label: 'Poster / Illustration',
    description: 'Bold hero composition with strong hierarchy and readable poster language.',
    category: 'Illustration',
    cinematicStylePrompt: 'Poster-grade illustration, strong silhouette, graphic contrast, expressive lighting, polished composition.',
    cameraPrompt: 'Center-framed hero shot, balanced negative space, poster-style composition, dramatic angle.',
    motionPrompt: 'Minimal motion with deliberate emphasis on pose, light sweep, and reveal timing.',
    negativePrompt: 'messy layout, unreadable text, weak hierarchy, low contrast, cluttered background, watermark',
    additionalInstruction: 'Keep the frame visually iconic and easy to read at a glance.',
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    description: 'Product-first framing with premium studio lighting and clean commercial polish.',
    category: 'Commercial',
    cinematicStylePrompt: 'Premium product lighting, clean studio background, crisp reflections, commercial-grade detail.',
    cameraPrompt: 'Product hero shot, controlled lens perspective, stable framing, catalog clarity.',
    motionPrompt: 'Slow reveal, subtle product rotation, gentle push-in, minimal movement.',
    negativePrompt: 'clutter, harsh shadows, warped product shape, noisy background, unreadable labels, watermark',
    additionalInstruction: 'Keep the product as the visual anchor in every frame.',
  },
  {
    id: 'adCreative',
    label: 'Ad Creative',
    description: 'Lifestyle-led commercial storytelling with strong emotional framing.',
    category: 'Advertising',
    cinematicStylePrompt: 'Lifestyle ad lighting, cinematic brand polish, emotional contrast, premium commercial atmosphere.',
    cameraPrompt: 'Dynamic commercial framing, mixed wide and medium shots, polished ad composition.',
    motionPrompt: 'Rhythmic motion, motivated camera movement, clean transitions, controlled energy.',
    negativePrompt: 'amateur framing, weak brand focus, muddy lighting, overcomplicated background, watermark',
    additionalInstruction: 'Make the message feel premium, concise, and brand-safe.',
  },
  {
    id: 'characterDesign',
    label: 'Character Design',
    description: 'Consistent identity, costume detail, and pose variation for repeatable characters.',
    category: 'Character',
    cinematicStylePrompt: 'Character sheet clarity, consistent facial features, costume detail, clean rendering, design-study polish.',
    cameraPrompt: 'Front, three-quarter, and profile-friendly framing with stable proportions.',
    motionPrompt: 'Low motion, pose changes, controlled gestures, identity-preserving framing.',
    negativePrompt: 'inconsistent anatomy, changing face shape, missing costume details, extra limbs, watermark',
    additionalInstruction: 'Preserve character consistency across every generated frame.',
  },
  {
    id: 'uiMockup',
    label: 'UI / Social Mockup',
    description: 'Interface-first layout with sharp typography and readable structure.',
    category: 'Product UI',
    cinematicStylePrompt: 'Clean interface rendering, sharp typography, structured layout, polished UI mockup lighting.',
    cameraPrompt: 'Straight-on UI capture, orthographic feel, clean grid alignment, screenshot clarity.',
    motionPrompt: 'Tiny interface transitions, subtle hover states, controlled reveal motion.',
    negativePrompt: 'blurry text, distorted UI, warped layout, cluttered controls, unreadable labels, watermark',
    additionalInstruction: 'Keep typography and spacing legible at every size.',
  },
  {
    id: 'comparison',
    label: 'Comparison / Before-After',
    description: 'Side-by-side contrast or transformation flow with clear visual deltas.',
    category: 'Comparison',
    cinematicStylePrompt: 'Comparison-ready framing, balanced left-right contrast, clear state separation, clean editorial polish.',
    cameraPrompt: 'Split-frame or before-after layout with steady alignment and equal visual weight.',
    motionPrompt: 'Transition from state A to state B with crisp, readable change moments.',
    negativePrompt: 'ambiguous comparison, mismatched scale, cluttered split layout, unclear differences, watermark',
    additionalInstruction: 'Make the contrast obvious without sacrificing composition quality.',
  },
];

export function getPromptSet(promptSetId: PromptSetId): PromptSetPreset {
  return PROMPT_SETS.find((preset) => preset.id === promptSetId) || PROMPT_SETS[0];
}
