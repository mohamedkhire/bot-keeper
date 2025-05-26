/**
 * Discord webhook service for Bot Keeper
 * Handles sending formatted Discord embeds for notifications
 */

export interface DiscordEmbed {
  title?: string
  description?: string
  color?: number // Decimal color value
  fields?: Array<{
    name: string
    value: string
    inline?: boolean
  }>
  timestamp?: string // ISO string
  footer?: {
    text: string
    icon_url?: string
  }
}

export interface DiscordWebhookPayload {
  content?: string
  username?: string
  avatar_url?: string
  embeds?: DiscordEmbed[]
}

/**
 * Send a notification to a Discord webhook
 */
export async function sendDiscordNotification(webhookUrl: string, payload: DiscordWebhookPayload): Promise<boolean> {
  try {
    if (!webhookUrl) {
      console.error("Discord webhook URL is not provided")
      return false
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Discord webhook error: ${response.status} - ${errorText}`)
      return false
    }

    return true
  } catch (error) {
    console.error("Error sending Discord notification:", error)
    return false
  }
}

/**
 * Create a Discord embed for a status change notification
 */
export function createStatusChangeEmbed(
  projectName: string,
  url: string,
  isUp: boolean,
  responseTime?: number,
  timestamp?: Date,
): DiscordEmbed {
  const status = isUp ? "UP" : "DOWN"
  const color = isUp ? 0x57f287 : 0xed4245 // Green for up, red for down
  const description = isUp
    ? `✅ **${projectName}** is now UP and responding normally.`
    : `❌ **${projectName}** is DOWN and not responding.`

  const embed: DiscordEmbed = {
    title: `Status Change: ${status}`,
    description,
    color,
    fields: [
      {
        name: "Website",
        value: url,
        inline: true,
      },
    ],
    timestamp: (timestamp || new Date()).toISOString(),
    footer: {
      text: "Bot Keeper Monitoring",
    },
  }

  if (responseTime !== undefined && isUp) {
    embed.fields?.push({
      name: "Response Time",
      value: `${responseTime}ms`,
      inline: true,
    })
  }

  return embed
}

/**
 * Send a test notification to verify Discord webhook configuration
 */
export async function sendTestDiscordNotification(webhookUrl: string): Promise<boolean> {
  const testEmbed: DiscordEmbed = {
    title: "Test Notification",
    description: "This is a test notification from Bot Keeper.",
    color: 0x3498db, // Blue color
    timestamp: new Date().toISOString(),
    footer: {
      text: "Bot Keeper Monitoring",
    },
  }

  return sendDiscordNotification(webhookUrl, {
    username: "Bot Keeper",
    embeds: [testEmbed],
  })
}
