import { NextResponse } from "next/server"
import { getAllProjects } from "@/lib/storage"
import { logger } from "@/lib/logger"

// This endpoint will directly ping all bot URLs without updating the database
export async function GET() {
  try {
    logger.info("[DIRECT] Direct bot ping started at:", new Date().toISOString())

    // Get all projects from the database
    const projects = await getAllProjects()

    // Only ping enabled projects
    const enabledProjects = projects.filter((project) => project.enabled)

    if (enabledProjects.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No enabled projects to ping directly",
      })
    }

    logger.info(`[DIRECT] Found ${enabledProjects.length} enabled projects to ping directly`)

    // Ping each enabled project directly without updating the database
    const results = await Promise.all(
      enabledProjects.map(async (project) => {
        try {
          logger.info(`[DIRECT] Directly pinging bot: ${project.name} (${project.url})`)

          // Validate URL before pinging
          try {
            new URL(project.url)
          } catch (urlError) {
            logger.error(`[DIRECT] Invalid URL format for bot ${project.id}: ${project.url}`)
            return {
              success: false,
              error: `Invalid URL format: ${project.url}`,
              project: {
                id: project.id,
                name: project.name,
                url: project.url,
              },
            }
          }

          // Directly ping the bot URL with minimal overhead
          const pingUrl = new URL(project.url)
          pingUrl.searchParams.append("keepalive", "true")
          pingUrl.searchParams.append("t", Date.now().toString())

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

          const response = await fetch(pingUrl.toString(), {
            method: "GET",
            headers: {
              "User-Agent": "BotKeeper-Direct-Ping/1.0",
              "Cache-Control": "no-cache",
            },
            signal: controller.signal,
            cache: "no-store",
          })

          clearTimeout(timeoutId)

          logger.info(`[DIRECT] Direct ping result for ${project.name}: ${response.status}`)

          return {
            success: response.status < 400,
            project: {
              id: project.id,
              name: project.name,
              url: project.url,
              status: response.status < 400 ? "online" : "offline",
            },
          }
        } catch (error) {
          logger.error(`[DIRECT] Error directly pinging bot ${project.id}:`, error)
          return {
            success: false,
            error: `Failed to directly ping bot ${project.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
            project: {
              id: project.id,
              name: project.name,
              url: project.url,
            },
          }
        }
      }),
    )

    logger.info("[DIRECT] Direct bot ping completed at:", new Date().toISOString())

    return NextResponse.json({
      success: true,
      message: "Direct bot ping executed successfully",
      timestamp: new Date().toISOString(),
      results,
    })
  } catch (error) {
    logger.error("[DIRECT] Error in direct bot ping:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to execute direct bot ping: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
