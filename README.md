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

### ✨ Effects & Transitions
- **40+ Professional Effects**:
  - Color Correction (brightness, contrast, saturation, hue, exposure, gamma)
  - Blur Effects (Gaussian, motion, radial)
  - Stylize Effects (grayscale, sepia, grain, vignette, glow)
  - Sharpen and clarity adjustments
  - Layer blending modes (16+ modes including multiply, screen, overlay, etc.)
  - Opacity and speed controls
- **Transition Presets**:
  - Fade (in, out, cross-dissolve, dip to black/white)
  - Wipe (left, right, up, down)
  - Slide (left, right)
  - Zoom (in, out)
  - Customizable duration and easing
- **Effect Stacking**: Apply multiple effects to single clips
- **Enable/Disable Effects**: Toggle effects without removing them

### 🎨 Color Grading Panel
- **Professional Color Controls**:
  - Basic adjustments (brightness, contrast, saturation, exposure)
  - Color temperature and tint
  - Hue rotation
  - Tone curves (highlights, shadows, gamma)
  - Real-time preview of adjustments
  - Reset all adjustments
- **Preset System**: Save and apply custom color grades

### 🟢 Chroma Key (Green Screen)
- **Advanced Keying**:
  - Color picker for custom key colors
  - Preset green and blue screen options
  - Tolerance adjustment (0-100)
  - Edge softness control
  - Spill suppression
  - Real-time keying preview
- **Professional Tips**: Built-in guidance for best results

### 📝 Text & Titles
- **Rich Text Editor**:
  - Multiple font families
  - Font size (12-200px)
  - Bold and italic styles
  - Text alignment (left, center, right)
  - Vertical positioning (top, middle, bottom)
  - Custom text and background colors
  - Stroke and shadow effects
- **Text Animations**:
  - Fade in/out
  - Slide in (all directions)
  - Typewriter effect
  - Bounce and scale animations

### 🎵 Audio Mixer
- **Track-Level Controls**:
  - Individual track volume (0-200%)
  - Mute/solo tracks
  - Visual volume meters
- **Clip-Level Audio**:
  - Per-clip volume adjustment
  - Audio effects (reverb, echo, compressor, noise reduction)
- **5-Band Equalizer**:
  - 60Hz, 250Hz, 1kHz, 4kHz, 16kHz bands
  - ±20dB gain per band
  - Visual EQ interface
- **Audio Effects**:
  - Reverb (room size, damping, wet/dry mix)
  - Echo/Delay
  - Compressor (threshold, ratio, attack, release)
  - Noise reduction
  - Pitch shift
  - Normalization

### 📤 Export & Render
- **Format Support**:
  - MP4 (H.264)
  - WebM (VP9)
  - QuickTime (MOV, ProRes)
  - GIF support
- **Quality Presets**:
  - Low (2000 kbps)
  - Medium (5000 kbps)
  - High (10000 kbps)
  - Ultra (20000 kbps)
- **Resolution Options**:
  - 4K (3840x2160)
  - Full HD (1920x1080)
  - HD (1280x720)
  - SD (854x480)
  - Custom resolutions
- **Advanced Settings**:
  - Custom frame rate (1-120 fps)
  - Video bitrate control
  - Audio bitrate and sample rate
  - Time range selection
  - Alpha channel support
- **Export Queue**:
  - Multiple simultaneous exports
  - Progress tracking
  - Export history
  - Cancel ongoing exports

### 🎯 Advanced Features
- **Keyframe Animation System**: Animate any property over time
- **Blending Modes**: 16 blend modes for creative compositing
- **Speed Control**: 0.1x to 10x playback speed with reverse
- **Markers**: Add chapter markers and comments to timeline
- **Clip Properties**: Speed, reverse, blend mode, opacity per clip

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

### Using Effects and Transitions
1. Select a clip on the timeline
2. Click the **Effects** tab in the right sidebar
3. Browse effect presets by category (color, blur, stylize)
4. Click a preset to apply it to the selected clip
5. Toggle effects on/off or remove them individually

### Color Grading
1. Select a video clip
2. Click the **Color Grading** tab
3. Adjust sliders for brightness, contrast, saturation, etc.
4. Changes apply in real-time
5. Click Reset to restore default values

### Chroma Key (Green Screen)
1. Select a video clip with green/blue screen
2. Click the **Chroma Key** tab
3. Toggle "Enable Chroma Key"
4. Use color picker or preset buttons for key color
5. Adjust tolerance, softness, and spill suppression
6. Fine-tune for clean keying

### Adding Text
1. Create a text clip or select existing text clip
2. Click the **Text** tab
3. Enter your text content
4. Customize font, size, color, and alignment
5. Add optional background, stroke, or shadow
6. Select animation style

### Audio Mixing
1. Click the **Audio Mixer** tab
2. Adjust track volumes with sliders
3. Select an audio/video clip for clip-level controls
4. Use 5-band EQ to shape audio frequency
5. Add audio effects (reverb, echo, compressor, etc.)

### Exporting Your Video
1. Click the **Export** tab
2. Select format (MP4, WebM, MOV, GIF)
3. Choose resolution preset or custom size
4. Select quality level (Low, Medium, High, Ultra)
5. Optionally adjust advanced settings
6. Click "Start Export"
7. Monitor progress in export queue

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── VideoEditor.tsx    # Main editor component with tabbed panels
│   ├── timeline/
│   │   ├── Timeline.tsx           # Main timeline container
│   │   ├── TimelineTrack.tsx      # Track component
│   │   ├── TimelineClip.tsx       # Draggable, resizable clips
│   │   ├── TimelineControls.tsx   # Playback/view controls
│   │   ├── TimeRuler.tsx          # Time ruler with markers
│   │   ├── Playhead.tsx           # Draggable playhead
│   │   └── MediaLibrary.tsx       # Media library panel
│   ├── effects/
│   │   ├── EffectsPanel.tsx       # Effects & transitions browser
│   │   ├── ColorGradingPanel.tsx  # Professional color grading
│   │   └── ChromaKeyPanel.tsx     # Green screen tool
│   ├── text/
│   │   └── TextEditor.tsx         # Text and title editor
│   ├── audio/
│   │   └── AudioMixer.tsx         # Audio mixing and EQ
│   └── export/
│       └── ExportPanel.tsx        # Export settings and queue
├── store/
│   └── timelineStore.ts   # Zustand state management (360+ lines)
├── types/
│   └── timeline.ts        # Complete TypeScript type system (320+ lines)
├── data/
│   └── presets.ts         # Effect and transition presets
└── utils/
    └── timelineUtils.ts   # Time/pixel conversion, snapping, colors
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

## Implemented Features ✅

- [x] Multi-track timeline with unlimited tracks
- [x] Drag-and-drop clip editing
- [x] Trim, split, and move operations
- [x] 40+ professional effects and filters
- [x] Transition presets (fade, wipe, slide, zoom)
- [x] Color grading panel
- [x] Chroma key (green screen) tool
- [x] Text and title editor with animations
- [x] Audio mixer with 5-band EQ
- [x] Audio effects (reverb, echo, compressor, etc.)
- [x] Export functionality (MP4, WebM, MOV, GIF)
- [x] Blending modes and compositing
- [x] Keyframe animation system
- [x] Speed control and reverse playback
- [x] Timeline markers
- [x] Effect stacking
- [x] Export queue with progress tracking

## Future Enhancements 🚀

- [ ] Video preview playback with actual rendering
- [ ] Audio waveform visualization
- [ ] Video thumbnails on clips
- [ ] Undo/Redo functionality
- [ ] Keyboard shortcuts
- [ ] Auto-save and project management
- [ ] Collaboration features (real-time editing)
- [ ] Cloud storage integration
- [ ] AI-powered features:
  - [ ] Auto-transcription and subtitles
  - [ ] Scene detection
  - [ ] Smart clip suggestions
  - [ ] Background music generation
- [ ] Advanced effects:
  - [ ] Motion tracking
  - [ ] 3D transformations
  - [ ] Particle effects
- [ ] Multi-camera editing
- [ ] Nested sequences
- [ ] Proxy workflow for 4K/8K footage

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.
