"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Check, Copy, Send, AlertCircle, Info, Plus, Trash, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DiscordMessagePreview } from "./discord-message-preview"
import { DiscordEmbedEditor } from "./discord-embed-editor"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Discord webhook schema
const discordWebhookSchema = z.object({
  enabled: z.boolean().default(false),
  url: z.string().url({ message: "Please enter a valid Discord webhook URL" }).or(z.string().length(0)),
  username: z.string().max(80, { message: "Username must be 80 characters or less" }).optional(),
  avatar_url: z.string().url({ message: "Please enter a valid URL" }).or(z.string().length(0)).optional(),
  content: z.string().max(2000, { message: "Content must be 2000 characters or less" }).optional(),
  embed_title: z.string().max(256, { message: "Title must be 256 characters or less" }).default("Status Update"),
  embed_description: z.string().max(4096, { message: "Description must be 4096 characters or less" }).optional(),
  embed_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, { message: "Please enter a valid hex color" })
    .default("#5865F2"),
  embed_thumbnail: z.string().url({ message: "Please enter a valid URL" }).or(z.string().length(0)).optional(),
  embed_image: z.string().url({ message: "Please enter a valid URL" }).or(z.string().length(0)).optional(),
  embed_author_name: z.string().max(256, { message: "Author name must be 256 characters or less" }).optional(),
  embed_author_url: z.string().url({ message: "Please enter a valid URL" }).or(z.string().length(0)).optional(),
  embed_author_icon_url: z.string().url({ message: "Please enter a valid URL" }).or(z.string().length(0)).optional(),
  embed_footer_text: z.string().max(2048, { message: "Footer text must be 2048 characters or less" }).optional(),
  embed_footer_icon_url: z.string().url({ message: "Please enter a valid URL" }).or(z.string().length(0)).optional(),
  include_timestamp: z.boolean().default(true),
  include_uptime: z.boolean().default(true),
  include_response_time: z.boolean().default(true),
  include_downtime: z.boolean().default(true),
  include_buttons: z.boolean().default(true),
  mention_everyone: z.boolean().default(false),
  mention_roles: z.array(z.string()).default([]),
  mention_users: z.array(z.string()).default([]),
  notification_frequency: z.enum(["all", "status_change", "downtime_only"]).default("status_change"),
  selected_projects: z.array(z.string()).default([]),
  notify_on_online: z.boolean().default(true),
  notify_on_offline: z.boolean().default(true),
  notify_on_ping: z.boolean().default(false),
  notify_on_edit: z.boolean().default(false),
  notify_on_delete: z.boolean().default(true),
  notify_on_pause: z.boolean().default(true),
})

export type DiscordWebhookFormValues = z.infer<typeof discordWebhookSchema>

interface DiscordWebhookConfigProps {
  defaultValues?: Partial<DiscordWebhookFormValues>
  onSave: (values: DiscordWebhookFormValues) => Promise<void>
  projects?: Array<{ id: string; name: string; url: string }>
}

export function DiscordWebhookConfig({ defaultValues, onSave, projects = [] }: DiscordWebhookConfigProps) {
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [copied, setCopied] = useState(false)
  const [mentionInput, setMentionInput] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const form = useForm<DiscordWebhookFormValues>({
    resolver: zodResolver(discordWebhookSchema),
    defaultValues: {
      enabled: false,
      url: "",
      username: "Bot Keeper",
      avatar_url: "",
      content: "",
      embed_title: "Status Update: {project_name}",
      embed_description: "{status_emoji} **{project_name}** is now **{status}**",
      embed_color: "#5865F2",
      embed_thumbnail: "",
      embed_image: "",
      embed_author_name: "",
      embed_author_url: "",
      embed_author_icon_url: "",
      embed_footer_text: "Bot Keeper Monitoring",
      embed_footer_icon_url: "",
      include_timestamp: true,
      include_uptime: true,
      include_response_time: true,
      include_downtime: true,
      include_buttons: true,
      mention_everyone: false,
      mention_roles: [],
      mention_users: [],
      notification_frequency: "status_change",
      selected_projects: [],
      notify_on_online: true,
      notify_on_offline: true,
      notify_on_ping: false,
      notify_on_edit: false,
      notify_on_delete: true,
      notify_on_pause: true,
      ...defaultValues,
    },
  })

  const watchEnabled = form.watch("enabled")
  const watchUrl = form.watch("url")
  const watchUsername = form.watch("username")
  const watchAvatarUrl = form.watch("avatar_url")
  const watchContent = form.watch("content")
  const watchEmbedTitle = form.watch("embed_title")
  const watchEmbedDescription = form.watch("embed_description")
  const watchEmbedColor = form.watch("embed_color")
  const watchEmbedThumbnail = form.watch("embed_thumbnail")
  const watchEmbedImage = form.watch("embed_image")
  const watchEmbedAuthorName = form.watch("embed_author_name")
  const watchEmbedAuthorUrl = form.watch("embed_author_url")
  const watchEmbedAuthorIconUrl = form.watch("embed_author_icon_url")
  const watchEmbedFooterText = form.watch("embed_footer_text")
  const watchEmbedFooterIconUrl = form.watch("embed_footer_icon_url")
  const watchIncludeTimestamp = form.watch("include_timestamp")
  const watchIncludeUptime = form.watch("include_uptime")
  const watchIncludeResponseTime = form.watch("include_response_time")
  const watchIncludeDowntime = form.watch("include_downtime")
  const watchIncludeButtons = form.watch("include_buttons")
  const watchMentionEveryone = form.watch("mention_everyone")
  const watchMentionRoles = form.watch("mention_roles")
  const watchMentionUsers = form.watch("mention_users")
  const watchSelectedProjects = form.watch("selected_projects")

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
          content: createMentionString() + (watchContent || ""),
          embed_title: watchEmbedTitle,
          embed_description: watchEmbedDescription,
          embed_color: watchEmbedColor,
          embed_thumbnail: watchEmbedThumbnail,
          embed_image: watchEmbedImage,
          embed_author_name: watchEmbedAuthorName,
          embed_author_url: watchEmbedAuthorUrl,
          embed_author_icon_url: watchEmbedAuthorIconUrl,
          embed_footer_text: watchEmbedFooterText,
          embed_footer_icon_url: watchEmbedFooterIconUrl,
          include_timestamp: watchIncludeTimestamp,
          include_uptime: watchIncludeUptime,
          include_response_time: watchIncludeResponseTime,
          include_downtime: watchIncludeDowntime,
          include_buttons: watchIncludeButtons,
          project_name: "Example Project",
          project_url: "https://example.com",
          project_id: "example-id",
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
    const formValues = form.getValues()

    const payload = {
      username: formValues.username || "Bot Keeper",
      avatar_url: formValues.avatar_url || undefined,
      content: createMentionString() + (formValues.content || ""),
      embeds: [
        {
          title: formValues.embed_title.replace("{project_name}", "Example Project").replace("{status}", "Online"),
          description: formValues.embed_description
            ?.replace("{project_name}", "Example Project")
            .replace("{status}", "Online")
            .replace("{status_emoji}", "✅"),
          color: Number.parseInt(formValues.embed_color.replace("#", ""), 16),
          url: "https://example.com",
          thumbnail: formValues.embed_thumbnail ? { url: formValues.embed_thumbnail } : undefined,
          image: formValues.embed_image ? { url: formValues.embed_image } : undefined,
          author: formValues.embed_author_name
            ? {
                name: formValues.embed_author_name,
                url: formValues.embed_author_url || undefined,
                icon_url: formValues.embed_author_icon_url || undefined,
              }
            : undefined,
          fields: [
            ...(formValues.include_uptime
              ? [
                  {
                    name: "Uptime",
                    value: "99.9%",
                    inline: true,
                  },
                ]
              : []),
            ...(formValues.include_response_time
              ? [
                  {
                    name: "Response Time",
                    value: "123ms",
                    inline: true,
                  },
                ]
              : []),
            ...(formValues.include_downtime
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
            text: formValues.embed_footer_text || "Powered by Bot Keeper",
            icon_url: formValues.embed_footer_icon_url || undefined,
          },
          timestamp: formValues.include_timestamp ? new Date().toISOString() : undefined,
        },
      ],
      components: formValues.include_buttons
        ? [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 5,
                  label: "View Statistics",
                  url: "https://example.com/statistics",
                },
                {
                  type: 2,
                  style: 5,
                  label: "View Dashboard",
                  url: "https://example.com/dashboard",
                },
              ],
            },
          ]
        : undefined,
    }

    navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Add mention
  const addMention = (type: "user" | "role") => {
    if (!mentionInput) return

    if (type === "user") {
      const currentUsers = form.getValues("mention_users")
      if (!currentUsers.includes(mentionInput)) {
        form.setValue("mention_users", [...currentUsers, mentionInput])
      }
    } else {
      const currentRoles = form.getValues("mention_roles")
      if (!currentRoles.includes(mentionInput)) {
        form.setValue("mention_roles", [...currentRoles, mentionInput])
      }
    }

    setMentionInput("")
  }

  // Remove mention
  const removeMention = (type: "user" | "role", id: string) => {
    if (type === "user") {
      const currentUsers = form.getValues("mention_users")
      form.setValue(
        "mention_users",
        currentUsers.filter((userId) => userId !== id),
      )
    } else {
      const currentRoles = form.getValues("mention_roles")
      form.setValue(
        "mention_roles",
        currentRoles.filter((roleId) => roleId !== id),
      )
    }
  }

  // Create mention string
  const createMentionString = () => {
    const mentions = []

    if (watchMentionEveryone) {
      mentions.push("@everyone")
    }

    watchMentionRoles.forEach((roleId) => {
      mentions.push(`<@&${roleId}>`)
    })

    watchMentionUsers.forEach((userId) => {
      mentions.push(`<@${userId}>`)
    })

    return mentions.length > 0 ? mentions.join(" ") + " " : ""
  }

  // Toggle project selection
  const toggleProjectSelection = (projectId: string) => {
    const currentSelection = [...watchSelectedProjects]
    const index = currentSelection.indexOf(projectId)

    if (index === -1) {
      currentSelection.push(projectId)
    } else {
      currentSelection.splice(index, 1)
    }

    form.setValue("selected_projects", currentSelection)
  }

  // Select all projects
  const selectAllProjects = () => {
    form.setValue(
      "selected_projects",
      projects.map((project) => project.id),
    )
  }

  // Deselect all projects
  const deselectAllProjects = () => {
    form.setValue("selected_projects", [])
  }

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(handleSubmit)}>
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="triggers">Triggers</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
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

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="mentions">
                    <AccordionTrigger>Mentions Configuration</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mention_everyone"
                            checked={form.watch("mention_everyone")}
                            onCheckedChange={(checked) => form.setValue("mention_everyone", !!checked)}
                          />
                          <Label htmlFor="mention_everyone">Mention @everyone</Label>
                        </div>

                        <div className="space-y-2">
                          <Label>Mention Roles</Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {watchMentionRoles.map((roleId) => (
                              <Badge key={roleId} variant="secondary" className="flex items-center gap-1">
                                @&lt;Role:{roleId}&gt;
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() => removeMention("role", roleId)}
                                >
                                  <Trash className="h-3 w-3" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Role ID"
                              value={mentionInput}
                              onChange={(e) => setMentionInput(e.target.value)}
                              className="bg-background"
                            />
                            <Button type="button" size="sm" onClick={() => addMention("role")} disabled={!mentionInput}>
                              <Plus className="h-4 w-4 mr-1" />
                              Add Role
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Enter role IDs to mention when sending notifications
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Mention Users</Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {watchMentionUsers.map((userId) => (
                              <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                                @&lt;User:{userId}&gt;
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() => removeMention("user", userId)}
                                >
                                  <Trash className="h-3 w-3" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="User ID"
                              value={mentionInput}
                              onChange={(e) => setMentionInput(e.target.value)}
                              className="bg-background"
                            />
                            <Button type="button" size="sm" onClick={() => addMention("user")} disabled={!mentionInput}>
                              <Plus className="h-4 w-4 mr-1" />
                              Add User
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Enter user IDs to mention when sending notifications
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 py-4">
                <Alert variant="outline" className="bg-muted/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Content Configuration</AlertTitle>
                  <AlertDescription>
                    Customize the content of your Discord notifications. You can use placeholders like{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{"{project_name}"}</code>,{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{"{status}"}</code>, and{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{"{status_emoji}"}</code>.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-2">
                  <Label htmlFor="content">Message Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Optional message content"
                    {...form.register("content")}
                    className="bg-background min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Text that appears above the embed. Mentions will be automatically added before this content.
                  </p>
                </div>

                <DiscordEmbedEditor form={form} />

                <div className="space-y-4 mt-4">
                  <h3 className="text-lg font-medium">Embed Fields</h3>
                  <div className="space-y-3">
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
                      <Label htmlFor="include_timestamp" className="flex flex-col space-y-1">
                        <span>Include Timestamp</span>
                        <span className="font-normal text-xs text-muted-foreground">
                          Show timestamp in notifications
                        </span>
                      </Label>
                      <Switch
                        id="include_timestamp"
                        checked={form.watch("include_timestamp")}
                        onCheckedChange={(checked) => form.setValue("include_timestamp", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="include_buttons" className="flex flex-col space-y-1">
                        <span>Include Action Buttons</span>
                        <span className="font-normal text-xs text-muted-foreground">
                          Add buttons linking to project statistics
                        </span>
                      </Label>
                      <Switch
                        id="include_buttons"
                        checked={form.watch("include_buttons")}
                        onCheckedChange={(checked) => form.setValue("include_buttons", checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Inline Preview */}
                <div className="mt-6">
                  <Collapsible open={showPreview} onOpenChange={setShowPreview}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        {showPreview ? "Hide Preview" : "Show Preview"}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="border rounded-lg p-4 bg-muted/20">
                        <h4 className="text-sm font-medium mb-3">Discord Message Preview</h4>
                        <DiscordMessagePreview
                          username={watchUsername || "Bot Keeper"}
                          avatarUrl={watchAvatarUrl}
                          content={createMentionString() + (watchContent || "")}
                          embedTitle={watchEmbedTitle
                            .replace("{project_name}", "Example Project")
                            .replace("{status}", "Online")}
                          embedDescription={
                            watchEmbedDescription
                              ?.replace("{project_name}", "Example Project")
                              .replace("{status}", "Online")
                              .replace("{status_emoji}", "✅") || ""
                          }
                          embedColor={watchEmbedColor}
                          embedThumbnail={watchEmbedThumbnail}
                          embedImage={watchEmbedImage}
                          embedAuthorName={watchEmbedAuthorName}
                          embedAuthorUrl={watchEmbedAuthorUrl}
                          embedAuthorIconUrl={watchEmbedAuthorIconUrl}
                          embedFooterText={watchEmbedFooterText || "Powered by Bot Keeper"}
                          embedFooterIconUrl={watchEmbedFooterIconUrl}
                          includeTimestamp={watchIncludeTimestamp}
                          includeUptime={watchIncludeUptime}
                          includeResponseTime={watchIncludeResponseTime}
                          includeDowntime={watchIncludeDowntime}
                          includeButtons={watchIncludeButtons}
                        />

                        <div className="flex justify-between mt-4">
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
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </TabsContent>

              <TabsContent value="triggers" className="space-y-4 py-4">
                <Alert variant="outline" className="bg-muted/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Notification Triggers</AlertTitle>
                  <AlertDescription>
                    Configure which project actions should trigger Discord notifications.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Status Changes</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="notify_on_online" className="flex flex-col space-y-1">
                        <span>Project comes online</span>
                        <span className="font-normal text-xs text-muted-foreground">
                          Notify when a project recovers and comes back online
                        </span>
                      </Label>
                      <Switch
                        id="notify_on_online"
                        checked={form.watch("notify_on_online")}
                        onCheckedChange={(checked) => form.setValue("notify_on_online", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="notify_on_offline" className="flex flex-col space-y-1">
                        <span>Project goes offline</span>
                        <span className="font-normal text-xs text-muted-foreground">
                          Notify when a project becomes unreachable or goes down
                        </span>
                      </Label>
                      <Switch
                        id="notify_on_offline"
                        checked={form.watch("notify_on_offline")}
                        onCheckedChange={(checked) => form.setValue("notify_on_offline", checked)}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-3">Project Actions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="notify_on_edit" className="flex flex-col space-y-1">
                          <span>Project edited</span>
                          <span className="font-normal text-xs text-muted-foreground">
                            Notify when project settings are modified
                          </span>
                        </Label>
                        <Switch
                          id="notify_on_edit"
                          checked={form.watch("notify_on_edit")}
                          onCheckedChange={(checked) => form.setValue("notify_on_edit", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="notify_on_delete" className="flex flex-col space-y-1">
                          <span>Project deleted</span>
                          <span className="font-normal text-xs text-muted-foreground">
                            Notify when a project is permanently deleted
                          </span>
                        </Label>
                        <Switch
                          id="notify_on_delete"
                          checked={form.watch("notify_on_delete")}
                          onCheckedChange={(checked) => form.setValue("notify_on_delete", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="notify_on_pause" className="flex flex-col space-y-1">
                          <span>Project paused/resumed</span>
                          <span className="font-normal text-xs text-muted-foreground">
                            Notify when monitoring is paused or resumed for a project
                          </span>
                        </Label>
                        <Switch
                          id="notify_on_pause"
                          checked={form.watch("notify_on_pause")}
                          onCheckedChange={(checked) => form.setValue("notify_on_pause", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="notify_on_ping" className="flex flex-col space-y-1">
                          <span>Manual ping</span>
                          <span className="font-normal text-xs text-muted-foreground">
                            Notify when a manual ping is performed (not recommended for frequent pings)
                          </span>
                        </Label>
                        <Switch
                          id="notify_on_ping"
                          checked={form.watch("notify_on_ping")}
                          onCheckedChange={(checked) => form.setValue("notify_on_ping", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="space-y-4 py-4">
                <Alert variant="outline" className="bg-muted/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Project Selection</AlertTitle>
                  <AlertDescription>
                    Select which projects should send notifications to this Discord webhook. If none are selected,
                    notifications will be sent for all projects.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between mb-2">
                  <Button type="button" variant="outline" size="sm" onClick={selectAllProjects}>
                    Select All
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={deselectAllProjects}>
                    Deselect All
                  </Button>
                </div>

                <div className="border rounded-md divide-y">
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{project.name}</span>
                          <span className="text-xs text-muted-foreground">{project.url}</span>
                        </div>
                        <Checkbox
                          checked={watchSelectedProjects.includes(project.id)}
                          onCheckedChange={() => toggleProjectSelection(project.id)}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">No projects available</div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {watchSelectedProjects.length === 0
                    ? "No projects selected. Notifications will be sent for all projects."
                    : `${watchSelectedProjects.length} project(s) selected.`}
                </p>
              </TabsContent>
            </Tabs>
          </>
        )}

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  )
}
