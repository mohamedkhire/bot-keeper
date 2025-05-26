import { NextResponse } from "next/server"

// This endpoint will be called to ping a specific project
// It acts as a proxy to avoid CORS issues
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ success: false, error: "URL parameter is required" }, { status: 400 })
  }

  try {
    // Validate URL before attempting to ping
    try {
      new URL(url)
    } catch (urlError) {
      console.error(`Invalid URL format: ${url}`)
      return NextResponse.json(
        {
          success: false,
          error: `Invalid URL format: ${url}`,
        },
        { status: 400 },
      )
    }

    console.log(`Proxy ping attempt to: ${url}`)

    // First try with HEAD request (less data)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

      const response = await fetch(url, {
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

      return NextResponse.json({
        success: true,
        status: response.status,
        message: `Successfully pinged ${url} with HEAD request`,
        timestamp: new Date().toISOString(),
      })
    } catch (headError) {
      // If HEAD fails, try with GET
      console.log(
        `HEAD request failed for ${url}, trying GET: ${headError instanceof Error ? headError.message : "Unknown error"}`,
      )

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

      const response = await fetch(url, {
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

      return NextResponse.json({
        success: true,
        status: response.status,
        message: `Successfully pinged ${url} with GET request`,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error(`Error pinging ${url}:`, error instanceof Error ? error.message : "Unknown error")

    // Return a 200 status even on error to prevent cascading failures
    return NextResponse.json(
      {
        success: false,
        error: `Failed to ping ${url}: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  }
}
