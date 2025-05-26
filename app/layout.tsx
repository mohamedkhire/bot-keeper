import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import AutoPingScript from "@/components/auto-ping-script"
import PersistentPingClient from "@/components/persistent-ping-client"
import ServiceWorkerRegistration from "@/components/service-worker-registration"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { config } from "@/lib/config"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: `${config.appName} - Keep Your Discord Bots Online 24/7`,
    template: `%s | ${config.appName}`,
  },
  description:
    "Automatically ping your Glitch projects to prevent them from going to sleep. Monitor uptime, track performance, and keep your Discord bots running 24/7 with real-time notifications.",
  keywords: ["uptime monitoring", "discord bots", "glitch projects", "server monitoring", "bot keeper", "24/7 uptime"],
  authors: [{ name: "Bot Keeper Team" }],
  creator: "Bot Keeper",
  publisher: "Bot Keeper",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000",
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: `${config.appName} - Keep Your Discord Bots Online 24/7`,
    description:
      "Automatically ping your Glitch projects to prevent them from going to sleep. Monitor uptime, track performance, and keep your Discord bots running 24/7.",
    siteName: config.appName,
    images: [
      {
        url: "https://i.ibb.co/6RQHw77X/382-1x-shots-so.png",
        width: 1200,
        height: 630,
        alt: `${config.appName} - Uptime Monitoring Dashboard`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${config.appName} - Keep Your Discord Bots Online 24/7`,
    description:
      "Monitor uptime, track performance, and keep your Discord bots running 24/7 with real-time notifications.",
    images: ["https://i.ibb.co/6RQHw77X/382-1x-shots-so.png"],
    creator: "@botkeeper",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#3b82f6" }],
  },
  manifest: "/site.webmanifest",
  other: {
    "msapplication-TileColor": "#3b82f6",
    "theme-color": "#ffffff",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
      </head>
      <body className={`${inter.className} theme-transition`}>
        <ThemeProvider>
          {children}
          <AutoPingScript />
          <PersistentPingClient />
          <ServiceWorkerRegistration />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
