/**
 * FusionFact API Client Module
 * Uses Replicate REST API through a same-origin proxy in development.
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

export type ProviderId = 'replicate' | 'custom';

export interface ProviderModel {
  id: string;
  label: string;
}

export interface ProviderDefinition {
  id: ProviderId;
  label: string;
  description: string;
  imageModels: ProviderModel[];
  videoModels: ProviderModel[];
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'fusionfact_api_key';
const PROVIDER_CREDENTIALS_KEY = 'fusionfact_provider_credentials';
const MODEL_STORAGE_KEY = 'fusionfact_model_config';
const REPLICATE_API_BASE = (
  import.meta.env.VITE_REPLICATE_API_BASE ||
  (import.meta.env.DEV ? '/api/replicate/v1' : 'https://api.replicate.com/v1')
).replace(/\/$/, '');

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

export const PROVIDERS: ProviderDefinition[] = [
  {
    id: 'replicate',
    label: 'Replicate',
    description: 'Hosted image/video generation through Replicate predictions API.',
    imageModels: Object.keys(IMAGE_MODEL_MAP).map((model) => ({ id: model, label: model })),
    videoModels: Object.keys(VIDEO_MODEL_MAP).map((model) => ({ id: model, label: model })),
  },
  {
    id: 'custom',
    label: 'Custom API',
    description: 'Bring your own Replicate-compatible API proxy or gateway.',
    imageModels: [{ id: 'custom-image-model', label: 'Custom image model' }],
    videoModels: [{ id: 'custom-video-model', label: 'Custom video model' }],
  },
];

export interface ProviderCredentials {
  apiKey: string;
  baseUrl?: string;
}

type ProviderCredentialsMap = Partial<Record<ProviderId, ProviderCredentials>>;

// ============================================================================
// Model Config Persistence
// ============================================================================

export interface ModelConfig {
  imageProvider: ProviderId;
  videoProvider: ProviderId;
  imageModel: string;
  videoModel: string;
}

const DEFAULT_MODEL_CONFIG: ModelConfig = {
  imageProvider: 'replicate',
  videoProvider: 'replicate',
  imageModel: 'FLUX.2 Pro',
  videoModel: 'Seedance 2.0',
};

function getModelConfig(): ModelConfig {
  if (typeof window === 'undefined') return DEFAULT_MODEL_CONFIG;
  try {
    const saved = localStorage.getItem(MODEL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<ModelConfig>;
      return {
        ...DEFAULT_MODEL_CONFIG,
        ...parsed,
        imageProvider: parsed.imageProvider || 'replicate',
        videoProvider: parsed.videoProvider || 'replicate',
      };
    }
  } catch {}
  return DEFAULT_MODEL_CONFIG;
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
  return getProviderCredentials('replicate').apiKey || localStorage.getItem(STORAGE_KEY);
}

function setApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, key);
  setProviderCredentials('replicate', { ...getProviderCredentials('replicate'), apiKey: key });
}

function clearApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  setProviderCredentials('replicate', { ...getProviderCredentials('replicate'), apiKey: '' });
}

function getProviderCredentialsMap(): ProviderCredentialsMap {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(PROVIDER_CREDENTIALS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveProviderCredentialsMap(credentials: ProviderCredentialsMap): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROVIDER_CREDENTIALS_KEY, JSON.stringify(credentials));
}

function getProviderCredentials(provider: ProviderId): ProviderCredentials {
  const credentials = getProviderCredentialsMap()[provider] || { apiKey: '' };
  if (provider === 'replicate' && !credentials.apiKey && typeof window !== 'undefined') {
    return { ...credentials, apiKey: localStorage.getItem(STORAGE_KEY) || '' };
  }
  return credentials;
}

function setProviderCredentials(provider: ProviderId, credentials: ProviderCredentials): void {
  const allCredentials = getProviderCredentialsMap();
  allCredentials[provider] = credentials;
  saveProviderCredentialsMap(allCredentials);
}

function resolveProviderBaseUrl(provider: ProviderId, credentials: ProviderCredentials): string {
  if (provider === 'replicate') return REPLICATE_API_BASE;
  const baseUrl = credentials.baseUrl?.trim();
  if (!baseUrl) throw new Error('Custom API base URL is required.');
  return baseUrl.replace(/\/$/, '');
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
// Provider REST API helpers
// ============================================================================

function replicateHeaders(apiKey: string): HeadersInit {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

async function parseReplicateError(response: Response): Promise<string> {
  const body = await response.text().catch(() => '');
  if (!body) return `${response.status} ${response.statusText}`.trim();
  try {
    const json = JSON.parse(body) as Record<string, unknown>;
    const detail = json.detail || json.error || json.message;
    if (detail) return typeof detail === 'string' ? detail : JSON.stringify(detail);
  } catch {}
  return body;
}

function normalizeNetworkError(err: unknown): string {
  if (err instanceof TypeError) {
    return 'Network request failed. In the browser this is usually CORS or an unreachable API proxy.';
  }
  return err instanceof Error ? err.message : 'Unknown API error';
}

export async function testReplicateConnection(apiKey: string): Promise<ApiState<{ ok: true }>> {
  return testProviderConnection('replicate', { apiKey });
}

export async function testProviderConnection(
  provider: ProviderId,
  credentials: ProviderCredentials,
): Promise<ApiState<{ ok: true }>> {
  if (!credentials.apiKey.trim()) {
    return { data: null, isLoading: false, error: 'API key is empty.' };
  }

  try {
    const baseUrl = resolveProviderBaseUrl(provider, credentials);
    const response = await fetch(`${baseUrl}/predictions?limit=1`, {
      method: 'GET',
      headers: replicateHeaders(credentials.apiKey.trim()),
    });

    if (!response.ok) {
      return {
        data: null,
        isLoading: false,
        error: `Replicate API error ${response.status}: ${await parseReplicateError(response)}`,
      };
    }

    return { data: { ok: true }, isLoading: false, error: null };
  } catch (err) {
    return { data: null, isLoading: false, error: normalizeNetworkError(err) };
  }
}

async function providerPost(
  provider: ProviderId,
  model: string,
  input: Record<string, unknown>,
  credentials: ProviderCredentials,
): Promise<unknown> {
  const baseUrl = resolveProviderBaseUrl(provider, credentials);
  const response = await fetch(`${baseUrl}/predictions`, {
    method: 'POST',
    headers: replicateHeaders(credentials.apiKey),
    body: JSON.stringify({
      version: model,
      input,
    }),
  });

  if (!response.ok) {
    throw new Error(`Replicate API error ${response.status}: ${await parseReplicateError(response)}`);
  }

  const prediction = await response.json();
  return await waitForProviderPrediction(provider, prediction.id, credentials);
}

async function waitForProviderPrediction(
  provider: ProviderId,
  predictionId: string,
  credentials: ProviderCredentials,
): Promise<unknown> {
  const baseUrl = resolveProviderBaseUrl(provider, credentials);
  for (let attempt = 0; attempt < 120; attempt++) {
    const response = await fetch(`${baseUrl}/predictions/${predictionId}`, {
      headers: replicateHeaders(credentials.apiKey),
    });

    if (!response.ok) {
      throw new Error(`Polling failed ${response.status}: ${await parseReplicateError(response)}`);
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
  private config: ModelConfig = getModelConfig();

  setApiKey(key: string): void {
    setApiKey(key);
  }

  clearApiKey(): void {
    clearApiKey();
  }

  setConfig(config: ModelConfig): void {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!getProviderCredentials(this.config.imageProvider).apiKey?.trim();
  }

  async generateImage(
    prompt: string,
    modelName: string = 'FLUX.2 Pro',
    options: ImageGenerateOptions = {},
    provider: ProviderId = this.config.imageProvider,
  ): Promise<ApiState<ImageResult>> {
    const credentials = getProviderCredentials(provider);
    if (!credentials.apiKey) {
      return { data: null, isLoading: false, error: 'API key not configured.' };
    }

    const modelId = provider === 'replicate' ? IMAGE_MODEL_MAP[modelName] : modelName;
    if (!modelId) {
      return { data: null, isLoading: false, error: `Unknown image model: ${modelName}` };
    }

    try {
      const output = await providerPost(provider, modelId, {
        prompt,
        aspect_ratio: options.aspect_ratio || '16:9',
        resolution: options.resolution || '1 MP',
        seed: options.seed,
        output_format: 'webp',
      }, credentials);

      const url = extractUrl(output);
      if (!url) {
        return { data: null, isLoading: false, error: 'No URL returned from API.' };
      }

      return { data: { url }, isLoading: false, error: null };
    } catch (err) {
      return {
        data: null,
        isLoading: false,
        error: normalizeNetworkError(err),
      };
    }
  }
}

// ============================================================================
// VideoAPI Class
// ============================================================================

export class VideoAPI {
  private config: ModelConfig = getModelConfig();

  setApiKey(key: string): void {
    setApiKey(key);
  }

  clearApiKey(): void {
    clearApiKey();
  }

  setConfig(config: ModelConfig): void {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!getProviderCredentials(this.config.videoProvider).apiKey?.trim();
  }

  async generateVideo(
    imageUrl: string,
    modelName: string = 'Seedance 2.0',
    options: VideoGenerateOptions = {},
    customPrompt?: string,
    provider: ProviderId = this.config.videoProvider,
  ): Promise<ApiState<VideoResult>> {
    const credentials = getProviderCredentials(provider);
    if (!credentials.apiKey) {
      return { data: null, isLoading: false, error: 'API key not configured.' };
    }

    const modelId = provider === 'replicate' ? VIDEO_MODEL_MAP[modelName] : modelName;
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
      const output = await providerPost(provider, modelId, input, credentials);
      const url = extractUrl(output);

      if (!url) {
        return { data: null, isLoading: false, error: 'No URL returned from API.' };
      }

      return { data: { url }, isLoading: false, error: null };
    } catch (err) {
      return {
        data: null,
        isLoading: false,
        error: normalizeNetworkError(err),
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
  getProviderCredentials: (provider: ProviderId) => ProviderCredentials;
  setProviderCredentials: (provider: ProviderId, credentials: ProviderCredentials) => void;
  isProviderConfigured: (provider: ProviderId) => boolean;
  isConfigured: () => boolean;
  testConnection: (apiKey?: string) => Promise<ApiState<{ ok: true }>>;
  testProviderConnection: (provider: ProviderId, credentials: ProviderCredentials) => Promise<ApiState<{ ok: true }>>;
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
      imageApi.clearApiKey();
      videoApi.clearApiKey();
    },
    getProviderCredentials,
    setProviderCredentials,
    isProviderConfigured: (provider: ProviderId) => !!getProviderCredentials(provider).apiKey?.trim(),
    isConfigured: () => imageApi.isConfigured() && videoApi.isConfigured(),
    testConnection: (apiKey?: string) => testReplicateConnection(apiKey || getApiKey() || ''),
    testProviderConnection,
    saveModelConfig: (config: ModelConfig) => {
      saveModelConfig(config);
      imageApi.setConfig(config);
      videoApi.setConfig(config);
    },
    getModelConfig,
  };
}

export const apiClient = initApiClient();
