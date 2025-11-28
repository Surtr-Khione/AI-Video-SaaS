import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateViralCoefficient } from '@/lib/utils'

export async function POST() {
  try {
    // Calculate today's viral coefficient
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const totalUsers = await prisma.user.count()

    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    })

    const referredUsers = await prisma.user.count({
      where: {
        referredById: { not: null },
        createdAt: {
          gte: today,
        },
      },
    })

    const activeReferrers = await prisma.user.count({
      where: {
        totalReferrals: { gt: 0 },
      },
    })

    // Calculate invites sent today
    const invitesToday = await prisma.invite.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    })

    const sharesToday = await prisma.share.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    })

    const totalInvitations = invitesToday + sharesToday

    // Calculate metrics
    const invitesPerUser = activeReferrers > 0 ? totalInvitations / activeReferrers : 0
    const conversionRate = totalInvitations > 0 ? referredUsers / totalInvitations : 0
    const coefficient = calculateViralCoefficient(invitesPerUser, conversionRate)
    const k_factor = coefficient

    // Find top referrer
    const topReferrer = await prisma.user.findFirst({
      orderBy: { totalReferrals: 'desc' },
      select: {
        id: true,
        totalReferrals: true,
      },
    })

    // Save to database
    await prisma.viralCoefficient.upsert({
      where: { date: today },
      update: {
        totalUsers,
        newUsers,
        referredUsers,
        coefficient,
        k_factor,
        invitesPerUser,
        conversionRate,
        activeReferrers,
        topReferrerId: topReferrer?.id,
        topReferrerCount: topReferrer?.totalReferrals || 0,
      },
      create: {
        date: today,
        totalUsers,
        newUsers,
        referredUsers,
        coefficient,
        k_factor,
        invitesPerUser,
        conversionRate,
        activeReferrers,
        topReferrerId: topReferrer?.id,
        topReferrerCount: topReferrer?.totalReferrals || 0,
      },
    })

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        newUsers,
        referredUsers,
        coefficient,
        k_factor,
        invitesPerUser,
        conversionRate,
        activeReferrers,
      },
    })
  } catch (error) {
    console.error('Failed to calculate viral coefficient:', error)
    return NextResponse.json(
      { error: 'Failed to calculate metrics' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)

    const coefficients = await prisma.viralCoefficient.findMany({
      where: {
        date: {
          gte: last30Days,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    const latestCoefficient = await prisma.viralCoefficient.findFirst({
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json({
      current: latestCoefficient,
      history: coefficients,
    })
  } catch (error) {
    console.error('Failed to fetch viral coefficient:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
