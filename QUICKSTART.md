# Quick Start Guide

This guide will help you get the AI Video SaaS Analytics Platform up and running quickly.

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- PostgreSQL 14+ running
- Redis 6+ running
- Social media platform API credentials (at least one platform to start)

## Step-by-Step Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd AI-Video-SaaS
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your database and API credentials:

```env
# Required - Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_video_saas"
REDIS_URL="redis://localhost:6379"

# Required - Server
PORT=3000
JWT_SECRET="your-secret-key-here"

# Optional - Add platform credentials as you integrate them
YOUTUBE_API_KEY="your-key"
FACEBOOK_ACCESS_TOKEN="your-token"
# ... etc
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Optional: Open Prisma Studio to view database
npm run prisma:studio
```

### 4. Create Storage Directories

```bash
mkdir -p /var/videos /var/training-data
# Or use local directories in development
mkdir -p ./storage/videos ./storage/training-data
```

Update `.env` if using local storage:
```env
VIDEO_STORAGE_PATH=./storage/videos
TRAINING_DATA_EXPORT_PATH=./storage/training-data
```

### 5. Start the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

### 6. Verify Installation

Check the health endpoint:
```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## First Steps

### 1. Create a User (Manual DB Insert)

For now, you'll need to create a user directly in the database:

```sql
INSERT INTO "User" (id, email, "passwordHash", name)
VALUES (
  gen_random_uuid(),
  'your-email@example.com',
  '$2b$10$YourHashedPasswordHere',
  'Your Name'
);
```

### 2. Generate an API Key

```sql
INSERT INTO "ApiKey" (id, "userId", key, name)
VALUES (
  gen_random_uuid(),
  'your-user-id-from-above',
  'your-api-key-here',
  'Development Key'
);
```

### 3. Connect a Social Media Account

```bash
curl -X POST http://localhost:3000/api/social-media/accounts \
  -H "x-api-key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "YOUTUBE",
    "accountId": "your-channel-id",
    "accountName": "My Channel",
    "accessToken": "your-access-token",
    "refreshToken": "your-refresh-token"
  }'
```

### 4. Upload Your First Video

```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -H "x-api-key: your-api-key-here" \
  -F "video=@/path/to/video.mp4" \
  -F "title=My First Video" \
  -F "duration=180"
```

### 5. Register a Social Media Post

After posting your video to a social platform:

```bash
curl -X POST http://localhost:3000/api/social-media/posts \
  -H "x-api-key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "video-id-from-upload",
    "socialMediaAccountId": "account-id-from-step-3",
    "platform": "YOUTUBE",
    "platformPostId": "youtube-video-id",
    "postUrl": "https://youtube.com/watch?v=...",
    "publishedAt": "2024-01-01T12:00:00Z"
  }'
```

### 6. Sync Analytics

```bash
curl -X POST http://localhost:3000/api/analytics/sync \
  -H "x-api-key: your-api-key-here"
```

### 7. View Analytics

Get video analytics summary:
```bash
curl http://localhost:3000/api/analytics/video/your-video-id \
  -H "x-api-key: your-api-key-here"
```

Get viral videos:
```bash
curl http://localhost:3000/api/analytics/viral-videos \
  -H "x-api-key: your-api-key-here"
```

## Platform-Specific Setup

### YouTube

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3 and YouTube Analytics API
4. Create OAuth 2.0 credentials
5. Get your access token and refresh token
6. Add to `.env`:
```env
YOUTUBE_API_KEY=your-api-key
YOUTUBE_CLIENT_ID=your-client-id
YOUTUBE_CLIENT_SECRET=your-client-secret
YOUTUBE_REFRESH_TOKEN=your-refresh-token
```

### Facebook/Instagram

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login and Instagram Graph API products
4. Get a long-lived access token
5. Add to `.env`:
```env
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
FACEBOOK_ACCESS_TOKEN=your-access-token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your-instagram-account-id
```

### LinkedIn

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create an app
3. Request access to Marketing Developer Platform
4. Generate access token
5. Add to `.env`:
```env
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-client-secret
LINKEDIN_ACCESS_TOKEN=your-access-token
```

### X (Twitter)

1. Go to [X Developer Portal](https://developer.twitter.com/)
2. Create a project and app
3. Generate API keys and access tokens
4. Ensure you have v2 API access
5. Add to `.env`:
```env
X_API_KEY=your-api-key
X_API_SECRET=your-api-secret
X_ACCESS_TOKEN=your-access-token
X_ACCESS_SECRET=your-access-secret
X_BEARER_TOKEN=your-bearer-token
```

## Automated Analytics Sync

In production, scheduled jobs will automatically:
- Sync analytics every hour (configurable)
- Calculate virality scores
- Generate training data points
- Update system metrics daily

To run manual sync:
```bash
npm run analytics:sync
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env`
- Ensure database exists: `createdb ai_video_saas`

### Redis Connection Issues
- Verify Redis is running: `redis-cli ping`
- Check REDIS_URL in `.env`

### API Rate Limits
- Social media platforms have rate limits
- The system will log rate limit errors
- Increase sync interval if hitting limits frequently

### Missing Dependencies
```bash
npm install
npm run prisma:generate
```

## Next Steps

1. Set up authentication system for your users
2. Integrate with your AI video generation pipeline
3. Configure scheduled jobs for your timezone
4. Set up monitoring and alerting
5. Deploy to production environment

## Support

For issues and questions, refer to the main README.md or create an issue on GitHub.
