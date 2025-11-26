# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
│                    Next.js 14 App (Port 3000)                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Express API (Port 3001)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Auth       │  │   Videos     │  │   Users      │          │
│  │   Routes     │  │   Routes     │  │   Routes     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│         └─────────────────┼──────────────────┘                   │
│                           │                                      │
│  ┌────────────────────────┴────────────────────────┐            │
│  │           Middleware Layer                       │            │
│  │  • Authentication (JWT)                          │            │
│  │  • Error Handling                                │            │
│  │  • Request Validation (Zod)                     │            │
│  │  • File Upload (Multer)                         │            │
│  └────────────────────────┬────────────────────────┘            │
│                           │                                      │
│  ┌────────────────────────┴────────────────────────┐            │
│  │           Service Layer                          │            │
│  │  • Transcription Service (OpenAI Whisper)       │            │
│  │  • Scene Detection (GPT-4 Vision)               │            │
│  │  • Quality Analysis (GPT-4)                     │            │
│  │  • Video Enhancement (FFmpeg)                   │            │
│  └────────────────────────┬────────────────────────┘            │
└─────────────────────────┬─┴────────────────────────────────────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            ▼             ▼             ▼
   ┌────────────┐ ┌────────────┐ ┌────────────┐
   │ PostgreSQL │ │   Redis    │ │   MinIO    │
   │  Database  │ │   Queue    │ │  Storage   │
   │ (Port 5432)│ │ (Port 6379)│ │ (Port 9000)│
   └────────────┘ └────────────┘ └────────────┘
            │             │             │
            └─────────────┼─────────────┘
                          │
                          ▼
                 ┌────────────────┐
                 │  BullMQ Worker │
                 │  (Background)  │
                 │   Processing   │
                 └────────────────┘
```

## Data Flow

### 1. Video Upload Flow

```
User → Upload Form → API (POST /videos/upload)
                         │
                         ├─> Validate File (Multer)
                         ├─> Save to Disk/MinIO
                         ├─> Create Video Record (Prisma)
                         └─> Queue Processing Job (BullMQ)
                              │
                              └─> Background Worker Picks Up Job
```

### 2. Video Processing Flow

```
BullMQ Worker
    │
    ├─> 1. Transcription Job (25%)
    │      ├─> Extract Audio
    │      ├─> Call OpenAI Whisper API
    │      └─> Save Transcription to DB
    │
    ├─> 2. Scene Detection Job (50%)
    │      ├─> Analyze Video Frames
    │      ├─> Call GPT-4 with Transcription
    │      └─> Save Scenes to DB
    │
    ├─> 3. Quality Analysis Job (65%)
    │      ├─> Analyze Transcription
    │      ├─> Analyze Scenes
    │      └─> Calculate Quality Score
    │
    └─> 4. Enhancement Job (100%)
           ├─> Remove Pauses (FFmpeg)
           ├─> Enhance Audio (FFmpeg)
           ├─> Color Correction (FFmpeg)
           ├─> Add Transitions (FFmpeg)
           └─> Export Final Video
```

## Database Schema

### User
- id (cuid)
- email (unique)
- passwordHash
- name
- createdAt
- updatedAt

### Video
- id (cuid)
- userId (FK → User)
- title
- description
- status (UPLOADED | PROCESSING | COMPLETED | FAILED)
- originalFileName
- originalFileSize
- originalUrl
- originalDuration
- processedUrl
- processedDuration
- processedFileSize
- transcription (text)
- scenes (json)
- enhancements (json)
- qualityScore (float)
- processingStartedAt
- processingCompletedAt
- errorMessage
- createdAt
- updatedAt

### ProcessingJob
- id (cuid)
- videoId (FK → Video)
- type (TRANSCRIPTION | SCENE_DETECTION | AUDIO_ENHANCEMENT | VIDEO_ENHANCEMENT | EXPORT)
- status (PENDING | RUNNING | COMPLETED | FAILED)
- progress (float)
- input (json)
- output (json)
- errorMessage
- startedAt
- completedAt
- createdAt
- updatedAt

## AI Services Integration

### OpenAI Whisper (Transcription)
```typescript
POST https://api.openai.com/v1/audio/transcriptions
- model: whisper-1
- response_format: verbose_json
- timestamp_granularities: ['word']
```

### GPT-4 (Scene Detection & Quality Analysis)
```typescript
POST https://api.openai.com/v1/chat/completions
- model: gpt-4o
- response_format: { type: 'json_object' }
```

## Security Considerations

### Authentication
- JWT tokens with 30-day expiration
- Passwords hashed with bcrypt (10 rounds)
- Bearer token authentication for API requests

### File Upload
- File type validation (video/* only)
- File size limits (2GB default)
- Unique filename generation
- Isolated storage per user

### API Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting (planned)
- Input validation with Zod

## Performance Optimizations

### Frontend
- Client-side state management (Zustand)
- Optimistic updates
- Upload progress tracking
- Responsive design

### Backend
- Background job processing (BullMQ)
- Connection pooling (Prisma)
- Efficient file streaming
- Caching strategy (Redis)

### Database
- Indexed fields: userId, status
- Efficient queries with Prisma
- Connection pooling

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers
- Shared session storage (Redis)
- Load balancer ready
- Worker scaling with BullMQ

### Storage Scaling
- S3-compatible storage (MinIO/AWS S3)
- CDN integration (planned)
- Video compression
- Cleanup policies

### Processing Scaling
- Queue-based architecture
- Multiple workers
- Job prioritization
- Retry mechanisms

## Monitoring & Logging

### Logging
- Winston logger with structured logs
- Different log levels (debug, info, error)
- Request/response logging
- Error stack traces

### Future Monitoring
- Application metrics
- Job queue metrics
- Video processing analytics
- Error tracking (Sentry)

## Development vs Production

### Development
- Local file storage
- Local PostgreSQL/Redis/MinIO
- Debug logging
- Hot reload

### Production
- S3/CloudFront storage
- Managed PostgreSQL (RDS/Supabase)
- Managed Redis (ElastiCache/Upstash)
- Production logging
- Environment-based configuration
