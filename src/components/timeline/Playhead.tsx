'use client';

import React, { useRef, useEffect } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { timeToPixels, pixelsToTime } from '@/utils/timelineUtils';

interface PlayheadProps {
  pixelsPerSecond?: number;
}

export const Playhead: React.FC<PlayheadProps> = ({ pixelsPerSecond = 100 }) => {
  const { currentTime, zoom, setCurrentTime, playing } = useTimelineStore();
  const playheadRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const x = timeToPixels(currentTime, zoom, pixelsPerSecond);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !playheadRef.current) return;

      const container = playheadRef.current.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left + container.scrollLeft;
      const time = pixelsToTime(x, zoom, pixelsPerSecond);
      setCurrentTime(Math.max(0, time));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    if (isDraggingRef.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [zoom, setCurrentTime, pixelsPerSecond]);

  return (
    <div
      ref={playheadRef}
      className="absolute top-0 bottom-0 z-30 pointer-events-none"
      style={{ left: `${x}px` }}
    >
      <div
        className="relative h-full cursor-ew-resize pointer-events-auto"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-0 -translate-x-1/2">
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-timeline-playhead" />
        </div>
        <div className="absolute top-2 bottom-0 w-0.5 -translate-x-1/2 bg-timeline-playhead" />
      </div>
    </div>
  );
};
