export interface WorkflowHistoryItem {
  id: string;
  title: string;
  storyIdea: string;
  subject: string;
  artStyle: string;
  workflowCase: string;
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
    artStyle: 'Cinematic',
    workflowCase: 'case1',
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'sample-2',
    title: 'Anime Opening',
    storyIdea: 'An anime-style opening sequence with action cuts and dramatic music',
    subject: 'Samurai warrior',
    artStyle: 'Anime',
    workflowCase: 'case10',
    timestamp: Date.now() - 172800000,
  },
  {
    id: 'sample-3',
    title: 'Logistics Ad',
    storyIdea: 'A professional logistics company ad showing warehouse to delivery',
    subject: 'Delivery truck',
    artStyle: 'Realistic',
    workflowCase: 'case19',
    timestamp: Date.now() - 259200000,
  },
];