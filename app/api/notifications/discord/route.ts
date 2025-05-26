import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("discord_webhook_settings").select("*").single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error("Error fetching Discord settings:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      settings: data || {},
    })
  } catch (error) {
    console.error("Error in GET /api/notifications/discord:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const settings = await request.json()
    const supabase = createServerSupabaseClient()

    // Check if settings already exist
    const { data: existing } = await supabase.from("discord_webhook_settings").select("id").single()

    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from("discord_webhook_settings")
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating Discord settings:", error)
        return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 })
      }

      return NextResponse.json({ success: true, settings: data })
    } else {
      // Create new settings
      const { data, error } = await supabase.from("discord_webhook_settings").insert(settings).select().single()

      if (error) {
        console.error("Error creating Discord settings:", error)
        return NextResponse.json({ success: false, error: "Failed to create settings" }, { status: 500 })
      }

      return NextResponse.json({ success: true, settings: data })
    }
  } catch (error) {
    console.error("Error in POST /api/notifications/discord:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
