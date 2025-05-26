import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { notifyStatusChange, notifyProjectAction } from "@/lib/notifications/service"

export async function POST(request: Request) {
  try {
    const { projectId, manual = false, silent = false } = await request.json()

    if (!projectId) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get the project from database
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 })
    }

    if (!project.enabled) {
      return NextResponse.json({ success: false, error: "Project is disabled" }, { status: 400 })
    }

    const startTime = Date.now()
    let isOnline = false
    let responseTime = 0
    let errorMessage = null

    try {
      // Perform the ping with proper timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(project.url, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent": "Bot-Keeper-Monitor/1.0",
        },
      })

      clearTimeout(timeoutId)
      responseTime = Date.now() - startTime
      isOnline = response.ok
    } catch (fetchError) {
      responseTime = Date.now() - startTime
      isOnline = false
      errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown error"
    }

    // Get previous status
    const previousStatus = project.status || "unknown"

    // Determine new status
    const newStatus: "online" | "offline" | "unknown" = isOnline ? "online" : "offline"

    // Update project status in database
    const { data: updatedProject, error: updateError } = await supabase
      .from("projects")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating project:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update project status" }, { status: 500 })
    }

    // Add ping to history
    await supabase.from("ping_history").insert({
      project_id: projectId,
      status: isOnline,
      response_time: responseTime,
      error_message: errorMessage,
    })

    // Send notifications for status changes (only if not silent)
    if (!silent && previousStatus !== newStatus) {
      try {
        await notifyStatusChange(
          {
            id: project.id,
            name: project.name,
            url: project.url,
            status: newStatus,
          },
          previousStatus as "online" | "offline" | "unknown",
          newStatus,
          responseTime,
        )
      } catch (notificationError) {
        console.error("Error sending status change notification:", notificationError)
      }
    }

    // Send notification for manual ping if enabled and not silent
    if (manual && !silent) {
      try {
        await notifyProjectAction(
          {
            id: project.id,
            name: project.name,
            url: project.url,
            status: newStatus,
          },
          "ping",
          `Manual ping result: ${isOnline ? "Online" : "Offline"} (${responseTime}ms)`,
        )
      } catch (notificationError) {
        console.error("Error sending manual ping notification:", notificationError)
      }
    }

    // Calculate uptime from recent ping history
    const { data: recentPings } = await supabase
      .from("ping_history")
      .select("status")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(100)

    let uptime = "0%"
    if (recentPings && recentPings.length > 0) {
      const successfulPings = recentPings.filter((ping) => ping.status).length
      const uptimePercentage = (successfulPings / recentPings.length) * 100
      uptime = `${uptimePercentage.toFixed(1)}%`
    }

    return NextResponse.json({
      success: true,
      project: {
        ...updatedProject,
        uptime,
        lastPinged: new Date().toISOString(),
      },
      ping: {
        isOnline,
        responseTime,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error pinging project:", error)
    return NextResponse.json({ success: false, error: "Failed to ping project" }, { status: 500 })
  }
}

// Handle GET requests for individual project pings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("id")
    const silent = searchParams.get("silent") === "true"

    if (!projectId) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 })
    }

    // Call the POST method with the same logic
    return POST(
      new Request(request.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, manual: true, silent }),
      }),
    )
  } catch (error) {
    console.error("Error in GET ping:", error)
    return NextResponse.json({ success: false, error: "Failed to ping project" }, { status: 500 })
  }
}
