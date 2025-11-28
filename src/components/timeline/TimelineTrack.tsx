'use client';

import React from 'react';
import { Track } from '@/types/timeline';
import { useTimelineStore } from '@/store/timelineStore';
import { TimelineClip } from './TimelineClip';
import { timeToPixels, pixelsToTime } from '@/utils/timelineUtils';
import { Eye, EyeOff, Volume2, VolumeX, Lock, Unlock, Trash2 } from 'lucide-react';

interface TimelineTrackProps {
  track: Track;
  duration: number;
  pixelsPerSecond?: number;
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({
  track,
  duration,
  pixelsPerSecond = 100,
}) => {
  const { zoom, updateTrack, removeTrack, addClip, mediaAssets } =
    useTimelineStore();

  const width = timeToPixels(duration, zoom, pixelsPerSecond);

  const handleTrackClick = (e: React.MouseEvent) => {
    if (track.locked) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = pixelsToTime(x, zoom, pixelsPerSecond);

    console.log(`Clicked on track ${track.name} at time ${time}s`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (track.locked) return;

    const assetId = e.dataTransfer.getData('assetId');
    const asset = mediaAssets.find((a) => a.id === assetId);
    if (!asset) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = pixelsToTime(x, zoom, pixelsPerSecond);

    addClip(track.id, asset, Math.max(0, time));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex border-b border-gray-700">
      {/* Track Header */}
      <div className="w-48 flex-shrink-0 bg-gray-800 border-r border-gray-700 p-2 flex flex-col justify-between">
        <div>
          <input
            type="text"
            value={track.name}
            onChange={(e) => updateTrack(track.id, { name: e.target.value })}
            className="w-full bg-transparent text-white text-sm font-medium border-none outline-none mb-2"
          />
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 uppercase">{track.type}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => updateTrack(track.id, { muted: !track.muted })}
              className="p-1 hover:bg-gray-700 rounded"
              title={track.muted ? 'Unmute' : 'Mute'}
            >
              {track.muted ? (
                <VolumeX className="w-4 h-4 text-gray-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-gray-300" />
              )}
            </button>
            <button
              onClick={() => updateTrack(track.id, { visible: !track.visible })}
              className="p-1 hover:bg-gray-700 rounded"
              title={track.visible ? 'Hide' : 'Show'}
            >
              {track.visible ? (
                <Eye className="w-4 h-4 text-gray-300" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <button
              onClick={() => updateTrack(track.id, { locked: !track.locked })}
              className="p-1 hover:bg-gray-700 rounded"
              title={track.locked ? 'Unlock' : 'Lock'}
            >
              {track.locked ? (
                <Lock className="w-4 h-4 text-gray-400" />
              ) : (
                <Unlock className="w-4 h-4 text-gray-300" />
              )}
            </button>
          </div>
          <button
            onClick={() => removeTrack(track.id)}
            className="p-1 hover:bg-red-700 rounded"
            title="Delete track"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Track Content */}
      <div
        className="relative flex-1 bg-timeline-track cursor-crosshair overflow-hidden"
        style={{ height: `${track.height}px`, minWidth: `${width}px` }}
        onClick={handleTrackClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: Math.ceil(duration) }).map((_, i) => {
            const x = timeToPixels(i, zoom, pixelsPerSecond);
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-gray-700/30"
                style={{ left: `${x}px` }}
              />
            );
          })}
        </div>

        {/* Clips */}
        {track.clips.map((clip) => (
          <TimelineClip key={clip.id} clip={clip} pixelsPerSecond={pixelsPerSecond} />
        ))}
      </div>
    </div>
  );
};
