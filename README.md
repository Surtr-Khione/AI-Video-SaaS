# AI Video SaaS - Viral Marketing Platform

A comprehensive AI Video SaaS platform with advanced viral marketing features designed to maximize user growth and viral coefficient.

## Features

### Viral Marketing System

This platform includes a complete viral growth engine with the following features:

#### 1. Referral System
- **Unique Referral Codes**: Each user gets a unique 8-character referral code
- **Automatic Tracking**: Track all referrals and conversions automatically
- **Multi-tier Rewards**:
  - Referrer gets 100 credits per signup
  - New user gets 50 bonus credits
  - Additional rewards for active referrals

#### 2. Rewards & Credits System
- **Action-based Rewards**:
  - Share on social media: 10 credits
  - Send email invite: 10 credits
  - Friend signs up: 100 credits
  - Friend becomes active: 50 bonus credits
- **Milestone Rewards**:
  - 5 referrals: 250 credits
  - 10 referrals: 500 credits
  - 25 referrals: 1,500 credits
  - 50 referrals: 3,000 credits
  - 100 referrals: 10,000 credits

#### 3. Viral Loops
- **Feature Gating**: Unlock premium features by referring friends
- **Default Unlock**: 3 referrals unlock all premium features
- **Premium Features Include**:
  - HD Video Export
  - Advanced AI Filters
  - Custom Branding
  - Priority Processing
  - API Access

#### 4. Gamification
- **Tier System**: Free → Bronze → Silver → Gold → Platinum
- **Viral Score**: Track user engagement and viral impact
- **Leaderboards**: Global rankings with top referrers
- **Achievements**: Unlock badges and rewards

#### 5. Social Sharing
- **One-Click Sharing**: Twitter, Facebook, LinkedIn integration
- **Email Invitations**: Bulk email invite system
- **Tracked Links**: Monitor clicks and conversions
- **Share Rewards**: Earn credits for every share

#### 6. Analytics & Tracking
- **Viral Coefficient Calculation**: Real-time K-factor tracking
- **Conversion Rate Monitoring**: Track invite-to-signup conversion
- **User Activity Tracking**: Comprehensive viral action logging
- **Historical Data**: 30-day analytics history

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Email**: Nodemailer

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd AI-Video-SaaS
npm install
```

### 2. Database Setup

Create a PostgreSQL database and update the `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_video_saas"
```

### 3. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Configure Environment Variables

Update `.env` with all required values:

- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `EMAIL_*`: Configure your email service (optional)
- `NEXT_PUBLIC_APP_URL`: Your app URL

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app.

## Viral Marketing Configuration

### Customizing Rewards

Edit `lib/utils.ts` to customize reward amounts:

```typescript
export function getCreditsForAction(action: string): number {
  const creditMap: Record<string, number> = {
    referral_signup: 100,      // Change this value
    referral_conversion: 50,   // Change this value
    share_social: 10,          // Change this value
    // ... etc
  }
  return creditMap[action] || 0
}
```

### Customizing Unlock Threshold

Edit the `VIRAL_UNLOCK_THRESHOLD` in `.env`:

```env
VIRAL_UNLOCK_THRESHOLD=3
```

Or pass it directly to the `ViralLoop` component in `app/dashboard/page.tsx`:

```tsx
<ViralLoop
  currentReferrals={user.totalReferrals}
  unlockThreshold={5}  // Change this number
  hasUnlockedPremium={user.hasUnlockedPremium}
/>
```

### Customizing Tier Thresholds

Edit `lib/utils.ts`:

```typescript
export function getTierFromReferrals(referrals: number): string {
  if (referrals >= 100) return 'platinum'
  if (referrals >= 50) return 'gold'
  if (referrals >= 20) return 'silver'
  if (referrals >= 5) return 'bronze'
  return 'free'
}
```

## API Endpoints

### Referral System

- `GET /api/referral/stats` - Get user's referral statistics
- `POST /api/referral/invite` - Send email invitations
- `POST /api/referral/share` - Track social shares
- `GET /api/referral/leaderboard` - Get global leaderboard

### Analytics

- `GET /api/analytics/viral-coefficient` - Get viral coefficient data
- `POST /api/analytics/viral-coefficient` - Calculate current viral coefficient

### Authentication

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

## Database Schema

### Key Models

- **User**: Core user data with viral marketing fields
- **Referral**: Tracked through user relationships
- **Invite**: Email invitation tracking
- **Reward**: User rewards and credits
- **ViralAction**: All viral activities logged
- **Share**: Social sharing tracking
- **Achievement**: Gamification achievements
- **ViralCoefficient**: Daily viral metrics

## Maximizing Viral Coefficient

The viral coefficient (K-factor) is calculated as:

```
K = invites_per_user × conversion_rate
```

To maximize viral growth:

1. **Increase Invites Per User**:
   - Make sharing easy and prominent
   - Offer compelling rewards
   - Create multiple touchpoints for sharing

2. **Improve Conversion Rate**:
   - Optimize signup flow
   - Provide value to referred users
   - Remove friction from onboarding

3. **Target K > 1**:
   - K > 1 = Viral growth (exponential)
   - K = 1 = Steady growth (linear)
   - K < 1 = Declining growth

## Viral Loop Strategy

This platform implements multiple viral loops:

1. **Signup Loop**: New users get credits, encouraging first action
2. **Feature Loop**: Locked features motivate referrals
3. **Reward Loop**: Credits create ongoing engagement
4. **Social Loop**: Leaderboards drive competition
5. **Achievement Loop**: Badges encourage continued participation

## Best Practices

1. **Test Thoroughly**: A/B test reward amounts and unlock thresholds
2. **Monitor Metrics**: Track viral coefficient daily
3. **Optimize Email**: Email deliverability is crucial for invites
4. **Reduce Friction**: Make sharing as easy as possible
5. **Provide Value**: Ensure referred users get immediate value
6. **Iterate**: Continuously optimize based on data

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Environment Variables

Set all environment variables in your deployment platform:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- Email configuration (if using)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
