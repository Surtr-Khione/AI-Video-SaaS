'use client';

import React, { useRef, useEffect } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { TimelineTrack } from './TimelineTrack';
import { TimeRuler } from './TimeRuler';
import { Playhead } from './Playhead';

interface TimelineProps {
  pixelsPerSecond?: number;
}

export const Timeline: React.FC<TimelineProps> = ({ pixelsPerSecond = 100 }) => {
  const { tracks, duration, zoom, clearSelection, calculateTotalDuration } =
    useTimelineStore();
  const timelineRef = useRef<HTMLDivElement>(null);

  const totalDuration = Math.max(duration, calculateTotalDuration());

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.target === timelineRef.current) {
        clearSelection();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [clearSelection]);

  return (
    <div className="flex flex-col h-full bg-timeline-bg overflow-hidden">
      {/* Timeline Header with Ruler */}
      <div className="flex flex-shrink-0 border-b border-gray-700">
        <div className="w-48 flex-shrink-0 bg-gray-800 border-r border-gray-700" />
        <div className="flex-1 overflow-x-auto" ref={timelineRef}>
          <TimeRuler
            duration={totalDuration}
            zoom={zoom}
            pixelsPerSecond={pixelsPerSecond}
          />
        </div>
      </div>

      {/* Tracks Area */}
      <div className="flex-1 overflow-auto relative">
        <div className="relative">
          {tracks.map((track) => (
            <TimelineTrack
              key={track.id}
              track={track}
              duration={totalDuration}
              pixelsPerSecond={pixelsPerSecond}
            />
          ))}

          {/* Playhead overlay */}
          <div className="absolute top-0 left-48 right-0 bottom-0 pointer-events-none">
            <div className="relative h-full">
              <Playhead pixelsPerSecond={pixelsPerSecond} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
