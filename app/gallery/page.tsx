"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Trash2, Search, Video, Clock, CheckCircle, RefreshCw, AlertCircle, Upload } from "lucide-react"
import { Video as VideoType } from "@/types"
import { useToast } from "@/components/toast-provider"
import { VideoCardSkeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import Link from "next/link"

export default function GalleryPage() {
  const [videos, setVideos] = useState<VideoType[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterTransformation, setFilterTransformation] = useState("all")
  const { showToast } = useToast()

  const fetchVideos = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true)

      const response = await fetch("/api/videos")
      const data = await response.json()

      if (data.success) {
        setVideos(data.videos)
        if (showRefreshToast) {
          showToast("Gallery refreshed", "success", 2000)
        }
      }
    } catch (error) {
      console.error("Error fetching videos:", error)
      showToast("Failed to load videos", "error")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchVideos()

    // Poll for updates every 5 seconds if there are processing videos
    const interval = setInterval(() => {
      const hasProcessing = videos.some((v) => v.status === "processing")
      if (hasProcessing) {
        fetchVideos()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [videos])

  const handleDelete = async (id: string, videoName: string) => {
    // Custom confirmation using toast
    const confirmDelete = window.confirm(`Delete "${videoName}"? This action cannot be undone.`)

    if (!confirmDelete) {
      return
    }

    try {
      const response = await fetch(`/api/videos/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setVideos(videos.filter((v) => v.id !== id))
        showToast("Video deleted successfully", "success")
      } else {
        showToast("Failed to delete video", "error")
      }
    } catch (error) {
      console.error("Error deleting video:", error)
      showToast("Failed to delete video", "error")
    }
  }

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.originalName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || video.status === filterStatus
    const matchesTransformation = filterTransformation === "all" ||
      video.transformation?.toLowerCase().includes(filterTransformation.toLowerCase())

    return matchesSearch && matchesStatus && matchesTransformation
  })

  const getStatusBadge = (status: string, progress?: number) => {
    if (status === "completed") {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      )
    } else if (status === "processing") {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1 animate-spin" />
          Processing {progress ? `${Math.round(progress)}%` : ""}
        </Badge>
      )
    } else if (status === "failed") {
      return (
        <Badge variant="destructive">
          Failed
        </Badge>
      )
    }
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Video Gallery</h1>
          <p className="text-muted-foreground text-lg">
            Browse and manage your processed videos
          </p>
        </div>
        <Button
          onClick={() => fetchVideos(true)}
          variant="outline"
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
              </Select>
            </div>
            <div>
              <Select
                value={filterTransformation}
                onChange={(e) => setFilterTransformation(e.target.value)}
              >
                <option value="all">All Transformations</option>
                <option value="enhance">AI Enhancement</option>
                <option value="crop">Smart Crop</option>
                <option value="background">Background Removal</option>
                <option value="subtitles">Auto Subtitles</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {videos.filter((v) => v.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {videos.filter((v) => v.status === "processing").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <EmptyState
          icon={searchQuery || filterStatus !== "all" || filterTransformation !== "all" ? <Search className="h-16 w-16" /> : <Video className="h-16 w-16" />}
          title={searchQuery || filterStatus !== "all" || filterTransformation !== "all" ? "No videos found" : "No videos yet"}
          description={
            searchQuery || filterStatus !== "all" || filterTransformation !== "all"
              ? "Try adjusting your search or filter settings"
              : "Upload your first video to get started with AI transformations"
          }
          action={
            !searchQuery && filterStatus === "all" && filterTransformation === "all" ? (
              <Link href="/upload">
                <Button size="lg">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Your First Video
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <Video className="h-16 w-16 text-primary/40" />
                </div>
                <div className="absolute top-2 right-2">
                  {getStatusBadge(video.status, video.progress)}
                </div>
                <div className="absolute bottom-2 right-2">
                  <Badge variant="secondary" className="bg-black/75 text-white">
                    {video.duration}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg line-clamp-1">{video.title}</CardTitle>
                <CardDescription className="line-clamp-1">
                  {video.originalName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transformation:</span>
                    <Badge variant="outline">{video.transformation}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">{video.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="font-medium">{video.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                  {video.status === "processing" && video.progress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${video.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={video.status === "processing"}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={video.status === "processing"}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(video.id, video.title)}
                  title="Delete video"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
