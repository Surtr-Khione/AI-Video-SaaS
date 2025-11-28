import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { emails } = await request.json()

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json({ error: 'Invalid email list' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const invites = []
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  for (const email of emails) {
    // Check if already invited
    const existingInvite = await prisma.invite.findFirst({
      where: {
        email,
        senderId: session.user.id,
        status: 'pending',
      },
    })

    if (!existingInvite) {
      const invite = await prisma.invite.create({
        data: {
          email,
          senderId: session.user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      })

      invites.push(invite)

      // Track viral action
      await prisma.viralAction.create({
        data: {
          userId: session.user.id,
          type: 'invite',
          platform: 'email',
          metadata: { email },
        },
      })

      // Award credits for sending invite
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          credits: { increment: 10 },
          viralScore: { increment: 1 },
        },
      })

      await prisma.reward.create({
        data: {
          userId: session.user.id,
          type: 'share',
          credits: 10,
          description: `Invited ${email} to join`,
        },
      })

      // Send email invite (if configured)
      if (process.env.EMAIL_SERVER_HOST) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
            auth: {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD,
            },
          })

          const referralUrl = `${appUrl}/signup?ref=${user.referralCode}`

          await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `${user.name} invited you to join ${process.env.NEXT_PUBLIC_APP_NAME}`,
            html: `
              <h2>${user.name} invited you to join ${process.env.NEXT_PUBLIC_APP_NAME}!</h2>
              <p>Click the link below to sign up and get 50 free credits:</p>
              <a href="${referralUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px;">
                Sign Up Now
              </a>
              <p>Your referral link: ${referralUrl}</p>
            `,
          })
        } catch (error) {
          console.error('Failed to send email:', error)
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    invitesSent: invites.length,
    totalInvites: emails.length,
  })
}
