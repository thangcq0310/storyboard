import type { WorkflowCase } from '../types';

export interface AIAnalysisResult {
  motionComplexity: 'Low' | 'Medium' | 'High';
  narrativeDensity: 'Low' | 'Medium' | 'High';
  continuityRequirement: 'Low' | 'Medium' | 'High';
  sceneTransitionRisk: 'Safe' | 'Caution' | 'Risk';
  workflowMatch: string;
  explanation: string;
}

export function selectWorkflowCase(
  motionLevel: number,
  duration: number,
  numScenes: number,
  budgetMode: boolean,
): WorkflowCase {
  if (budgetMode) return 'case19';
  if (motionLevel >= 70 && duration <= 20) return 'case2';
  if (duration > 20 || numScenes >= 10) return 'case10';
  return 'case1';
}

const workflowLabels: Record<WorkflowCase, string> = {
  case1: 'Case 1: Standard Storyboard -> Video',
  case2: 'Case 2: 3x3 Grid Storyboard',
  case10: 'Case 10: Multi-Frame Fast-Cut',
  case19: 'Case 19: Storyboard-First Cost Control',
};

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

  const selectedCase = selectWorkflowCase(motionLevel, duration, numScenes, budgetMode);
  const workflowMatch = workflowLabels[selectedCase];

  const explanation = `Your ${mood.toLowerCase()} video has ${motionComplexity.toLowerCase()} motion, ${narrativeDensity.toLowerCase()} narrative density, and ${sceneTransitionRisk.toLowerCase()} transition risk. ${workflowMatch} is recommended.`;

  return { motionComplexity, narrativeDensity, continuityRequirement, sceneTransitionRisk, workflowMatch, explanation };
}
