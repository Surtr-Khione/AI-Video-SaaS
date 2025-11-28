'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Users, Award, TrendingUp, Zap } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface Stats {
  referralCode: string
  totalReferrals: number
  activeReferrals: number
  credits: number
  totalCreditsEarned: number
  tier: string
  viralScore: number
  conversionRate: number
}

export function ReferralStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/referral/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading stats...</div>
  }

  if (!stats) {
    return <div>Failed to load stats</div>
  }

  const nextTierThreshold = {
    free: 5,
    bronze: 20,
    silver: 50,
    gold: 100,
    platinum: 999,
  }[stats.tier] || 5

  const tierProgress = (stats.totalReferrals / nextTierThreshold) * 100

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeReferrals} active users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credits Balance</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.credits)}</div>
          <p className="text-xs text-muted-foreground">
            {formatNumber(stats.totalCreditsEarned)} total earned
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Viral Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.viralScore}</div>
          <p className="text-xs text-muted-foreground">
            Top {Math.max(1, 100 - stats.viralScore)}% of users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tier</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">{stats.tier}</div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span>{stats.totalReferrals} referrals</span>
              <span>{nextTierThreshold} needed</span>
            </div>
            <Progress value={Math.min(tierProgress, 100)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
