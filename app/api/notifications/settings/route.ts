import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET notification settings
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Check if notification_settings table exists
    const { data: tableExists } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "notification_settings")
      .eq("table_schema", "public")
      .single()

    if (!tableExists) {
      return NextResponse.json({
        success: true,
        settings: {
          email_enabled: false,
          email_address: null,
          webhook_enabled: false,
          webhook_url: null,
          discord_enabled: false,
          discord_webhook_url: null,
          notify_on_down: true,
          notify_on_up: true,
        },
      })
    }

    // Get notification settings
    const { data, error } = await supabase.from("notification_settings").select("*").single()

    if (error) {
      // If no settings exist, return default settings
      if (error.code === "PGRST116") {
        return NextResponse.json({
          success: true,
          settings: {
            email_enabled: false,
            email_address: null,
            webhook_enabled: false,
            webhook_url: null,
            discord_enabled: false,
            discord_webhook_url: null,
            notify_on_down: true,
            notify_on_up: true,
          },
        })
      }

      console.error("Error fetching notification settings:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch notification settings" }, { status: 500 })
    }

    return NextResponse.json({ success: true, settings: data })
  } catch (error) {
    console.error("Error in GET /api/notifications/settings:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// POST to update notification settings
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      email_enabled,
      email_address,
      webhook_enabled,
      webhook_url,
      discord_enabled,
      discord_webhook_url,
      notify_on_down,
      notify_on_up,
    } = body

    const supabase = createServerSupabaseClient()

    // Check if notification_settings table exists
    const { data: tableExists } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "notification_settings")
      .eq("table_schema", "public")
      .single()

    if (!tableExists) {
      return NextResponse.json({ success: false, error: "Notification settings table does not exist" }, { status: 500 })
    }

    // Check if settings already exist
    const { data: existingSettings } = await supabase.from("notification_settings").select("id").single()

    if (existingSettings) {
      // Update existing settings
      const { error } = await supabase
        .from("notification_settings")
        .update({
          email_enabled,
          email_address,
          webhook_enabled,
          webhook_url,
          discord_enabled,
          discord_webhook_url,
          notify_on_down,
          notify_on_up,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSettings.id)

      if (error) {
        console.error("Error updating notification settings:", error)
        return NextResponse.json({ success: false, error: "Failed to update notification settings" }, { status: 500 })
      }
    } else {
      // Insert new settings
      const { error } = await supabase.from("notification_settings").insert({
        email_enabled,
        email_address,
        webhook_enabled,
        webhook_url,
        discord_enabled,
        discord_webhook_url,
        notify_on_down,
        notify_on_up,
      })

      if (error) {
        console.error("Error inserting notification settings:", error)
        return NextResponse.json({ success: false, error: "Failed to insert notification settings" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/notifications/settings:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
