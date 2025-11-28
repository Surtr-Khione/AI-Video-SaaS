'use client';

import React from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { formatTime } from '@/utils/timelineUtils';
import {
  Play,
  Pause,
  SkipBack,
  ZoomIn,
  ZoomOut,
  Grid3x3,
  Plus,
} from 'lucide-react';

export const TimelineControls: React.FC = () => {
  const {
    currentTime,
    playing,
    zoom,
    snapToGrid,
    play,
    pause,
    stop,
    setZoom,
    toggleSnapToGrid,
    addTrack,
  } = useTimelineStore();

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={stop}
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Stop"
        >
          <SkipBack className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={playing ? pause : play}
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </button>

        <div className="ml-4 px-3 py-1 bg-gray-900 rounded text-white font-mono text-sm">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* View Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setZoom(Math.max(0.1, zoom - 0.2))}
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </button>

        <div className="px-3 py-1 bg-gray-900 rounded text-white text-sm min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </div>

        <button
          onClick={() => setZoom(Math.min(10, zoom + 0.2))}
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={toggleSnapToGrid}
          className={`p-2 rounded transition-colors ${
            snapToGrid ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-700'
          }`}
          title="Snap to Grid"
        >
          <Grid3x3 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Track Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => addTrack('video')}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-white text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Video Track
        </button>
        <button
          onClick={() => addTrack('audio')}
          className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors text-white text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Audio Track
        </button>
      </div>
    </div>
  );
};
