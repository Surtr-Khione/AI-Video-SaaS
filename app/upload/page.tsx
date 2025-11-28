"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Video, X, Wand2, Loader2, FileVideo, Info, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/toast-provider"
import { useRouter } from "next/navigation"

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState("")
  const [processing, setProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()
  const router = useRouter()

  const [options, setOptions] = useState({
    transformation: "enhance",
    quality: "high",
    format: "mp4",
    aspectRatio: "original",
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith("video/")) {
        setSelectedFile(file)
        setVideoUrl("")
        showToast(`Selected: ${file.name}`, "success", 3000)
      } else {
        showToast("Please select a valid video file", "error")
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      if (file.type.startsWith("video/")) {
        setSelectedFile(file)
        setVideoUrl("")
        showToast(`Selected: ${file.name}`, "success", 3000)
      } else {
        showToast("Please select a valid video file", "error")
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleProcess = async () => {
    if (!selectedFile && !videoUrl) {
      showToast("Please select a video file or provide a URL", "warning")
      return
    }

    setProcessing(true)
    setUploadProgress(0)
    showToast("Starting upload...", "info", 2000)

    try {
      const formData = new FormData()

      if (selectedFile) {
        formData.append("file", selectedFile)
      } else if (videoUrl) {
        showToast("URL upload not yet implemented. Please upload a file instead.", "warning")
        setProcessing(false)
        return
      }

      formData.append("options", JSON.stringify(options))

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 300)

      const response = await fetch("/api/videos", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (data.success) {
        setTimeout(() => {
          showToast("Video uploaded successfully! Processing started.", "success")
          setProcessing(false)
          setSelectedFile(null)
          setUploadProgress(0)
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
          // Redirect to gallery after 1 second
          setTimeout(() => {
            router.push("/gallery")
          }, 1000)
        }, 500)
      } else {
        throw new Error(data.error || "Upload failed")
      }
    } catch (error) {
      console.error("Error uploading video:", error)
      showToast("Failed to upload video. Please try again.", "error")
      setProcessing(false)
      setUploadProgress(0)
    }
  }

  const transformations = [
    { value: "enhance", label: "AI Enhancement" },
    { value: "crop", label: "Smart Crop" },
    { value: "background", label: "Background Removal" },
    { value: "subtitles", label: "Auto Subtitles" },
    { value: "stabilize", label: "Video Stabilization" },
    { value: "colorgrade", label: "Color Grading" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Upload & Process Video</h1>
        <p className="text-muted-foreground text-lg">
          Upload your video and apply AI transformations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>
                Drag and drop or click to select a video file
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors ${
                    isDragging ? "text-primary animate-bounce" : "text-muted-foreground"
                  }`} />
                  <p className="text-sm font-medium mb-2">
                    {isDragging ? "Drop your video here" : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    MP4, MOV, AVI, WebM (max 500MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border-2 border-primary/50 bg-primary/5 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileVideo className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Or Use Video URL</CardTitle>
              <CardDescription>
                Provide a direct link to a video file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="https://example.com/video.mp4"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value)
                  if (e.target.value) {
                    setSelectedFile(null)
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Processing Options */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Transformation</CardTitle>
              <CardDescription>
                Choose how you want to transform your video
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Transformation Type
                </label>
                <Select
                  value={options.transformation}
                  onChange={(e) =>
                    setOptions({ ...options, transformation: e.target.value })
                  }
                >
                  {transformations.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Quality
                </label>
                <Select
                  value={options.quality}
                  onChange={(e) =>
                    setOptions({ ...options, quality: e.target.value })
                  }
                >
                  <option value="low">Low (Fast)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Best Quality)</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Output Format
                </label>
                <Select
                  value={options.format}
                  onChange={(e) =>
                    setOptions({ ...options, format: e.target.value })
                  }
                >
                  <option value="mp4">MP4</option>
                  <option value="mov">MOV</option>
                  <option value="webm">WebM</option>
                  <option value="avi">AVI</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Aspect Ratio
                </label>
                <Select
                  value={options.aspectRatio}
                  onChange={(e) =>
                    setOptions({ ...options, aspectRatio: e.target.value })
                  }
                >
                  <option value="original">Original</option>
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="4:3">4:3 (Classic)</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  placeholder="Add any specific instructions for the AI..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6">
              {processing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="font-medium text-sm">Uploading...</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} max={100} />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <Info className="h-3.5 w-3.5" />
                    <span>Processing will start automatically after upload completes</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                    disabled={!selectedFile && !videoUrl}
                    onClick={handleProcess}
                  >
                    <Wand2 className="mr-2 h-5 w-5" />
                    Start AI Processing
                  </Button>
                  {(!selectedFile && !videoUrl) && (
                    <p className="text-xs text-center text-muted-foreground">
                      Select a video file to begin
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Settings Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Processing Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transformation:</span>
                <Badge variant="secondary">
                  {transformations.find((t) => t.value === options.transformation)?.label}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quality:</span>
                <Badge variant="secondary">{options.quality}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Format:</span>
                <Badge variant="secondary">{options.format.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Aspect Ratio:</span>
                <Badge variant="secondary">{options.aspectRatio}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
