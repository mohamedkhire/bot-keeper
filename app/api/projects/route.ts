import { NextResponse } from "next/server"
import {
  getAllProjects,
  addProject,
  deleteProject,
  toggleProjectEnabled,
  ensureDefaultUser,
  updateProject,
} from "@/lib/storage"
import { notifyProjectAction } from "@/lib/notifications/service"

// GET all projects
export async function GET() {
  try {
    // Ensure we have a default user
    await ensureDefaultUser()

    const projects = await getAllProjects()

    return NextResponse.json({
      success: true,
      projects: projects.map((project) => ({
        ...project,
        lastPinged: project.lastPinged?.toISOString(),
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 })
  }
}

// POST a new project
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      url,
      description,
      iconType,
      iconUrl,
      discord_webhook_enabled,
      discord_webhook_url,
      discord_webhook_settings,
    } = body

    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch (error) {
      return NextResponse.json({ success: false, error: "Invalid URL format" }, { status: 400 })
    }

    const newProject = await addProject({
      name: name || url.split("//")[1],
      url,
      description: description || "",
      enabled: true,
      iconType,
      iconUrl,
      discord_webhook_enabled,
      discord_webhook_url,
      discord_webhook_settings,
    })

    // Send notification for new project creation
    try {
      await notifyProjectAction(
        {
          id: newProject.id,
          name: newProject.name,
          url: newProject.url,
          status: "unknown",
        },
        "edit",
        "New project created",
      )
    } catch (notificationError) {
      console.error("Error sending project creation notification:", notificationError)
    }

    return NextResponse.json({
      success: true,
      project: {
        ...newProject,
        lastPinged: newProject.lastPinged?.toISOString(),
        createdAt: newProject.createdAt.toISOString(),
        updatedAt: newProject.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error adding project:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to add project",
      },
      { status: 500 },
    )
  }
}

// PUT to update a project
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      url,
      description,
      iconType,
      iconUrl,
      discord_webhook_enabled,
      discord_webhook_url,
      discord_webhook_settings,
    } = body

    // Validate URL format if provided
    if (url) {
      try {
        new URL(url)
      } catch (error) {
        return NextResponse.json({ success: false, error: "Invalid URL format" }, { status: 400 })
      }
    }

    const updatedProject = await updateProject(id, {
      name,
      url,
      description,
      iconType,
      iconUrl,
      discord_webhook_enabled,
      discord_webhook_url,
      discord_webhook_settings,
    })

    if (!updatedProject) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 })
    }

    // Send notification for project edit
    try {
      await notifyProjectAction(
        {
          id: updatedProject.id,
          name: updatedProject.name,
          url: updatedProject.url,
          status: "unknown",
        },
        "edit",
        "Project settings updated",
      )
    } catch (notificationError) {
      console.error("Error sending project edit notification:", notificationError)
    }

    return NextResponse.json({
      success: true,
      project: {
        ...updatedProject,
        lastPinged: updatedProject.lastPinged?.toISOString(),
        createdAt: updatedProject.createdAt.toISOString(),
        updatedAt: updatedProject.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ success: false, error: "Failed to update project" }, { status: 500 })
  }
}

// DELETE a project
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 })
    }

    // Get project details before deletion for notification
    const projects = await getAllProjects()
    const projectToDelete = projects.find((p) => p.id === id)

    try {
      const success = await deleteProject(id)

      if (!success) {
        return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 })
      }

      // Send notification for project deletion
      if (projectToDelete) {
        try {
          await notifyProjectAction(
            {
              id: projectToDelete.id,
              name: projectToDelete.name,
              url: projectToDelete.url,
              status: "unknown",
            },
            "delete",
          )
        } catch (notificationError) {
          console.error("Error sending project deletion notification:", notificationError)
        }
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to delete project",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ success: false, error: "Failed to delete project" }, { status: 500 })
  }
}

// PATCH to toggle project enabled status
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const action = searchParams.get("action")

    if (!id) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 })
    }

    if (action === "toggle") {
      const updatedProject = await toggleProjectEnabled(id)

      if (!updatedProject) {
        return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 })
      }

      // Send notification for project pause/resume
      try {
        await notifyProjectAction(
          {
            id: updatedProject.id,
            name: updatedProject.name,
            url: updatedProject.url,
            status: "unknown",
          },
          updatedProject.enabled ? "resume" : "pause",
        )
      } catch (notificationError) {
        console.error("Error sending project toggle notification:", notificationError)
      }

      return NextResponse.json({
        success: true,
        project: {
          ...updatedProject,
          lastPinged: updatedProject.lastPinged?.toISOString(),
          createdAt: updatedProject.createdAt.toISOString(),
          updatedAt: updatedProject.updatedAt.toISOString(),
        },
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ success: false, error: "Failed to update project" }, { status: 500 })
  }
}
