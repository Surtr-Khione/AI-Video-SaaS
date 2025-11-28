import type { Metadata } from "next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { ToastProvider } from "@/components/toast-provider"

export const metadata: Metadata = {
  title: "AI Video Studio - Transform Your Videos with AI",
  description: "Professional AI-powered video editing and transformation platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ToastProvider>
          <Navigation />
          <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  )
}
