import { createServerSupabaseClient } from "@/lib/supabase"
import { DEFAULT_PROJECTS } from "@/config/default-projects"

async function seedDatabase() {
  console.log("Starting database seeding...")
  const supabase = createServerSupabaseClient()

  // Create default user if it doesn't exist
  console.log("Creating default user...")
  const { data: existingUser } = await supabase.from("users").select("id").eq("email", "default@botkeeper.app").single()

  let userId = existingUser?.id

  if (!userId) {
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        email: "default@botkeeper.app",
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating default user:", error)
      return
    }

    userId = newUser.id
    console.log(`Created default user with ID: ${userId}`)
  } else {
    console.log(`Using existing default user with ID: ${userId}`)
  }

  // Create default projects
  console.log("Creating default projects...")
  for (const defaultProject of DEFAULT_PROJECTS) {
    const { data: existingProject } = await supabase
      .from("projects")
      .select("id")
      .eq("url", defaultProject.url)
      .eq("is_default", true)
      .single()

    if (!existingProject) {
      const { data, error } = await supabase.from("projects").insert({
        name: defaultProject.name,
        url: defaultProject.url,
        description: defaultProject.description || "",
        is_default: true,
        enabled: defaultProject.enabled,
        user_id: userId,
      })

      if (error) {
        console.error(`Error creating default project ${defaultProject.name}:`, error)
      } else {
        console.log(`Created default project: ${defaultProject.name}`)
      }
    } else {
      console.log(`Default project already exists: ${defaultProject.name}`)
    }
  }

  console.log("Database seeding completed!")
}

// Execute the seed function
seedDatabase()
  .catch(console.error)
  .finally(() => {
    console.log("Seed script execution finished")
  })
