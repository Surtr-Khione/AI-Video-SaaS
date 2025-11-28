'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, Facebook, Linkedin, Twitter, Share2, Check } from 'lucide-react'

interface ShareButtonsProps {
  referralCode: string
  userName?: string
}

export function ShareButtons({ referralCode, userName }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const referralUrl = `${appUrl}/signup?ref=${referralCode}`
  const shareText = `Join me on ${process.env.NEXT_PUBLIC_APP_NAME || 'AI Video SaaS'}! Use my referral code to get 50 free credits.`

  const handleShare = async (platform: string) => {
    await fetch('/api/referral/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform }),
    })

    let shareUrl = ''
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralUrl)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(referralUrl)
    await fetch('/api/referral/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: 'copy' }),
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share & Earn
        </CardTitle>
        <CardDescription>
          Share your referral link and earn 100 credits for each friend who signs up!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
          <code className="flex-1 text-sm">{referralUrl}</code>
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="flex flex-col gap-2 h-auto py-4"
            onClick={() => handleShare('twitter')}
          >
            <Twitter className="h-5 w-5" />
            <span className="text-xs">Twitter</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-2 h-auto py-4"
            onClick={() => handleShare('facebook')}
          >
            <Facebook className="h-5 w-5" />
            <span className="text-xs">Facebook</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-2 h-auto py-4"
            onClick={() => handleShare('linkedin')}
          >
            <Linkedin className="h-5 w-5" />
            <span className="text-xs">LinkedIn</span>
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Rewards:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>10 credits for each share</li>
            <li>100 credits when someone signs up</li>
            <li>50 credits bonus for your friend</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
