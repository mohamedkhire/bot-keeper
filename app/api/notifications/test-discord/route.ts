import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      url,
      username,
      avatar_url,
      content,
      embed_title,
      embed_description,
      embed_color,
      embed_thumbnail,
      embed_image,
      embed_author_name,
      embed_author_url,
      embed_author_icon_url,
      embed_footer_text,
      embed_footer_icon_url,
      include_timestamp,
      include_uptime,
      include_response_time,
      include_downtime,
      include_buttons,
      project_name = "Test Project",
      project_url = "https://example.com",
      project_id = "test-id",
    } = body

    if (!url) {
      return NextResponse.json({ success: false, error: "Webhook URL is required" }, { status: 400 })
    }

    // Create fields array
    const fields = []

    if (include_uptime) {
      fields.push({
        name: "Uptime",
        value: "99.9%",
        inline: true,
      })
    }

    if (include_response_time) {
      fields.push({
        name: "Response Time",
        value: "123ms",
        inline: true,
      })
    }

    if (include_downtime) {
      fields.push({
        name: "Last Downtime",
        value: "None in the last 7 days",
        inline: false,
      })
    }

    // Create embed object
    const embed = {
      title: embed_title?.replace("{project_name}", project_name).replace("{status}", "Online") || "Test Notification",
      description:
        embed_description
          ?.replace("{project_name}", project_name)
          .replace("{status}", "Online")
          .replace("{status_emoji}", "✅") || "🧪 This is a test notification from Bot Keeper",
      color: embed_color ? Number.parseInt(embed_color.replace("#", ""), 16) : 0x5865f2,
      url: project_url,
      fields,
      timestamp: include_timestamp ? new Date().toISOString() : undefined,
    }

    // Add optional embed properties
    if (embed_thumbnail) {
      embed.thumbnail = { url: embed_thumbnail }
    }

    if (embed_image) {
      embed.image = { url: embed_image }
    }

    if (embed_author_name) {
      embed.author = {
        name: embed_author_name,
        url: embed_author_url || undefined,
        icon_url: embed_author_icon_url || undefined,
      }
    }

    if (embed_footer_text) {
      embed.footer = {
        text: embed_footer_text,
        icon_url: embed_footer_icon_url || undefined,
      }
    } else {
      embed.footer = {
        text: "🧪 Test notification from Bot Keeper",
      }
    }

    // Create webhook payload
    const payload: any = {
      username: username || "Bot Keeper",
      avatar_url: avatar_url || undefined,
      content: content || "",
      embeds: [embed],
    }

    // Add buttons if requested - FIXED FORMAT
    if (include_buttons) {
      const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"

      // Create properly formatted URLs
      const statisticsUrl = `${baseUrl}/dashboard/statistics?project=${encodeURIComponent(project_id)}`
      const dashboardUrl = `${baseUrl}/dashboard`

      // Validate URLs before adding components
      try {
        new URL(statisticsUrl)
        new URL(dashboardUrl)

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
                label: "View Dashboard",
                url: dashboardUrl,
              },
            ],
          },
        ]
      } catch (urlError) {
        console.warn("Invalid URLs for Discord buttons, skipping components:", urlError)
        // Don't add components if URLs are invalid
      }
    }

    // Send to Discord
    const discordResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text()
      throw new Error(`Discord API error: ${discordResponse.status} - ${errorText}`)
    }

    return NextResponse.json({ success: true, message: "Test notification sent successfully!" })
  } catch (error) {
    console.error("Error sending test Discord notification:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send test notification",
      },
      { status: 500 },
    )
  }
}
