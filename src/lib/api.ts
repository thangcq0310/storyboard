/**
 * FusionFact API Client Module
 * Uses direct Replicate REST API (browser-safe, no Node.js SDK)
 */

// ============================================================================
// Types
// ============================================================================

export interface ImageGenerateOptions {
  aspect_ratio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  resolution?: '1 MP' | '2 MP' | '4 MP' | '8 MP';
  seed?: number;
}

export interface VideoGenerateOptions {
  duration?: number;
  seed?: number;
}

export interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface ImageResult {
  url: string;
}

export interface VideoResult {
  url: string;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'fusionfact_api_key';
const MODEL_STORAGE_KEY = 'fusionfact_model_config';
const REPLICATE_API_BASE = 'https://api.replicate.com/v1';

// Model name → Replicate model identifier mapping
export const IMAGE_MODEL_MAP: Record<string, string> = {
  'Nano Banana Pro': 'lucataco/nano-banana-pro',
  'FLUX.2 Pro': 'black-forest-labs/flux-dev',
  'SD3.0': 'stability-ai/stable-diffusion-3.5-large',
};

export const VIDEO_MODEL_MAP: Record<string, string> = {
  'Veo 3.1 Lite': 'luma/veo-3.1-lite',
  'Seedance 2.0': 'bytedance/seedance-2.0',
  'Happy Horse': 'alibaba/happyhorse-1.0',
};

// ============================================================================
// Model Config Persistence
// ============================================================================

export interface ModelConfig {
  imageModel: string;
  videoModel: string;
}

function getModelConfig(): ModelConfig {
  if (typeof window === 'undefined') return { imageModel: 'FLUX.2 Pro', videoModel: 'Seedance 2.0' };
  try {
    const saved = localStorage.getItem(MODEL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { imageModel: 'FLUX.2 Pro', videoModel: 'Seedance 2.0' };
}

function saveModelConfig(config: ModelConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(config));
}

// ============================================================================
// Helper Functions
// ============================================================================

function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

function setApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, key);
}

function clearApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

function extractUrl(data: unknown): string | null {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const url = extractUrl(item);
        if (url) return url;
      }
    }
    if (obj.url) return String(obj.url);
    if (obj.output) return extractUrl(obj.output);
  }
  return null;
}

// ============================================================================
// Direct Replicate REST API (browser-safe)
// ============================================================================

async function replicatePost(model: string, input: Record<string, unknown>, apiKey: string): Promise<unknown> {
  const response = await fetch(`${REPLICATE_API_BASE}/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: model,
      input,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Replicate API error ${response.status}: ${errBody}`);
  }

  const prediction = await response.json();
  return await waitForReplicatePrediction(prediction.id, apiKey);
}

async function waitForReplicatePrediction(predictionId: string, apiKey: string): Promise<unknown> {
  for (let attempt = 0; attempt < 120; attempt++) {
    const response = await fetch(`${REPLICATE_API_BASE}/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Polling failed: ${response.status}`);
    }

    const prediction = await response.json();

    switch (prediction.status) {
      case 'succeeded':
        return prediction.output;
      case 'failed':
        throw new Error(prediction.error?.toString() || 'Prediction failed');
      case 'canceled':
        throw new Error('Prediction was canceled');
      case 'starting':
      case 'processing':
        await new Promise(r => setTimeout(r, 2000));
        break;
    }
  }

  throw new Error('Prediction timed out');
}

// ============================================================================
// ImageAPI Class
// ============================================================================

export class ImageAPI {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = getApiKey();
  }

  setApiKey(key: string): void {
    setApiKey(key);
    this.apiKey = key;
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }

  async generateImage(
    prompt: string,
    modelName: string = 'FLUX.2 Pro',
    options: ImageGenerateOptions = {}
  ): Promise<ApiState<ImageResult>> {
    if (!this.apiKey) {
      return { data: null, isLoading: false, error: 'API key not configured.' };
    }

    const modelId = IMAGE_MODEL_MAP[modelName];
    if (!modelId) {
      return { data: null, isLoading: false, error: `Unknown image model: ${modelName}` };
    }

    try {
      const output = await replicatePost(modelId, {
        prompt,
        aspect_ratio: options.aspect_ratio || '16:9',
        resolution: options.resolution || '1 MP',
        seed: options.seed,
        output_format: 'webp',
      }, this.apiKey);

      const url = extractUrl(output);
      if (!url) {
        return { data: null, isLoading: false, error: 'No URL returned from API.' };
      }

      return { data: { url }, isLoading: false, error: null };
    } catch (err) {
      return {
        data: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }
}

// ============================================================================
// VideoAPI Class
// ============================================================================

export class VideoAPI {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = getApiKey();
  }

  setApiKey(key: string): void {
    setApiKey(key);
    this.apiKey = key;
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }

  async generateVideo(
    imageUrl: string,
    modelName: string = 'Seedance 2.0',
    options: VideoGenerateOptions = {},
    customPrompt?: string
  ): Promise<ApiState<VideoResult>> {
    if (!this.apiKey) {
      return { data: null, isLoading: false, error: 'API key not configured.' };
    }

    const modelId = VIDEO_MODEL_MAP[modelName];
    if (!modelId) {
      return { data: null, isLoading: false, error: `Unknown video model: ${modelName}` };
    }

    const input: Record<string, unknown> = {
      image: imageUrl,
      duration: options.duration || 5,
    };

    if (customPrompt) {
      input.prompt = customPrompt;
    }

    try {
      const output = await replicatePost(modelId, input, this.apiKey);
      const url = extractUrl(output);

      if (!url) {
        return { data: null, isLoading: false, error: 'No URL returned from API.' };
      }

      return { data: { url }, isLoading: false, error: null };
    } catch (err) {
      return {
        data: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }
}

// ============================================================================
// Initialization
// ============================================================================

export interface ApiClient {
  image: ImageAPI;
  video: VideoAPI;
  getApiKey: () => string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  isConfigured: () => boolean;
  saveModelConfig: (config: ModelConfig) => void;
  getModelConfig: () => ModelConfig;
}

export function initApiClient(apiKey?: string): ApiClient {
  if (apiKey) {
    setApiKey(apiKey);
  }

  const imageApi = new ImageAPI();
  const videoApi = new VideoAPI();

  return {
    image: imageApi,
    video: videoApi,
    getApiKey,
    setApiKey: (key: string) => {
      setApiKey(key);
      imageApi.setApiKey(key);
      videoApi.setApiKey(key);
    },
    clearApiKey: () => {
      clearApiKey();
    },
    isConfigured: () => imageApi.isConfigured() && videoApi.isConfigured(),
    saveModelConfig,
    getModelConfig,
  };
}

export const apiClient = initApiClient();