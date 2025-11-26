import { NextRequest, NextResponse } from "next/server"
import { getVideos, addVideo, ensureDirectories } from "@/lib/storage"
import { processVideo, generateVideoMetadata, validateVideoFile } from "@/lib/video-processing"
import { Video } from "@/types"
import path from "path"
import { writeFile } from "fs/promises"

export const dynamic = "force-dynamic"

// GET /api/videos - List all videos
export async function GET() {
  try {
    const videos = await getVideos()
    return NextResponse.json({ success: true, videos })
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch videos" },
      { status: 500 }
    )
  }
}

// POST /api/videos - Upload and process a video
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const optionsJson = formData.get("options") as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const options = JSON.parse(optionsJson || "{}")

    // Generate metadata
    const metadata = generateVideoMetadata(file, options)

    // Ensure upload directory exists
    await ensureDirectories()

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uploadPath = path.join(process.cwd(), "public", "uploads", `${metadata.id}_${file.name}`)

    await writeFile(uploadPath, buffer)

    // Create video record
    const video: Video = {
      ...metadata,
      duration: "0:00", // Would be extracted from actual video
      filePath: `/uploads/${metadata.id}_${file.name}`,
    } as Video

    // Add to database
    await addVideo(video)

    // Start processing in background (non-blocking)
    processVideo(video.id, options).catch((error) => {
      console.error("Error processing video:", error)
    })

    return NextResponse.json({ success: true, video })
  } catch (error) {
    console.error("Error uploading video:", error)
    return NextResponse.json(
      { success: false, error: "Failed to upload video" },
      { status: 500 }
    )
  }
}
