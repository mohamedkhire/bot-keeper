"use client"

import { useState, useEffect } from "react"
import { Bell, MessageSquare, Mail, Webhook } from "lucide-react"
import { motion } from "framer-motion"

import { DiscordWebhookConfig, type DiscordWebhookFormValues } from "@/components/discord/discord-webhook-config"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Project = {
  id: string
  name: string
  url: string
}

export default function NotificationsPage() {
  const [discordSettings, setDiscordSettings] = useState<Partial<DiscordWebhookFormValues>>({})
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load settings and projects on mount
  useEffect(() => {
    Promise.all([loadDiscordSettings(), loadProjects()]).finally(() => setIsLoading(false))
  }, [])

  const loadDiscordSettings = async () => {
    try {
      const response = await fetch("/api/notifications/discord")
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.settings) {
          setDiscordSettings(data.settings)
        }
      }
    } catch (error) {
      console.error("Error loading Discord settings:", error)
    }
  }

  const loadProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.projects) {
          // Filter out default projects
          const userProjects = data.projects.filter((project: any) => !project.isDefault)
          setProjects(userProjects)
        }
      }
    } catch (error) {
      console.error("Error loading projects:", error)
    }
  }

  const handleSaveDiscordSettings = async (values: DiscordWebhookFormValues) => {
    try {
      const response = await fetch("/api/notifications/discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save settings")
      }

      const data = await response.json()
      if (data.success) {
        setDiscordSettings(values)
        toast({
          title: "Success",
          description: "Discord webhook settings saved successfully!",
        })
      } else {
        throw new Error(data.error || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving Discord settings:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save Discord webhook settings",
        variant: "destructive",
      })
      throw error // Re-throw to let the component handle it
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
            <Bell className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Notification Settings</h1>
            <p className="text-muted-foreground text-lg">Configure how you receive alerts and updates</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
          <Bell className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground text-lg">Configure how you receive alerts and updates</p>
        </div>
      </motion.div>

      {/* Overview Alert */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-800">
          <MessageSquare className="h-4 w-4" />
          <AlertTitle>Notification Channels</AlertTitle>
          <AlertDescription>
            Set up Discord webhooks to receive real-time notifications about your project status changes, downtime
            alerts, and system events. More notification channels coming soon!
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Discord Webhook Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Discord Notifications</h2>
              <p className="text-sm text-muted-foreground">Send real-time alerts to your Discord server via webhooks</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <DiscordWebhookConfig
            defaultValues={discordSettings}
            onSave={handleSaveDiscordSettings}
            projects={projects}
          />
        </div>
      </motion.div>

      {/* Coming Soon Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-6 md:grid-cols-2"
      >
        <div className="bg-card/50 rounded-2xl border border-border/50 p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">Coming Soon</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Receive email alerts for critical events and daily/weekly summary reports.
          </p>
        </div>

        <div className="bg-card/50 rounded-2xl border border-border/50 p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Webhook className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Custom Webhooks</h3>
              <p className="text-sm text-muted-foreground">Coming Soon</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Send notifications to any HTTP endpoint with custom payloads and authentication.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
