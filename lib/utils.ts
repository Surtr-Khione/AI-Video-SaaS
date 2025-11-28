import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function calculateViralCoefficient(invitesPerUser: number, conversionRate: number): number {
  return invitesPerUser * conversionRate
}

export function getTierFromReferrals(referrals: number): string {
  if (referrals >= 100) return 'platinum'
  if (referrals >= 50) return 'gold'
  if (referrals >= 20) return 'silver'
  if (referrals >= 5) return 'bronze'
  return 'free'
}

export function getCreditsForAction(action: string): number {
  const creditMap: Record<string, number> = {
    referral_signup: 100,
    referral_conversion: 50,
    share_social: 10,
    share_email: 20,
    milestone_5: 250,
    milestone_10: 500,
    milestone_25: 1500,
    milestone_50: 3000,
    milestone_100: 10000,
  }
  return creditMap[action] || 0
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
