# 🔌 AI Provider Integration Guide

This guide provides detailed information about integrating with each AI video provider.

## 🎯 Provider Comparison

| Provider | Text-to-Video | Image-to-Video | Video Editing | Max Duration | Est. Cost/sec | Quality | Speed |
|----------|---------------|----------------|---------------|--------------|---------------|---------|-------|
| **Google Veo 3** | ✅ | ✅ | ❌ | 60s | $0.15 | ⭐⭐⭐⭐⭐ | Medium |
| **OpenAI Sora** | ✅ | ✅ | ❌ | 60s | $0.20 | ⭐⭐⭐⭐⭐ | Slow |
| **Runway ML** | ✅ | ✅ | ✅ | 10s | $0.50 | ⭐⭐⭐⭐ | Fast |
| **Replicate** | ✅ | ✅ | ✅ | 60s | $0.10 | ⭐⭐⭐ | Medium |

## 1. Google Veo 3

Google's latest video generation model with exceptional quality and consistency.

### Setup Options

#### Option A: Google AI Studio (Easiest)

1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Click "Get API Key"
3. Create a new API key
4. Add to `.env`:
   ```env
   GOOGLE_API_KEY="AIza..."
   ENABLE_GOOGLE_VEO=true
   ```

#### Option B: Vertex AI (Production)

1. Create a Google Cloud project
2. Enable Vertex AI API
3. Create a service account:
   ```bash
   gcloud iam service-accounts create ai-video-sa
   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="serviceAccount:ai-video-sa@PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```
4. Download service account key (JSON)
5. Add to `.env`:
   ```env
   GOOGLE_CLOUD_PROJECT_ID="your-project-id"
   GOOGLE_CLOUD_LOCATION="us-central1"
   GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
   ENABLE_GOOGLE_VEO=true
   ```

### Features

- **Resolution**: Up to 1920x1080
- **Duration**: 1-60 seconds
- **Aspect Ratios**: 16:9, 9:16, 1:1, 4:3
- **Capabilities**: Text-to-video, image-to-video

### Example Request

```typescript
{
  "type": "text-to-video",
  "prompt": "A majestic eagle soaring through mountain peaks at sunset",
  "duration": 10,
  "aspectRatio": "16:9",
  "provider": "google_veo"
}
```

### API Limits

- Free tier: 50 requests/day
- Paid tier: Custom limits
- Generation time: ~1-2 minutes per video

---

## 2. OpenAI Sora

OpenAI's highly sophisticated text-to-video model with photorealistic output.

### Setup

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Go to API Keys
3. Create new secret key
4. Add to `.env`:
   ```env
   OPENAI_API_KEY="sk-..."
   OPENAI_ORG_ID="org-..." # Optional
   ENABLE_OPENAI_SORA=true
   ```

**Important**: Sora is currently in limited preview. You may need to join a waitlist.

### Features

- **Resolution**: Up to 1920x1080 (HD)
- **Duration**: 1-60 seconds
- **Aspect Ratios**: 16:9, 9:16, 4:3, 1:1
- **Capabilities**: Text-to-video, image-to-video

### Example Request

```typescript
{
  "type": "text-to-video",
  "prompt": "A serene Japanese garden with cherry blossoms falling into a koi pond",
  "duration": 8,
  "resolution": "1920x1080",
  "provider": "openai_sora"
}
```

### API Limits

- Varies by tier
- Generation time: ~2-3 minutes per video
- Highest quality but slowest

---

## 3. Runway ML

Industry-leading Gen-3 Alpha model, fast and reliable.

### Setup

1. Sign up at [Runway ML](https://runwayml.com/)
2. Go to Settings → API Keys
3. Generate new API key
4. Add to `.env`:
   ```env
   RUNWAY_API_KEY="your-key"
   RUNWAY_API_SECRET="your-secret" # Optional
   ENABLE_RUNWAY=true
   ```

### Features

- **Models**: Gen-3 Alpha Turbo, Gen-3 Alpha
- **Resolution**: 1280x768, 768x1280, 1024x1024
- **Duration**: 5-10 seconds
- **Capabilities**: Text-to-video, image-to-video, video-to-video

### Example Request

```typescript
{
  "type": "image-to-video",
  "prompt": "Camera slowly zooms into the subject",
  "sourceImage": "https://example.com/image.jpg",
  "duration": 5,
  "aspectRatio": "16:9",
  "provider": "runway_ml"
}
```

### API Limits

- Credits-based system
- Gen-3 Turbo: Faster, good quality
- Gen-3 Alpha: Slower, best quality
- Generation time: ~30-60 seconds

---

## 4. Replicate

Access to multiple open-source video models.

### Setup

1. Sign up at [Replicate](https://replicate.com/)
2. Go to Account → API Tokens
3. Create new token
4. Add to `.env`:
   ```env
   REPLICATE_API_TOKEN="r8_..."
   ENABLE_REPLICATE=true
   ```

### Available Models

#### Stable Video Diffusion (Image-to-Video)
- Best for image-to-video
- Duration: Up to 3 seconds (25 frames)
- High quality, open-source

#### Zeroscope V2 (Text-to-Video)
- Good for text-to-video
- Duration: Up to 3 seconds
- Fast generation

#### AnimateDiff
- Animation-style videos
- Customizable styles

### Example Request

```typescript
{
  "type": "image-to-video",
  "sourceImage": "https://example.com/landscape.jpg",
  "duration": 3,
  "fps": 8,
  "provider": "replicate",
  "options": {
    "model": "stability-ai/stable-video-diffusion",
    "motionBucketId": 127,
    "condAug": 0.02
  }
}
```

### API Limits

- Pay-per-use pricing
- Most cost-effective option
- Generation time: ~1-2 minutes
- Can specify custom models

---

## 🛠️ Provider-Specific Options

### Google Veo 3 Options

```typescript
{
  "guidanceScale": 7.5,  // How closely to follow prompt (1-20)
  "seed": 42,            // Reproducible results
  "negativePrompt": "blurry, low quality"
}
```

### OpenAI Sora Options

```typescript
{
  "quality": "hd",       // "standard" or "hd"
  "seed": 42
}
```

### Runway ML Options

```typescript
{
  "model": "gen3a_turbo",  // or "gen3a"
  "seed": 42,
  "watermark": false
}
```

### Replicate Options

```typescript
{
  "model": "stability-ai/stable-video-diffusion",
  "motionBucketId": 127,     // Motion amount (1-255)
  "condAug": 0.02,           // Conditioning augmentation
  "steps": 25                // Inference steps
}
```

---

## 🔄 Auto Provider Selection

When `provider: "auto"` is used, the system selects based on:

1. **Capability Match**: Does provider support the requested type?
2. **Priority Order**:
   - Google Veo 3 (best quality)
   - OpenAI Sora (photorealistic)
   - Runway ML (fast, reliable)
   - Replicate (cost-effective)
3. **Availability**: Is the provider configured?

---

## 💰 Cost Optimization

### Tips for Reducing Costs

1. **Use Replicate for testing** - Most cost-effective
2. **Limit duration** - Shorter videos = lower cost
3. **Use Runway Turbo** - Faster and cheaper than Alpha
4. **Batch requests** - Queue multiple jobs
5. **Cache results** - Store generated videos

### Estimated Costs (5-second video)

- Google Veo 3: ~$0.75
- OpenAI Sora: ~$1.00
- Runway ML: ~$2.50
- Replicate: ~$0.50

---

## 🚨 Error Handling

All providers implement automatic retry logic with exponential backoff:

```typescript
{
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid API key | Check `.env` configuration |
| 402 Payment Required | Insufficient credits | Add credits to account |
| 429 Rate Limited | Too many requests | Wait or increase limits |
| 503 Service Unavailable | Provider down | Try different provider |

---

## 📊 Monitoring

Track provider performance in `JobLog` table:

```sql
SELECT
  provider,
  COUNT(*) as total_jobs,
  AVG(processing_time_ms) as avg_time,
  SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as successful
FROM job_logs
GROUP BY provider;
```

---

## 🔮 Future Providers

Potential providers to add:

- **Stability AI** - Direct Stable Diffusion access
- **Pika Labs** - High-quality video generation
- **HeyGen** - Avatar and talking head videos
- **D-ID** - Face animation
- **Synthesia** - AI presenters

---

## 📝 Best Practices

1. **Always validate input** - Use schema validation
2. **Set timeouts** - Prevent hanging requests
3. **Log everything** - Track usage and costs
4. **Handle webhooks** - For async completion
5. **Cache results** - Avoid regenerating same content
6. **Monitor costs** - Set up alerts for budget limits
7. **Test providers separately** - Use provider-specific test mode
8. **Implement fallbacks** - Auto-switch if provider fails

---

## 🆘 Troubleshooting

### Google Veo 3 Not Working

- Check API key is valid
- Verify project has Vertex AI enabled
- Ensure service account has correct permissions
- Check quota limits in Google Cloud Console

### OpenAI Sora Access Denied

- Sora is in limited preview
- Join the waitlist at OpenAI
- Use alternative providers meanwhile

### Runway ML Credit Issues

- Add credits at runwayml.com/billing
- Check credit balance in dashboard
- Set up auto-recharge

### Replicate Slow Performance

- Some models take longer
- Consider using faster models
- Check Replicate status page

---

For more help, check the main README.md or open an issue on GitHub.
