"use client"

import { useEffect, useState } from "react"

export default function AutoPingScript() {
  const [lastPing, setLastPing] = useState<Record<string, Date>>({})
  const [projects, setProjects] = useState<Array<{ id: string; url: string; enabled: boolean }>>([])

  // Load projects on mount and set up interval to refresh them
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")
        if (!response.ok) {
          console.error("Failed to fetch projects:", response.status)
          return
        }

        const data = await response.json()
        if (data.success && data.projects) {
          setProjects(
            data.projects
              .filter((p: any) => p.enabled)
              .map((p: any) => ({
                id: p.id,
                url: p.url,
                enabled: p.enabled,
              })),
          )
        }
      } catch (error) {
        console.error("Error fetching projects:", error)
      }
    }

    // Fetch projects immediately
    fetchProjects()

    // Then set up interval to refresh projects every 5 minutes
    const intervalId = setInterval(fetchProjects, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  // Set up pinging for all enabled projects
  useEffect(() => {
    if (projects.length === 0) return

    // Function to ping a project
    const pingProject = async (project: { id: string; url: string; enabled: boolean }) => {
      if (!project.enabled) return

      // Check if we've pinged this project recently (within the last 2 minutes)
      // This helps reduce unnecessary pings when server-side pinging is also active
      const lastPingTime = lastPing[project.id]
      if (lastPingTime && Date.now() - lastPingTime.getTime() < 2 * 60 * 1000) {
        console.log(`Skipping client-side ping for ${project.url} - pinged recently`)
        return
      }

      try {
        // Use a more reliable method with proper error handling
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

        // Use the server-side ping endpoint instead of direct fetch
        const response = await fetch(`/api/ping?id=${project.id}`, {
          signal: controller.signal,
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          console.log(`Client-side ping for ${project.url} successful`)
          setLastPing((prev) => ({ ...prev, [project.id]: new Date() }))
        } else {
          // Even if the ping fails, we still want to record it
          console.warn(`Client-side ping for ${project.url} failed with status: ${response.status}`)
          // Update the last ping time anyway to prevent excessive retries
          setLastPing((prev) => ({ ...prev, [project.id]: new Date() }))
        }
      } catch (error) {
        // Don't log AbortError as it's expected when timeout occurs
        if (error instanceof Error && error.name !== "AbortError") {
          console.error(`Error pinging ${project.url}:`, error)
        } else {
          console.warn(`Ping timeout for ${project.url}`)
        }

        // Still update the last ping time to prevent excessive retries
        setLastPing((prev) => ({ ...prev, [project.id]: new Date() }))
      }
    }

    // Ping all projects immediately with a small delay between each
    projects.forEach((project, index) => {
      // Stagger pings to avoid overwhelming the server
      setTimeout(() => pingProject(project), index * 2000)
    })

    // Set up interval to ping projects every 5 minutes (client-side backup)
    // This is a backup for the server-side cron job
    const intervalId = setInterval(
      () => {
        projects.forEach((project, index) => {
          // Stagger pings to avoid overwhelming the server
          setTimeout(() => pingProject(project), index * 2000)
        })
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(intervalId)
  }, [projects, lastPing])

  // This component doesn't render anything visible
  return null
}
