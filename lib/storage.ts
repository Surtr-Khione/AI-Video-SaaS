import { Video } from "@/types"
import fs from "fs/promises"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const VIDEOS_FILE = path.join(DATA_DIR, "videos.json")
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")
const PROCESSED_DIR = path.join(process.cwd(), "public", "processed")

// Ensure directories exist
export async function ensureDirectories() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.mkdir(UPLOADS_DIR, { recursive: true })
    await fs.mkdir(PROCESSED_DIR, { recursive: true })
  } catch (error) {
    console.error("Error creating directories:", error)
  }
}

// Read videos from storage
export async function getVideos(): Promise<Video[]> {
  try {
    await ensureDirectories()
    const data = await fs.readFile(VIDEOS_FILE, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    // If file doesn't exist, return empty array
    return []
  }
}

// Save videos to storage
export async function saveVideos(videos: Video[]): Promise<void> {
  await ensureDirectories()
  await fs.writeFile(VIDEOS_FILE, JSON.stringify(videos, null, 2))
}

// Get a single video by ID
export async function getVideoById(id: string): Promise<Video | null> {
  const videos = await getVideos()
  return videos.find((v) => v.id === id) || null
}

// Add a new video
export async function addVideo(video: Video): Promise<Video> {
  const videos = await getVideos()
  videos.push(video)
  await saveVideos(videos)
  return video
}

// Update a video
export async function updateVideo(id: string, updates: Partial<Video>): Promise<Video | null> {
  const videos = await getVideos()
  const index = videos.findIndex((v) => v.id === id)

  if (index === -1) {
    return null
  }

  videos[index] = { ...videos[index], ...updates, updatedAt: new Date().toISOString() }
  await saveVideos(videos)
  return videos[index]
}

// Delete a video
export async function deleteVideo(id: string): Promise<boolean> {
  const videos = await getVideos()
  const video = videos.find((v) => v.id === id)

  if (!video) {
    return false
  }

  // Delete files if they exist
  try {
    if (video.filePath) {
      await fs.unlink(path.join(process.cwd(), "public", video.filePath))
    }
    if (video.processedPath) {
      await fs.unlink(path.join(process.cwd(), "public", video.processedPath))
    }
  } catch (error) {
    console.error("Error deleting files:", error)
  }

  const filtered = videos.filter((v) => v.id !== id)
  await saveVideos(filtered)
  return true
}

// Get storage stats
export async function getStorageStats() {
  const videos = await getVideos()

  let totalSize = 0
  let videoSize = 0
  let processedSize = 0

  for (const video of videos) {
    const size = parseFloat(video.size.replace(/[^0-9.]/g, ""))
    totalSize += size

    if (video.status === "completed" && video.processedPath) {
      processedSize += size / 2 // Estimate
    } else {
      videoSize += size
    }
  }

  return {
    total: videos.length,
    completed: videos.filter((v) => v.status === "completed").length,
    processing: videos.filter((v) => v.status === "processing").length,
    failed: videos.filter((v) => v.status === "failed").length,
    totalSize: totalSize.toFixed(2),
    videoSize: videoSize.toFixed(2),
    processedSize: processedSize.toFixed(2),
  }
}
