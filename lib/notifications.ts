import { createTransport } from "nodemailer"
import { db } from "@/lib/db"
import { sendDiscordNotification, createStatusChangeEmbed } from "@/lib/discord"

export async function sendNotification(
  projectId: string,
  projectName: string,
  url: string,
  isUp: boolean,
  responseTime?: number,
) {
  try {
    // Get project-specific notification settings
    const project = await db.query(`SELECT discord_webhook_enabled, discord_webhook_url FROM projects WHERE id = $1`, [
      projectId,
    ])

    // Get global notification settings
    const settings = await db.query(`SELECT * FROM notification_settings LIMIT 1`)

    if (!settings.rows.length) {
      console.error("No notification settings found")
      return
    }

    const notificationSettings = settings.rows[0]
    const projectSettings = project.rows[0]
    const timestamp = new Date()

    // Log the notification attempt
    const logResult = await db.query(
      `INSERT INTO notification_logs 
       (project_id, status_change, timestamp, email_sent, webhook_sent, discord_sent) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [projectId, isUp ? "up" : "down", timestamp, false, false, false],
    )

    const logId = logResult.rows[0].id
    let emailSent = false
    let webhookSent = false
    let discordSent = false

    // Send email notification if enabled
    if (
      notificationSettings.email_enabled &&
      ((isUp && notificationSettings.notify_on_up) || (!isUp && notificationSettings.notify_on_down))
    ) {
      emailSent = await sendEmailNotification(notificationSettings.email_address, projectName, url, isUp, responseTime)
    }

    // Send webhook notification if enabled
    if (
      notificationSettings.webhook_enabled &&
      ((isUp && notificationSettings.notify_on_up) || (!isUp && notificationSettings.notify_on_down))
    ) {
      webhookSent = await sendWebhookNotification(
        notificationSettings.webhook_url,
        projectName,
        url,
        isUp,
        responseTime,
      )
    }

    // Send Discord notification if enabled (project-specific or global)
    if (
      (projectSettings.discord_webhook_enabled || notificationSettings.discord_enabled) &&
      ((isUp && notificationSettings.notify_on_up) || (!isUp && notificationSettings.notify_on_down))
    ) {
      // Prefer project-specific webhook if available
      const webhookUrl =
        projectSettings.discord_webhook_enabled && projectSettings.discord_webhook_url
          ? projectSettings.discord_webhook_url
          : notificationSettings.discord_webhook_url

      if (webhookUrl) {
        const embed = createStatusChangeEmbed(projectName, url, isUp, responseTime, timestamp)
        discordSent = await sendDiscordNotification(webhookUrl, {
          username: "Bot Keeper",
          embeds: [embed],
        })
      }
    }

    // Update the notification log with the results
    await db.query(
      `UPDATE notification_logs 
       SET email_sent = $1, webhook_sent = $2, discord_sent = $3
       WHERE id = $4`,
      [emailSent, webhookSent, discordSent, logId],
    )

    return { emailSent, webhookSent, discordSent }
  } catch (error) {
    console.error("Error sending notification:", error)
    return { emailSent: false, webhookSent: false, discordSent: false }
  }
}

async function sendEmailNotification(
  email: string,
  projectName: string,
  url: string,
  isUp: boolean,
  responseTime?: number,
): Promise<boolean> {
  try {
    const transporter = createTransport({
      host: process.env.SMTP_HOST || "smtp.example.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    })

    const status = isUp ? "UP" : "DOWN"
    const subject = `[Bot Keeper] ${projectName} is ${status}`
    const responseTimeText = responseTime ? `Response time: ${responseTime}ms` : ""

    const html = `
      <h1>${projectName} is ${status}</h1>
      <p>URL: <a href="${url}">${url}</a></p>
      ${responseTimeText ? `<p>${responseTimeText}</p>` : ""}
      <p>Time: ${new Date().toLocaleString()}</p>
    `

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || "notifications@botkeeper.app",
      to: email,
      subject,
      html,
    })

    console.log("Email sent:", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending email notification:", error)
    return false
  }
}

async function sendWebhookNotification(
  webhookUrl: string,
  projectName: string,
  url: string,
  isUp: boolean,
  responseTime?: number,
): Promise<boolean> {
  try {
    const status = isUp ? "UP" : "DOWN"
    const payload = {
      project: projectName,
      url,
      status,
      responseTime,
      timestamp: new Date().toISOString(),
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error(`Webhook error: ${response.status}`)
      return false
    }

    return true
  } catch (error) {
    console.error("Error sending webhook notification:", error)
    return false
  }
}
