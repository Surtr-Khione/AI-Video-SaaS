import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      referrals: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          credits: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      rewards: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      viralActions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const totalCreditsEarned = await prisma.reward.aggregate({
    where: { userId: session.user.id },
    _sum: { credits: true },
  })

  const stats = {
    referralCode: user.referralCode,
    totalReferrals: user.totalReferrals,
    activeReferrals: user.activeReferrals,
    credits: user.credits,
    totalCreditsEarned: totalCreditsEarned._sum.credits || 0,
    tier: user.tier,
    viralScore: user.viralScore,
    conversionRate: user.conversionRate,
    referrals: user.referrals,
    recentRewards: user.rewards,
    recentActions: user.viralActions,
  }

  return NextResponse.json(stats)
}
