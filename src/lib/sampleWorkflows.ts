import type { WorkflowCase } from '../types';

export interface WorkflowHistoryItem {
  id: string;
  title: string;
  storyIdea: string;
  subject: string;
  environment: string;
  artStyle: string;
  workflowCase: WorkflowCase;
  mood: string;
  duration: number;
  motionLevel: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
  platform: string;
  budgetMode: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'storyboard_recent_workflows';

export function loadRecentWorkflows(): WorkflowHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWorkflowToHistory(item: Omit<WorkflowHistoryItem, 'id' | 'timestamp'>): void {
  const history = loadRecentWorkflows();
  const newItem: WorkflowHistoryItem = {
    ...item,
    id: `wf-${Date.now()}`,
    timestamp: Date.now(),
  };
  const updated = [newItem, ...history].slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export const SAMPLE_WORKFLOWS: WorkflowHistoryItem[] = [
  {
    id: 'sample-1',
    title: 'Frozen Mango Promo',
    storyIdea: 'A frozen mango ad with vibrant tropical colors and smooth transitions',
    subject: 'Mango product',
    environment: 'Tropical studio set with ice, condensation, and saturated fruit colors',
    artStyle: 'Cinematic',
    workflowCase: 'case1',
    mood: 'Joyful',
    duration: 5,
    motionLevel: 55,
    aspectRatio: '16:9',
    platform: 'YouTube',
    budgetMode: false,
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'sample-2',
    title: 'Anime Opening',
    storyIdea: 'An anime-style opening sequence with action cuts and dramatic music',
    subject: 'Samurai warrior',
    environment: 'Stormy neon city rooftop with drifting embers and rain streaks',
    artStyle: 'Anime',
    workflowCase: 'case10',
    mood: 'Energetic',
    duration: 24,
    motionLevel: 88,
    aspectRatio: '16:9',
    platform: 'YouTube',
    budgetMode: false,
    timestamp: Date.now() - 172800000,
  },
  {
    id: 'sample-3',
    title: 'Logistics Ad',
    storyIdea: 'A professional logistics company ad showing warehouse to delivery',
    subject: 'Delivery truck',
    environment: 'Modern warehouse, loading dock, city road, and clean corporate lighting',
    artStyle: 'Realistic',
    workflowCase: 'case19',
    mood: 'Dramatic',
    duration: 8,
    motionLevel: 35,
    aspectRatio: '16:9',
    platform: 'Web',
    budgetMode: true,
    timestamp: Date.now() - 259200000,
  },
];
