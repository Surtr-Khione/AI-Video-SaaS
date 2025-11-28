import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      include: { pricingTier: true },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 400 }
      )
    }

    const aiUsage = await prisma.aIUsage.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: subscription.currentPeriodStart,
          lte: subscription.currentPeriodEnd,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const totalCost = aiUsage.reduce((sum, usage) => sum + usage.totalCharge, 0)

    const usageByType = {
      video_generation: aiUsage.filter((u) => u.featureType === 'video_generation'),
      image_generation: aiUsage.filter((u) => u.featureType === 'image_generation'),
      text_generation: aiUsage.filter((u) => u.featureType === 'text_generation'),
    }

    return NextResponse.json({
      subscription: {
        tier: subscription.pricingTier.name,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      usage: {
        videos: {
          used: subscription.videoGenerationsUsed,
          quota:
            subscription.pricingTier.videoGenerations === -1
              ? 'unlimited'
              : subscription.pricingTier.videoGenerations,
          payPerUse: usageByType.video_generation.length,
        },
        images: {
          used: subscription.imageGenerationsUsed,
          quota:
            subscription.pricingTier.imageGenerations === -1
              ? 'unlimited'
              : subscription.pricingTier.imageGenerations,
          payPerUse: usageByType.image_generation.length,
        },
        text: {
          used: subscription.textGenerationsUsed,
          quota:
            subscription.pricingTier.textGenerations === -1
              ? 'unlimited'
              : subscription.pricingTier.textGenerations,
          payPerUse: usageByType.text_generation.length,
        },
      },
      billing: {
        totalCostThisPeriod: totalCost,
        recentCharges: aiUsage.slice(0, 10),
      },
    })
  } catch (error) {
    console.error('Get usage stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
