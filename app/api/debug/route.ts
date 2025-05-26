import { NextResponse } from "next/server"

// This endpoint is used to debug the worker system
export async function GET(request: Request) {
  const timestamp = new Date().toISOString()
  const requestUrl = request.url
  const userAgent = request.headers.get("user-agent") || "Unknown"

  console.log(`[DEBUG] Endpoint called at ${timestamp}`)
  console.log(`[DEBUG] URL: ${requestUrl}`)
  console.log(`[DEBUG] User-Agent: ${userAgent}`)

  // Return debug information
  return NextResponse.json({
    success: true,
    message: "Debug endpoint called successfully",
    timestamp,
    requestUrl,
    userAgent,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || "unknown",
    },
  })
}
