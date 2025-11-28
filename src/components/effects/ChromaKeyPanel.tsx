'use client';

import React, { useState } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { v4 as uuidv4 } from 'uuid';
import { Pipette } from 'lucide-react';
import { Effect, ChromaKeyParams } from '@/types/timeline';

export const ChromaKeyPanel: React.FC = () => {
  const { selectedClipIds, getClipById, updateClip } = useTimelineStore();
  const selectedClip = selectedClipIds.length === 1 ? getClipById(selectedClipIds[0]) : null;

  const [params, setParams] = useState<ChromaKeyParams>({
    color: '#00ff00',
    tolerance: 30,
    softness: 10,
    spillSuppression: 20,
  });

  const [enabled, setEnabled] = useState(false);

  const updateParameter = (key: keyof ChromaKeyParams, value: string | number) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);

    if (!selectedClip || !enabled) return;

    const existingEffectIndex = (selectedClip.effects || []).findIndex(
      (e) => e.type === 'chroma-key'
    );

    let newEffects = [...(selectedClip.effects || [])];

    if (existingEffectIndex >= 0) {
      newEffects[existingEffectIndex] = {
        ...newEffects[existingEffectIndex],
        parameters: newParams,
      };
    } else {
      const newEffect: Effect = {
        id: uuidv4(),
        type: 'chroma-key',
        enabled: true,
        parameters: newParams,
      };
      newEffects.push(newEffect);
    }

    updateClip(selectedClip.id, { effects: newEffects });
  };

  const toggleChromaKey = () => {
    if (!selectedClip) return;

    const newEnabled = !enabled;
    setEnabled(newEnabled);

    if (newEnabled) {
      const newEffect: Effect = {
        id: uuidv4(),
        type: 'chroma-key',
        enabled: true,
        parameters: params,
      };
      updateClip(selectedClip.id, {
        effects: [...(selectedClip.effects || []), newEffect],
      });
    } else {
      updateClip(selectedClip.id, {
        effects: (selectedClip.effects || []).filter((e) => e.type !== 'chroma-key'),
      });
    }
  };

  // Load from selected clip
  React.useEffect(() => {
    if (selectedClip) {
      const chromaEffect = (selectedClip.effects || []).find(
        (e) => e.type === 'chroma-key'
      );
      if (chromaEffect && chromaEffect.parameters) {
        setParams({
          color: chromaEffect.parameters.color || '#00ff00',
          tolerance: chromaEffect.parameters.tolerance || 30,
          softness: chromaEffect.parameters.softness || 10,
          spillSuppression: chromaEffect.parameters.spillSuppression || 20,
        });
        setEnabled(true);
      } else {
        setEnabled(false);
      }
    }
  }, [selectedClip?.id]);

  if (!selectedClip || selectedClip.type !== 'video') {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Pipette className="w-5 h-5" />
            Chroma Key
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-gray-400 text-sm text-center">
            Select a video clip to apply chroma key
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Pipette className="w-5 h-5" />
          Chroma Key (Green Screen)
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between bg-gray-700 rounded p-3">
            <span className="text-white text-sm font-medium">Enable Chroma Key</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={toggleChromaKey}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {enabled && (
            <>
              {/* Color Picker */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Key Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={params.color}
                    onChange={(e) => updateParameter('color', e.target.value)}
                    className="w-16 h-16 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={params.color}
                      onChange={(e) => updateParameter('color', e.target.value)}
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm font-mono mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateParameter('color', '#00ff00')}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1 rounded"
                      >
                        Green
                      </button>
                      <button
                        onClick={() => updateParameter('color', '#0000ff')}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 rounded"
                      >
                        Blue
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tolerance */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-300 text-sm">Tolerance</label>
                  <span className="text-white text-sm font-mono bg-gray-700 px-2 py-0.5 rounded">
                    {params.tolerance}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={params.tolerance}
                  onChange={(e) => updateParameter('tolerance', Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-gray-500 text-xs mt-1">
                  How much color variation to remove
                </p>
              </div>

              {/* Softness */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-300 text-sm">Edge Softness</label>
                  <span className="text-white text-sm font-mono bg-gray-700 px-2 py-0.5 rounded">
                    {params.softness}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={params.softness}
                  onChange={(e) => updateParameter('softness', Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Smoothness of the keyed edges
                </p>
              </div>

              {/* Spill Suppression */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-300 text-sm">Spill Suppression</label>
                  <span className="text-white text-sm font-mono bg-gray-700 px-2 py-0.5 rounded">
                    {params.spillSuppression}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={params.spillSuppression}
                  onChange={(e) =>
                    updateParameter('spillSuppression', Number(e.target.value))
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Remove color cast from subject
                </p>
              </div>

              {/* Tips */}
              <div className="bg-blue-900/30 border border-blue-700 rounded p-3 mt-6">
                <h4 className="text-blue-300 text-sm font-semibold mb-2">Tips:</h4>
                <ul className="text-blue-200 text-xs space-y-1">
                  <li>• Use even, bright lighting on the green/blue screen</li>
                  <li>• Ensure subject is well-separated from background</li>
                  <li>• Start with lower tolerance and increase as needed</li>
                  <li>• Adjust spill suppression if subject has color cast</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
