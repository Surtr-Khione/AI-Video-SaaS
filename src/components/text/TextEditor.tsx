'use client';

import React, { useState } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';
import { TextStyle, TextAnimation } from '@/types/timeline';
import { v4 as uuidv4 } from 'uuid';

const fontFamilies = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Impact',
  'Comic Sans MS',
];

const animations: TextAnimation[] = [
  'none',
  'fade-in',
  'fade-out',
  'slide-in-left',
  'slide-in-right',
  'slide-in-top',
  'slide-in-bottom',
  'typewriter',
  'bounce',
  'scale-in',
];

export const TextEditor: React.FC = () => {
  const { selectedClipIds, getClipById, updateClip, addClip, tracks } =
    useTimelineStore();

  const selectedClip = selectedClipIds.length === 1 ? getClipById(selectedClipIds[0]) : null;

  const [textContent, setTextContent] = useState(selectedClip?.text || '');
  const [textStyle, setTextStyle] = useState<TextStyle>(
    selectedClip?.textStyle || {
      fontFamily: 'Arial',
      fontSize: 48,
      fontWeight: 'bold',
      fontStyle: 'normal',
      color: '#ffffff',
      textAlign: 'center',
      verticalAlign: 'middle',
    }
  );

  const updateStyle = <K extends keyof TextStyle>(key: K, value: TextStyle[K]) => {
    const newStyle = { ...textStyle, [key]: value };
    setTextStyle(newStyle);

    if (selectedClip) {
      updateClip(selectedClip.id, {
        textStyle: newStyle,
      });
    }
  };

  const updateText = (text: string) => {
    setTextContent(text);
    if (selectedClip) {
      updateClip(selectedClip.id, { text });
    }
  };

  const addTextClip = () => {
    const videoTrack = tracks.find((t) => t.type === 'video');
    if (!videoTrack) return;

    const newClip = {
      id: uuidv4(),
      trackId: videoTrack.id,
      assetId: uuidv4(),
      type: 'text' as const,
      startTime: 0,
      duration: 5,
      trimStart: 0,
      trimEnd: 5,
      text: 'New Text',
      textStyle,
    };

    // This would need to be implemented in the store
    // For now, we'll just show how it would be used
  };

  // Load from selected clip
  React.useEffect(() => {
    if (selectedClip) {
      setTextContent(selectedClip.text || '');
      if (selectedClip.textStyle) {
        setTextStyle(selectedClip.textStyle);
      }
    }
  }, [selectedClip?.id]);

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Type className="w-5 h-5" />
          Text Editor
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedClip || selectedClip.type !== 'text' ? (
          <div className="text-center text-gray-400 text-sm">
            Select a text clip to edit
          </div>
        ) : (
          <div className="space-y-4">
            {/* Text Content */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Text Content
              </label>
              <textarea
                value={textContent}
                onChange={(e) => updateText(e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm min-h-[100px] resize-none"
                placeholder="Enter your text..."
              />
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Font Family
              </label>
              <select
                value={textStyle.fontFamily}
                onChange={(e) => updateStyle('fontFamily', e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
              >
                {fontFamilies.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Font Size: {textStyle.fontSize}px
              </label>
              <input
                type="range"
                min={12}
                max={200}
                value={textStyle.fontSize}
                onChange={(e) => updateStyle('fontSize', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Font Style */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Style
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    updateStyle(
                      'fontWeight',
                      textStyle.fontWeight === 'bold' ? 'normal' : 'bold'
                    )
                  }
                  className={`flex-1 py-2 rounded transition-colors ${
                    textStyle.fontWeight === 'bold'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Bold className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() =>
                    updateStyle(
                      'fontStyle',
                      textStyle.fontStyle === 'italic' ? 'normal' : 'italic'
                    )
                  }
                  className={`flex-1 py-2 rounded transition-colors ${
                    textStyle.fontStyle === 'italic'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Italic className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>

            {/* Text Align */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Alignment
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateStyle('textAlign', 'left')}
                  className={`flex-1 py-2 rounded transition-colors ${
                    textStyle.textAlign === 'left'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <AlignLeft className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => updateStyle('textAlign', 'center')}
                  className={`flex-1 py-2 rounded transition-colors ${
                    textStyle.textAlign === 'center'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <AlignCenter className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => updateStyle('textAlign', 'right')}
                  className={`flex-1 py-2 rounded transition-colors ${
                    textStyle.textAlign === 'right'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <AlignRight className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Text Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textStyle.color}
                  onChange={(e) => updateStyle('color', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={textStyle.color}
                  onChange={(e) => updateStyle('color', e.target.value)}
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Background Color (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textStyle.backgroundColor || '#000000'}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={textStyle.backgroundColor || ''}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  placeholder="Transparent"
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>

            {/* Animation */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Animation
              </label>
              <select
                value={textStyle.animation || 'none'}
                onChange={(e) => updateStyle('animation', e.target.value as TextAnimation)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm capitalize"
              >
                {animations.map((anim) => (
                  <option key={anim} value={anim} className="capitalize">
                    {anim.replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
