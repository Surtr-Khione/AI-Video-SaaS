# AI Video SaaS - Enterprise Social Media Analytics Platform

A comprehensive enterprise-level analytics platform for AI-generated videos that tracks performance across multiple social media platforms, identifies viral content, and generates training data to improve video production.

## Features

### 🎯 Multi-Platform Integration
- **Facebook**: Track video views, likes, comments, shares, impressions, and engagement rates
- **Instagram**: Monitor reels and video posts with detailed insights
- **LinkedIn**: Analyze professional content performance
- **YouTube**: Comprehensive analytics including watch time, retention, and demographics
- **X (Twitter)**: Track video views, engagement, and impressions

### 📊 Advanced Analytics
- **Real-time Performance Tracking**: Monitor video performance across all platforms
- **Engagement Metrics**: Calculate weighted engagement scores based on likes, comments, shares, and saves
- **View Analytics**: Track both hosted video views and social media views
- **Demographic Insights**: Understand your audience by location, age, and interests
- **Traffic Source Analysis**: Identify where your views are coming from

### 🚀 Virality Detection
- **Virality Scoring Algorithm**: Sophisticated multi-factor scoring system
- **Velocity Metrics**: Track view, share, and comment velocity
- **Growth Rate Analysis**: Identify exponential growth patterns
- **Predictive Reach**: Estimate future video performance
- **Viral Classification**: Automatic categorization (Low, Medium, High, Viral, Super Viral)

### 🤖 AI Training Data Generation
- **Automated Data Collection**: Extract features from successful videos
- **Pattern Recognition**: Identify characteristics of viral and high-engagement content
- **Export Capabilities**: Generate training datasets in JSON format
- **Insights Dashboard**: Discover optimal posting times, content patterns, and platform preferences

### 📹 Video Hosting
- **Secure Video Storage**: Host and serve your videos
- **View Tracking**: Monitor who watches your videos and for how long
- **Completion Rates**: Measure audience retention
- **Geographic Analytics**: See where your viewers are located

## Architecture

### Tech Stack
- **Backend**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Job Queue**: Bull with Redis
- **Social Media APIs**: Official SDKs for each platform
- **Authentication**: JWT tokens and API keys

### Database Schema
The platform uses a comprehensive relational database schema including:
- **Users & Authentication**: User accounts and API keys
- **Videos**: Video metadata and storage information
- **VideoViews**: Individual view tracking with analytics
- **SocialMediaAccounts**: Connected social media profiles
- **SocialMediaPosts**: Cross-platform post references
- **SocialMediaAnalytics**: Time-series analytics data
- **EngagementMetrics**: Aggregated performance metrics
- **ViralityScores**: Virality analysis results
- **TrainingDataPoints**: ML training dataset

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/AI-Video-SaaS.git
cd AI-Video-SaaS
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up the database**
```bash
npm run prisma:migrate
npm run prisma:generate
```

5. **Create required directories**
```bash
mkdir -p /var/videos /var/training-data
```

6. **Start the server**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Configuration

### Environment Variables

#### Database
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_video_saas"
REDIS_URL="redis://localhost:6379"
```

#### Social Media Credentials

**Facebook/Instagram**
- Create an app at [Facebook Developers](https://developers.facebook.com/)
- Enable Instagram Graph API for Instagram integration
- Get long-lived access tokens

**LinkedIn**
- Create an app at [LinkedIn Developers](https://www.linkedin.com/developers/)
- Request access to Marketing Developer Platform

**YouTube**
- Create project at [Google Cloud Console](https://console.cloud.google.com/)
- Enable YouTube Data API v3 and YouTube Analytics API
- Create OAuth 2.0 credentials

**X (Twitter)**
- Apply for developer access at [X Developer Portal](https://developer.twitter.com/)
- Create an app and generate API keys
- Ensure you have access to v2 API endpoints

## API Documentation

### Authentication
All endpoints (except public view tracking) require authentication via:
- JWT Bearer token in `Authorization` header, OR
- API key in `x-api-key` header

### Endpoints

#### Videos

**Upload Video**
```http
POST /api/videos/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Fields:
- video: file
- title: string
- description: string (optional)
- duration: number (seconds)
- aiGeneratedMetadata: JSON string (optional)
```

**Track Video View**
```http
POST /api/videos/:videoId/view
Content-Type: application/json

{
  "watchDuration": 120,
  "completionRate": 0.85
}
```

**Get Video Analytics**
```http
GET /api/videos/:videoId/analytics
Authorization: Bearer {token}
```

#### Social Media

**Connect Social Media Account**
```http
POST /api/social-media/accounts
Authorization: Bearer {token}
Content-Type: application/json

{
  "platform": "YOUTUBE",
  "accountId": "channel_id",
  "accountName": "My Channel",
  "accessToken": "token",
  "refreshToken": "refresh",
  "tokenExpiry": "2024-12-31T23:59:59Z"
}
```

**Register Social Media Post**
```http
POST /api/social-media/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "videoId": "uuid",
  "socialMediaAccountId": "uuid",
  "platform": "YOUTUBE",
  "platformPostId": "video_id",
  "postUrl": "https://youtube.com/watch?v=...",
  "publishedAt": "2024-01-01T12:00:00Z"
}
```

#### Analytics

**Sync All Analytics**
```http
POST /api/analytics/sync
Authorization: Bearer {token}
```

**Get Video Analytics Summary**
```http
GET /api/analytics/video/:videoId
Authorization: Bearer {token}
```

**Get Top Performing Videos**
```http
GET /api/analytics/top-performing?limit=20
Authorization: Bearer {token}
```

**Calculate Virality Score**
```http
POST /api/analytics/virality/:videoId
Authorization: Bearer {token}
```

**Get Viral Videos**
```http
GET /api/analytics/viral-videos?limit=50
Authorization: Bearer {token}
```

**Export Training Dataset**
```http
POST /api/analytics/training/export
Authorization: Bearer {token}
Content-Type: application/json

{
  "minVideos": 100
}
```

**Get Training Insights**
```http
GET /api/analytics/training/insights
Authorization: Bearer {token}
```

## Virality Detection Algorithm

The platform uses a sophisticated multi-factor algorithm to detect viral content:

### Factors Analyzed
1. **View Velocity**: Views per day
2. **Share Velocity**: Shares per day
3. **Comment Velocity**: Comments per day
4. **Growth Acceleration**: Rate of change in growth
5. **Engagement Intensity**: Weighted engagement relative to views
6. **Cross-Platform Reach**: Number of platforms where posted
7. **Time to Threshold**: Speed of reaching milestone views

### Scoring
Each factor is normalized (0-1) and weighted:
- View Velocity: 25%
- Share Velocity: 20%
- Comment Velocity: 15%
- Growth Acceleration: 15%
- Engagement Intensity: 15%
- Cross-Platform Reach: 5%
- Time to Threshold: 5%

Final score (0-100) determines virality level:
- **Super Viral**: Score ≥80 + 1M+ views in 24h
- **Viral**: Score ≥60 + 100K+ views in 24h
- **High**: Score ≥40 + 10K+ views in 24h
- **Medium**: Score ≥20
- **Low**: Score <20

## Training Data Export

The platform generates comprehensive training datasets for AI model improvement:

### Data Points Collected
- **Video Features**: Duration, file size, platform distribution
- **Performance Metrics**: Views, engagements, rates
- **Virality Metrics**: Scores, velocity, growth patterns
- **Timing Features**: Publish time, day of week, time to viral
- **Audience Features**: Demographics, locations, traffic sources
- **Outcomes**: Success classification, engagement level, virality

### Export Format
```json
{
  "videoId": "uuid",
  "title": "Video Title",
  "features": {
    "duration": 180,
    "fileSize": 52428800,
    "platforms": ["YOUTUBE", "FACEBOOK"],
    "platformCount": 2
  },
  "performance": {
    "totalViews": 500000,
    "totalEngagements": 25000,
    "avgEngagementRate": 5.0
  },
  "virality": {
    "isViral": true,
    "viralityLevel": "VIRAL",
    "viralityScore": 75.5,
    "peakViews24h": 250000
  },
  "outcome": {
    "success": true,
    "highEngagement": true,
    "viral": true,
    "totalReach": 500000
  }
}
```

## Scheduled Jobs

The platform runs automated jobs for continuous analytics:

### Analytics Sync
- **Frequency**: Configurable (default: hourly)
- **Actions**: Fetch latest metrics from all platforms
- **Processing**: Update engagement scores and virality metrics
- **Training**: Generate training data points

### System Metrics
- **Frequency**: Daily
- **Actions**: Aggregate system-wide statistics
- **Metrics**: Total videos, views, engagements, viral count

## Best Practices

### Rate Limiting
- Social media APIs have rate limits
- The platform implements intelligent retry logic
- Spread requests across time to avoid throttling

### Security
- Never commit API keys to version control
- Use environment variables for all secrets
- Rotate access tokens regularly
- Implement proper CORS and rate limiting

### Performance
- Use pagination for large datasets
- Cache frequently accessed data
- Implement database indexing for analytics queries
- Use Redis for job queue management

## Monitoring

### Logs
- Application logs: `combined.log`
- Error logs: `error.log`
- Structured JSON logging with Winston

### Health Check
```http
GET /health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/AI-Video-SaaS/issues
- Documentation: https://docs.yourplatform.com

## Roadmap

- [ ] Real-time websocket updates
- [ ] Advanced AI model integration
- [ ] Automated content optimization suggestions
- [ ] TikTok integration
- [ ] Advanced demographic analysis
- [ ] A/B testing framework
- [ ] Custom reporting dashboards
- [ ] Mobile app
