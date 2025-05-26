"use client"

import { useState } from "react"
import { Check, Copy, Send, AlertCircle, Info } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Discord webhook schema
const discordWebhookSchema = z.object({
  enabled: z.boolean().default(false),
  url: z.string().url({ message: "Please enter a valid Discord webhook URL" }).or(z.string().length(0)),
  username: z.string().max(80, { message: "Username must be 80 characters or less" }).optional(),
  avatar_url: z.string().url({ message: "Please enter a valid URL" }).or(z.string().length(0)).optional(),
  embed_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, { message: "Please enter a valid hex color" })
    .default("#5865F2"),
  include_uptime: z.boolean().default(true),
  include_response_time: z.boolean().default(true),
  include_downtime: z.boolean().default(true),
  include_logs: z.boolean().default(false),
  custom_footer: z.string().max(2048).optional(),
  notification_frequency: z.enum(["all", "status_change", "downtime_only"]).default("status_change"),
})

type DiscordWebhookFormValues = z.infer<typeof discordWebhookSchema>

interface DiscordWebhookConfigProps {
  defaultValues?: Partial<DiscordWebhookFormValues>
  onSave: (values: DiscordWebhookFormValues) => Promise<void>
  projectName?: string
  projectUrl?: string
}

export function DiscordWebhookConfig({
  defaultValues,
  onSave,
  projectName = "Example Project",
  projectUrl = "https://example.com",
}: DiscordWebhookConfigProps) {
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [copied, setCopied] = useState(false)

  const form = useForm<DiscordWebhookFormValues>({
    resolver: zodResolver(discordWebhookSchema),
    defaultValues: {
      enabled: false,
      url: "",
      username: "Bot Keeper",
      avatar_url: "",
      embed_color: "#5865F2",
      include_uptime: true,
      include_response_time: true,
      include_downtime: true,
      include_logs: false,
      custom_footer: "Powered by Bot Keeper",
      notification_frequency: "status_change",
      ...defaultValues,
    },
  })

  const watchEnabled = form.watch("enabled")
  const watchUrl = form.watch("url")
  const watchUsername = form.watch("username")
  const watchAvatarUrl = form.watch("avatar_url")
  const watchEmbedColor = form.watch("embed_color")
  const watchIncludeUptime = form.watch("include_uptime")
  const watchIncludeResponseTime = form.watch("include_response_time")
  const watchIncludeDowntime = form.watch("include_downtime")
  const watchCustomFooter = form.watch("custom_footer")

  // Handle form submission
  const handleSubmit = async (values: DiscordWebhookFormValues) => {
    setIsSaving(true)
    try {
      await onSave(values)
      toast({
        title: "Success",
        description: "Discord webhook settings saved successfully!",
      })
    } catch (error) {
      console.error("Error saving Discord webhook settings:", error)
      toast({
        title: "Error",
        description: "Failed to save Discord webhook settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Test Discord webhook
  const testWebhook = async () => {
    if (!watchEnabled || !watchUrl) {
      toast({
        title: "Error",
        description: "Discord webhook is not enabled or URL is missing.",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)
    try {
      const response = await fetch("/api/notifications/test-discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: watchUrl,
          username: watchUsername || "Bot Keeper",
          avatar_url: watchAvatarUrl,
          embed_color: watchEmbedColor,
          project_name: projectName,
          project_url: projectUrl,
          include_uptime: watchIncludeUptime,
          include_response_time: watchIncludeResponseTime,
          include_downtime: watchIncludeDowntime,
          custom_footer: watchCustomFooter,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to test Discord webhook")
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Test Discord notification sent successfully!",
        })
      } else {
        throw new Error(data.error || "Failed to test Discord webhook")
      }
    } catch (error) {
      console.error("Error testing Discord webhook:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to test Discord webhook. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  // Copy JSON payload
  const copyJsonPayload = () => {
    const payload = {
      username: watchUsername || "Bot Keeper",
      avatar_url: watchAvatarUrl,
      embeds: [
        {
          title: `Status Update: ${projectName}`,
          description: "This is an example of what your Discord notification will look like.",
          color: Number.parseInt(watchEmbedColor.replace("#", ""), 16),
          url: projectUrl,
          fields: [
            {
              name: "Status",
              value: "✅ Online",
              inline: true,
            },
            ...(watchIncludeResponseTime
              ? [
                  {
                    name: "Response Time",
                    value: "123ms",
                    inline: true,
                  },
                ]
              : []),
            ...(watchIncludeUptime
              ? [
                  {
                    name: "Uptime",
                    value: "99.9%",
                    inline: true,
                  },
                ]
              : []),
            ...(watchIncludeDowntime
              ? [
                  {
                    name: "Last Downtime",
                    value: "None in the last 7 days",
                    inline: false,
                  },
                ]
              : []),
          ],
          footer: {
            text: watchCustomFooter || "Powered by Bot Keeper",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }

    navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-discord mr-2 text-[#5865F2]"
              >
                <circle cx="9" cy="12" r="1" />
                <circle cx="15" cy="12" r="1" />
                <path d="M7.5 7.5c3.5-1 5.5-1 9 0" />
                <path d="M7.5 16.5c3.5 1 5.5 1 9 0" />
                <path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833-1.667 3.5-3 .667-1.667.5-5.833 0-7.5-.5-1.667-1.5-4.5-7-7.5-5.5 3-6.5 5.833-7 7.5-.5 1.667-.667 5.833 0 7.5.667 1.333 2 3 3.5 3 .5 0 2-2 2-3" />
              </svg>
              Discord Webhook Configuration
            </CardTitle>
            <CardDescription>Configure Discord webhook notifications for this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-2 mb-6">
              <Label htmlFor="discord_enabled" className="flex flex-col space-y-1">
                <span>Enable Discord Notifications</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Send status notifications to Discord via webhook
                </span>
              </Label>
              <Switch
                id="discord_enabled"
                checked={form.watch("enabled")}
                onCheckedChange={(checked) => form.setValue("enabled", checked)}
              />
            </div>

            {watchEnabled && (
              <>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="discord_webhook_url">
                        Discord Webhook URL
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 ml-1 inline-block text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Create a webhook in your Discord server settings and paste the URL here. Go to Server
                                Settings → Integrations → Webhooks → New Webhook.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Input
                        id="discord_webhook_url"
                        placeholder="https://discord.com/api/webhooks/..."
                        {...form.register("url")}
                        className="bg-background"
                      />
                      {form.formState.errors.url && (
                        <p className="text-sm text-destructive">{form.formState.errors.url.message}</p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="notification_frequency">Notification Frequency</Label>
                      <Select
                        value={form.watch("notification_frequency")}
                        onValueChange={(value) => form.setValue("notification_frequency", value as any)}
                      >
                        <SelectTrigger id="notification_frequency" className="bg-background">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Updates</SelectItem>
                          <SelectItem value="status_change">Status Changes Only</SelectItem>
                          <SelectItem value="downtime_only">Downtime Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Choose when to send notifications to Discord</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="appearance" className="space-y-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="discord_username">Webhook Name</Label>
                      <Input
                        id="discord_username"
                        placeholder="Bot Keeper"
                        {...form.register("username")}
                        className="bg-background"
                      />
                      <p className="text-xs text-muted-foreground">
                        The name that will appear as the sender of the webhook
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="discord_avatar_url">Avatar URL</Label>
                      <Input
                        id="discord_avatar_url"
                        placeholder="https://example.com/avatar.png"
                        {...form.register("avatar_url")}
                        className="bg-background"
                      />
                      <p className="text-xs text-muted-foreground">
                        URL to an image that will be used as the webhook's avatar
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="embed_color">Embed Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="embed_color"
                          type="color"
                          {...form.register("embed_color")}
                          className="w-12 h-8 p-1 bg-background"
                        />
                        <Input
                          value={form.watch("embed_color")}
                          onChange={(e) => form.setValue("embed_color", e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">The color of the embed's left border</p>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="custom_footer">Custom Footer</Label>
                      <Input
                        id="custom_footer"
                        placeholder="Powered by Bot Keeper"
                        {...form.register("custom_footer")}
                        className="bg-background"
                      />
                      <p className="text-xs text-muted-foreground">Custom text to display in the footer of the embed</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4 py-4">
                    <Alert variant="outline" className="bg-muted/50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Content Configuration</AlertTitle>
                      <AlertDescription>
                        Choose what information to include in your Discord notifications
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="include_uptime" className="flex flex-col space-y-1">
                          <span>Include Uptime</span>
                          <span className="font-normal text-xs text-muted-foreground">
                            Show uptime percentage in notifications
                          </span>
                        </Label>
                        <Switch
                          id="include_uptime"
                          checked={form.watch("include_uptime")}
                          onCheckedChange={(checked) => form.setValue("include_uptime", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="include_response_time" className="flex flex-col space-y-1">
                          <span>Include Response Time</span>
                          <span className="font-normal text-xs text-muted-foreground">
                            Show response time in notifications
                          </span>
                        </Label>
                        <Switch
                          id="include_response_time"
                          checked={form.watch("include_response_time")}
                          onCheckedChange={(checked) => form.setValue("include_response_time", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="include_downtime" className="flex flex-col space-y-1">
                          <span>Include Downtime</span>
                          <span className="font-normal text-xs text-muted-foreground">
                            Show downtime information in notifications
                          </span>
                        </Label>
                        <Switch
                          id="include_downtime"
                          checked={form.watch("include_downtime")}
                          onCheckedChange={(checked) => form.setValue("include_downtime", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="include_logs" className="flex flex-col space-y-1">
                          <span>Include JSON Logs</span>
                          <span className="font-normal text-xs text-muted-foreground">
                            Attach detailed JSON logs to notifications
                          </span>
                        </Label>
                        <Switch
                          id="include_logs"
                          checked={form.watch("include_logs")}
                          onCheckedChange={(checked) => form.setValue("include_logs", checked)}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Preview</h3>
                  <div className="bg-[#36393f] text-white rounded-md p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 overflow-hidden">
                        {watchAvatarUrl ? (
                          <img
                            src={watchAvatarUrl || "/placeholder.svg"}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#5865F2] text-white font-bold">
                            {(watchUsername || "BK").charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{watchUsername || "Bot Keeper"}</div>
                        <div className="text-xs text-gray-400">Today at {new Date().toLocaleTimeString()}</div>
                      </div>
                    </div>
                    <div className="border-l-4 rounded-sm pl-3 mt-2" style={{ borderColor: watchEmbedColor }}>
                      <div className="text-lg font-semibold">Status Update: {projectName}</div>
                      <div className="text-sm mb-2">
                        This is an example of what your Discord notification will look like.
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <div className="text-xs font-semibold text-gray-400">Status</div>
                          <div className="text-sm">✅ Online</div>
                        </div>
                        {watchIncludeResponseTime && (
                          <div>
                            <div className="text-xs font-semibold text-gray-400">Response Time</div>
                            <div className="text-sm">123ms</div>
                          </div>
                        )}
                        {watchIncludeUptime && (
                          <div>
                            <div className="text-xs font-semibold text-gray-400">Uptime</div>
                            <div className="text-sm">99.9%</div>
                          </div>
                        )}
                      </div>
                      {watchIncludeDowntime && (
                        <div className="mb-2">
                          <div className="text-xs font-semibold text-gray-400">Last Downtime</div>
                          <div className="text-sm">None in the last 7 days</div>
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-2">
                        {watchCustomFooter || "Powered by Bot Keeper"} • {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyJsonPayload}
                      className="flex items-center"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy JSON
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={testWebhook}
                      disabled={!watchUrl || isTesting}
                      className="flex items-center"
                    >
                      {isTesting ? (
                        <>Testing...</>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Test Webhook
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
