import { NextRequest, NextResponse } from "next/server"
import { getVideoById, deleteVideo, updateVideo } from "@/lib/storage"

export const dynamic = "force-dynamic"

// GET /api/videos/[id] - Get a specific video
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

    return NextResponse.json({ success: true, video })
  } catch (error) {
    console.error("Error fetching video:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch video" },
      { status: 500 }
    )
  }
}

// DELETE /api/videos/[id] - Delete a video
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteVideo(params.id)

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting video:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete video" },
      { status: 500 }
    )
  }
}

// PATCH /api/videos/[id] - Update a video
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    const video = await updateVideo(params.id, updates)

    if (!video) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, video })
  } catch (error) {
    console.error("Error updating video:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update video" },
      { status: 500 }
    )
  }
}
