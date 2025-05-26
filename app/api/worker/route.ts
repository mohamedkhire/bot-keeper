import { NextResponse } from "next/server"
import { handleWorkerPing } from "@/lib/worker"
import { logger } from "@/lib/logger"

// This route is called by the worker to keep it alive
export async function GET() {
  try {
    const result = await handleWorkerPing()

    // Always return a 200 OK response to prevent the worker from retrying
    return NextResponse.json(result)
  } catch (error) {
    logger.error("Error in worker route:", error)

    // Still return a 200 OK to prevent the worker from retrying
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
