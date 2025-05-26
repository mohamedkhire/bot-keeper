import { config } from "@/lib/config"

type EmailContent = {
  type: "down" | "up" | "test"
  project?: {
    name: string
    url: string
  }
  message?: string
}

type EmailOptions = {
  to: string
  subject: string
  content: EmailContent
}

export async function sendEmail({ to, subject, content }: EmailOptions): Promise<boolean> {
  try {
    // In a real implementation, you would use a service like SendGrid, Mailgun, etc.
    // For now, we'll just log the email details
    console.log(`[EMAIL] To: ${to}, Subject: ${subject}`)
    console.log(`[EMAIL] Content:`, content)

    // Simulate sending an email
    // In production, replace this with actual email sending logic
    // Example with SendGrid:
    /*
    const msg = {
      to,
      from: 'notifications@botkeeper.app',
      subject,
      text: getPlainTextContent(content),
      html: getHtmlContent(content),
    };
    await sgMail.send(msg);
    */

    // For now, just simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

// Helper function to generate email content
function getPlainTextContent(content: EmailContent): string {
  switch (content.type) {
    case "down":
      return `
Alert: ${content.project?.name} is DOWN

Your project ${content.project?.name} (${content.project?.url}) is currently unreachable.

Time: ${new Date().toLocaleString()}

- ${config.appName} Team
      `.trim()

    case "up":
      return `
Good News: ${content.project?.name} is back ONLINE

Your project ${content.project?.name} (${content.project?.url}) is now reachable again.

Time: ${new Date().toLocaleString()}

- ${config.appName} Team
      `.trim()

    case "test":
      return `
Test Notification from ${config.appName}

${content.message || "This is a test notification. If you received this, your email notifications are working correctly!"}

Time: ${new Date().toLocaleString()}

- ${config.appName} Team
      `.trim()

    default:
      return content.message || ""
  }
}

// In a real implementation, you would also have an HTML version of the email
