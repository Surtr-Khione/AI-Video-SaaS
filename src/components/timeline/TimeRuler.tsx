'use client';

import React from 'react';
import { formatTime, timeToPixels } from '@/utils/timelineUtils';

interface TimeRulerProps {
  duration: number;
  zoom: number;
  pixelsPerSecond?: number;
}

export const TimeRuler: React.FC<TimeRulerProps> = ({
  duration,
  zoom,
  pixelsPerSecond = 100,
}) => {
  const width = timeToPixels(duration, zoom, pixelsPerSecond);

  const interval = zoom < 0.5 ? 10 : zoom < 1 ? 5 : zoom < 2 ? 1 : 0.5;
  const markers: number[] = [];

  for (let time = 0; time <= duration; time += interval) {
    markers.push(time);
  }

  return (
    <div className="relative h-8 bg-timeline-ruler border-b border-gray-700 select-none">
      <div className="relative h-full" style={{ width: `${width}px` }}>
        {markers.map((time) => {
          const x = timeToPixels(time, zoom, pixelsPerSecond);
          const isSecond = time % 1 === 0;
          const isFiveSecond = time % 5 === 0;

          return (
            <div
              key={time}
              className="absolute top-0 flex flex-col items-start"
              style={{ left: `${x}px` }}
            >
              <div
                className={`${
                  isFiveSecond
                    ? 'h-4 bg-gray-400'
                    : isSecond
                    ? 'h-3 bg-gray-500'
                    : 'h-2 bg-gray-600'
                } w-px`}
              />
              {isFiveSecond && (
                <span className="text-[10px] text-gray-400 ml-1 mt-0.5">
                  {formatTime(time)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
