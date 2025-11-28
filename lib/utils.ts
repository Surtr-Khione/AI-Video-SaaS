import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountInCents / 100)
}

export function calculateAIFeatureCost(
  baseCostInCents: number,
  profitMarginPercentage: number
): { cost: number; profitMargin: number; totalCharge: number } {
  const profitAmount = Math.round((baseCostInCents * profitMarginPercentage) / 100)
  return {
    cost: baseCostInCents,
    profitMargin: profitMarginPercentage,
    totalCharge: baseCostInCents + profitAmount,
  }
}
