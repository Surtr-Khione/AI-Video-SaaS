# AI Video SaaS

A complete user management SaaS platform for AI-powered video generation with flexible pricing tiers and pay-per-use AI features.

## Features

### User Management
- ✅ User registration and authentication with NextAuth.js
- ✅ Email/password authentication
- ✅ Secure password hashing with bcrypt
- ✅ Session management with JWT

### Pricing Tiers

#### 1. Free Tier
- 10 video generations per month
- 50 image generations per month
- 100 text generations per month
- Basic support
- Watermarked videos

#### 2. Starter Tier ($29/month)
- 100 video generations per month
- 500 image generations per month
- 1000 text generations per month
- Pay-per-use AI features
- No watermarks
- Email support
- HD video quality

#### 3. Pro Tier ($79/month)
- 500 video generations per month
- 2000 image generations per month
- 5000 text generations per month
- Pay-per-use AI features (20% discount)
- Priority processing
- Advanced editing tools
- 4K video quality
- API access
- Priority support

#### 4. Enterprise Tier ($299/month)
- Unlimited video generations
- Unlimited image generations
- Unlimited text generations
- Pay-per-use AI features (40% discount)
- Dedicated infrastructure
- Custom models
- 8K video quality
- White-label options
- Advanced API access
- Dedicated support
- SLA guarantee

### Pay-Per-Use AI Features
All paid tiers support pay-per-use features when monthly quotas are exceeded:
- **Video Generation**: $0.65 per video (cost $0.50 + 30% profit margin)
- **Image Generation**: $0.13 per image (cost $0.10 + 30% profit margin)
- **Text Generation**: $0.07 per request (cost $0.05 + 30% profit margin)

Pro and Enterprise tiers receive discounted rates on pay-per-use features.

### Subscription Management
- ✅ Stripe integration for payment processing
- ✅ Automatic subscription management
- ✅ Webhook handling for subscription events
- ✅ Automatic downgrade to free tier on cancellation

### AI Usage Tracking
- ✅ Real-time usage tracking for all AI features
- ✅ Cost calculation with configurable profit margins
- ✅ Usage statistics and billing dashboard
- ✅ Quota management per pricing tier

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Authentication**: NextAuth.js
- **Database**: Prisma ORM with SQLite (easily switchable to PostgreSQL)
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Validation**: Zod

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Stripe account for payments

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

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs
STRIPE_PRICE_STARTER="price_..."
STRIPE_PRICE_PRO="price_..."
STRIPE_PRICE_ENTERPRISE="price_..."

# AI Feature Costs (in cents)
AI_COST_VIDEO_GENERATION=50
AI_COST_IMAGE_GENERATION=10
AI_COST_TEXT_GENERATION=5

# Profit Margin (percentage)
AI_PROFIT_MARGIN=30
```

4. Set up the database:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Stripe Setup

1. Create products and prices in your Stripe Dashboard
2. Copy the price IDs to your `.env` file
3. Set up a webhook endpoint pointing to `https://your-domain.com/api/stripe/webhook`
4. Add the webhook secret to your `.env` file
5. Configure the webhook to listen for these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

## Database Schema

### User
- User accounts with email/password authentication
- Links to subscriptions and AI usage records

### PricingTier
- Defines available pricing plans
- Includes quotas and features for each tier

### Subscription
- User subscriptions to pricing tiers
- Tracks current period and usage
- Stripe subscription management

### AIUsage
- Records all pay-per-use AI feature usage
- Tracks costs and charges
- Historical billing data

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Subscription
- `GET /api/subscription` - Get user's subscription
- `GET /api/pricing` - Get all pricing tiers
- `POST /api/stripe/create-checkout` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Stripe webhook handler

### AI Usage
- `POST /api/ai/track-usage` - Track AI feature usage and handle billing
- `GET /api/ai/usage-stats` - Get usage statistics and billing info

## Usage Example

### Tracking AI Feature Usage

```typescript
// Track video generation usage
const response = await fetch('/api/ai/track-usage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    featureType: 'video_generation',
    metadata: {
      videoId: 'vid_123',
      duration: 30,
      resolution: '1080p'
    }
  })
})

const result = await response.json()
// {
//   success: true,
//   withinQuota: false,
//   charged: true,
//   chargeAmount: 65,
//   usage: 101,
//   quota: 100,
//   aiUsageId: "clx..."
// }
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy

### Database Migration for Production

For production, switch to PostgreSQL:

1. Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

2. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Run migrations:
```bash
npx prisma migrate deploy
npx prisma db seed
```

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
