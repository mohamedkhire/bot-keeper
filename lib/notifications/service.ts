import { createServerSupabaseClient } from "@/lib/supabase"
import { sendDiscordWebhook } from "./discord"

type Project = {
  id: string
  name: string
  url: string
  status: "online" | "offline" | "unknown"
}

type DiscordWebhookSettings = {
  id: string
  enabled: boolean
  url: string
  username?: string
  avatar_url?: string
  content?: string
  embed_title?: string
  embed_description?: string
  embed_color?: string
  embed_thumbnail?: string
  embed_image?: string
  embed_author_name?: string
  embed_author_url?: string
  embed_author_icon_url?: string
  embed_footer_text?: string
  embed_footer_icon_url?: string
  include_timestamp: boolean
  include_uptime: boolean
  include_response_time: boolean
  include_downtime: boolean
  include_buttons: boolean
  mention_everyone: boolean
  mention_roles: string[]
  mention_users: string[]
  notification_frequency: "all" | "status_change" | "downtime_only"
  selected_projects: string[]
  notify_on_online: boolean
  notify_on_offline: boolean
  notify_on_ping: boolean
  notify_on_edit: boolean
  notify_on_delete: boolean
  notify_on_pause: boolean
}

// Send notifications when a project status changes
export async function notifyStatusChange(
  project: Project,
  previousStatus: "online" | "offline" | "unknown",
  newStatus: "online" | "offline" | "unknown",
  responseTime?: number,
  silent = false,
): Promise<void> {
  try {
    // Skip notifications if silent mode is enabled
    if (silent) {
      console.log("Silent mode enabled, skipping notifications")
      return
    }

    // Skip if status didn't change or is unknown
    if (previousStatus === newStatus || newStatus === "unknown") {
      return
    }

    // Get Discord webhook settings
    const discordSettings = await getDiscordWebhookSettings()

    // Check if we should send a Discord notification
    if (discordSettings && discordSettings.enabled) {
      const isDown = newStatus === "offline" && previousStatus === "online"
      const isUp = newStatus === "online" && previousStatus === "offline"

      // Check if this type of notification is enabled
      let shouldSendNotification = false
      if (isDown && discordSettings.notify_on_offline) {
        shouldSendNotification = true
      } else if (isUp && discordSettings.notify_on_online) {
        shouldSendNotification = true
      }

      // Check notification frequency
      if (shouldSendNotification) {
        if (discordSettings.notification_frequency === "downtime_only" && !isDown) {
          shouldSendNotification = false
        }
      }

      // Check if this project is selected for notifications
      if (discordSettings.selected_projects.length > 0 && !discordSettings.selected_projects.includes(project.id)) {
        shouldSendNotification = false
      }

      if (shouldSendNotification) {
        await sendDiscordNotification(
          discordSettings,
          project,
          previousStatus,
          newStatus,
          responseTime,
          "status_change",
        )
      }
    }

    // Log notification
    try {
      await logNotification({
        project_id: project.id,
        notification_type: newStatus === "offline" ? "down" : "up",
        status_change: `${previousStatus} -> ${newStatus}`,
        discord_sent: true,
      })
    } catch (logError) {
      console.error("Error logging notification:", logError)
    }
  } catch (error) {
    console.error("Error sending notifications:", error)
  }
}

// Send notifications for project actions
export async function notifyProjectAction(
  project: Project,
  action: "edit" | "delete" | "pause" | "resume" | "ping",
  details?: string,
): Promise<void> {
  try {
    // Get Discord webhook settings
    const discordSettings = await getDiscordWebhookSettings()

    if (!discordSettings || !discordSettings.enabled) {
      return
    }

    // Check if this type of notification is enabled
    let shouldSendNotification = false
    switch (action) {
      case "edit":
        shouldSendNotification = discordSettings.notify_on_edit
        break
      case "delete":
        shouldSendNotification = discordSettings.notify_on_delete
        break
      case "pause":
      case "resume":
        shouldSendNotification = discordSettings.notify_on_pause
        break
      case "ping":
        shouldSendNotification = discordSettings.notify_on_ping
        break
    }

    // Check if this project is selected for notifications
    if (discordSettings.selected_projects.length > 0 && !discordSettings.selected_projects.includes(project.id)) {
      shouldSendNotification = false
    }

    if (shouldSendNotification) {
      await sendDiscordNotification(discordSettings, project, "unknown", "unknown", undefined, action, details)
    }

    // Log notification
    try {
      await logNotification({
        project_id: project.id,
        notification_type: action,
        discord_sent: shouldSendNotification,
      })
    } catch (logError) {
      console.error("Error logging notification:", logError)
    }
  } catch (error) {
    console.error("Error sending project action notifications:", error)
  }
}

// Send a Discord notification
async function sendDiscordNotification(
  settings: DiscordWebhookSettings,
  project: Project,
  previousStatus: "online" | "offline" | "unknown",
  newStatus: "online" | "offline" | "unknown",
  responseTime?: number,
  action?: string,
  details?: string,
): Promise<boolean> {
  try {
    const isDown = newStatus === "offline"
    const isUp = newStatus === "online"
    const isAction = action && action !== "status_change"

    // Create mention string
    let mentionString = ""
    if (settings.mention_everyone) {
      mentionString += "@everyone "
    }

    if (settings.mention_roles && settings.mention_roles.length > 0) {
      settings.mention_roles.forEach((roleId) => {
        mentionString += `<@&${roleId}> `
      })
    }

    if (settings.mention_users && settings.mention_users.length > 0) {
      settings.mention_users.forEach((userId) => {
        mentionString += `<@${userId}> `
      })
    }

    // Create content based on action type
    let content = mentionString
    let embedTitle = settings.embed_title || "Status Update: {project_name}"
    let embedDescription = settings.embed_description || "{status_emoji} **{project_name}** is now **{status}**"

    if (isAction) {
      // Handle project actions
      switch (action) {
        case "edit":
          content += `📝 Project ${project.name} has been edited`
          embedTitle = `Project Edited: ${project.name}`
          embedDescription = `🔧 **${project.name}** has been modified${details ? `\n\n${details}` : ""}`
          break
        case "delete":
          content += `🗑️ Project ${project.name} has been deleted`
          embedTitle = `Project Deleted: ${project.name}`
          embedDescription = `❌ **${project.name}** has been permanently deleted`
          break
        case "pause":
          content += `⏸️ Monitoring paused for ${project.name}`
          embedTitle = `Monitoring Paused: ${project.name}`
          embedDescription = `⏸️ Monitoring has been **paused** for **${project.name}**`
          break
        case "resume":
          content += `▶️ Monitoring resumed for ${project.name}`
          embedTitle = `Monitoring Resumed: ${project.name}`
          embedDescription = `▶️ Monitoring has been **resumed** for **${project.name}**`
          break
        case "ping":
          content += `🏓 Manual ping performed on ${project.name}`
          embedTitle = `Manual Ping: ${project.name}`
          embedDescription = `🏓 Manual ping performed on **${project.name}**${responseTime ? ` (${responseTime}ms)` : ""}`
          break
      }
    } else {
      // Handle status changes
      if (settings.content) {
        content += settings.content
          .replace("{project_name}", project.name)
          .replace("{status}", newStatus)
          .replace("{previous_status}", previousStatus)
      } else if (isDown) {
        content += `🔴 Alert: ${project.name} is DOWN`
      } else if (isUp) {
        content += `🟢 Good News: ${project.name} is back ONLINE`
      }

      embedTitle = embedTitle.replace("{project_name}", project.name).replace("{status}", newStatus)

      embedDescription = embedDescription
        .replace("{project_name}", project.name)
        .replace("{status}", newStatus)
        .replace("{previous_status}", previousStatus)
        .replace("{status_emoji}", isDown ? "🔴" : isUp ? "🟢" : "⚪")
    }

    // Create fields
    const fields = []

    if (settings.include_uptime && !isAction) {
      // Calculate uptime from ping history
      const uptime = await calculateProjectUptime(project.id)
      fields.push({
        name: "Uptime",
        value: uptime,
        inline: true,
      })
    }

    if (settings.include_response_time && responseTime) {
      fields.push({
        name: "Response Time",
        value: `${responseTime}ms`,
        inline: true,
      })
    }

    if (settings.include_downtime && !isAction) {
      const lastDowntime = await getLastDowntime(project.id)
      fields.push({
        name: "Last Downtime",
        value: lastDowntime,
        inline: false,
      })
    }

    // Create embed
    const embed = {
      title: embedTitle,
      description: embedDescription,
      color: settings.embed_color
        ? Number.parseInt(settings.embed_color.replace("#", ""), 16)
        : isDown
          ? 0xed4245
          : isUp
            ? 0x57f287
            : isAction
              ? 0xfee75c
              : 0x5865f2,
      url: project.url,
      fields,
      timestamp: settings.include_timestamp ? new Date().toISOString() : undefined,
    }

    // Add thumbnail if provided
    if (settings.embed_thumbnail) {
      embed.thumbnail = { url: settings.embed_thumbnail }
    }

    // Add image if provided
    if (settings.embed_image) {
      embed.image = { url: settings.embed_image }
    }

    // Add author if provided
    if (settings.embed_author_name) {
      embed.author = {
        name: settings.embed_author_name,
        url: settings.embed_author_url || undefined,
        icon_url: settings.embed_author_icon_url || undefined,
      }
    }

    // Add footer if provided
    if (settings.embed_footer_text) {
      embed.footer = {
        text: settings.embed_footer_text,
        icon_url: settings.embed_footer_icon_url || undefined,
      }
    } else {
      embed.footer = {
        text: "Powered by Bot Keeper",
      }
    }

    // Create webhook payload
    const payload: any = {
      username: settings.username || "Bot Keeper",
      content: content || undefined,
      embeds: [embed],
    }

    // Add avatar URL if provided
    if (settings.avatar_url) {
      payload.avatar_url = settings.avatar_url
    }

    // Add buttons if requested and not a delete action - FIXED FORMAT
    if (settings.include_buttons && action !== "delete") {
      const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

      // Ensure URLs are valid and properly formatted
      const statisticsUrl = `${baseUrl}/dashboard/statistics?project=${encodeURIComponent(project.id)}`
      const projectUrl = `${baseUrl}/dashboard/project/${encodeURIComponent(project.id)}`

      // Validate URLs before adding components
      try {
        new URL(statisticsUrl)
        new URL(projectUrl)

        payload.components = [
          {
            type: 1, // Action Row
            components: [
              {
                type: 2, // Button
                style: 5, // Link
                label: "View Statistics",
                url: statisticsUrl,
              },
              {
                type: 2, // Button
                style: 5, // Link
                label: "View Project",
                url: projectUrl,
              },
            ],
          },
        ]
      } catch (urlError) {
        console.warn("Invalid URLs for Discord buttons, skipping components:", urlError)
        // Don't add components if URLs are invalid
      }
    }

    // Send webhook
    const success = await sendDiscordWebhook({
      url: settings.url,
      payload,
    })

    return success
  } catch (error) {
    console.error("Error sending Discord notification:", error)
    return false
  }
}

// Get Discord webhook settings
async function getDiscordWebhookSettings(): Promise<DiscordWebhookSettings | null> {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("discord_webhook_settings").select("*").single()

    if (error) {
      console.error("Error fetching Discord webhook settings:", error)
      return null
    }

    return data as DiscordWebhookSettings
  } catch (error) {
    console.error("Error in getDiscordWebhookSettings:", error)
    return null
  }
}

// Calculate project uptime from ping history
async function calculateProjectUptime(projectId: string): Promise<string> {
  try {
    const supabase = createServerSupabaseClient()

    // Get ping history for the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from("ping_history")
      .select("status")
      .eq("project_id", projectId)
      .gte("created_at", twentyFourHoursAgo.toISOString())
      .order("created_at", { ascending: false })

    if (error || !data || data.length === 0) {
      return "N/A"
    }

    const successfulPings = data.filter((ping) => ping.status).length
    const totalPings = data.length
    const uptimePercentage = (successfulPings / totalPings) * 100

    return `${uptimePercentage.toFixed(1)}%`
  } catch (error) {
    console.error("Error calculating uptime:", error)
    return "N/A"
  }
}

// Get last downtime information
async function getLastDowntime(projectId: string): Promise<string> {
  try {
    const supabase = createServerSupabaseClient()

    // Get the most recent failed ping
    const { data, error } = await supabase
      .from("ping_history")
      .select("created_at")
      .eq("project_id", projectId)
      .eq("status", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return "None in the last 7 days"
    }

    const downtime = new Date(data.created_at)
    const now = new Date()
    const diffMs = now.getTime() - downtime.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    } else {
      return "Less than an hour ago"
    }
  } catch (error) {
    console.error("Error getting last downtime:", error)
    return "Unknown"
  }
}

// Log notification for tracking
async function logNotification({
  project_id,
  notification_type,
  status_change,
  email_sent = false,
  webhook_sent = false,
  discord_sent = false,
  error_message,
}: {
  project_id: string
  notification_type: string
  status_change?: string
  email_sent?: boolean
  webhook_sent?: boolean
  discord_sent?: boolean
  error_message?: string
}): Promise<void> {
  try {
    const supabase = createServerSupabaseClient()

    await supabase.from("notification_logs").insert({
      project_id,
      notification_type,
      status_change,
      email_sent,
      webhook_sent,
      discord_sent,
      error_message,
    })
  } catch (error) {
    console.error("Error logging notification:", error)
  }
}
