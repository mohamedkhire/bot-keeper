// This file contains the worker logic for keeping bots alive
import { getAllProjects } from "./storage"
import { logger } from "./logger"

// Function to directly ping a bot URL with minimal overhead
export async function pingBot(url: string): Promise<boolean> {
  try {
    // Validate URL
    try {
      new URL(url)
    } catch (error) {
      logger.error(`Invalid bot URL: ${url}`)
      return false
    }

    // Add cache-busting parameters
    const pingUrl = new URL(url)
    pingUrl.searchParams.append("keepalive", "true")
    pingUrl.searchParams.append("t", Date.now().toString())

    // Use a short timeout to avoid hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    try {
      const response = await fetch(pingUrl.toString(), {
        method: "GET",
        headers: {
          "User-Agent": "BotKeeper-Worker/1.0",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          // Mode no-cors can help with CORS issues but will limit response data
          mode: "no-cors",
        },
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      logger.info(`Worker pinged ${url} - Status: ${response.status}`)
      return response.status < 400
    } catch (fetchError) {
      // Try with a proxy approach
      logger.warn(`Direct fetch failed for ${url}, trying proxy approach: ${fetchError.message}`)

      // Use our own API as a proxy to avoid CORS
      const proxyUrl = "/api/auto-ping?url=" + encodeURIComponent(pingUrl.toString())
      const proxyResponse = await fetch(proxyUrl, {
        cache: "no-store",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (proxyResponse.ok) {
        logger.info(`Worker pinged ${url} via proxy - Success`)
        return true
      } else {
        logger.error(`Worker pinged ${url} via proxy - Failed: ${proxyResponse.status}`)
        return false
      }
    }
  } catch (error) {
    logger.error(`Error pinging bot ${url}: ${error instanceof Error ? error.message : "Unknown error"}`)
    return false
  }
}

// Function to ping all bots
export async function pingAllBots(): Promise<void> {
  try {
    const timestamp = new Date().toISOString()
    logger.info(`Worker started at ${timestamp}`)

    // Get all enabled projects
    const projects = await getAllProjects()
    const enabledProjects = projects.filter((p) => p.enabled)

    if (enabledProjects.length === 0) {
      logger.info("No enabled bots to ping")
      return
    }

    logger.info(`Worker found ${enabledProjects.length} bots to ping`)

    // Ping each bot with a slight delay between pings
    for (const project of enabledProjects) {
      try {
        await pingBot(project.url)
        // Add a small delay between pings to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        logger.error(
          `Worker failed to ping ${project.url}: ${error instanceof Error ? error.message : "Unknown error"}`,
        )
      }
    }

    logger.info(`Worker completed at ${new Date().toISOString()}`)
  } catch (error) {
    logger.error(`Worker error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// This function will be called by the worker API route
export async function handleWorkerPing() {
  try {
    logger.info("Worker ping received at:", new Date().toISOString())

    // You can add any additional logic here that needs to run on each ping

    return {
      success: true,
      timestamp: new Date().toISOString(),
      message: "Worker ping successful",
    }
  } catch (error) {
    logger.error("Error in worker ping:", error)
    return {
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
