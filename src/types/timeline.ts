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

// Forward declaration for BlendMode
export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

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
  audioEffects?: AudioEffect[];
  transitions?: Transition[];
  blendMode?: BlendMode;
  opacity?: number; // 0-100
  speed?: number; // 0.1 to 10
  reversed?: boolean;
  // Text-specific properties
  text?: string;
  textStyle?: TextStyle;
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

// Keyframe system for animations
export interface Keyframe {
  id: string;
  time: number;
  value: any;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bezier';
  bezierPoints?: [number, number, number, number];
}

export interface AnimatableProperty {
  name: string;
  keyframes: Keyframe[];
  enabled: boolean;
}

// Effect types
export type EffectType =
  | 'color-correction'
  | 'blur'
  | 'sharpen'
  | 'transform'
  | 'opacity'
  | 'speed'
  | 'chroma-key'
  | 'grayscale'
  | 'sepia'
  | 'vignette'
  | 'grain'
  | 'stabilization'
  | 'lens-flare'
  | 'glow';

export interface ColorCorrectionParams {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  hue: number; // -180 to 180
  temperature: number; // -100 to 100
  tint: number; // -100 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  exposure: number; // -100 to 100
  gamma: number; // 0.1 to 3
}

export interface TransformParams {
  scaleX: number;
  scaleY: number;
  rotation: number;
  positionX: number;
  positionY: number;
  anchorX: number;
  anchorY: number;
}

export interface ChromaKeyParams {
  color: string; // hex color
  tolerance: number; // 0-100
  softness: number; // 0-100
  spillSuppression: number; // 0-100
}

export interface BlurParams {
  amount: number; // 0-100
  type: 'gaussian' | 'motion' | 'radial';
  angle?: number; // for motion blur
}

export interface Effect {
  id: string;
  type: EffectType;
  enabled: boolean;
  parameters: Partial<ColorCorrectionParams & TransformParams & ChromaKeyParams & BlurParams> & Record<string, any>;
  keyframes?: AnimatableProperty[];
  blendMode?: BlendMode;
  opacity?: number; // 0-100
}

// Transition types
export type TransitionType =
  | 'fade'
  | 'dissolve'
  | 'wipe-left'
  | 'wipe-right'
  | 'wipe-up'
  | 'wipe-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'cross-dissolve'
  | 'dip-to-black'
  | 'dip-to-white';

export interface Transition {
  id: string;
  type: TransitionType;
  duration: number;
  position: 'in' | 'out' | 'between';
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  parameters?: Record<string, any>;
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
  markers: Marker[];
  exportJobs: ExportJob[];
  selectedEffectPresets: EffectPreset[];
  selectedTransitionPresets: TransitionPreset[];
}

export interface TimelineSettings {
  fps: number;
  width: number;
  height: number;
  sampleRate: number;
}

// Text and titles
export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  color: string;
  backgroundColor?: string;
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  stroke?: {
    color: string;
    width: number;
  };
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  animation?: TextAnimation;
}

export type TextAnimation =
  | 'none'
  | 'fade-in'
  | 'fade-out'
  | 'slide-in-left'
  | 'slide-in-right'
  | 'slide-in-top'
  | 'slide-in-bottom'
  | 'typewriter'
  | 'bounce'
  | 'scale-in';

// Audio effects
export type AudioEffectType =
  | 'equalizer'
  | 'compressor'
  | 'reverb'
  | 'echo'
  | 'noise-reduction'
  | 'pitch-shift'
  | 'normalize'
  | 'fade-in'
  | 'fade-out';

export interface EqualizerBand {
  frequency: number;
  gain: number; // -20 to 20 dB
  q: number; // 0.1 to 10
}

export interface AudioEffect {
  id: string;
  type: AudioEffectType;
  enabled: boolean;
  parameters: Record<string, any>;
}

export interface CompressorParams {
  threshold: number; // -60 to 0 dB
  ratio: number; // 1 to 20
  attack: number; // 0 to 1000 ms
  release: number; // 0 to 3000 ms
  knee: number; // 0 to 40 dB
  makeupGain: number; // 0 to 30 dB
}

export interface ReverbParams {
  roomSize: number; // 0 to 100
  damping: number; // 0 to 100
  wetLevel: number; // 0 to 100
  dryLevel: number; // 0 to 100
  width: number; // 0 to 100
}

// Timeline markers
export interface Marker {
  id: string;
  time: number;
  label: string;
  color?: string;
  type: 'comment' | 'chapter' | 'scene';
}

// Export settings
export interface ExportSettings {
  format: 'mp4' | 'webm' | 'mov' | 'avi' | 'gif';
  codec: string;
  resolution: {
    width: number;
    height: number;
  };
  frameRate: number;
  bitrate: number; // kbps
  quality: 'low' | 'medium' | 'high' | 'ultra';
  audioBitrate: number; // kbps
  audioSampleRate: number;
  startTime?: number;
  endTime?: number;
  includeAlpha?: boolean;
}

export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  settings: ExportSettings;
  outputPath?: string;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

// Effect presets
export interface EffectPreset {
  id: string;
  name: string;
  category: 'color' | 'blur' | 'stylize' | 'distort' | 'time' | 'audio';
  thumbnail?: string;
  effects: Omit<Effect, 'id'>[];
}

export interface TransitionPreset {
  id: string;
  name: string;
  category: 'fade' | 'wipe' | 'slide' | 'zoom' | 'special';
  thumbnail?: string;
  transition: Omit<Transition, 'id'>;
}
