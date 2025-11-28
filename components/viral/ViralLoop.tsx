'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Lock, Unlock, Users } from 'lucide-react'

interface ViralLoopProps {
  currentReferrals: number
  unlockThreshold?: number
  hasUnlockedPremium: boolean
}

export function ViralLoop({ currentReferrals, unlockThreshold = 3, hasUnlockedPremium }: ViralLoopProps) {
  const progress = (currentReferrals / unlockThreshold) * 100
  const remaining = Math.max(0, unlockThreshold - currentReferrals)

  const features = [
    'HD Video Export',
    'Advanced AI Filters',
    'Custom Branding',
    'Priority Processing',
    'API Access',
  ]

  return (
    <Card className={hasUnlockedPremium ? 'border-green-500' : 'border-orange-500'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hasUnlockedPremium ? (
            <>
              <Unlock className="h-5 w-5 text-green-500" />
              Premium Features Unlocked!
            </>
          ) : (
            <>
              <Lock className="h-5 w-5 text-orange-500" />
              Unlock Premium Features
            </>
          )}
        </CardTitle>
        <CardDescription>
          {hasUnlockedPremium
            ? 'You have access to all premium features!'
            : `Refer ${unlockThreshold} friends to unlock premium features`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasUnlockedPremium && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {currentReferrals} / {unlockThreshold} referrals
                </span>
                <span className="font-semibold">
                  {remaining} more needed
                </span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-2" />
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="font-semibold text-sm">Premium Features:</p>
              <ul className="space-y-1 text-sm">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Button className="w-full" size="lg">
              Invite Friends to Unlock
            </Button>
          </>
        )}

        {hasUnlockedPremium && (
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg space-y-2">
            <p className="font-semibold text-sm text-green-700 dark:text-green-300">
              You have unlocked:
            </p>
            <ul className="space-y-1 text-sm">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Unlock className="h-3 w-3" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Keep referring to unlock higher tiers and earn more credits!
        </div>
      </CardContent>
    </Card>
  )
}
