import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Track, Clip, MediaAsset, TimelineState, ClipType } from '@/types/timeline';

interface TimelineStore extends TimelineState {
  // Media Library
  mediaAssets: MediaAsset[];
  addMediaAsset: (asset: MediaAsset) => void;
  removeMediaAsset: (assetId: string) => void;

  // Track Operations
  addTrack: (type: 'video' | 'audio') => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  reorderTracks: (startIndex: number, endIndex: number) => void;

  // Clip Operations
  addClip: (trackId: string, asset: MediaAsset, startTime: number) => void;
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, updates: Partial<Clip>) => void;
  moveClip: (clipId: string, trackId: string, startTime: number) => void;
  splitClip: (clipId: string, splitTime: number) => void;
  trimClip: (clipId: string, trimStart: number, trimEnd: number) => void;

  // Selection
  selectClip: (clipId: string, multiSelect?: boolean) => void;
  clearSelection: () => void;

  // Playback
  setCurrentTime: (time: number) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;

  // View Controls
  setZoom: (zoom: number) => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;

  // Utility
  getClipById: (clipId: string) => Clip | undefined;
  getTrackById: (trackId: string) => Track | undefined;
  calculateTotalDuration: () => number;
}

const createDefaultTrack = (type: 'video' | 'audio', index: number): Track => ({
  id: uuidv4(),
  name: `${type.charAt(0).toUpperCase() + type.slice(1)} Track ${index}`,
  type,
  clips: [],
  muted: false,
  locked: false,
  visible: true,
  volume: 1,
  height: type === 'video' ? 80 : 60,
});

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  // Initial State
  tracks: [
    createDefaultTrack('video', 1),
    createDefaultTrack('audio', 1),
  ],
  mediaAssets: [],
  currentTime: 0,
  duration: 60,
  zoom: 1,
  selectedClipIds: [],
  playing: false,
  snapToGrid: true,
  gridSize: 0.5,

  // Media Library
  addMediaAsset: (asset) => {
    set((state) => ({
      mediaAssets: [...state.mediaAssets, asset],
    }));
  },

  removeMediaAsset: (assetId) => {
    set((state) => ({
      mediaAssets: state.mediaAssets.filter((a) => a.id !== assetId),
    }));
  },

  // Track Operations
  addTrack: (type) => {
    set((state) => {
      const tracksOfType = state.tracks.filter((t) => t.type === type);
      const newTrack = createDefaultTrack(type, tracksOfType.length + 1);
      return { tracks: [...state.tracks, newTrack] };
    });
  },

  removeTrack: (trackId) => {
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== trackId),
    }));
  },

  updateTrack: (trackId, updates) => {
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId ? { ...track, ...updates } : track
      ),
    }));
  },

  reorderTracks: (startIndex, endIndex) => {
    set((state) => {
      const result = Array.from(state.tracks);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { tracks: result };
    });
  },

  // Clip Operations
  addClip: (trackId, asset, startTime) => {
    const clip: Clip = {
      id: uuidv4(),
      trackId,
      assetId: asset.id,
      type: asset.type,
      startTime,
      duration: asset.duration,
      trimStart: 0,
      trimEnd: asset.duration,
      volume: 1,
      effects: [],
      transitions: [],
    };

    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId
          ? { ...track, clips: [...track.clips, clip] }
          : track
      ),
    }));
  },

  removeClip: (clipId) => {
    set((state) => ({
      tracks: state.tracks.map((track) => ({
        ...track,
        clips: track.clips.filter((c) => c.id !== clipId),
      })),
      selectedClipIds: state.selectedClipIds.filter((id) => id !== clipId),
    }));
  },

  updateClip: (clipId, updates) => {
    set((state) => ({
      tracks: state.tracks.map((track) => ({
        ...track,
        clips: track.clips.map((clip) =>
          clip.id === clipId ? { ...clip, ...updates } : clip
        ),
      })),
    }));
  },

  moveClip: (clipId, trackId, startTime) => {
    set((state) => {
      let clipToMove: Clip | undefined;

      const tracksWithoutClip = state.tracks.map((track) => {
        const clip = track.clips.find((c) => c.id === clipId);
        if (clip) {
          clipToMove = { ...clip, trackId, startTime };
          return { ...track, clips: track.clips.filter((c) => c.id !== clipId) };
        }
        return track;
      });

      if (!clipToMove) return state;

      return {
        tracks: tracksWithoutClip.map((track) =>
          track.id === trackId
            ? { ...track, clips: [...track.clips, clipToMove!] }
            : track
        ),
      };
    });
  },

  splitClip: (clipId, splitTime) => {
    set((state) => {
      const clip = get().getClipById(clipId);
      if (!clip) return state;

      const relativeTime = splitTime - clip.startTime;
      if (relativeTime <= 0 || relativeTime >= clip.duration) return state;

      const clip1: Clip = {
        ...clip,
        duration: relativeTime,
        trimEnd: clip.trimStart + relativeTime,
      };

      const clip2: Clip = {
        ...clip,
        id: uuidv4(),
        startTime: splitTime,
        duration: clip.duration - relativeTime,
        trimStart: clip.trimStart + relativeTime,
      };

      return {
        tracks: state.tracks.map((track) =>
          track.id === clip.trackId
            ? {
                ...track,
                clips: track.clips
                  .filter((c) => c.id !== clipId)
                  .concat([clip1, clip2]),
              }
            : track
        ),
      };
    });
  },

  trimClip: (clipId, trimStart, trimEnd) => {
    get().updateClip(clipId, {
      trimStart,
      trimEnd,
      duration: trimEnd - trimStart,
    });
  },

  // Selection
  selectClip: (clipId, multiSelect = false) => {
    set((state) => {
      if (multiSelect) {
        const isSelected = state.selectedClipIds.includes(clipId);
        return {
          selectedClipIds: isSelected
            ? state.selectedClipIds.filter((id) => id !== clipId)
            : [...state.selectedClipIds, clipId],
        };
      }
      return { selectedClipIds: [clipId] };
    });
  },

  clearSelection: () => {
    set({ selectedClipIds: [] });
  },

  // Playback
  setCurrentTime: (time) => {
    set({ currentTime: Math.max(0, Math.min(time, get().duration)) });
  },

  play: () => {
    set({ playing: true });
  },

  pause: () => {
    set({ playing: false });
  },

  stop: () => {
    set({ playing: false, currentTime: 0 });
  },

  // View Controls
  setZoom: (zoom) => {
    set({ zoom: Math.max(0.1, Math.min(zoom, 10)) });
  },

  toggleSnapToGrid: () => {
    set((state) => ({ snapToGrid: !state.snapToGrid }));
  },

  setGridSize: (size) => {
    set({ gridSize: size });
  },

  // Utility
  getClipById: (clipId) => {
    const state = get();
    for (const track of state.tracks) {
      const clip = track.clips.find((c) => c.id === clipId);
      if (clip) return clip;
    }
    return undefined;
  },

  getTrackById: (trackId) => {
    return get().tracks.find((t) => t.id === trackId);
  },

  calculateTotalDuration: () => {
    const state = get();
    let maxDuration = 0;
    state.tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        const endTime = clip.startTime + clip.duration;
        if (endTime > maxDuration) maxDuration = endTime;
      });
    });
    return Math.max(maxDuration, 60);
  },
}));
