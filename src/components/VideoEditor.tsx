'use client';

import React from 'react';
import { Timeline } from './timeline/Timeline';
import { TimelineControls } from './timeline/TimelineControls';
import { MediaLibrary } from './timeline/MediaLibrary';

export const VideoEditor: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-950 border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold text-white">AI Video Editor</h1>
        <p className="text-gray-400 text-sm mt-1">
          Professional multi-track video and audio editing
        </p>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Preview */}
          <div className="flex-1 bg-black flex items-center justify-center border-b border-gray-700">
            <div className="text-center">
              <div className="w-[640px] h-[360px] bg-gray-900 rounded-lg flex items-center justify-center">
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

        {/* Media Library Sidebar */}
        <MediaLibrary />
      </div>
    </div>
  );
};
