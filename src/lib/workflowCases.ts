import { WorkflowCase, WorkflowCaseInfo } from '../types';

export const WORKFLOW_CASES: WorkflowCaseInfo[] = [
  {
    id: 'case1',
    title: 'Standard Storyboard → Video',
    panels: 6,
    description: 'Linear storyboard with sequential scene generation',
    tags: ['General purpose', 'Narrative', 'Balanced'],
    match: 96,
    coherence: 92,
    stability: 88,
    efficiency: 85,
  },
  {
    id: 'case2',
    title: '3×3 Grid Storyboard',
    panels: 9,
    description: 'Matrix-based storyboard for parallel concept exploration',
    tags: ['Exploration', 'Grid', 'Multi-concept'],
    match: 78,
    coherence: 85,
    stability: 72,
    efficiency: 90,
  },
  {
    id: 'case10',
    title: 'Multi-Frame Fast-Cut',
    panels: 12,
    description: 'Rapid-fire multi-frame montage for high-energy sequences',
    tags: ['Fast paced', 'Montage', 'Dynamic'],
    match: 65,
    coherence: 60,
    stability: 70,
    efficiency: 75,
  },
  {
    id: 'case19',
    title: 'Storyboard-First Cost Control',
    panels: 4,
    description: 'Budget-optimized workflow with minimal render passes',
    tags: ['Budget', 'Efficient', 'Minimal'],
    match: 88,
    coherence: 90,
    stability: 95,
    efficiency: 98,
  },
];

export function getCaseInfo(id: WorkflowCase): WorkflowCaseInfo {
  return WORKFLOW_CASES.find(c => c.id === id) || WORKFLOW_CASES[0];
}