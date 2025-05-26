type DiscordEmbedField = {
  name: string
  value: string
  inline?: boolean
}

type DiscordEmbed = {
  title: string
  description?: string
  url?: string
  color?: number // Decimal color value
  fields?: DiscordEmbedField[]
  timestamp?: string
  footer?: {
    text: string
    icon_url?: string
  }
  thumbnail?: {
    url: string
  }
  image?: {
    url: string
  }
  author?: {
    name: string
    url?: string
    icon_url?: string
  }
}

type DiscordWebhookOptions = {
  url: string
  payload: any
}

export async function sendDiscordWebhook(options: DiscordWebhookOptions): Promise<boolean> {
  try {
    // Validate webhook URL
    if (!options.url || !options.url.includes("discord.com/api/webhooks")) {
      console.error("Invalid Discord webhook URL")
      return false
    }

    // Send webhook notification
    const response = await fetch(options.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options.payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Discord webhook request failed with status ${response.status}: ${errorText}`)
      return false
    }

    return true
  } catch (error) {
    console.error("Error sending Discord webhook:", error)
    return false
  }
}

// Helper function to create a status change embed (legacy)
export function createStatusChangeEmbed(
  project: { id: string; name: string; url: string; status: string },
  previousStatus: string,
  newStatus: string,
  timestamp: string,
): DiscordEmbed {
  // Define colors for different statuses
  const colors = {
    online: 3066993, // Green
    offline: 15158332, // Red
    unknown: 10070709, // Gray
  }

  // Determine embed color based on new status
  const color = colors[newStatus as keyof typeof colors] || colors.unknown

  // Create status description
  let description: string
  if (newStatus === "online" && previousStatus === "offline") {
    description = `✅ **${project.name}** is back online!`
  } else if (newStatus === "offline" && previousStatus === "online") {
    description = `❌ **${project.name}** is down!`
  } else {
    description = `Status changed from **${previousStatus}** to **${newStatus}**`
  }

  // Create embed
  return {
    title: `Status Change: ${project.name}`,
    description,
    url: project.url,
    color,
    fields: [
      {
        name: "Project URL",
        value: project.url,
        inline: true,
      },
      {
        name: "Previous Status",
        value: previousStatus.charAt(0).toUpperCase() + previousStatus.slice(1),
        inline: true,
      },
      {
        name: "New Status",
        value: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
        inline: true,
      },
    ],
    timestamp,
    footer: {
      text: "Bot Keeper Monitoring",
    },
  }
}
