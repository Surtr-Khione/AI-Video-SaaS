import { NextResponse } from "next/server"
import { getStorageStats } from "@/lib/storage"

export const dynamic = "force-dynamic"

// GET /api/stats - Get dashboard statistics
export async function GET() {
  try {
    const stats = await getStorageStats()
    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
