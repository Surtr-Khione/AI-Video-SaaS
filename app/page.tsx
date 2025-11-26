"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Video, Wand2, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    completed: 0,
  })

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats)
        }
      })
      .catch((error) => console.error("Error fetching stats:", error))
  }, [])

  const statCards = [
    { label: "Videos Processed", value: stats.total.toString(), icon: Video },
    { label: "Processing", value: stats.processing.toString(), icon: Clock },
    { label: "Completed", value: stats.completed.toString(), icon: CheckCircle },
  ]

  const features = [
    {
      title: "AI Video Enhancement",
      description: "Automatically enhance video quality, stabilize footage, and improve colors",
      icon: Wand2,
    },
    {
      title: "Smart Cropping",
      description: "AI-powered cropping to focus on key subjects and reframe for different aspect ratios",
      icon: Video,
    },
    {
      title: "Background Removal",
      description: "Remove or replace backgrounds from your videos with precision",
      icon: Video,
    },
    {
      title: "Auto Subtitles",
      description: "Generate accurate subtitles automatically with AI transcription",
      icon: Video,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to AI Video Studio</h1>
        <p className="text-muted-foreground text-lg">
          Transform your videos with cutting-edge AI technology
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Upload */}
      <Card className="mb-8 border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Quick Upload
          </CardTitle>
          <CardDescription>
            Upload a video to get started with AI-powered transformations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/upload">
            <Button size="lg" className="w-full sm:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              Upload Video
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Features */}
      <div>
        <h2 className="text-2xl font-bold mb-6">AI-Powered Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
