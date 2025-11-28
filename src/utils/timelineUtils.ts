export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms
    .toString()
    .padStart(2, '0')}`;
};

export const snapToGrid = (time: number, gridSize: number, snap: boolean): number => {
  if (!snap) return time;
  return Math.round(time / gridSize) * gridSize;
};

export const timeToPixels = (time: number, zoom: number, pixelsPerSecond = 100): number => {
  return time * pixelsPerSecond * zoom;
};

export const pixelsToTime = (pixels: number, zoom: number, pixelsPerSecond = 100): number => {
  return pixels / (pixelsPerSecond * zoom);
};

export const checkClipOverlap = (
  clip1Start: number,
  clip1Duration: number,
  clip2Start: number,
  clip2Duration: number
): boolean => {
  const clip1End = clip1Start + clip1Duration;
  const clip2End = clip2Start + clip2Duration;
  return clip1Start < clip2End && clip2Start < clip1End;
};

export const getClipColor = (type: string): string => {
  const colors: Record<string, string> = {
    video: '#4a90e2',
    audio: '#50c878',
    image: '#e27d60',
    text: '#9b59b6',
  };
  return colors[type] || '#95a5a6';
};

export const secondsToFrames = (seconds: number, fps: number): number => {
  return Math.floor(seconds * fps);
};

export const framesToSeconds = (frames: number, fps: number): number => {
  return frames / fps;
};
