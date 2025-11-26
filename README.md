# AI Video Demo Platform

Transform screen share sales demos into world-class product demos using AI.

## Overview

This platform automatically enhances screen share recordings with AI-powered features including:

- **Automatic Transcription**: Uses OpenAI Whisper to transcribe your video
- **Scene Detection**: Identifies key moments and segments in your demo
- **Quality Analysis**: Rates your demo and provides improvement suggestions
- **Video Enhancement**: Removes pauses, enhances audio, and improves visual quality
- **Professional Output**: Generates polished, shareable product demos

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (state management)
- **React Dropzone** (file uploads)

### Backend
- **Node.js** with **Express**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **BullMQ** (job queue)
- **Redis** (queue storage)
- **OpenAI API** (transcription & analysis)

### Infrastructure
- **Docker Compose** (local development)
- **MinIO** (S3-compatible storage)
- **FFmpeg** (video processing)

## Project Structure

```
ai-video-saas/
├── apps/
│   ├── api/           # Express backend API
│   │   ├── src/
│   │   │   ├── routes/         # API routes
│   │   │   ├── services/       # Business logic
│   │   │   ├── queues/         # Background jobs
│   │   │   ├── middleware/     # Express middleware
│   │   │   └── utils/          # Utilities
│   │   └── package.json
│   └── web/           # Next.js frontend
│       ├── src/
│       │   ├── app/            # Next.js app router
│       │   ├── components/     # React components
│       │   └── lib/            # API client & stores
│       └── package.json
├── packages/
│   ├── database/      # Prisma schema & client
│   └── types/         # Shared TypeScript types
├── docker-compose.yml # Local development services
├── package.json       # Root package (workspace)
└── turbo.json         # Turbo build configuration
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and **pnpm** 8+
- **Docker** and **Docker Compose**
- **OpenAI API key** (for transcription and analysis)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Video-SaaS
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start infrastructure services**
   ```bash
   docker-compose up -d
   ```

   This starts:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - MinIO (port 9000, console 9001)

4. **Configure environment variables**

   **Backend** (`apps/api/.env`):
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

   Edit `apps/api/.env` and set:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_video_saas
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-secret-key-change-this
   OPENAI_API_KEY=sk-your-openai-api-key
   ```

   **Frontend** (`apps/web/.env.local`):
   ```bash
   cp apps/web/.env.local.example apps/web/.env.local
   ```

   Edit `apps/web/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

5. **Set up the database**
   ```bash
   pnpm db:generate  # Generate Prisma client
   pnpm db:push      # Push schema to database
   ```

6. **Start the development servers**
   ```bash
   pnpm dev
   ```

   This starts:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - MinIO Console: http://localhost:9001

## Usage

### 1. Create an Account
- Navigate to http://localhost:3000
- Click "Get Started" or "Sign In"
- Register with your email and password

### 2. Upload a Video
- Log in to your dashboard
- Drag and drop a screen share video (MP4, MOV, AVI, MKV)
- Add a title and description
- Click "Upload and Process Video"

### 3. AI Processing
The platform automatically:
- Transcribes the audio
- Detects scenes and transitions
- Analyzes quality
- Enhances the video

### 4. View Results
- See your video's quality score
- Review transcription and detected scenes
- Download the enhanced version

## Development

### Database Management

```bash
# Generate Prisma client after schema changes
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Open Prisma Studio (database GUI)
pnpm db:studio

# Create a migration
cd packages/database
pnpm prisma migrate dev --name your_migration_name
```

### Build for Production

```bash
# Build all packages
pnpm build

# Start production servers
pnpm start
```

### Clean Build Artifacts

```bash
pnpm clean
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/users/me` - Get current user

### Videos
- `POST /api/videos/upload` - Upload video
- `GET /api/videos` - List user's videos
- `GET /api/videos/:id` - Get video details
- `DELETE /api/videos/:id` - Delete video

## AI Processing Pipeline

When a video is uploaded, it goes through these stages:

1. **Transcription** (25%): Extract audio and transcribe using OpenAI Whisper
2. **Scene Detection** (50%): Analyze content and identify key scenes using GPT-4
3. **Quality Analysis** (65%): Evaluate demo quality and provide score
4. **Enhancement** (100%): Apply audio/video enhancements and export

## Configuration

### Video Processing Options

Edit `apps/api/src/services/videoEnhancement.ts` to customize:
- Audio normalization levels
- Noise reduction settings
- Color correction parameters
- Transition styles
- Overlay templates

### Storage

By default, videos are stored locally. For production, configure S3:

```env
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres
```

### Video Processing Fails
- Ensure OpenAI API key is valid
- Check Redis is running: `docker-compose ps redis`
- View worker logs in the API console

### File Upload Errors
- Check `UPLOAD_DIR` exists and is writable
- Verify `MAX_FILE_SIZE` is sufficient
- Ensure disk space is available

## Future Enhancements

- [ ] Real-time video preview
- [ ] Custom branding and overlays
- [ ] Multi-language transcription
- [ ] Advanced video editing timeline
- [ ] Batch processing
- [ ] Team collaboration features
- [ ] Analytics and insights
- [ ] Export to multiple formats/resolutions

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
