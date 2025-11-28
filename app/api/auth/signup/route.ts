import { NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password, name, referralCode } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const user = await createUser(email, password, name, referralCode)

    return NextResponse.json(
      { success: true, userId: user.id },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
