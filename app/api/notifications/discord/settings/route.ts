import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Get Discord webhook settings
    const { data, error } = await supabase.from("discord_webhook_settings").select("*").single()

    if (error) {
      // If the error is that the record doesn't exist, return a 404
      if (error.code === "PGRST116") {
        return NextResponse.json({ success: false, error: "Discord webhook settings not found" }, { status: 404 })
      }

      console.error("Error fetching Discord webhook settings:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch Discord webhook settings" }, { status: 500 })
    }

    return NextResponse.json({ success: true, settings: data })
  } catch (error) {
    console.error("Error in GET /api/notifications/discord/settings:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    // Validate required fields
    if (body.enabled && !body.url) {
      return NextResponse.json({ success: false, error: "Webhook URL is required when enabled" }, { status: 400 })
    }

    // Check if settings already exist
    const { data: existingSettings } = await supabase.from("discord_webhook_settings").select("id").single()

    let result
    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from("discord_webhook_settings")
        .update({
          enabled: body.enabled,
          url: body.url,
          username: body.username,
          avatar_url: body.avatar_url,
          content: body.content,
          embed_title: body.embed_title,
          embed_description: body.embed_description,
          embed_color: body.embed_color,
          embed_thumbnail: body.embed_thumbnail,
          embed_image: body.embed_image,
          embed_author_name: body.embed_author_name,
          embed_author_url: body.embed_author_url,
          embed_author_icon_url: body.embed_author_icon_url,
          embed_footer_text: body.embed_footer_text,
          embed_footer_icon_url: body.embed_footer_icon_url,
          include_timestamp: body.include_timestamp,
          include_uptime: body.include_uptime,
          include_response_time: body.include_response_time,
          include_downtime: body.include_downtime,
          include_buttons: body.include_buttons,
          mention_everyone: body.mention_everyone,
          mention_roles: body.mention_roles,
          mention_users: body.mention_users,
          notification_frequency: body.notification_frequency,
          selected_projects: body.selected_projects,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSettings.id)
    } else {
      // Create new settings
      result = await supabase.from("discord_webhook_settings").insert({
        enabled: body.enabled,
        url: body.url,
        username: body.username,
        avatar_url: body.avatar_url,
        content: body.content,
        embed_title: body.embed_title,
        embed_description: body.embed_description,
        embed_color: body.embed_color,
        embed_thumbnail: body.embed_thumbnail,
        embed_image: body.embed_image,
        embed_author_name: body.embed_author_name,
        embed_author_url: body.embed_author_url,
        embed_author_icon_url: body.embed_author_icon_url,
        embed_footer_text: body.embed_footer_text,
        embed_footer_icon_url: body.embed_footer_icon_url,
        include_timestamp: body.include_timestamp,
        include_uptime: body.include_uptime,
        include_response_time: body.include_response_time,
        include_downtime: body.include_downtime,
        include_buttons: body.include_buttons,
        mention_everyone: body.mention_everyone,
        mention_roles: body.mention_roles,
        mention_users: body.mention_users,
        notification_frequency: body.notification_frequency,
        selected_projects: body.selected_projects,
      })
    }

    if (result.error) {
      console.error("Error saving Discord webhook settings:", result.error)
      return NextResponse.json({ success: false, error: "Failed to save Discord webhook settings" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/notifications/discord/settings:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}
