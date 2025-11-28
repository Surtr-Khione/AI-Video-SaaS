import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const topReferrers = await prisma.user.findMany({
    where: {
      totalReferrals: { gt: 0 },
    },
    select: {
      id: true,
      name: true,
      image: true,
      totalReferrals: true,
      viralScore: true,
      tier: true,
      createdAt: true,
    },
    orderBy: {
      viralScore: 'desc',
    },
    take: 100,
  })

  const globalStats = await prisma.user.aggregate({
    _sum: {
      totalReferrals: true,
      credits: true,
    },
    _avg: {
      totalReferrals: true,
      viralScore: true,
    },
    _count: true,
  })

  return NextResponse.json({
    leaderboard: topReferrers.map((user, index) => ({
      ...user,
      rank: index + 1,
    })),
    globalStats: {
      totalUsers: globalStats._count,
      totalReferrals: globalStats._sum.totalReferrals || 0,
      totalCreditsDistributed: globalStats._sum.credits || 0,
      avgReferralsPerUser: globalStats._avg.totalReferrals || 0,
      avgViralScore: globalStats._avg.viralScore || 0,
    },
  })
}
