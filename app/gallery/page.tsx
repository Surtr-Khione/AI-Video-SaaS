"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Trash2, Search, Video, Clock, CheckCircle, RefreshCw } from "lucide-react"
import { Video as VideoType } from "@/types"

export default function GalleryPage() {
  const [videos, setVideos] = useState<VideoType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterTransformation, setFilterTransformation] = useState("all")

  const fetchVideos = async () => {
    try {
      const response = await fetch("/api/videos")
      const data = await response.json()

      if (data.success) {
        setVideos(data.videos)
      }
    } catch (error) {
      console.error("Error fetching videos:", error)
    } finally {
      setLoading(false)
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) {
      return
    }

    try {
      const response = await fetch(`/api/videos/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setVideos(videos.filter((v) => v.id !== id))
      } else {
        alert("Failed to delete video")
      }
    } catch (error) {
      console.error("Error deleting video:", error)
      alert("Failed to delete video")
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
        <Button onClick={fetchVideos} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
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
      {filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No videos found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterStatus !== "all" || filterTransformation !== "all"
                ? "Try adjusting your filters"
                : "Upload your first video to get started"}
            </p>
            {!searchQuery && filterStatus === "all" && filterTransformation === "all" && (
              <Button>Upload Video</Button>
            )}
          </CardContent>
        </Card>
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
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(video.id)}
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
