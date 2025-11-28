export type ClipType = 'video' | 'audio' | 'image' | 'text';

export type TrackType = 'video' | 'audio';

export interface MediaAsset {
  id: string;
  name: string;
  type: ClipType;
  url: string;
  duration: number;
  thumbnail?: string;
  waveform?: number[];
}

export interface Clip {
  id: string;
  trackId: string;
  assetId: string;
  type: ClipType;
  startTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  volume?: number;
  effects?: Effect[];
  transitions?: Transition[];
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  clips: Clip[];
  muted: boolean;
  locked: boolean;
  visible: boolean;
  volume: number;
  height: number;
}

export interface Effect {
  id: string;
  type: string;
  parameters: Record<string, any>;
}

export interface Transition {
  id: string;
  type: 'fade' | 'dissolve' | 'wipe' | 'slide';
  duration: number;
}

export interface TimelineState {
  tracks: Track[];
  currentTime: number;
  duration: number;
  zoom: number;
  selectedClipIds: string[];
  playing: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export interface TimelineSettings {
  fps: number;
  width: number;
  height: number;
  sampleRate: number;
}
