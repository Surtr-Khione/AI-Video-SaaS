# 🎬 AI Video SaaS Platform

A production-ready Next.js application for generating AI videos using multiple cutting-edge AI providers:

- **Google Veo 3** - Google's state-of-the-art video generation model
- **OpenAI Sora** - OpenAI's advanced text-to-video AI
- **Runway ML** - Industry-leading Gen-3 Alpha video AI
- **Replicate** - Access to Stable Video Diffusion and more

## ✨ Features

- 🚀 **Multiple AI Providers** - Automatic provider selection or manual choice
- 🎥 **Comprehensive Video Generation** - Text-to-video, image-to-video, video editing, and enhancement
- ⚡ **Async Job Queue** - BullMQ-powered background processing
- 📊 **Real-time Status Tracking** - Live progress updates for video generation
- 💾 **Database Persistence** - PostgreSQL with Prisma ORM
- 🎨 **Modern UI** - Beautiful, responsive interface with Tailwind CSS
- 🔧 **Type-Safe** - Full TypeScript support throughout
- 📈 **Scalable Architecture** - Modular provider system for easy expansion

## 🏗️ Architecture

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API endpoints
│   │   │   └── ai/             # AI-related routes
│   │   └── page.tsx            # Main UI
│   │
│   ├── services/               # Business logic
│   │   ├── ai/                 # AI service layer
│   │   │   ├── providers/      # AI provider implementations
│   │   │   │   ├── base.ts              # Base provider class
│   │   │   │   ├── google-veo.ts        # Google Veo 3
│   │   │   │   ├── openai-sora.ts       # OpenAI Sora
│   │   │   │   ├── runway-ml.ts         # Runway ML
│   │   │   │   ├── replicate.ts         # Replicate
│   │   │   │   └── index.ts             # Provider factory
│   │   │   └── index.ts        # AI service orchestrator
│   │   └── queue/              # Job queue system
│   │
│   ├── lib/                    # Utilities
│   │   ├── db.ts               # Prisma client
│   │   └── utils.ts            # Helper functions
│   │
│   ├── types/                  # TypeScript types
│   │   └── ai.ts               # AI-related types
│   │
│   └── config/                 # Configuration
│       └── ai-providers.ts     # Provider configs
│
├── prisma/
│   └── schema.prisma           # Database schema
│
└── docker-compose.yml          # Local development services
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- Redis (for job queue)
- API keys for at least one AI provider

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/AI-Video-SaaS.git
cd AI-Video-SaaS
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Start Database Services

Using Docker Compose (recommended):

```bash
docker-compose up -d
```

Or set up PostgreSQL and Redis manually.

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_video_saas"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Google Veo 3 (choose one method)
# Method 1: API Key (Google AI Studio)
GOOGLE_API_KEY="your-api-key"

# Method 2: Service Account (Vertex AI)
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_LOCATION="us-central1"
GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"

# OpenAI Sora
OPENAI_API_KEY="sk-..."
OPENAI_ORG_ID="org-..." # Optional

# Runway ML
RUNWAY_API_KEY="your-runway-api-key"

# Replicate
REPLICATE_API_TOKEN="your-replicate-token"

# Feature Flags (enable providers you have keys for)
ENABLE_GOOGLE_VEO=true
ENABLE_OPENAI_SORA=true
ENABLE_RUNWAY=true
ENABLE_REPLICATE=true
```

### 5. Initialize Database

```bash
npx prisma db push
npx prisma generate
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 API Documentation

### Generate Video

**POST** `/api/ai/generate`

Generate a new video using AI.

**Request Body:**

```json
{
  "userId": "user-123",
  "title": "Sunset at the beach",
  "type": "text-to-video",
  "prompt": "A beautiful sunset at a tropical beach with palm trees swaying in the breeze",
  "duration": 5,
  "provider": "auto",
  "aspectRatio": "16:9",
  "resolution": "1920x1080"
}
```

**Response:**

```json
{
  "success": true,
  "project": {
    "id": "clx123...",
    "title": "Sunset at the beach",
    "status": "QUEUED",
    "provider": "GOOGLE_VEO"
  },
  "job": {
    "id": "job-abc123",
    "status": "processing",
    "estimatedTimeSeconds": 60
  }
}
```

### Check Status

**GET** `/api/ai/status/:projectId`

Check the status of a video generation job.

**Response:**

```json
{
  "project": {
    "id": "clx123...",
    "title": "Sunset at the beach",
    "status": "COMPLETED",
    "provider": "GOOGLE_VEO",
    "videoUrl": "https://...",
    "thumbnailUrl": "https://..."
  },
  "job": {
    "status": "completed",
    "progress": 100
  }
}
```

### Cancel Generation

**POST** `/api/ai/cancel/:projectId`

Cancel a running video generation job.

### List Providers

**GET** `/api/ai/providers`

Get a list of available AI providers and their capabilities.

**Response:**

```json
{
  "providers": [
    {
      "name": "google_veo",
      "capabilities": ["text-to-video", "image-to-video"],
      "maxDuration": 60,
      "costPerSecond": 0.15
    }
  ],
  "count": 4
}
```

## 🎯 Usage Examples

### Text-to-Video

```typescript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    type: 'text-to-video',
    prompt: 'A futuristic city with flying cars at night',
    duration: 10,
    provider: 'google_veo',
  }),
});
```

### Image-to-Video

```typescript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    type: 'image-to-video',
    prompt: 'Camera zooms into the landscape',
    sourceImage: 'https://example.com/image.jpg',
    duration: 5,
    provider: 'runway_ml',
  }),
});
```

## 🔧 Configuration

### Provider Selection

The system can automatically select the best provider based on:

1. **Capability** - Does the provider support the requested generation type?
2. **Priority** - Google Veo 3 > OpenAI Sora > Runway ML > Replicate
3. **Availability** - Is the provider configured and enabled?

You can also manually specify a provider:

```typescript
{
  "provider": "runway_ml" // Force use of Runway ML
}
```

### Rate Limiting

Configure rate limits in `.env`:

```env
RATE_LIMIT_PER_USER=100
RATE_LIMIT_WINDOW=3600
```

### Job Queue

Configure queue concurrency and timeouts:

```env
QUEUE_CONCURRENCY=3
VIDEO_GENERATION_TIMEOUT=600000
```

## 🧪 Testing

Each provider can be tested independently. Here's how to get API keys:

### Google Veo 3

1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Create a new API key
3. Add to `.env` as `GOOGLE_API_KEY`

**OR** use Vertex AI:

1. Create a Google Cloud project
2. Enable Vertex AI API
3. Create a service account and download JSON
4. Set `GOOGLE_APPLICATION_CREDENTIALS` path

### OpenAI Sora

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Generate an API key
3. Note: Sora access may be limited - join waitlist if needed

### Runway ML

1. Sign up at [Runway ML](https://runwayml.com/)
2. Go to Settings → API Keys
3. Generate a new API key

### Replicate

1. Sign up at [Replicate](https://replicate.com/)
2. Go to Account → API Tokens
3. Create a new token

## 📊 Database Schema

The application uses PostgreSQL with the following main models:

- **VideoProject** - Stores video generation projects
- **JobLog** - Logs provider API interactions

View the full schema in `prisma/schema.prisma`.

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

**Note:** You'll need external PostgreSQL and Redis (e.g., Supabase, Upstash)

### Docker

Build and run with Docker:

```bash
docker build -t ai-video-saas .
docker run -p 3000:3000 ai-video-saas
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Google Veo 3 - State-of-the-art video generation
- OpenAI Sora - Advanced AI video synthesis
- Runway ML - Creative AI tools
- Replicate - ML model hosting platform
- Next.js - React framework
- Prisma - Database ORM
- BullMQ - Job queue system

## 📞 Support

For issues and questions:

- Open an issue on GitHub
- Check existing documentation
- Review API provider documentation

## 🗺️ Roadmap

- [ ] Add authentication (NextAuth.js)
- [ ] Implement credit system
- [ ] Add video gallery
- [ ] Support for video-to-video editing
- [ ] Webhook notifications
- [ ] S3 storage integration
- [ ] Advanced analytics
- [ ] User dashboard
- [ ] Batch processing
- [ ] Custom model fine-tuning

---

**Built with ❤️ using Next.js 14, TypeScript, and cutting-edge AI**
