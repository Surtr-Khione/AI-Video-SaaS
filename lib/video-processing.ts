import { Video, ProcessingOptions } from "@/types"
import { updateVideo } from "./storage"

// Simulate video processing with different transformations
export async function processVideo(
  videoId: string,
  options: ProcessingOptions
): Promise<void> {
  // Simulate processing time based on quality
  const processingTime = {
    low: 3000,
    medium: 5000,
    high: 8000,
  }[options.quality] || 5000

  // Update progress incrementally
  const steps = 10
  const stepTime = processingTime / steps

  for (let i = 1; i <= steps; i++) {
    await new Promise((resolve) => setTimeout(resolve, stepTime))
    await updateVideo(videoId, {
      progress: (i / steps) * 100,
    })
  }

  // Mark as completed
  await updateVideo(videoId, {
    status: "completed",
    progress: 100,
    processedPath: `/processed/${videoId}.${options.format}`,
  })
}

// Get transformation description
export function getTransformationDescription(type: string): string {
  const descriptions: Record<string, string> = {
    enhance: "AI Enhancement applied: improved quality, stabilization, and color correction",
    crop: "Smart Crop applied: optimized framing and aspect ratio conversion",
    background: "Background Removal applied: clean background replacement",
    subtitles: "Auto Subtitles applied: AI-generated accurate subtitles",
    stabilize: "Video Stabilization applied: smooth and steady footage",
    colorgrade: "Color Grading applied: professional color enhancement",
  }
  return descriptions[type] || "AI transformation applied"
}

// Calculate estimated output size
export function estimateOutputSize(inputSize: string, quality: string): string {
  const size = parseFloat(inputSize.replace(/[^0-9.]/g, ""))

  const multipliers: Record<string, number> = {
    low: 0.6,
    medium: 0.8,
    high: 1.2,
  }

  const outputSize = size * (multipliers[quality] || 1)
  return `${outputSize.toFixed(2)} MB`
}

// Generate video metadata
export function generateVideoMetadata(file: File, options: ProcessingOptions): Partial<Video> {
  const id = `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return {
    id,
    originalName: file.name,
    title: file.name.replace(/\.[^/.]+$/, ""),
    size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    format: options.format.toUpperCase(),
    transformation: getTransformationType(options.transformation),
    status: "processing",
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    options,
  }
}

function getTransformationType(type: string): string {
  const types: Record<string, string> = {
    enhance: "AI Enhancement",
    crop: "Smart Crop",
    background: "Background Removal",
    subtitles: "Auto Subtitles",
    stabilize: "Video Stabilization",
    colorgrade: "Color Grading",
  }
  return types[type] || "AI Enhancement"
}

// Validate video file
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 500 * 1024 * 1024 // 500MB
  const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"]

  if (file.size > maxSize) {
    return { valid: false, error: "File size exceeds 500MB limit" }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Invalid file type. Supported: MP4, MOV, AVI, WebM" }
  }

  return { valid: true }
}
