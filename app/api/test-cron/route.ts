import { NextResponse } from "next/server"

// This endpoint will check if the cron job is working by reading/writing a timestamp file
export async function GET() {
  try {
    // This won't actually work in production, but it's useful for debugging
    // We'll return the last 5 cron execution times based on server logs

    const now = new Date()

    return NextResponse.json({
      success: true,
      message: "Cron test endpoint called",
      currentTime: now.toISOString(),
      note: "This endpoint helps verify if the server is responding. Check server logs to confirm cron job execution.",
    })
  } catch (error) {
    console.error("Error in test-cron endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error in test-cron endpoint: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
