'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Clip } from '@/types/timeline';
import { useTimelineStore } from '@/store/timelineStore';
import {
  timeToPixels,
  pixelsToTime,
  snapToGrid,
  getClipColor,
} from '@/utils/timelineUtils';
import { Scissors } from 'lucide-react';

interface TimelineClipProps {
  clip: Clip;
  pixelsPerSecond?: number;
}

type DragMode = 'move' | 'trim-start' | 'trim-end' | null;

export const TimelineClip: React.FC<TimelineClipProps> = ({
  clip,
  pixelsPerSecond = 100,
}) => {
  const {
    zoom,
    selectedClipIds,
    selectClip,
    updateClip,
    moveClip,
    snapToGrid: snapEnabled,
    gridSize,
    splitClip,
    mediaAssets,
  } = useTimelineStore();

  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [dragStart, setDragStart] = useState({ x: 0, time: 0, duration: 0 });
  const clipRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedClipIds.includes(clip.id);
  const width = timeToPixels(clip.duration, zoom, pixelsPerSecond);
  const x = timeToPixels(clip.startTime, zoom, pixelsPerSecond);

  const asset = mediaAssets.find((a) => a.id === clip.assetId);
  const clipColor = getClipColor(clip.type);

  const handleMouseDown = (e: React.MouseEvent, mode: DragMode) => {
    e.stopPropagation();
    if (mode === 'move') {
      selectClip(clip.id, e.shiftKey);
    }
    setDragMode(mode);
    setDragStart({
      x: e.clientX,
      time: clip.startTime,
      duration: clip.duration,
    });
  };

  const handleSplit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = clipRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relativeX = e.clientX - rect.left;
    const relativeTime = pixelsToTime(relativeX, zoom, pixelsPerSecond);
    const splitTime = clip.startTime + relativeTime;

    splitClip(clip.id, splitTime);
  };

  useEffect(() => {
    if (!dragMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaTime = pixelsToTime(deltaX, zoom, pixelsPerSecond);

      if (dragMode === 'move') {
        const newStartTime = snapToGrid(
          dragStart.time + deltaTime,
          gridSize,
          snapEnabled
        );
        moveClip(clip.id, clip.trackId, Math.max(0, newStartTime));
      } else if (dragMode === 'trim-start') {
        const newStartTime = snapToGrid(
          dragStart.time + deltaTime,
          gridSize,
          snapEnabled
        );
        const maxStart = clip.startTime + clip.duration - 0.1;
        const clampedStart = Math.max(0, Math.min(newStartTime, maxStart));
        const newDuration = dragStart.time + dragStart.duration - clampedStart;

        updateClip(clip.id, {
          startTime: clampedStart,
          duration: newDuration,
          trimStart: clip.trimStart + (clampedStart - clip.startTime),
        });
      } else if (dragMode === 'trim-end') {
        const newDuration = snapToGrid(
          dragStart.duration + deltaTime,
          gridSize,
          snapEnabled
        );
        updateClip(clip.id, {
          duration: Math.max(0.1, newDuration),
          trimEnd: clip.trimStart + Math.max(0.1, newDuration),
        });
      }
    };

    const handleMouseUp = () => {
      setDragMode(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    dragMode,
    dragStart,
    zoom,
    clip,
    updateClip,
    moveClip,
    snapEnabled,
    gridSize,
    pixelsPerSecond,
  ]);

  return (
    <div
      ref={clipRef}
      className={`absolute top-1 bottom-1 rounded group ${
        isSelected ? 'ring-2 ring-white' : ''
      }`}
      style={{
        left: `${x}px`,
        width: `${width}px`,
        backgroundColor: clipColor,
      }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
    >
      {/* Trim handles */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 z-10"
        onMouseDown={(e) => handleMouseDown(e, 'trim-start')}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 z-10"
        onMouseDown={(e) => handleMouseDown(e, 'trim-end')}
      />

      {/* Clip content */}
      <div className="px-2 py-1 overflow-hidden h-full flex items-center justify-between">
        <span className="text-xs text-white font-medium truncate">
          {asset?.name || 'Clip'}
        </span>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
          onClick={handleSplit}
          title="Split clip"
        >
          <Scissors className="w-3 h-3 text-white" />
        </button>
      </div>

      {/* Waveform or thumbnail overlay */}
      {clip.type === 'audio' && (
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <path
              d={`M 0,50 ${Array.from({ length: 50 })
                .map(
                  (_, i) =>
                    `L ${(i / 50) * 100},${
                      50 + Math.sin(i * 0.5) * 20 * Math.random()
                    }`
                )
                .join(' ')} L 100,50 Z`}
              fill="white"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
