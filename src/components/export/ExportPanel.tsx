'use client';

import React, { useState } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { v4 as uuidv4 } from 'uuid';
import { Download, FileVideo, Settings, X, CheckCircle, AlertCircle } from 'lucide-react';
import { ExportSettings, ExportJob } from '@/types/timeline';

const resolutionPresets = [
  { label: '4K (3840x2160)', width: 3840, height: 2160 },
  { label: 'Full HD (1920x1080)', width: 1920, height: 1080 },
  { label: 'HD (1280x720)', width: 1280, height: 720 },
  { label: 'SD (854x480)', width: 854, height: 480 },
];

const formatOptions = [
  { value: 'mp4', label: 'MP4 (H.264)', codec: 'h264' },
  { value: 'webm', label: 'WebM (VP9)', codec: 'vp9' },
  { value: 'mov', label: 'QuickTime (MOV)', codec: 'prores' },
];

const qualityPresets = {
  low: { bitrate: 2000, audioBitrate: 128 },
  medium: { bitrate: 5000, audioBitrate: 192 },
  high: { bitrate: 10000, audioBitrate: 256 },
  ultra: { bitrate: 20000, audioBitrate: 320 },
};

export const ExportPanel: React.FC = () => {
  const { duration, calculateTotalDuration, exportJobs, addExportJob, updateExportJob } =
    useTimelineStore();

  const totalDuration = calculateTotalDuration();

  const [settings, setSettings] = useState<ExportSettings>({
    format: 'mp4',
    codec: 'h264',
    resolution: { width: 1920, height: 1080 },
    frameRate: 30,
    bitrate: 5000,
    quality: 'high',
    audioBitrate: 256,
    audioSampleRate: 48000,
    startTime: 0,
    endTime: totalDuration,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateSetting = <K extends keyof ExportSettings>(
    key: K,
    value: ExportSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    const job: ExportJob = {
      id: uuidv4(),
      status: 'pending',
      progress: 0,
      settings,
      startedAt: new Date(),
    };

    addExportJob(job);

    // Simulate export progress
    simulateExport(job.id);
  };

  const simulateExport = (jobId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        updateExportJob(jobId, {
          status: 'completed',
          progress: 100,
          completedAt: new Date(),
          outputPath: `/exports/video_${Date.now()}.${settings.format}`,
        });
      } else {
        updateExportJob(jobId, {
          status: 'processing',
          progress: Math.min(progress, 99),
        });
      }
    }, 500);
  };

  const cancelExport = (jobId: string) => {
    updateExportJob(jobId, { status: 'cancelled' });
  };

  return (
    <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Video
        </h2>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Format */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Format
            </label>
            <select
              value={settings.format}
              onChange={(e) => {
                const format = e.target.value as 'mp4' | 'webm' | 'mov';
                const option = formatOptions.find((o) => o.value === format);
                updateSetting('format', format);
                if (option) {
                  updateSetting('codec', option.codec);
                }
              }}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
            >
              {formatOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Resolution */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Resolution
            </label>
            <div className="grid grid-cols-2 gap-2">
              {resolutionPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => updateSetting('resolution', preset)}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    settings.resolution.width === preset.width &&
                    settings.resolution.height === preset.height
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {preset.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Quality
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'ultra'] as const).map((quality) => (
                <button
                  key={quality}
                  onClick={() => {
                    updateSetting('quality', quality);
                    updateSetting('bitrate', qualityPresets[quality].bitrate);
                    updateSetting('audioBitrate', qualityPresets[quality].audioBitrate);
                  }}
                  className={`px-3 py-2 rounded text-xs transition-colors capitalize ${
                    settings.quality === quality
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {quality}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
          >
            <Settings className="w-4 h-4" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
          </button>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-4 border-t border-gray-700 pt-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Frame Rate (fps)
                </label>
                <input
                  type="number"
                  value={settings.frameRate}
                  onChange={(e) => updateSetting('frameRate', Number(e.target.value))}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                  min={1}
                  max={120}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Video Bitrate (kbps)
                </label>
                <input
                  type="number"
                  value={settings.bitrate}
                  onChange={(e) => updateSetting('bitrate', Number(e.target.value))}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                  min={500}
                  max={50000}
                  step={500}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Audio Bitrate (kbps)
                </label>
                <input
                  type="number"
                  value={settings.audioBitrate}
                  onChange={(e) => updateSetting('audioBitrate', Number(e.target.value))}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                  min={64}
                  max={512}
                  step={32}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Start Time (s)
                  </label>
                  <input
                    type="number"
                    value={settings.startTime || 0}
                    onChange={(e) => updateSetting('startTime', Number(e.target.value))}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                    min={0}
                    max={totalDuration}
                    step={0.1}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    End Time (s)
                  </label>
                  <input
                    type="number"
                    value={settings.endTime || totalDuration}
                    onChange={(e) => updateSetting('endTime', Number(e.target.value))}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                    min={settings.startTime || 0}
                    max={totalDuration}
                    step={0.1}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Start Export
          </button>

          {/* Export Queue */}
          {exportJobs.length > 0 && (
            <div className="mt-6 border-t border-gray-700 pt-4">
              <h3 className="text-white text-sm font-semibold mb-3">Export Queue</h3>
              <div className="space-y-3">
                {exportJobs.map((job) => (
                  <div key={job.id} className="bg-gray-700 rounded p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {job.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : job.status === 'failed' ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <FileVideo className="w-4 h-4 text-blue-500" />
                        )}
                        <span className="text-white text-sm">
                          {job.settings.format.toUpperCase()} •{' '}
                          {job.settings.resolution.width}x{job.settings.resolution.height}
                        </span>
                      </div>
                      {job.status === 'processing' && (
                        <button
                          onClick={() => cancelExport(job.id)}
                          className="p-1 hover:bg-gray-600 rounded"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>

                    {job.status === 'processing' && (
                      <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    )}

                    <div className="text-gray-400 text-xs">
                      {job.status === 'completed' && job.outputPath && (
                        <span>Saved to: {job.outputPath}</span>
                      )}
                      {job.status === 'processing' && (
                        <span>Processing... {Math.round(job.progress)}%</span>
                      )}
                      {job.status === 'failed' && (
                        <span className="text-red-400">Export failed</span>
                      )}
                      {job.status === 'cancelled' && (
                        <span className="text-gray-500">Cancelled</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
