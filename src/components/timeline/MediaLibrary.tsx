'use client';

import React, { useRef } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { MediaAsset, ClipType } from '@/types/timeline';
import { v4 as uuidv4 } from 'uuid';
import { Film, Music, Image as ImageIcon, Type, Upload, Trash2 } from 'lucide-react';

const getIconForType = (type: ClipType) => {
  switch (type) {
    case 'video':
      return <Film className="w-5 h-5" />;
    case 'audio':
      return <Music className="w-5 h-5" />;
    case 'image':
      return <ImageIcon className="w-5 h-5" />;
    case 'text':
      return <Type className="w-5 h-5" />;
    default:
      return <Film className="w-5 h-5" />;
  }
};

export const MediaLibrary: React.FC = () => {
  const { mediaAssets, addMediaAsset, removeMediaAsset } = useTimelineStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      let type: ClipType = 'video';

      if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';
      else if (file.type.startsWith('image/')) type = 'image';

      const asset: MediaAsset = {
        id: uuidv4(),
        name: file.name,
        type,
        url,
        duration: type === 'image' ? 5 : 10,
      };

      addMediaAsset(asset);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragStart = (e: React.DragEvent, asset: MediaAsset) => {
    e.dataTransfer.setData('assetId', asset.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const addSampleAssets = () => {
    const samples: MediaAsset[] = [
      {
        id: uuidv4(),
        name: 'Sample Video 1.mp4',
        type: 'video',
        url: '',
        duration: 15,
      },
      {
        id: uuidv4(),
        name: 'Sample Video 2.mp4',
        type: 'video',
        url: '',
        duration: 20,
      },
      {
        id: uuidv4(),
        name: 'Background Music.mp3',
        type: 'audio',
        url: '',
        duration: 180,
      },
      {
        id: uuidv4(),
        name: 'Voiceover.wav',
        type: 'audio',
        url: '',
        duration: 25,
      },
      {
        id: uuidv4(),
        name: 'Intro Image.jpg',
        type: 'image',
        url: '',
        duration: 5,
      },
    ];

    samples.forEach((asset) => addMediaAsset(asset));
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-semibold mb-3">Media Library</h2>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button
            onClick={addSampleAssets}
            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors"
          >
            Add Samples
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,audio/*,image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {mediaAssets.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-8">
            <p>No media assets yet</p>
            <p className="mt-2">Upload files or add samples to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mediaAssets.map((asset) => (
              <div
                key={asset.id}
                draggable
                onDragStart={(e) => handleDragStart(e, asset)}
                className="bg-gray-700 rounded p-3 cursor-move hover:bg-gray-600 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="text-gray-300 mt-0.5 flex-shrink-0">
                      {getIconForType(asset.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {asset.name}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {asset.type} • {asset.duration}s
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMediaAsset(asset.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all flex-shrink-0"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
