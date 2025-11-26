'use client';

import { useState, useEffect } from 'react';

interface Provider {
  name: string;
  capabilities: string[];
  maxDuration: number;
  costPerSecond: number;
}

interface GenerationResult {
  success: boolean;
  project: {
    id: string;
    title: string;
    status: string;
    provider: string;
  };
  job: {
    id: string;
    status: string;
    estimatedTimeSeconds?: number;
  };
}

interface StatusResult {
  project: {
    id: string;
    title: string;
    status: string;
    provider: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    error?: string;
  };
  job?: {
    status: string;
    progress?: number;
    videoUrl?: string;
    error?: string;
  };
}

export default function Home() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [status, setStatus] = useState<StatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    userId: 'demo-user',
    title: '',
    type: 'text-to-video',
    prompt: '',
    duration: 5,
    provider: 'auto',
  });

  // Load providers on mount
  useEffect(() => {
    fetchProviders();
  }, []);

  // Poll for status
  useEffect(() => {
    if (result && result.project.id) {
      const interval = setInterval(() => {
        checkStatus(result.project.id);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [result]);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/ai/providers');
      const data = await res.json();
      setProviders(data.providers || []);
    } catch (err: any) {
      console.error('Failed to fetch providers:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setStatus(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Generation failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (projectId: string) => {
    try {
      const res = await fetch(`/api/ai/status/${projectId}`);
      const data = await res.json();

      if (res.ok) {
        setStatus(data);

        // Stop polling if completed or failed
        if (
          data.project.status === 'COMPLETED' ||
          data.project.status === 'FAILED' ||
          data.project.status === 'CANCELLED'
        ) {
          setResult(null);
        }
      }
    } catch (err: any) {
      console.error('Failed to check status:', err);
    }
  };

  const handleCancel = async () => {
    if (!result) return;

    try {
      await fetch(`/api/ai/cancel/${result.project.id}`, {
        method: 'POST',
      });
      setResult(null);
      setStatus(null);
    } catch (err: any) {
      console.error('Failed to cancel:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            🎬 AI Video SaaS
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Generate videos with Google Veo 3, OpenAI Sora, Runway ML, and Replicate
          </p>
        </header>

        {/* Providers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Available Providers
          </h2>
          {providers.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              No providers configured. Please set up your API keys in .env
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providers.map((provider) => (
                <div
                  key={provider.name}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-lg capitalize text-gray-900 dark:text-white">
                    {provider.name.replace('_', ' ')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Max: {provider.maxDuration}s | ${provider.costPerSecond}/sec
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {provider.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generation Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Generate Video
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title (optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="My awesome video"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="text-to-video">Text to Video</option>
                <option value="image-to-video">Image to Video</option>
                <option value="video-editing">Video Editing</option>
                <option value="video-enhancement">Video Enhancement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prompt *
              </label>
              <textarea
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={4}
                placeholder="A serene lake at sunset with mountains in the background..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (seconds)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                min="1"
                max="60"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Provider
              </label>
              <select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="auto">Auto (Best Available)</option>
                <option value="google_veo">Google Veo 3</option>
                <option value="openai_sora">OpenAI Sora</option>
                <option value="runway_ml">Runway ML</option>
                <option value="replicate">Replicate</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || providers.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Generating...' : 'Generate Video'}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Generation Started
              </h2>
              <button
                onClick={handleCancel}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Cancel
              </button>
            </div>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>Project ID:</strong> {result.project.id}</p>
              <p><strong>Provider:</strong> {result.project.provider}</p>
              <p><strong>Status:</strong> {result.job.status}</p>
              {result.job.estimatedTimeSeconds && (
                <p><strong>Estimated Time:</strong> {result.job.estimatedTimeSeconds}s</p>
              )}
            </div>
          </div>
        )}

        {/* Status */}
        {status && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Status: {status.project.status}
            </h2>

            {status.job?.progress !== undefined && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${status.job.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {status.job.progress}%
                </p>
              </div>
            )}

            {status.project.videoUrl && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Video Ready!
                </h3>
                <video
                  src={status.project.videoUrl}
                  controls
                  className="w-full rounded-lg"
                  poster={status.project.thumbnailUrl}
                />
                <a
                  href={status.project.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Open in new tab →
                </a>
              </div>
            )}

            {status.project.error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200">
                  <strong>Error:</strong> {status.project.error}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-600 dark:text-gray-400">
          <p>Powered by Google Veo 3, OpenAI Sora, Runway ML, and Replicate</p>
        </footer>
      </div>
    </div>
  );
}
