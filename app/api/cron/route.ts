import { NextResponse } from "next/server"
import { getAllProjects, updateProjectStatus } from "@/lib/storage"
import { config } from "@/lib/config"

// Helper function to ping a URL directly
async function pingUrl(url: string): Promise<{ isOnline: boolean; responseTime?: number }> {
  try {
    const startTime = Date.now()

    // Add a random query parameter to prevent caching
    const pingUrl = new URL(url)
    pingUrl.searchParams.append("ping", Date.now().toString())
    pingUrl.searchParams.append("keepalive", "true")

    // First try with a HEAD request (less data transfer)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

      const response = await fetch(pingUrl.toString(), {
        method: "HEAD",
        headers: {
          "User-Agent": "BotKeeper-Uptime-Monitor/1.0",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      const endTime = Date.now()
      const responseTime = endTime - startTime

      console.log(`Pinged ${url} with HEAD - Status: ${response.status} - Response time: ${responseTime}ms`)
      return {
        isOnline: response.status < 400,
        responseTime,
      }
    } catch (headError) {
      console.log(
        `HEAD request failed for ${url}, trying GET: ${headError instanceof Error ? headError.message : "Unknown error"}`,
      )

      // If HEAD fails, try with GET
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

      const response = await fetch(pingUrl.toString(), {
        method: "GET",
        headers: {
          "User-Agent": "BotKeeper-Uptime-Monitor/1.0",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      const endTime = Date.now()
      const responseTime = endTime - startTime

      console.log(`Pinged ${url} with GET - Status: ${response.status} - Response time: ${responseTime}ms`)
      return {
        isOnline: response.status < 400,
        responseTime,
      }
    }
  } catch (error) {
    console.error(`Error pinging ${url}:`, error instanceof Error ? error.message : "Unknown error")
    // Consider the site offline if we can't reach it
    return { isOnline: false }
  }
}

// This route will be called by a cron job to ping all projects
export async function GET() {
  try {
    console.log("Cron job started at:", new Date().toISOString())
    console.log("Using base URL:", config.baseUrl)

    // Get all projects from the database
    const projects = await getAllProjects()

    // Only ping enabled projects
    const enabledProjects = projects.filter((project) => project.enabled)

    if (enabledProjects.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No enabled projects to ping",
      })
    }

    console.log(`Found ${enabledProjects.length} enabled projects to ping`)

    // Ping each enabled project directly
    const results = await Promise.all(
      enabledProjects.map(async (project) => {
        try {
          console.log(`Pinging project: ${project.name} (${project.url})`)

          // Validate URL before pinging
          try {
            // This will throw if the URL is invalid
            new URL(project.url)
          } catch (urlError) {
            console.error(`Invalid URL format for project ${project.id}: ${project.url}`)
            // Update the project as offline
            await updateProjectStatus(project.id, false)
            return {
              success: false,
              error: `Invalid URL format: ${project.url}`,
              project: {
                id: project.id,
                name: project.name,
                url: project.url,
                status: "offline",
              },
            }
          }

          // Directly ping the project URL
          const { isOnline, responseTime } = await pingUrl(project.url)

          // Update the project status in the database
          const updatedProject = await updateProjectStatus(project.id, isOnline, responseTime)

          console.log(`Ping result for ${project.name}: ${isOnline ? "online" : "offline"}`)

          return {
            success: true,
            project: updatedProject
              ? {
                  id: updatedProject.id,
                  name: updatedProject.name,
                  url: updatedProject.url,
                  status: updatedProject.status,
                  lastPinged: updatedProject.lastPinged?.toISOString(),
                }
              : {
                  id: project.id,
                  name: project.name,
                  url: project.url,
                  status: isOnline ? "online" : "offline",
                },
          }
        } catch (error) {
          console.error(`Error pinging project ${project.id}:`, error)

          // Update the project as offline
          await updateProjectStatus(project.id, false)

          return {
            success: false,
            error: `Failed to ping project ${project.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
            project: {
              id: project.id,
              name: project.name,
              url: project.url,
              status: "offline",
            },
          }
        }
      }),
    )

    console.log("Cron job completed at:", new Date().toISOString())

    return NextResponse.json({
      success: true,
      message: "Cron job executed successfully",
      timestamp: new Date().toISOString(),
      results,
    })
  } catch (error) {
    console.error("Error in cron job:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to execute cron job: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
