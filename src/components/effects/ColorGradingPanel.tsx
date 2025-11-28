'use client';

import React, { useState } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { v4 as uuidv4 } from 'uuid';
import { Palette, RotateCcw } from 'lucide-react';
import { Effect, ColorCorrectionParams } from '@/types/timeline';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-gray-300 text-sm">{label}</label>
        <span className="text-white text-sm font-mono bg-gray-700 px-2 py-0.5 rounded">
          {value > 0 ? '+' : ''}
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );
};

export const ColorGradingPanel: React.FC = () => {
  const { selectedClipIds, getClipById, updateClip } = useTimelineStore();
  const selectedClip = selectedClipIds.length === 1 ? getClipById(selectedClipIds[0]) : null;

  const [params, setParams] = useState<ColorCorrectionParams>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0,
    exposure: 0,
    gamma: 1,
  });

  const updateParameter = (key: keyof ColorCorrectionParams, value: number) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);

    if (!selectedClip) return;

    // Find existing color correction effect or create new one
    const existingEffectIndex = (selectedClip.effects || []).findIndex(
      (e) => e.type === 'color-correction'
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
        type: 'color-correction',
        enabled: true,
        parameters: newParams,
      };
      newEffects.push(newEffect);
    }

    updateClip(selectedClip.id, { effects: newEffects });
  };

  const resetAll = () => {
    const defaultParams: ColorCorrectionParams = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      temperature: 0,
      tint: 0,
      highlights: 0,
      shadows: 0,
      exposure: 0,
      gamma: 1,
    };
    setParams(defaultParams);

    if (!selectedClip) return;

    const newEffects = (selectedClip.effects || []).filter(
      (e) => e.type !== 'color-correction'
    );
    updateClip(selectedClip.id, { effects: newEffects });
  };

  // Load parameters from selected clip
  React.useEffect(() => {
    if (selectedClip) {
      const colorEffect = (selectedClip.effects || []).find(
        (e) => e.type === 'color-correction'
      );
      if (colorEffect && colorEffect.parameters) {
        setParams({
          brightness: colorEffect.parameters.brightness || 0,
          contrast: colorEffect.parameters.contrast || 0,
          saturation: colorEffect.parameters.saturation || 0,
          hue: colorEffect.parameters.hue || 0,
          temperature: colorEffect.parameters.temperature || 0,
          tint: colorEffect.parameters.tint || 0,
          highlights: colorEffect.parameters.highlights || 0,
          shadows: colorEffect.parameters.shadows || 0,
          exposure: colorEffect.parameters.exposure || 0,
          gamma: colorEffect.parameters.gamma || 1,
        });
      } else {
        resetAll();
      }
    }
  }, [selectedClip?.id]);

  if (!selectedClip) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Grading
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-gray-400 text-sm text-center">
            Select a clip to adjust color grading
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Color Grading
        </h2>
        <button
          onClick={resetAll}
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Reset All"
        >
          <RotateCcw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {/* Basic Adjustments */}
          <div className="mb-6">
            <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">
              Basic
            </h3>
            <SliderControl
              label="Brightness"
              value={params.brightness}
              min={-100}
              max={100}
              onChange={(v) => updateParameter('brightness', v)}
            />
            <SliderControl
              label="Contrast"
              value={params.contrast}
              min={-100}
              max={100}
              onChange={(v) => updateParameter('contrast', v)}
            />
            <SliderControl
              label="Saturation"
              value={params.saturation}
              min={-100}
              max={100}
              onChange={(v) => updateParameter('saturation', v)}
            />
            <SliderControl
              label="Exposure"
              value={params.exposure}
              min={-100}
              max={100}
              onChange={(v) => updateParameter('exposure', v)}
            />
          </div>

          {/* Color */}
          <div className="mb-6">
            <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">
              Color
            </h3>
            <SliderControl
              label="Temperature"
              value={params.temperature}
              min={-100}
              max={100}
              onChange={(v) => updateParameter('temperature', v)}
            />
            <SliderControl
              label="Tint"
              value={params.tint}
              min={-100}
              max={100}
              onChange={(v) => updateParameter('tint', v)}
            />
            <SliderControl
              label="Hue"
              value={params.hue}
              min={-180}
              max={180}
              onChange={(v) => updateParameter('hue', v)}
            />
          </div>

          {/* Tone */}
          <div className="mb-6">
            <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">
              Tone
            </h3>
            <SliderControl
              label="Highlights"
              value={params.highlights}
              min={-100}
              max={100}
              onChange={(v) => updateParameter('highlights', v)}
            />
            <SliderControl
              label="Shadows"
              value={params.shadows}
              min={-100}
              max={100}
              onChange={(v) => updateParameter('shadows', v)}
            />
            <SliderControl
              label="Gamma"
              value={params.gamma}
              min={0.1}
              max={3}
              step={0.1}
              onChange={(v) => updateParameter('gamma', v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
