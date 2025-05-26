"use client"

import { useState, useEffect } from "react"
import { Bell, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  EnhancedCard,
  EnhancedCardContent,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardDescription,
} from "@/components/enhanced-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { DiscordWebhookConfig, type DiscordWebhookFormValues } from "@/components/discord/discord-webhook-config"

type Project = {
  id: string
  name: string
  url: string
  status: "online" | "offline" | "unknown"
}

export default function NotificationsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [discordSettings, setDiscordSettings] = useState<DiscordWebhookFormValues | null>(null)

  // Load projects and notification settings on mount
  useEffect(() => {
    Promise.all([fetchProjects(), fetchDiscordSettings()]).finally(() => {
      setIsLoading(false)
    })
  }, [])

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }

      const data = await response.json()
      if (data.success) {
        setProjects(data.projects)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast({
        title: "Error",
        description: "Failed to fetch projects. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Fetch Discord settings
  const fetchDiscordSettings = async () => {
    try {
      const response = await fetch("/api/notifications/discord/settings")
      if (!response.ok) {
        // If 404, it means no settings exist yet
        if (response.status === 404) {
          return
        }
        throw new Error("Failed to fetch Discord settings")
      }

      const data = await response.json()
      if (data.success) {
        setDiscordSettings(data.settings)
      }
    } catch (error) {
      console.error("Error fetching Discord settings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch Discord settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Save Discord settings
  const saveDiscordSettings = async (values: DiscordWebhookFormValues) => {
    try {
      const response = await fetch("/api/notifications/discord/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to save Discord settings")
      }

      const data = await response.json()
      if (data.success) {
        setDiscordSettings(values)
        router.refresh()
        return true
      } else {
        throw new Error(data.error || "Failed to save Discord settings")
      }
    } catch (error) {
      console.error("Error saving Discord settings:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save Discord settings. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground mt-1">Configure how you want to be notified about your projects</p>
      </div>

      {isLoading ? (
        <EnhancedCard>
          <EnhancedCardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full mt-2" />
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      ) : (
        <>
          <Alert variant="info" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Discord Notifications</AlertTitle>
            <AlertDescription>
              We've upgraded our notification system to use Discord webhooks exclusively. Configure your Discord webhook
              below to receive notifications about your projects.
            </AlertDescription>
          </Alert>

          <EnhancedCard variant="default" hover="default" animation="fadeIn">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-primary" />
                Discord Notification Settings
              </EnhancedCardTitle>
              <EnhancedCardDescription>
                Configure how and when you want to receive Discord notifications about your projects
              </EnhancedCardDescription>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <DiscordWebhookConfig
                defaultValues={discordSettings || undefined}
                onSave={saveDiscordSettings}
                projects={projects}
              />
            </EnhancedCardContent>
          </EnhancedCard>
        </>
      )}
    </div>
  )
}
