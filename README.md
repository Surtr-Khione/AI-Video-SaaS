# AI Video Studio 🎬✨

A modern, full-featured AI-powered video processing platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 🚀 Core Functionality
- **Video Upload**: Drag-and-drop or click to upload videos
- **URL Import**: Process videos from direct URLs
- **AI Transformations**:
  - AI Enhancement (quality improvement, stabilization, color correction)
  - Smart Crop (aspect ratio conversion, subject tracking)
  - Background Removal
  - Auto Subtitles (AI transcription)
  - Video Stabilization
  - Color Grading

### 📊 Dashboard
- Overview of processed videos
- Processing statistics
- Quick upload access
- Feature highlights

### 🎨 Video Gallery
- Browse all processed videos
- Filter by status (completed, processing)
- Filter by transformation type
- Search functionality
- Video details and metadata
- Download and preview options

### ⚙️ Settings
- Profile management
- Processing defaults (quality, format)
- Auto-processing toggle
- Theme selection (light/dark/system)
- Notification preferences
- Storage management
- API key management

### 🎥 Video Player
- Custom video player with controls
- Play/pause functionality
- Volume control
- Seek bar
- Fullscreen support
- Time display

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes (App Router)
- **Storage**: File-based storage with JSON metadata
- **Video Processing**: Simulated AI transformations
- **File Handling**: Native Node.js fs/promises

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
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

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
AI-Video-SaaS/
├── app/                      # Next.js app directory
│   ├── api/                 # Backend API routes
│   │   ├── videos/         # Video endpoints
│   │   │   ├── [id]/      # Individual video operations
│   │   │   │   ├── route.ts          # GET, DELETE, PATCH /api/videos/[id]
│   │   │   │   └── status/route.ts   # GET /api/videos/[id]/status
│   │   │   └── route.ts   # GET, POST /api/videos
│   │   └── stats/         # Dashboard stats
│   │       └── route.ts   # GET /api/stats
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Dashboard/home page
│   ├── upload/            # Upload and processing page
│   ├── gallery/           # Video gallery page
│   ├── settings/          # Settings page
│   ├── loading.tsx        # Loading state
│   ├── error.tsx          # Error handling
│   └── not-found.tsx      # 404 page
├── components/            # Reusable components
│   ├── ui/               # UI components (button, card, input, etc.)
│   ├── navigation.tsx    # Main navigation component
│   └── video-player.tsx  # Video player component
├── lib/                  # Backend utilities
│   ├── storage.ts        # Video metadata storage
│   ├── video-processing.ts  # AI transformation logic
│   └── utils.ts          # Helper functions
├── types/                # TypeScript types
│   └── index.ts         # Shared types (Video, ProcessingOptions, etc.)
├── data/                # Runtime data (created automatically)
│   └── videos.json      # Video metadata storage
└── public/              # Static assets
    ├── uploads/         # Uploaded video files
    └── processed/       # Processed video files
```

## Pages

- **/** - Dashboard with stats and quick actions
- **/upload** - Upload and process videos with AI transformations
- **/gallery** - Browse and manage processed videos
- **/settings** - Configure preferences and account settings

## API Endpoints

### Videos
- **POST /api/videos** - Upload and start processing a video
- **GET /api/videos** - List all videos
- **GET /api/videos/[id]** - Get a specific video
- **DELETE /api/videos/[id]** - Delete a video
- **PATCH /api/videos/[id]** - Update video metadata
- **GET /api/videos/[id]/status** - Get processing status

### Statistics
- **GET /api/stats** - Get dashboard statistics (total, processing, completed)

## Features in Detail

### Video Processing Options

- **Quality Settings**: Low (fast), Medium, High (best quality)
- **Output Formats**: MP4, MOV, WebM, AVI
- **Aspect Ratios**: Original, 16:9, 9:16, 1:1, 4:3
- **Custom Instructions**: Add specific AI processing instructions

### Responsive Design

The entire UI is fully responsive and works seamlessly across:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## Future Enhancements

- Backend integration for actual video processing
- User authentication and authorization
- Database integration for video storage
- Real-time processing status updates
- Batch processing capabilities
- Advanced AI features (object detection, scene classification)
- Social sharing capabilities
- Team collaboration features

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
