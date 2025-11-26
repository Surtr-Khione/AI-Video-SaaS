"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, User, Bell, Palette, Database, Key, Zap } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    name: "John Doe",
    email: "john@example.com",
    defaultQuality: "high",
    defaultFormat: "mp4",
    theme: "light",
    notifications: true,
    autoProcess: false,
    storageLimit: "100",
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground text-lg">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Settings Menu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Zap className="mr-2 h-4 w-4" />
                Processing
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Palette className="mr-2 h-4 w-4" />
                Appearance
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Database className="mr-2 h-4 w-4" />
                Storage
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Key className="mr-2 h-4 w-4" />
                API Keys
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Full Name
                </label>
                <Input
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Processing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Processing Defaults
              </CardTitle>
              <CardDescription>
                Set default options for video processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Default Quality
                </label>
                <Select
                  value={settings.defaultQuality}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultQuality: e.target.value })
                  }
                >
                  <option value="low">Low (Fast)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Best Quality)</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Default Output Format
                </label>
                <Select
                  value={settings.defaultFormat}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultFormat: e.target.value })
                  }
                >
                  <option value="mp4">MP4</option>
                  <option value="mov">MOV</option>
                  <option value="webm">WebM</option>
                  <option value="avi">AVI</option>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium block">
                    Auto-process uploads
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Automatically start processing after upload
                  </p>
                </div>
                <Button
                  variant={settings.autoProcess ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSettings({ ...settings, autoProcess: !settings.autoProcess })
                  }
                >
                  {settings.autoProcess ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how the app looks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Theme
                </label>
                <Select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium block">
                    Email Notifications
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Receive email updates about your videos
                  </p>
                </div>
                <Button
                  variant={settings.notifications ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSettings({ ...settings, notifications: !settings.notifications })
                  }
                >
                  {settings.notifications ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Storage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Storage
              </CardTitle>
              <CardDescription>
                Manage your storage usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Storage Used</span>
                  <span className="font-medium">
                    12.5 GB / {settings.storageLimit} GB
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(12.5 / parseInt(settings.storageLimit)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Videos: 8.2 GB</Badge>
                <Badge variant="outline">Processed: 4.3 GB</Badge>
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage API keys for integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Your API Key
                </label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value="sk_live_***************************"
                    readOnly
                  />
                  <Button variant="outline">Copy</Button>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Generate New Key
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <Button
                size="lg"
                className="w-full"
                onClick={handleSave}
              >
                <Save className="mr-2 h-4 w-4" />
                {saved ? "Settings Saved!" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
