'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface PricingTier {
  id: string
  name: string
  slug: string
  description: string
  priceMonthly: number
  features: string[]
  stripePriceId: string | null
}

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/pricing')
      .then((res) => res.json())
      .then((data) => {
        const parsedData = data.map((tier: any) => ({
          ...tier,
          features: JSON.parse(tier.features),
        }))
        setTiers(parsedData)
      })
  }, [])

  const handleSubscribe = async (tier: PricingTier) => {
    if (!session) {
      router.push('/login')
      return
    }

    if (tier.slug === 'free') {
      router.push('/dashboard')
      return
    }

    setLoading(tier.id)

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricingTierId: tier.id }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Video className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AI Video SaaS</span>
          </Link>
          <nav className="flex gap-4 items-center">
            {session ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">
              Choose the Perfect Plan for You
            </h1>
            <p className="text-xl text-muted-foreground">
              Start free and upgrade as you grow. All plans include pay-per-use AI features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {tiers.map((tier) => (
              <Card
                key={tier.id}
                className={
                  tier.slug === 'pro'
                    ? 'border-primary shadow-lg scale-105'
                    : ''
                }
              >
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {formatCurrency(tier.priceMonthly)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tier.slug === 'pro' ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(tier)}
                    disabled={loading === tier.id}
                  >
                    {loading === tier.id
                      ? 'Loading...'
                      : tier.slug === 'free'
                      ? 'Get Started'
                      : 'Subscribe'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Pay-Per-Use AI Features</h2>
            <p className="text-muted-foreground mb-8">
              All paid plans include access to additional AI features with transparent pricing
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Video Generation</CardTitle>
                  <CardDescription>Beyond monthly quota</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">$0.65</p>
                  <p className="text-sm text-muted-foreground">per video</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Image Generation</CardTitle>
                  <CardDescription>Beyond monthly quota</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">$0.13</p>
                  <p className="text-sm text-muted-foreground">per image</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Text Generation</CardTitle>
                  <CardDescription>Beyond monthly quota</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">$0.07</p>
                  <p className="text-sm text-muted-foreground">per request</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
