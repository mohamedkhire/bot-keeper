import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/notifications/email"
import { sendWebhook } from "@/lib/notifications/webhook"
import { sendDiscordWebhook, createStatusChangeEmbed } from "@/lib/notifications/discord"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, settings } = body

    if (!type) {
      return NextResponse.json({ success: false, error: "Notification type is required" }, { status: 400 })
    }

    // Test project data
    const testProject = {
      id: "test-project-id",
      name: "Test Project",
      url: "https://example.com",
      status: "online",
    }

    // Send test notification based on type
    if (type === "email") {
      if (!settings.email_enabled || !settings.email_address) {
        return NextResponse.json(
          { success: false, error: "Email notifications are not enabled or email address is missing" },
          { status: 400 },
        )
      }

      await sendEmail({
        to: settings.email_address,
        subject: "🧪 Test Notification from Bot Keeper",
        content: {
          type: "test",
          project: {
            name: testProject.name,
            url: testProject.url,
          },
        },
      })
    } else if (type === "webhook") {
      if (!settings.webhook_enabled || !settings.webhook_url) {
        return NextResponse.json(
          { success: false, error: "Webhook notifications are not enabled or webhook URL is missing" },
          { status: 400 },
        )
      }

      await sendWebhook({
        url: settings.webhook_url,
        payload: {
          type: "test",
          project: testProject,
          timestamp: new Date().toISOString(),
          message: "This is a test notification from Bot Keeper",
        },
      })
    } else if (type === "discord") {
      if (!settings.discord_enabled || !settings.discord_webhook_url) {
        return NextResponse.json(
          { success: false, error: "Discord notifications are not enabled or webhook URL is missing" },
          { status: 400 },
        )
      }

      const timestamp = new Date().toISOString()
      const embed = createStatusChangeEmbed(testProject, "unknown", "online", timestamp)

      // Add a test field to the embed
      embed.fields?.push({
        name: "Test Notification",
        value: "This is a test notification from Bot Keeper",
        inline: false,
      })

      await sendDiscordWebhook({
        url: settings.discord_webhook_url,
        username: "Bot Keeper Monitoring",
        content: "🧪 This is a test notification from Bot Keeper",
        embeds: [embed],
      })
    } else {
      return NextResponse.json({ success: false, error: "Invalid notification type" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending test notification:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send test notification" },
      { status: 500 },
    )
  }
}
