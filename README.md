# AI Video SaaS - Mass Video Production Platform

A powerful platform for creating thousands of videos at scale using AI and automation.

## Features

- **Batch Video Production**: Create hundreds or thousands of videos from CSV data
- **Queue-Based Processing**: Efficient job queue system with Bull and Redis
- **Real-Time Progress Tracking**: Monitor video generation progress in real-time
- **Template System**: Define reusable video templates
- **RESTful API**: Complete API for programmatic access
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Bull with Redis
- **Video Processing**: FFmpeg
- **TypeScript**: Full type safety

## Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- FFmpeg

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Video-SaaS
   ```

2. **Run setup script**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

3. **Configure environment**
   Edit `.env` with your database and Redis settings

4. **Set up database**
   ```bash
   npm run db:push
   ```

5. **Start the application**
   ```bash
   # Terminal 1: Start the web server
   npm run dev

   # Terminal 2: Start the worker
   npm run worker
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### Creating a Video Project

1. Click "New Project" button
2. Enter project name and description
3. Upload a CSV file with video data (optional)
4. Click "Create Project"

### CSV Format

Your CSV should have columns representing data for each video:

```csv
text,backgroundColor
"Welcome to Video 1",#FF5733
"Welcome to Video 2",#33FF57
"Welcome to Video 3",#3357FF
```

See `example.csv` for a complete example.

### API Endpoints

#### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project details
- `DELETE /api/projects/:id` - Delete a project
- `GET /api/projects/:id/status` - Get real-time project status

#### Jobs
- `POST /api/projects/:id/jobs` - Add jobs to a project

#### Templates
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create a new template

#### Videos
- `GET /api/videos/:id` - Download completed video

### Example API Usage

```javascript
// Create a project
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Campaign',
    description: 'Q1 2024 promotional videos'
  })
});

const { project } = await response.json();

// Add jobs to the project
await fetch(`/api/projects/${project.id}/jobs`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jobs: [
      { data: { text: 'Video 1', backgroundColor: '#FF5733' } },
      { data: { text: 'Video 2', backgroundColor: '#33FF57' } },
    ]
  })
});

// Check status
const statusResponse = await fetch(`/api/projects/${project.id}/status`);
const status = await statusResponse.json();
console.log(`Progress: ${status.stats.overallProgress}%`);
```

## Architecture

### Database Schema

- **VideoProject**: Represents a batch video production project
- **VideoJob**: Individual video within a project
- **Template**: Reusable video template configuration

### Queue System

The application uses Bull queue for processing videos:
- Jobs are added to the queue when created
- Workers process jobs concurrently (default: 3 concurrent jobs)
- Failed jobs are automatically retried (max 3 attempts)
- Progress is tracked in real-time

### Video Processing

Videos are generated using FFmpeg with customizable:
- Resolution (default: 1920x1080)
- Format (default: MP4)
- Quality settings (low/medium/high)
- Text overlays
- Background colors
- Duration

## Deployment

### Using Docker

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis server
- Next.js application
- Video processing worker

### Manual Deployment

1. Set up PostgreSQL and Redis
2. Configure environment variables
3. Build the application:
   ```bash
   npm run build
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Start workers:
   ```bash
   npm run worker
   ```

## Development

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── projects/      # Project management
│   │   ├── templates/     # Template management
│   │   └── videos/        # Video downloads
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard
├── components/            # React components
│   └── ui/               # UI components (Button, Card, etc.)
├── lib/                   # Shared libraries
│   ├── prisma.ts         # Prisma client
│   ├── queue.ts          # Bull queue setup
│   ├── video-processor.ts # Video processing logic
│   └── utils.ts          # Utility functions
├── workers/               # Background workers
│   └── video-processor.ts # Video processing worker
└── prisma/                # Database schema
    └── schema.prisma
```

### Adding Custom Video Templates

Templates allow you to define reusable video configurations:

```typescript
const template = await fetch('/api/templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Promotional Video',
    description: 'Standard promotional video template',
    config: {
      duration: 15,
      resolution: '1920x1080',
      format: 'mp4',
      // Add custom FFmpeg filters, transitions, etc.
    }
  })
});
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_video_saas?schema=public"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Storage
UPLOAD_DIR="./uploads"
OUTPUT_DIR="./output"

# Processing
MAX_CONCURRENT_JOBS=3
VIDEO_QUALITY="high"
DEFAULT_VIDEO_FORMAT="mp4"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
