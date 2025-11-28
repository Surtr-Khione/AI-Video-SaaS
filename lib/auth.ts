import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './db'
import bcrypt from 'bcryptjs'
import { generateReferralCode } from './utils'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials')
        }

        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.referralCode = (user as any).referralCode
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.referralCode = token.referralCode as string
      }
      return session
    },
  },
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  referredByCode?: string
) {
  const hashedPassword = await bcrypt.hash(password, 10)

  let referredById: string | undefined

  // Find referrer if code provided
  if (referredByCode) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: referredByCode },
    })

    if (referrer) {
      referredById = referrer.id

      // Award referrer credits
      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          credits: { increment: 100 },
          totalReferrals: { increment: 1 },
          activeReferrals: { increment: 1 },
          viralScore: { increment: 10 },
        },
      })

      // Create reward for referrer
      await prisma.reward.create({
        data: {
          userId: referrer.id,
          type: 'referral_signup',
          credits: 100,
          description: `New user ${name} signed up with your referral code!`,
        },
      })

      // Track viral action
      await prisma.viralAction.create({
        data: {
          userId: referrer.id,
          type: 'referral_signup',
          metadata: { newUserId: email },
        },
      })
    }
  }

  // Create new user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      referralCode: generateReferralCode(),
      referredById,
      credits: referredById ? 50 : 0, // Bonus credits for being referred
    },
  })

  // Award new user if they were referred
  if (referredById) {
    await prisma.reward.create({
      data: {
        userId: user.id,
        type: 'referral_conversion',
        credits: 50,
        description: 'Welcome bonus for joining via referral!',
      },
    })
  }

  return user
}
