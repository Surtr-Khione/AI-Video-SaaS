import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateAIFeatureCost } from '@/lib/utils'
import { z } from 'zod'

const trackUsageSchema = z.object({
  featureType: z.enum(['video_generation', 'image_generation', 'text_generation']),
  metadata: z.record(z.any()).optional(),
})

const AI_COSTS = {
  video_generation: parseInt(process.env.AI_COST_VIDEO_GENERATION || '50'),
  image_generation: parseInt(process.env.AI_COST_IMAGE_GENERATION || '10'),
  text_generation: parseInt(process.env.AI_COST_TEXT_GENERATION || '5'),
}

const PROFIT_MARGIN = parseInt(process.env.AI_PROFIT_MARGIN || '30')

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { featureType, metadata } = trackUsageSchema.parse(body)

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

    const usageField =
      featureType === 'video_generation'
        ? 'videoGenerationsUsed'
        : featureType === 'image_generation'
        ? 'imageGenerationsUsed'
        : 'textGenerationsUsed'

    const quotaField =
      featureType === 'video_generation'
        ? 'videoGenerations'
        : featureType === 'image_generation'
        ? 'imageGenerations'
        : 'textGenerations'

    const currentUsage = subscription[usageField]
    const quota = subscription.pricingTier[quotaField]

    const withinQuota = quota === -1 || currentUsage < quota
    const willCharge =
      !withinQuota && subscription.pricingTier.payPerUseEnabled

    let chargeAmount = 0
    let aiUsageRecord = null

    if (willCharge) {
      const baseCost = AI_COSTS[featureType]

      let profitMargin = PROFIT_MARGIN
      if (subscription.pricingTier.slug === 'pro') {
        profitMargin = Math.round(PROFIT_MARGIN * 0.8)
      } else if (subscription.pricingTier.slug === 'enterprise') {
        profitMargin = Math.round(PROFIT_MARGIN * 0.6)
      }

      const costCalculation = calculateAIFeatureCost(baseCost, profitMargin)
      chargeAmount = costCalculation.totalCharge

      aiUsageRecord = await prisma.aIUsage.create({
        data: {
          userId: session.user.id,
          featureType,
          cost: costCalculation.cost,
          profitMargin: costCalculation.profitMargin,
          totalCharge: costCalculation.totalCharge,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      })
    } else if (!withinQuota && !subscription.pricingTier.payPerUseEnabled) {
      return NextResponse.json(
        {
          error: 'Quota exceeded',
          message: `You have reached your monthly limit for ${featureType}. Please upgrade your plan.`,
        },
        { status: 403 }
      )
    }

    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        [usageField]: currentUsage + 1,
      },
    })

    return NextResponse.json({
      success: true,
      withinQuota,
      charged: willCharge,
      chargeAmount,
      usage: currentUsage + 1,
      quota: quota === -1 ? 'unlimited' : quota,
      aiUsageId: aiUsageRecord?.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Track usage error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
