export interface Scene {
  id: string;
  description: string;
  prompt: string;
  imageUrl?: string;
  danceStyle?: string;
  motionIntensity?: number;
}

export type WorkflowMode = 'full' | 'images' | 'videos';

export type WorkflowCase = 'case1' | 'case2' | 'case10' | 'case19';

export interface WorkflowCaseInfo {
  id: WorkflowCase;
  title: string;
  panels: number;
  description: string;
  tags: string[];
  match?: number;
  coherence?: number;
  stability?: number;
  efficiency?: number;
}

export interface BatchItem {
  id: string;
  story: string;
  scenes: number;
  style: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  images: string[];
  videos: string[];
}

export interface AnalyticsStats {
  totalImages: number;
  totalVideos: number;
  successfulImages: number;
  successfulVideos: number;
  failedImages: number;
  failedVideos: number;
  totalCost: number;
  batchJobs: number;
  lastUpdated: number;
}

export interface JobEntry {
  id: string;
  type: 'image' | 'video' | 'batch';
  provider: string;
  status: 'success' | 'failed';
  timestamp: number;
  cost: number;
}

export interface ExportSummary {
  scenes: number;
  quality: string;
  format: string;
  social: string;
  duration: string;
}

export type Mode = 'creator' | 'production';

export type TabType = 'storyboard' | 'video-motion' | 'shotlist' | 'prompts' | 'export';