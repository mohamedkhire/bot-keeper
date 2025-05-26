import { createServerSupabaseClient, getSupabaseClient } from "./supabase"

// Project type definition
export type Project = {
  id: string
  name: string
  url: string
  status: "online" | "offline" | "unknown"
  lastPinged?: Date
  pingHistory: boolean[]
  isDefault?: boolean
  description?: string
  enabled: boolean
  createdAt: Date
  updatedAt: Date
  iconType?: string
  iconUrl?: string
  discord_webhook_enabled?: boolean
  discord_webhook_url?: string
  discord_webhook_settings?: {
    username?: string
    avatar_url?: string
    embed_color?: string
    include_uptime?: boolean
    include_response_time?: boolean
    include_downtime?: boolean
    include_logs?: boolean
    custom_footer?: string
    notification_frequency?: string
  }
}

// Remove the initializeDefaultProjects function and replace it with a simpler function
// to ensure we have a default user for projects

export async function ensureDefaultUser(): Promise<string> {
  const supabase = createServerSupabaseClient()

  // Check if we have a default user, if not create one
  const { data: existingUser } = await supabase.from("users").select("id").eq("email", "default@botkeeper.app").single()

  if (existingUser?.id) {
    return existingUser.id
  }

  const { data: newUser, error } = await supabase
    .from("users")
    .insert({
      email: "default@botkeeper.app",
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error creating default user:", error)
    throw new Error("Failed to create default user")
  }

  return newUser.id
}

// Get all projects (including defaults)
export async function getAllProjects(): Promise<Project[]> {
  // For server-side operations
  if (typeof window === "undefined") {
    const supabase = createServerSupabaseClient()
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*, ping_history(status, created_at)")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching projects:", error)
      return []
    }

    return projects.map(transformProjectFromDb)
  }

  // For client-side operations
  const supabase = getSupabaseClient()
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*, ping_history(status, created_at)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching projects:", error)
    return []
  }

  return projects.map(transformProjectFromDb)
}

// Add a new project
export async function addProject(
  project: Omit<Project, "id" | "status" | "pingHistory" | "createdAt" | "updatedAt">,
): Promise<Project> {
  // For server-side operations
  if (typeof window === "undefined") {
    const supabase = createServerSupabaseClient()

    // Check if project with this URL already exists
    const { data: existingProject } = await supabase.from("projects").select("id").eq("url", project.url).single()

    if (existingProject) {
      throw new Error("Project with this URL already exists")
    }

    // Get default user
    const userId = await ensureDefaultUser()

    // Create a base project object with required fields
    const baseProject = {
      name: project.name,
      url: project.url,
      description: project.description || "",
      is_default: false,
      enabled: true,
      user_id: userId,
      icon_type: project.iconType || "globe",
      icon_url: project.iconUrl || null,
    }

    // Try to add the project with just the base fields first
    try {
      const { data: newProject, error } = await supabase
        .from("projects")
        .insert(baseProject)
        .select("*, ping_history(status, created_at)")
        .single()

      if (error) {
        console.error("Error adding project:", error)
        throw new Error("Failed to add project")
      }

      return transformProjectFromDb(newProject)
    } catch (error) {
      console.error("Error adding project:", error)
      throw new Error("Failed to add project")
    }
  }

  // For client-side operations
  const supabase = getSupabaseClient()

  // Check if project with this URL already exists
  const { data: existingProject } = await supabase.from("projects").select("id").eq("url", project.url).single()

  if (existingProject) {
    throw new Error("Project with this URL already exists")
  }

  // Get default user
  const { data: defaultUser } = await supabase.from("users").select("id").eq("email", "default@botkeeper.app").single()

  // Create a base project object with required fields
  const baseProject = {
    name: project.name,
    url: project.url,
    description: project.description || "",
    is_default: false,
    enabled: true,
    user_id: defaultUser?.id,
    icon_type: project.iconType || "globe",
    icon_url: project.iconUrl || null,
  }

  // Try to add the project with just the base fields first
  try {
    const { data: newProject, error } = await supabase
      .from("projects")
      .insert(baseProject)
      .select("*, ping_history(status, created_at)")
      .single()

    if (error) {
      console.error("Error adding project:", error)
      throw new Error("Failed to add project")
    }

    return transformProjectFromDb(newProject)
  } catch (error) {
    console.error("Error adding project:", error)
    throw new Error("Failed to add project")
  }
}

// Update a project
export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const supabase = typeof window === "undefined" ? createServerSupabaseClient() : getSupabaseClient()

  // Create a base update object with non-Discord fields
  const baseUpdate = {
    name: updates.name,
    url: updates.url,
    description: updates.description,
    enabled: updates.enabled,
    icon_type: updates.iconType,
    icon_url: updates.iconUrl,
    updated_at: new Date().toISOString(),
  }

  // Update the base fields first
  const { data: project, error } = await supabase
    .from("projects")
    .update(baseUpdate)
    .eq("id", id)
    .select("*, ping_history(status, created_at)")
    .single()

  if (error) {
    console.error("Error updating project:", error)
    return null
  }

  return transformProjectFromDb(project)
}

// Delete a project
export async function deleteProject(id: string): Promise<boolean> {
  const supabase = typeof window === "undefined" ? createServerSupabaseClient() : getSupabaseClient()

  // Don't allow deletion of default projects
  const { data: project } = await supabase.from("projects").select("is_default").eq("id", id).single()

  if (project?.is_default) {
    throw new Error("Cannot delete default projects")
  }

  const { error } = await supabase.from("projects").delete().eq("id", id)

  if (error) {
    console.error("Error deleting project:", error)
    return false
  }

  return true
}

// Update project status after a ping
export async function updateProjectStatus(
  id: string,
  isOnline: boolean,
  responseTime?: number,
): Promise<Project | null> {
  const supabase = typeof window === "undefined" ? createServerSupabaseClient() : getSupabaseClient()

  // First, add the ping to history
  const { error: pingError } = await supabase.from("ping_history").insert({
    project_id: id,
    status: isOnline,
    response_time: responseTime || null,
  })

  if (pingError) {
    console.error("Error adding ping history:", pingError)
  }

  // Then update the project's updated_at timestamp
  const { data: project, error } = await supabase
    .from("projects")
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*, ping_history(status, created_at)")
    .single()

  if (error) {
    console.error("Error updating project status:", error)
    return null
  }

  return transformProjectFromDb(project)
}

// Toggle project enabled status
export async function toggleProjectEnabled(id: string): Promise<Project | null> {
  const supabase = typeof window === "undefined" ? createServerSupabaseClient() : getSupabaseClient()

  // First get the current enabled status
  const { data: currentProject } = await supabase.from("projects").select("enabled").eq("id", id).single()

  if (!currentProject) {
    return null
  }

  // Toggle the enabled status
  const { data: project, error } = await supabase
    .from("projects")
    .update({
      enabled: !currentProject.enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*, ping_history(status, created_at)")
    .single()

  if (error) {
    console.error("Error toggling project enabled status:", error)
    return null
  }

  return transformProjectFromDb(project)
}

// Calculate uptime percentage
export function calculateUptime(history: boolean[]): string {
  if (history.length === 0) return "N/A"

  const successfulChecks = history.filter((status) => status).length
  const uptimePercentage = (successfulChecks / history.length) * 100

  return uptimePercentage.toFixed(1) + "%"
}

// Helper function to transform a project from the database to our Project type
function transformProjectFromDb(dbProject: any): Project {
  // Extract ping history from the nested ping_history field
  const pingHistory = dbProject.ping_history ? dbProject.ping_history.map((ping: any) => ping.status) : []

  // Find the most recent ping
  const lastPing =
    dbProject.ping_history && dbProject.ping_history.length > 0
      ? new Date(Math.max(...dbProject.ping_history.map((ping: any) => new Date(ping.created_at).getTime())))
      : undefined

  // Determine status based on the most recent ping
  let status: "online" | "offline" | "unknown" = "unknown"
  if (dbProject.ping_history && dbProject.ping_history.length > 0) {
    const latestPing = dbProject.ping_history.reduce((latest: any, current: any) => {
      return new Date(current.created_at) > new Date(latest.created_at) ? current : latest
    }, dbProject.ping_history[0])

    status = latestPing.status ? "online" : "offline"
  }

  return {
    id: dbProject.id,
    name: dbProject.name,
    url: dbProject.url,
    status,
    lastPinged: lastPing,
    pingHistory,
    isDefault: dbProject.is_default,
    description: dbProject.description,
    enabled: dbProject.enabled,
    createdAt: new Date(dbProject.created_at),
    updatedAt: new Date(dbProject.updated_at),
    iconType: dbProject.icon_type,
    iconUrl: dbProject.icon_url,
    discord_webhook_enabled: dbProject.discord_webhook_enabled,
    discord_webhook_url: dbProject.discord_webhook_url,
    discord_webhook_settings: dbProject.discord_webhook_settings,
  }
}
