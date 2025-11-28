import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { platform } = await request.json()

  if (!platform) {
    return NextResponse.json({ error: 'Platform required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const shareUrl = `${appUrl}/signup?ref=${user.referralCode}`

  // Track share
  await prisma.share.create({
    data: {
      userId: session.user.id,
      platform,
      url: shareUrl,
    },
  })

  // Track viral action
  await prisma.viralAction.create({
    data: {
      userId: session.user.id,
      type: 'share',
      platform,
    },
  })

  // Award credits for sharing
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      credits: { increment: 10 },
      viralScore: { increment: 2 },
    },
  })

  await prisma.reward.create({
    data: {
      userId: session.user.id,
      type: 'share',
      credits: 10,
      description: `Shared on ${platform}`,
    },
  })

  return NextResponse.json({ success: true, shareUrl })
}
