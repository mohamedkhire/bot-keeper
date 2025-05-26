import { NextResponse } from "next/server"

// This is a simple endpoint that will be called by the cron job to keep the server warm
export async function GET() {
  console.log("[WARMUP] Server warmup triggered at:", new Date().toISOString())

  return NextResponse.json({
    success: true,
    message: "Server warmed up successfully",
    timestamp: new Date().toISOString(),
  })
}
