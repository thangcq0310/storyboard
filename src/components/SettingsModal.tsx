import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings2, Key, Wifi, WifiOff, X, Save, Loader2, AlertTriangle } from 'lucide-react';
import { ApiClient } from '../lib/api';

interface Props {
  client: React.MutableRefObject<ApiClient>;
  onClose: () => void;
  imageModel: string;
  videoModel: string;
  onImageModelChange: (m: string) => void;
  onVideoModelChange: (m: string) => void;
}

export default function SettingsModal({
  client,
  onClose,
  imageModel,
  videoModel,
  onImageModelChange,
  onVideoModelChange,
}: Props) {
  const [apiKeyInput, setApiKeyInput] = useState(client.current.getApiKey() || '');
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking' | 'error'>(() =>
    client.current.isConfigured() ? 'connected' : 'disconnected'
  );
  const [apiMessage, setApiMessage] = useState('');

  useEffect(() => {
    if (client.current.isConfigured()) {
      setApiStatus('connected');
    }
  }, []);

  const handleSave = async () => {
    const key = apiKeyInput.trim();
    if (!key) return;

    setApiStatus('checking');
    setApiMessage('Testing Replicate connection...');

    const result = await client.current.testConnection(key);
    if (result.error) {
      setApiStatus('error');
      setApiMessage(result.error);
      return;
    }

    client.current.setApiKey(key);
    client.current.saveModelConfig({ imageModel, videoModel });
    setApiStatus('connected');
    setApiMessage('Replicate connection verified.');
    onClose();
  };

  const statusConfig = {
    connected: {
      icon: <Wifi size={12} className="text-emerald-400" />,
      label: 'Connected',
      className: 'text-emerald-400',
    },
    disconnected: {
      icon: <WifiOff size={12} className="text-red-400" />,
      label: 'Disconnected',
      className: 'text-red-400',
    },
    checking: {
      icon: <Loader2 size={12} className="text-violet-400 animate-spin" />,
      label: 'Checking connection',
      className: 'text-violet-300',
    },
    error: {
      icon: <AlertTriangle size={12} className="text-amber-400" />,
      label: 'Connection failed',
      className: 'text-amber-400',
    },
  }[apiStatus];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-panel w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Settings2 size={18} className="text-violet-400" />
            Settings
          </h2>
          <button className="btn-ghost p-1.5" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Model Configuration */}
          <div className="space-y-3">
            <div className="section-label">Model Configuration</div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Image Model</label>
              <select
                className="select-field"
                value={imageModel}
                onChange={(e) => onImageModelChange(e.target.value)}
              >
                <option value="Nano Banana Pro">Nano Banana Pro</option>
                <option value="FLUX.2 Pro">FLUX.2 Pro</option>
                <option value="SD3.0">SD3.0</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Video Model</label>
              <select
                className="select-field"
                value={videoModel}
                onChange={(e) => onVideoModelChange(e.target.value)}
              >
                <option value="Veo 3.1 Lite">Veo 3.1 Lite</option>
                <option value="Seedance 2.0">Seedance 2.0</option>
                <option value="Happy Horse">Happy Horse</option>
              </select>
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-3">
            <label className="text-xs text-gray-400 flex items-center gap-2">
              <Key size={12} /> Replicate API Key
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="r8_xxx..."
              value={apiKeyInput}
              onChange={(e) => {
                setApiKeyInput(e.target.value);
                if (apiStatus === 'error') {
                  setApiStatus('disconnected');
                  setApiMessage('');
                }
              }}
            />
            <div className="flex items-center gap-2 text-xs">
              {statusConfig.icon}
              <span className={statusConfig.className}>{statusConfig.label}</span>
            </div>
            {apiMessage && (
              <div className={`rounded-lg border px-3 py-2 text-[11px] leading-relaxed ${
                apiStatus === 'error'
                  ? 'border-amber-500/20 bg-amber-500/10 text-amber-200'
                  : 'border-violet-500/20 bg-violet-500/10 text-violet-200'
              }`}>
                {apiMessage}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button className="btn-primary flex-1" onClick={handleSave} disabled={!apiKeyInput.trim() || apiStatus === 'checking'}>
            {apiStatus === 'checking' ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Test & Save
          </button>
          <button className="btn-secondary flex-1" onClick={onClose}>
            <X size={15} /> Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
