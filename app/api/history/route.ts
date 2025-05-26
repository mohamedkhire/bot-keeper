import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    const startDate = searchParams.get("startDate")
    const limit = searchParams.get("limit") || "1000" // Default to 1000 records

    if (!projectId) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Build query
    let query = supabase
      .from("ping_history")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(Number.parseInt(limit))

    // Add date filter if provided
    if (startDate) {
      query = query.gte("created_at", startDate)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching ping history:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch ping history" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      history: data,
    })
  } catch (error) {
    console.error("Error in history route:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error in history route: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
