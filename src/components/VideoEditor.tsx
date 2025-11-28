'use client';

import React, { useState } from 'react';
import { Timeline } from './timeline/Timeline';
import { TimelineControls } from './timeline/TimelineControls';
import { MediaLibrary } from './timeline/MediaLibrary';
import { EffectsPanel } from './effects/EffectsPanel';
import { ColorGradingPanel } from './effects/ColorGradingPanel';
import { ChromaKeyPanel } from './effects/ChromaKeyPanel';
import { TextEditor } from './text/TextEditor';
import { AudioMixer } from './audio/AudioMixer';
import { ExportPanel } from './export/ExportPanel';
import {
  Film,
  Wand2,
  Palette,
  Pipette,
  Type,
  Volume2,
  Download,
  Layers,
} from 'lucide-react';

type SidebarPanel =
  | 'media'
  | 'effects'
  | 'color'
  | 'chroma'
  | 'text'
  | 'audio'
  | 'export';

export const VideoEditor: React.FC = () => {
  const [activePanel, setActivePanel] = useState<SidebarPanel>('media');

  const renderPanel = () => {
    switch (activePanel) {
      case 'media':
        return <MediaLibrary />;
      case 'effects':
        return <EffectsPanel />;
      case 'color':
        return <ColorGradingPanel />;
      case 'chroma':
        return <ChromaKeyPanel />;
      case 'text':
        return <TextEditor />;
      case 'audio':
        return <AudioMixer />;
      case 'export':
        return <ExportPanel />;
      default:
        return <MediaLibrary />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-950 border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold text-white">AI Video Editor Pro</h1>
        <p className="text-gray-400 text-sm mt-1">
          Professional multi-track video and audio editing with advanced effects
        </p>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Preview */}
          <div className="flex-1 bg-black flex items-center justify-center border-b border-gray-700">
            <div className="text-center">
              <div className="w-[640px] h-[360px] bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
                <p className="text-gray-500">Video Preview</p>
              </div>
            </div>
          </div>

          {/* Timeline Controls */}
          <TimelineControls />

          {/* Timeline */}
          <div className="h-80 flex-shrink-0">
            <Timeline />
          </div>
        </div>

        {/* Sidebar Panel Tabs */}
        <div className="flex">
          {/* Tab Buttons */}
          <div className="w-16 bg-gray-950 border-l border-gray-700 flex flex-col">
            <button
              onClick={() => setActivePanel('media')}
              className={`p-4 border-b border-gray-700 transition-colors ${
                activePanel === 'media'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title="Media Library"
            >
              <Film className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActivePanel('effects')}
              className={`p-4 border-b border-gray-700 transition-colors ${
                activePanel === 'effects'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title="Effects & Transitions"
            >
              <Wand2 className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActivePanel('color')}
              className={`p-4 border-b border-gray-700 transition-colors ${
                activePanel === 'color'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title="Color Grading"
            >
              <Palette className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActivePanel('chroma')}
              className={`p-4 border-b border-gray-700 transition-colors ${
                activePanel === 'chroma'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title="Chroma Key"
            >
              <Pipette className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActivePanel('text')}
              className={`p-4 border-b border-gray-700 transition-colors ${
                activePanel === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title="Text Editor"
            >
              <Type className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActivePanel('audio')}
              className={`p-4 border-b border-gray-700 transition-colors ${
                activePanel === 'audio'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title="Audio Mixer"
            >
              <Volume2 className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActivePanel('export')}
              className={`p-4 border-b border-gray-700 transition-colors ${
                activePanel === 'export'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title="Export"
            >
              <Download className="w-6 h-6" />
            </button>
          </div>

          {/* Panel Content */}
          {renderPanel()}
        </div>
      </div>
    </div>
  );
};
