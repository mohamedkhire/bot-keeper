type WebhookOptions = {
  url: string
  payload: any
  contentType?: string
}

export async function sendWebhook({
  url,
  payload,
  contentType = "application/json",
}: WebhookOptions): Promise<boolean> {
  try {
    // Validate URL before sending
    if (!url || !url.trim() || !url.startsWith("http")) {
      console.error("Invalid webhook URL:", url)
      return false
    }

    // Validate payload
    if (!payload) {
      console.error("Empty webhook payload")
      return false
    }

    // Prepare the body based on content type
    let body: string
    try {
      body = typeof payload === "string" ? payload : JSON.stringify(payload)
    } catch (jsonError) {
      console.error("Error stringifying webhook payload:", jsonError)
      return false
    }

    // Send webhook notification with proper error handling
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        "User-Agent": "BotKeeper-Notifications/1.0",
        Accept: "application/json, text/plain, */*",
      },
      body,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No error details available")
      console.error(`Webhook request failed with status ${response.status}: ${errorText}`)

      // Log more details about the request for debugging
      console.debug("Webhook request details:", {
        url,
        contentType,
        payloadSize: body.length,
        responseStatus: response.status,
        responseStatusText: response.statusText,
      })

      return false
    }

    return true
  } catch (error) {
    console.error("Error sending webhook:", error instanceof Error ? error.message : String(error))
    return false
  }
}
