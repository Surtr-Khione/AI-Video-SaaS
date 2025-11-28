'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Video, LogOut, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

interface UsageStats {
  subscription: {
    tier: string
    status: string
    currentPeriodStart: string
    currentPeriodEnd: string
  }
  usage: {
    videos: {
      used: number
      quota: number | string
      payPerUse: number
    }
    images: {
      used: number
      quota: number | string
      payPerUse: number
    }
    text: {
      used: number
      quota: number | string
      payPerUse: number
    }
  }
  billing: {
    totalCostThisPeriod: number
    recentCharges: Array<{
      id: string
      featureType: string
      totalCharge: number
      createdAt: string
    }>
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetch('/api/ai/usage-stats')
        .then((res) => res.json())
        .then((data) => {
          setStats(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Failed to load stats:', error)
          setLoading(false)
        })
    }
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!session || !stats) {
    return null
  }

  const getUsagePercentage = (used: number, quota: number | string) => {
    if (quota === 'unlimited') return 0
    return Math.min((used / (quota as number)) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Video className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AI Video SaaS</span>
          </Link>
          <nav className="flex gap-4 items-center">
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <Link href="/pricing">
              <Button variant="ghost">Pricing</Button>
            </Link>
            <Button variant="ghost" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name || session.user.email}
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    {format(new Date(stats.subscription.currentPeriodStart), 'MMM d, yyyy')} -{' '}
                    {format(new Date(stats.subscription.currentPeriodEnd), 'MMM d, yyyy')}
                  </CardDescription>
                </div>
                <Link href="/pricing">
                  <Button variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Change Plan
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{stats.subscription.tier}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    stats.subscription.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {stats.subscription.status}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Video Generations</CardTitle>
              <CardDescription>
                {stats.usage.videos.used} / {stats.usage.videos.quota}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${getUsagePercentage(
                        stats.usage.videos.used,
                        stats.usage.videos.quota
                      )}%`,
                    }}
                  />
                </div>
                {stats.usage.videos.payPerUse > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {stats.usage.videos.payPerUse} additional (pay-per-use)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image Generations</CardTitle>
              <CardDescription>
                {stats.usage.images.used} / {stats.usage.images.quota}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${getUsagePercentage(
                        stats.usage.images.used,
                        stats.usage.images.quota
                      )}%`,
                    }}
                  />
                </div>
                {stats.usage.images.payPerUse > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {stats.usage.images.payPerUse} additional (pay-per-use)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Text Generations</CardTitle>
              <CardDescription>
                {stats.usage.text.used} / {stats.usage.text.quota}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${getUsagePercentage(
                        stats.usage.text.used,
                        stats.usage.text.quota
                      )}%`,
                    }}
                  />
                </div>
                {stats.usage.text.payPerUse > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {stats.usage.text.payPerUse} additional (pay-per-use)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pay-Per-Use Charges</CardTitle>
            <CardDescription>
              Total this period: {formatCurrency(stats.billing.totalCostThisPeriod)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.billing.recentCharges.length > 0 ? (
              <div className="space-y-4">
                {stats.billing.recentCharges.map((charge) => (
                  <div
                    key={charge.id}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">
                        {charge.featureType.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(charge.createdAt), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(charge.totalCharge)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No pay-per-use charges this period
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
