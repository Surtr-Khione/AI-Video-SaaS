'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Medal, Award } from 'lucide-react'

interface LeaderboardUser {
  id: string
  name: string
  image?: string
  totalReferrals: number
  viralScore: number
  tier: string
  rank: number
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[]
  globalStats: {
    totalUsers: number
    totalReferrals: number
    totalCreditsDistributed: number
    avgReferralsPerUser: number
    avgViralScore: number
  }
}

export function Leaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/referral/leaderboard')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading leaderboard...</div>
  }

  if (!data) {
    return <div>Failed to load leaderboard</div>
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <Award className="h-5 w-5 text-muted-foreground" />
  }

  const getTierColor = (tier: string) => {
    const colors = {
      platinum: 'text-cyan-500',
      gold: 'text-yellow-500',
      silver: 'text-gray-400',
      bronze: 'text-amber-700',
      free: 'text-gray-500',
    }
    return colors[tier as keyof typeof colors] || colors.free
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Leaderboard
        </CardTitle>
        <CardDescription>
          Top referrers and their viral impact
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg text-sm">
            <div>
              <div className="font-semibold">Total Users</div>
              <div className="text-2xl font-bold">{data.globalStats.totalUsers}</div>
            </div>
            <div>
              <div className="font-semibold">Total Referrals</div>
              <div className="text-2xl font-bold">{data.globalStats.totalReferrals}</div>
            </div>
            <div>
              <div className="font-semibold">Avg per User</div>
              <div className="text-2xl font-bold">{data.globalStats.avgReferralsPerUser.toFixed(1)}</div>
            </div>
          </div>

          <div className="space-y-2">
            {data.leaderboard.slice(0, 10).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(user.rank)}
                  </div>
                  <div>
                    <div className="font-semibold">{user.name || 'Anonymous'}</div>
                    <div className="text-sm text-muted-foreground">
                      <span className={getTierColor(user.tier)}>{user.tier}</span> tier
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{user.totalReferrals} referrals</div>
                  <div className="text-sm text-muted-foreground">
                    {user.viralScore} viral score
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
