import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const pricingTiers = await prisma.pricingTier.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    })

    return NextResponse.json(pricingTiers)
  } catch (error) {
    console.error('Get pricing tiers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
