import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Video SaaS",
  description: "Generate videos with AI using Google Veo 3, OpenAI Sora, Runway ML, and Replicate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
