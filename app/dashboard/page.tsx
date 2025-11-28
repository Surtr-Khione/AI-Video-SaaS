import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ReferralStats } from '@/components/viral/ReferralStats'
import { ShareButtons } from '@/components/viral/ShareButtons'
import { InviteForm } from '@/components/viral/InviteForm'
import { ViralLoop } from '@/components/viral/ViralLoop'
import { Leaderboard } from '@/components/viral/Leaderboard'
import { RecentActivity } from '@/components/viral/RecentActivity'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      rewards: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}! Track your viral growth and earn rewards.
        </p>
      </div>

      <ReferralStats />

      <div className="grid gap-6 md:grid-cols-2">
        <ShareButtons referralCode={user.referralCode} userName={user.name || ''} />
        <InviteForm />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ViralLoop
          currentReferrals={user.totalReferrals}
          unlockThreshold={3}
          hasUnlockedPremium={user.hasUnlockedPremium}
        />
        <RecentActivity activities={user.rewards} />
      </div>

      <Leaderboard />
    </div>
  )
}
