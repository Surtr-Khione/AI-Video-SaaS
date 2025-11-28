'use client';

import React, { useState } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { effectPresets, transitionPresets } from '@/data/presets';
import { v4 as uuidv4 } from 'uuid';
import {
  Wand2,
  Sparkles,
  Layers,
  Blend,
  Zap,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import { Effect, EffectType } from '@/types/timeline';

type PanelTab = 'effects' | 'transitions' | 'color' | 'transform';

export const EffectsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PanelTab>('effects');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['color', 'blur', 'stylize'])
  );

  const { selectedClipIds, getClipById, updateClip } = useTimelineStore();
  const selectedClip = selectedClipIds.length === 1 ? getClipById(selectedClipIds[0]) : null;

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const applyEffectPreset = (preset: typeof effectPresets[0]) => {
    if (!selectedClip) return;

    const newEffects: Effect[] = preset.effects.map((effect) => ({
      ...effect,
      id: uuidv4(),
    }));

    updateClip(selectedClip.id, {
      effects: [...(selectedClip.effects || []), ...newEffects],
    });
  };

  const applyTransitionPreset = (preset: typeof transitionPresets[0]) => {
    if (!selectedClip) return;

    const newTransition = {
      ...preset.transition,
      id: uuidv4(),
    };

    updateClip(selectedClip.id, {
      transitions: [...(selectedClip.transitions || []), newTransition],
    });
  };

  const removeEffect = (effectId: string) => {
    if (!selectedClip) return;

    updateClip(selectedClip.id, {
      effects: (selectedClip.effects || []).filter((e) => e.id !== effectId),
    });
  };

  const toggleEffect = (effectId: string) => {
    if (!selectedClip) return;

    updateClip(selectedClip.id, {
      effects: (selectedClip.effects || []).map((e) =>
        e.id === effectId ? { ...e, enabled: !e.enabled } : e
      ),
    });
  };

  const groupedEffects = effectPresets.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, typeof effectPresets>);

  const groupedTransitions = transitionPresets.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, typeof transitionPresets>);

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          Effects & Transitions
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('effects')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'effects'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-1" />
          Effects
        </button>
        <button
          onClick={() => setActiveTab('transitions')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'transitions'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Zap className="w-4 h-4 inline mr-1" />
          Transitions
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedClip ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            Select a clip to apply effects
          </div>
        ) : (
          <>
            {/* Applied Effects */}
            {selectedClip.effects && selectedClip.effects.length > 0 && (
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white text-sm font-semibold mb-3">Applied Effects</h3>
                <div className="space-y-2">
                  {selectedClip.effects.map((effect) => (
                    <div
                      key={effect.id}
                      className="bg-gray-700 rounded p-2 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={effect.enabled}
                          onChange={() => toggleEffect(effect.id)}
                          className="rounded"
                        />
                        <span className="text-white text-sm">{effect.type}</span>
                      </div>
                      <button
                        onClick={() => removeEffect(effect.id)}
                        className="p-1 hover:bg-red-600 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Effect Presets */}
            {activeTab === 'effects' && (
              <div className="p-4">
                {Object.entries(groupedEffects).map(([category, presets]) => (
                  <div key={category} className="mb-4">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between text-white text-sm font-semibold mb-2 hover:text-blue-400 transition-colors"
                    >
                      <span className="capitalize">{category}</span>
                      {expandedCategories.has(category) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {expandedCategories.has(category) && (
                      <div className="space-y-2">
                        {presets.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => applyEffectPreset(preset)}
                            className="w-full bg-gray-700 hover:bg-gray-600 rounded p-3 text-left transition-colors"
                          >
                            <div className="text-white text-sm font-medium">
                              {preset.name}
                            </div>
                            <div className="text-gray-400 text-xs mt-1">
                              {preset.effects.length} effect
                              {preset.effects.length > 1 ? 's' : ''}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Transition Presets */}
            {activeTab === 'transitions' && (
              <div className="p-4">
                {Object.entries(groupedTransitions).map(([category, presets]) => (
                  <div key={category} className="mb-4">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between text-white text-sm font-semibold mb-2 hover:text-blue-400 transition-colors"
                    >
                      <span className="capitalize">{category}</span>
                      {expandedCategories.has(category) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {expandedCategories.has(category) && (
                      <div className="space-y-2">
                        {presets.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => applyTransitionPreset(preset)}
                            className="w-full bg-gray-700 hover:bg-gray-600 rounded p-3 text-left transition-colors"
                          >
                            <div className="text-white text-sm font-medium">
                              {preset.name}
                            </div>
                            <div className="text-gray-400 text-xs mt-1">
                              {preset.transition.duration}s • {preset.transition.position}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
