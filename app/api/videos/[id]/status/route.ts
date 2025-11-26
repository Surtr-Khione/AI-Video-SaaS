import { NextRequest, NextResponse } from "next/server"
import { getVideoById } from "@/lib/storage"

export const dynamic = "force-dynamic"

// GET /api/videos/[id]/status - Get processing status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const video = await getVideoById(params.id)

    if (!video) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      status: video.status,
      progress: video.progress || 0,
      video,
    })
  } catch (error) {
    console.error("Error fetching video status:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch video status" },
      { status: 500 }
    )
  }
}
