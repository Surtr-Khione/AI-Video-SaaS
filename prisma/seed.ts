import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding pricing tiers...')

  // Free tier
  await prisma.pricingTier.upsert({
    where: { slug: 'free' },
    update: {},
    create: {
      name: 'Free',
      slug: 'free',
      description: 'Perfect for trying out our AI video tools',
      priceMonthly: 0,
      features: JSON.stringify([
        '10 video generations per month',
        '50 image generations per month',
        '100 text generations per month',
        'Basic support',
        'Watermarked videos',
      ]),
      videoGenerations: 10,
      imageGenerations: 50,
      textGenerations: 100,
      payPerUseEnabled: false,
      isActive: true,
    },
  })

  // Starter tier
  await prisma.pricingTier.upsert({
    where: { slug: 'starter' },
    update: {},
    create: {
      name: 'Starter',
      slug: 'starter',
      description: 'For individuals and small projects',
      priceMonthly: 2900, // $29
      features: JSON.stringify([
        '100 video generations per month',
        '500 image generations per month',
        '1000 text generations per month',
        'Pay-per-use AI features',
        'No watermarks',
        'Email support',
        'HD video quality',
      ]),
      videoGenerations: 100,
      imageGenerations: 500,
      textGenerations: 1000,
      payPerUseEnabled: true,
      stripePriceId: process.env.STRIPE_PRICE_STARTER || 'price_starter',
      isActive: true,
    },
  })

  // Pro tier
  await prisma.pricingTier.upsert({
    where: { slug: 'pro' },
    update: {},
    create: {
      name: 'Pro',
      slug: 'pro',
      description: 'For professionals and growing teams',
      priceMonthly: 7900, // $79
      features: JSON.stringify([
        '500 video generations per month',
        '2000 image generations per month',
        '5000 text generations per month',
        'Pay-per-use AI features (discounted rates)',
        'Priority processing',
        'Advanced editing tools',
        '4K video quality',
        'API access',
        'Priority support',
      ]),
      videoGenerations: 500,
      imageGenerations: 2000,
      textGenerations: 5000,
      payPerUseEnabled: true,
      stripePriceId: process.env.STRIPE_PRICE_PRO || 'price_pro',
      isActive: true,
    },
  })

  // Enterprise tier
  await prisma.pricingTier.upsert({
    where: { slug: 'enterprise' },
    update: {},
    create: {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'For large teams and businesses',
      priceMonthly: 29900, // $299
      features: JSON.stringify([
        'Unlimited video generations',
        'Unlimited image generations',
        'Unlimited text generations',
        'Pay-per-use AI features (best rates)',
        'Dedicated infrastructure',
        'Custom models',
        '8K video quality',
        'White-label options',
        'Advanced API access',
        'Dedicated support',
        'SLA guarantee',
      ]),
      videoGenerations: -1, // -1 means unlimited
      imageGenerations: -1,
      textGenerations: -1,
      payPerUseEnabled: true,
      stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
      isActive: true,
    },
  })

  console.log('Pricing tiers seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
