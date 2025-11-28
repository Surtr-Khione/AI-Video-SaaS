'use client';

import React, { useState } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { Volume2, VolumeX, Sliders } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { AudioEffect, AudioEffectType, EqualizerBand } from '@/types/timeline';

const defaultEQBands: EqualizerBand[] = [
  { frequency: 60, gain: 0, q: 1 },
  { frequency: 250, gain: 0, q: 1 },
  { frequency: 1000, gain: 0, q: 1 },
  { frequency: 4000, gain: 0, q: 1 },
  { frequency: 16000, gain: 0, q: 1 },
];

export const AudioMixer: React.FC = () => {
  const { tracks, updateTrack, selectedClipIds, getClipById, updateClip } =
    useTimelineStore();

  const selectedClip = selectedClipIds.length === 1 ? getClipById(selectedClipIds[0]) : null;
  const [eqBands, setEQBands] = useState<EqualizerBand[]>(defaultEQBands);

  const updateEQBand = (index: number, gain: number) => {
    const newBands = [...eqBands];
    newBands[index] = { ...newBands[index], gain };
    setEQBands(newBands);

    if (selectedClip) {
      const existingEQ = (selectedClip.audioEffects || []).find(
        (e) => e.type === 'equalizer'
      );

      let newEffects = [...(selectedClip.audioEffects || [])];

      if (existingEQ) {
        newEffects = newEffects.map((e) =>
          e.type === 'equalizer' ? { ...e, parameters: { bands: newBands } } : e
        );
      } else {
        newEffects.push({
          id: uuidv4(),
          type: 'equalizer',
          enabled: true,
          parameters: { bands: newBands },
        });
      }

      updateClip(selectedClip.id, { audioEffects: newEffects });
    }
  };

  const audioTracks = tracks.filter((t) => t.type === 'audio');

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Sliders className="w-5 h-5" />
          Audio Mixer
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Track Levels */}
        <div className="mb-6">
          <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">
            Track Levels
          </h3>
          <div className="space-y-4">
            {audioTracks.map((track) => (
              <div key={track.id} className="bg-gray-700 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-medium">{track.name}</span>
                  <button
                    onClick={() => updateTrack(track.id, { muted: !track.muted })}
                    className={`p-1 rounded transition-colors ${
                      track.muted ? 'text-red-500' : 'text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {track.muted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.01}
                    value={track.volume}
                    onChange={(e) =>
                      updateTrack(track.id, { volume: Number(e.target.value) })
                    }
                    className="flex-1"
                  />
                  <span className="text-white text-xs font-mono w-12 text-right">
                    {Math.round(track.volume * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clip Volume */}
        {selectedClip && (selectedClip.type === 'audio' || selectedClip.type === 'video') && (
          <div className="mb-6">
            <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">
              Clip Volume
            </h3>
            <div className="bg-gray-700 rounded p-3">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.01}
                  value={selectedClip.volume || 1}
                  onChange={(e) =>
                    updateClip(selectedClip.id, { volume: Number(e.target.value) })
                  }
                  className="flex-1"
                />
                <span className="text-white text-xs font-mono w-12 text-right">
                  {Math.round((selectedClip.volume || 1) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Equalizer */}
        {selectedClip && (selectedClip.type === 'audio' || selectedClip.type === 'video') && (
          <div className="mb-6">
            <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">
              Equalizer
            </h3>
            <div className="bg-gray-700 rounded p-4">
              <div className="flex items-end justify-around h-40 gap-2">
                {eqBands.map((band, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="flex-1 flex items-end w-full">
                      <input
                        type="range"
                        min={-20}
                        max={20}
                        step={0.5}
                        value={band.gain}
                        onChange={(e) => updateEQBand(index, Number(e.target.value))}
                        className="h-full"
                        style={{
                          writingMode: 'bt-lr',
                          WebkitAppearance: 'slider-vertical',
                          width: '100%',
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-2 text-center">
                      {band.frequency < 1000
                        ? `${band.frequency}Hz`
                        : `${band.frequency / 1000}kHz`}
                    </div>
                    <div className="text-xs text-white mt-1">
                      {band.gain > 0 ? '+' : ''}
                      {band.gain}dB
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audio Effects */}
        {selectedClip && (selectedClip.type === 'audio' || selectedClip.type === 'video') && (
          <div>
            <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">
              Audio Effects
            </h3>
            <div className="space-y-2">
              {(['reverb', 'echo', 'compressor', 'noise-reduction'] as AudioEffectType[]).map(
                (effectType) => {
                  const hasEffect = (selectedClip.audioEffects || []).some(
                    (e) => e.type === effectType
                  );

                  return (
                    <button
                      key={effectType}
                      onClick={() => {
                        let newEffects = [...(selectedClip.audioEffects || [])];

                        if (hasEffect) {
                          newEffects = newEffects.filter((e) => e.type !== effectType);
                        } else {
                          newEffects.push({
                            id: uuidv4(),
                            type: effectType,
                            enabled: true,
                            parameters: {},
                          });
                        }

                        updateClip(selectedClip.id, { audioEffects: newEffects });
                      }}
                      className={`w-full py-2 px-3 rounded text-sm transition-colors capitalize ${
                        hasEffect
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {effectType.replace(/-/g, ' ')}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
