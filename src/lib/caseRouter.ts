import type { WorkflowCase } from '../types';

export interface AIAnalysisResult {
  motionComplexity: 'Low' | 'Medium' | 'High';
  narrativeDensity: 'Low' | 'Medium' | 'High';
  continuityRequirement: 'Low' | 'Medium' | 'High';
  sceneTransitionRisk: 'Safe' | 'Caution' | 'Risk';
  workflowMatch: string;
  explanation: string;
}

export function analyzeVideoProfile(
  mood: string,
  motionLevel: number,
  duration: number,
  numScenes: number,
  budgetMode: boolean,
): AIAnalysisResult {
  const motionComplexity = motionLevel < 33 ? 'Low' : motionLevel < 66 ? 'Medium' : 'High';
  const narrativeDensity = numScenes > 8 ? 'High' : numScenes > 5 ? 'Medium' : 'Low';
  const continuityRequirement = duration > 8 ? 'High' : duration > 4 ? 'Medium' : 'Low';
  const sceneTransitionRisk = motionLevel > 90 ? 'Risk' : motionLevel > 70 ? 'Caution' : 'Safe';

  let workflowMatch = 'Case 1: Standard Storyboard → Video';
  if (budgetMode) workflowMatch = 'Case 19: Storyboard-First Cost Control';
  else if (motionLevel > 75) workflowMatch = 'Case 10: Multi-Frame Fast-Cut';
  else if (narrativeDensity === 'High') workflowMatch = 'Case 2: 3×3 Grid Storyboard';

  const explanation = `Your video has ${motionComplexity.toLowerCase()} motion, ${narrativeDensity.toLowerCase()} narrative density, and ${sceneTransitionRisk.toLowerCase()} transition risk. ${workflowMatch} is recommended.`;

  return { motionComplexity, narrativeDensity, continuityRequirement, sceneTransitionRisk, workflowMatch, explanation };
}
