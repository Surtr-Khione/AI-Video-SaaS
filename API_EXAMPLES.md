# API Examples

Complete examples for using the AI Video SaaS Analytics Platform API.

## Authentication

All requests (except view tracking) require authentication via API key or JWT token.

### Using API Key
```bash
curl -H "x-api-key: your-api-key-here" \
  http://localhost:3000/api/analytics/viral-videos
```

### Using JWT Token
```bash
curl -H "Authorization: Bearer your-jwt-token" \
  http://localhost:3000/api/analytics/viral-videos
```

## Complete Workflow Example

### 1. Upload a Video

```bash
VIDEO_RESPONSE=$(curl -X POST http://localhost:3000/api/videos/upload \
  -H "x-api-key: YOUR_API_KEY" \
  -F "video=@./my-video.mp4" \
  -F "title=Amazing AI Generated Video" \
  -F "description=This video was generated using AI" \
  -F "duration=180" \
  -F 'aiGeneratedMetadata={"model":"gpt-4","prompt":"Create a video about technology"}')

VIDEO_ID=$(echo $VIDEO_RESPONSE | jq -r '.id')
echo "Video ID: $VIDEO_ID"
```

### 2. Connect Social Media Account

```bash
ACCOUNT_RESPONSE=$(curl -X POST http://localhost:3000/api/social-media/accounts \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "YOUTUBE",
    "accountId": "UCxxxxxxxxxxxxx",
    "accountName": "My YouTube Channel",
    "accessToken": "ya29.xxxxxxxxxxxxx",
    "refreshToken": "1//xxxxxxxxxxxxx",
    "tokenExpiry": "2024-12-31T23:59:59Z"
  }')

ACCOUNT_ID=$(echo $ACCOUNT_RESPONSE | jq -r '.id')
echo "Account ID: $ACCOUNT_ID"
```

### 3. Register Social Media Post

After uploading to YouTube:

```bash
curl -X POST http://localhost:3000/api/social-media/posts \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"videoId\": \"$VIDEO_ID\",
    \"socialMediaAccountId\": \"$ACCOUNT_ID\",
    \"platform\": \"YOUTUBE\",
    \"platformPostId\": \"dQw4w9WgXcQ\",
    \"postUrl\": \"https://youtube.com/watch?v=dQw4w9WgXcQ\",
    \"publishedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }"
```

### 4. Sync Analytics

```bash
curl -X POST http://localhost:3000/api/analytics/sync \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"videoId\": \"$VIDEO_ID\"}"
```

### 5. Get Video Analytics

```bash
curl http://localhost:3000/api/analytics/video/$VIDEO_ID \
  -H "x-api-key: YOUR_API_KEY" | jq
```

Response:
```json
{
  "video": {
    "id": "uuid",
    "title": "Amazing AI Generated Video",
    "duration": 180,
    "status": "ACTIVE"
  },
  "hostedViews": 1523,
  "totalSocialViews": 45678,
  "totalViews": 47201,
  "platformBreakdown": [
    {
      "platform": "YOUTUBE",
      "views": 45678,
      "likes": 2341,
      "comments": 456,
      "shares": 123,
      "engagementScore": 5.67,
      "engagementPercentile": 85
    }
  ],
  "viralityScore": {
    "viralityLevel": "HIGH",
    "viralityScore": 67.5,
    "isViral": false
  }
}
```

### 6. Calculate Virality Score

```bash
curl -X POST http://localhost:3000/api/analytics/virality/$VIDEO_ID \
  -H "x-api-key: YOUR_API_KEY" | jq
```

### 7. Get Viral Videos

```bash
curl "http://localhost:3000/api/analytics/viral-videos?limit=10" \
  -H "x-api-key: YOUR_API_KEY" | jq
```

### 8. Export Training Data

```bash
curl -X POST http://localhost:3000/api/analytics/training/export \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"minVideos": 50}' | jq
```

Response:
```json
{
  "message": "Training dataset exported",
  "path": "/var/training-data/training-data-1704123456789.json"
}
```

### 9. Get Training Insights

```bash
curl http://localhost:3000/api/analytics/training/insights \
  -H "x-api-key: YOUR_API_KEY" | jq
```

Response:
```json
{
  "totalVideos": 237,
  "viralVideos": 12,
  "highEngagementVideos": 45,
  "viralityRate": 5.06,
  "platformPerformance": {
    "YOUTUBE": {
      "totalVideos": 150,
      "avgScore": 4.23,
      "viralCount": 8
    },
    "FACEBOOK": {
      "totalVideos": 87,
      "avgScore": 3.45,
      "viralCount": 4
    }
  },
  "timingAnalysis": {
    "bestPublishHour": 14,
    "bestPublishDay": 3
  },
  "readyForTraining": true
}
```

## Track Video Views (Public Endpoint)

This endpoint doesn't require authentication:

```javascript
// JavaScript example for video player
const videoElement = document.getElementById('video');
let watchStartTime = Date.now();

videoElement.addEventListener('ended', () => {
  const watchDuration = (Date.now() - watchStartTime) / 1000;
  const completionRate = watchDuration / videoElement.duration;

  fetch(`http://localhost:3000/api/videos/${VIDEO_ID}/view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      watchDuration: Math.floor(watchDuration),
      completionRate: completionRate
    })
  });
});
```

## Get User's Videos

```bash
curl "http://localhost:3000/api/videos/user/videos?skip=0&take=20" \
  -H "x-api-key: YOUR_API_KEY" | jq
```

## Get Video View Analytics

```bash
curl http://localhost:3000/api/videos/$VIDEO_ID/analytics \
  -H "x-api-key: YOUR_API_KEY" | jq
```

Response:
```json
{
  "totalViews": 1523,
  "uniqueViews": 1234,
  "averageWatchDuration": 145.6,
  "averageCompletionRate": 0.81,
  "viewsByCountry": {
    "US": 450,
    "GB": 234,
    "CA": 156
  },
  "viewsByReferrer": {
    "https://facebook.com": 678,
    "https://twitter.com": 345,
    "direct": 500
  },
  "viewsOverTime": [
    { "date": "2024-01-01", "count": 123 },
    { "date": "2024-01-02", "count": 234 }
  ]
}
```

## Get Top Performing Videos

```bash
curl "http://localhost:3000/api/analytics/top-performing?limit=20" \
  -H "x-api-key: YOUR_API_KEY" | jq
```

## Bulk Operations

### Sync All Platform Analytics

```bash
# Sync all videos across all platforms
curl -X POST http://localhost:3000/api/analytics/sync \
  -H "x-api-key: YOUR_API_KEY"
```

### Generate Training Data for All Videos

```bash
# This is done automatically during sync, but can be triggered manually
for video_id in $(curl http://localhost:3000/api/videos/user/videos \
  -H "x-api-key: YOUR_API_KEY" | jq -r '.[].id'); do
  curl -X POST http://localhost:3000/api/analytics/training/generate/$video_id \
    -H "x-api-key: YOUR_API_KEY"
done
```

## Error Handling

All endpoints return standard HTTP status codes:

- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:
```json
{
  "error": "Description of the error"
}
```

## Rate Limiting

The API implements rate limiting:
- 100 requests per 15 minutes per IP address
- Returns `429 Too Many Requests` when exceeded

## Webhooks (Future Feature)

Coming soon: Real-time webhooks for:
- New analytics data available
- Video goes viral
- High engagement detected
- Training data ready
