# AI Video SaaS - Professional Video Editor

A modern, professional-grade video editing application with multi-track timeline support, built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

### 🎬 Multi-Track Timeline Editor
- **Multiple Video and Audio Tracks**: Add unlimited video and audio tracks
- **Professional Timeline Interface**: Similar to Adobe Premiere Pro and other industry-standard editors
- **Visual Track Management**: Easy track organization with drag-and-drop support

### ✂️ Advanced Editing Tools
- **Drag & Drop**: Drag clips from media library to timeline
- **Trim & Resize**: Adjust clip duration by dragging edges
- **Split Clips**: Split clips at any point with the scissors tool
- **Move Clips**: Drag clips to reposition on timeline or move between tracks
- **Multi-Selection**: Select multiple clips with Shift+Click

### 🎮 Playback Controls
- **Play/Pause/Stop**: Standard playback controls
- **Scrubbing**: Drag the playhead to any position
- **Time Display**: Real-time time code display

### 🔧 Timeline Controls
- **Zoom In/Out**: Adjust timeline zoom level (10% - 1000%)
- **Snap to Grid**: Toggle grid snapping for precise editing
- **Grid Lines**: Visual grid for easy alignment

### 📚 Media Library
- **File Upload**: Upload video, audio, and image files
- **Sample Assets**: Quick-add sample media for testing
- **Drag to Timeline**: Drag assets directly onto tracks

### 🎨 Track Features
- **Track Controls**:
  - Mute/Unmute audio
  - Show/Hide video
  - Lock/Unlock tracks
  - Delete tracks
- **Track Types**: Separate video and audio track types
- **Custom Track Names**: Rename tracks for organization

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/AI-Video-SaaS.git
cd AI-Video-SaaS
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding Media
1. Click "Upload" to add your own media files (video, audio, images)
2. Or click "Add Samples" to add sample media for testing

### Creating Your Timeline
1. Add tracks using "Video Track" or "Audio Track" buttons
2. Drag media from the library onto your tracks
3. Position clips by dragging them on the timeline

### Editing Clips
- **Move**: Click and drag the clip body
- **Trim Start**: Drag the left edge of a clip
- **Trim End**: Drag the right edge of a clip
- **Split**: Click the scissors icon while hovering over a clip
- **Delete**: Select a clip and press Delete (or use track delete button)

### Playback
- Click Play to start playback
- Drag the playhead (red line) to scrub through your video
- Use Stop to return to the beginning

### Timeline Navigation
- **Zoom**: Use +/- buttons or zoom percentage display
- **Scroll**: Use scrollbars to navigate long timelines
- **Snap to Grid**: Enable for precise clip alignment

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── VideoEditor.tsx    # Main editor component
│   └── timeline/
│       ├── Timeline.tsx           # Main timeline container
│       ├── TimelineTrack.tsx      # Track component
│       ├── TimelineClip.tsx       # Clip component
│       ├── TimelineControls.tsx   # Playback/view controls
│       ├── TimeRuler.tsx          # Time ruler
│       ├── Playhead.tsx           # Playhead indicator
│       └── MediaLibrary.tsx       # Media library panel
├── store/
│   └── timelineStore.ts   # Zustand state management
├── types/
│   └── timeline.ts        # TypeScript type definitions
└── utils/
    └── timelineUtils.ts   # Helper functions
```

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **ID Generation**: UUID

## Key Concepts

### Timeline State
The timeline state is managed with Zustand and includes:
- Tracks (video and audio)
- Clips (positioned on tracks)
- Playback state (current time, playing)
- View state (zoom, snap settings)
- Selection state

### Clip Model
Each clip contains:
- Asset reference (points to media in library)
- Position (start time on timeline)
- Duration (length of clip)
- Trim points (in/out points in source media)
- Effects and transitions (planned for future)

### Track Model
Each track contains:
- Type (video or audio)
- Clips array
- Mute/lock/visible states
- Volume level

## Keyboard Shortcuts (Planned)

- `Space`: Play/Pause
- `Delete`: Delete selected clips
- `Cmd/Ctrl + Z`: Undo
- `Cmd/Ctrl + Shift + Z`: Redo
- `Cmd/Ctrl + C`: Copy
- `Cmd/Ctrl + V`: Paste
- `S`: Split clip at playhead

## Future Enhancements

- [ ] Video preview playback
- [ ] Audio waveform visualization
- [ ] Video thumbnails on clips
- [ ] Effects and filters
- [ ] Transitions between clips
- [ ] Undo/Redo functionality
- [ ] Keyboard shortcuts
- [ ] Export/Render functionality
- [ ] Auto-save
- [ ] Project management
- [ ] Collaboration features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.
