# System Architecture

## Overview

The AI Video SaaS Analytics Platform is built with a modular, enterprise-grade architecture designed for scalability, reliability, and maintainability.

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3+
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Cache/Queue**: Redis 6+
- **Logging**: Winston
- **Authentication**: JWT + API Keys

### External Integrations
- **YouTube**: Google APIs (OAuth 2.0)
- **Facebook/Instagram**: Graph API
- **LinkedIn**: Marketing Developer Platform API
- **X (Twitter)**: API v2

## System Components

### 1. Core Services (`/src/services`)

#### Analytics Service (`analytics.service.ts`)
- **Purpose**: Orchestrates analytics data collection and processing
- **Key Functions**:
  - `syncAllPlatformAnalytics()`: Fetch analytics from all connected platforms
  - `syncPostAnalytics()`: Sync individual post analytics
  - `updateEngagementMetrics()`: Calculate and store engagement scores
  - `getVideoAnalyticsSummary()`: Aggregate cross-platform analytics
  - `calculateEngagementScore()`: Weighted engagement calculation

#### Video Hosting Service (`video-hosting.service.ts`)
- **Purpose**: Manage hosted videos and view tracking
- **Key Functions**:
  - `createVideo()`: Upload and store video metadata
  - `trackView()`: Record individual video views
  - `getVideoViewAnalytics()`: Generate view analytics reports
  - `deleteVideo()`: Remove videos and associated files

#### Virality Service (`virality.service.ts`)
- **Purpose**: Detect and analyze viral content
- **Key Functions**:
  - `calculateViralityScore()`: Multi-factor virality analysis
  - `calculateVelocityMetrics()`: Growth rate calculations
  - `determineViralityLevel()`: Classify virality level
  - `detectViralStartDate()`: Identify when content went viral
  - `predictReach()`: Forecast future performance

#### Training Data Service (`training-data.service.ts`)
- **Purpose**: Generate ML training datasets
- **Key Functions**:
  - `generateTrainingDataPoint()`: Extract features from video performance
  - `exportTrainingDataset()`: Create JSON export for ML models
  - `getTrainingInsights()`: Analyze patterns in successful content
  - `analyzeTimingPatterns()`: Identify optimal posting times
  - `analyzeContentPatterns()`: Extract successful content characteristics

### 2. Platform Integrations (`/src/services/platforms`)

Each platform service implements:
- API authentication
- Analytics data fetching
- Rate limit handling
- Error recovery

#### YouTube Service
- Video statistics and analytics
- Audience demographics
- Geographic data
- Traffic sources

#### Facebook Service
- Video insights
- Engagement metrics
- Impression tracking
- Instagram integration

#### LinkedIn Service
- Professional content analytics
- Share statistics
- Engagement tracking

#### X Service
- Tweet metrics
- Video view counts
- Engagement data

### 3. API Layer (`/src/routes`)

#### Analytics Routes (`analytics.routes.ts`)
- `POST /api/analytics/sync` - Trigger analytics sync
- `GET /api/analytics/video/:videoId` - Get video analytics
- `GET /api/analytics/top-performing` - Top videos
- `POST /api/analytics/virality/:videoId` - Calculate virality
- `GET /api/analytics/viral-videos` - List viral content
- `POST /api/analytics/training/export` - Export training data
- `GET /api/analytics/training/insights` - Get insights

#### Video Routes (`videos.routes.ts`)
- `POST /api/videos/upload` - Upload video
- `POST /api/videos/:videoId/view` - Track view (public)
- `GET /api/videos/:videoId` - Get video details
- `GET /api/videos/:videoId/analytics` - View analytics
- `GET /api/videos/user/videos` - List user's videos
- `DELETE /api/videos/:videoId` - Delete video

#### Social Media Routes (`social-media.routes.ts`)
- `POST /api/social-media/accounts` - Connect account
- `GET /api/social-media/accounts` - List accounts
- `PUT /api/social-media/accounts/:id` - Update account
- `DELETE /api/social-media/accounts/:id` - Remove account
- `POST /api/social-media/posts` - Register post
- `GET /api/social-media/posts/video/:videoId` - Get video's posts

### 4. Background Jobs (`/src/jobs`)

#### Analytics Sync Job
- **Schedule**: Configurable (default: hourly)
- **Tasks**:
  1. Fetch latest analytics from all platforms
  2. Update engagement metrics
  3. Calculate virality scores
  4. Generate training data points
- **Error Handling**: Logs failures, continues processing other videos

#### System Metrics Job
- **Schedule**: Daily
- **Tasks**:
  1. Aggregate system-wide statistics
  2. Calculate platform performance
  3. Identify top performing content
  4. Store historical metrics

## Database Schema

### Core Tables

#### Users
- Authentication and authorization
- Profile information
- API key management

#### Videos
- Video metadata and storage
- AI generation parameters
- Processing status

#### VideoViews
- Individual view tracking
- Geographic data
- Engagement metrics (watch time, completion)

#### SocialMediaAccounts
- Platform connections
- OAuth tokens
- Account metadata

#### SocialMediaPosts
- Cross-platform post references
- Publishing timestamps
- Platform-specific IDs

#### SocialMediaAnalytics (Time-series)
- Periodic snapshots of performance
- Platform-specific metrics
- Demographic data
- Traffic sources

#### EngagementMetrics
- Aggregated per-video, per-platform metrics
- Calculated engagement scores
- Percentile rankings

#### ViralityScores
- Multi-factor virality analysis
- Growth metrics
- Predictions

#### TrainingDataPoints
- Feature extraction
- Performance outcomes
- Pattern data for ML

## Data Flow

### 1. Video Upload Flow
```
User -> Upload Video -> Store File -> Create DB Record -> Return Video ID
```

### 2. Social Media Publishing Flow
```
User Publishes -> Register Post -> Link Video -> Queue Analytics Sync
```

### 3. Analytics Collection Flow
```
Scheduled Job -> For Each Post -> Fetch Platform Analytics ->
Store Snapshot -> Update Aggregated Metrics -> Calculate Virality ->
Generate Training Data
```

### 4. Virality Detection Flow
```
Get Video Data -> Calculate Velocity Metrics -> Analyze Growth Patterns ->
Compute Multi-factor Score -> Classify Virality Level -> Predict Reach
```

### 5. Training Data Flow
```
Collect Video Features -> Aggregate Performance Data ->
Extract Patterns -> Export Dataset -> ML Model Training
```

## Security Architecture

### Authentication Layers
1. **JWT Tokens**: User session authentication
2. **API Keys**: Service-to-service authentication
3. **OAuth 2.0**: Social media platform authentication

### Security Features
- Helmet.js for HTTP security headers
- CORS configuration
- Rate limiting (100 req/15min)
- Input validation with Zod
- SQL injection prevention via Prisma
- File upload restrictions

### Data Protection
- Sensitive credentials in environment variables
- Token encryption in database
- Secure file storage paths
- API key rotation support

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Redis for shared session state
- Database connection pooling
- Job queue distribution

### Performance Optimization
- Database indexing on frequently queried fields
- Pagination for large datasets
- Caching with Redis
- Async processing for analytics

### Monitoring & Observability
- Structured logging with Winston
- Error tracking and alerting
- Performance metrics
- Health check endpoints

## Deployment Architecture

### Recommended Setup

```
Load Balancer
    |
    +-- App Server 1 (Node.js + Express)
    +-- App Server 2 (Node.js + Express)
    +-- App Server N (Node.js + Express)
    |
    +-- PostgreSQL (Primary + Replicas)
    +-- Redis (Cluster)
    +-- File Storage (S3 or equivalent)
```

### Environment Separation
- **Development**: Local PostgreSQL, Redis
- **Staging**: Managed databases, separate platform credentials
- **Production**: High-availability setup, read replicas, backup strategies

## Extension Points

### Adding New Platforms
1. Create service in `/src/services/platforms/`
2. Implement analytics interface
3. Add platform enum to Prisma schema
4. Update analytics service orchestration

### Custom Analytics Metrics
1. Add fields to `EngagementMetrics` model
2. Update calculation in `analytics.service.ts`
3. Extend training data extraction

### AI Model Integration
1. Consume training data exports
2. Generate predictions
3. Feed back into system for optimization

## Future Enhancements

- Real-time WebSocket updates
- Advanced caching strategies
- Machine learning model deployment
- Automated A/B testing framework
- Advanced anomaly detection
- Custom dashboard builder
