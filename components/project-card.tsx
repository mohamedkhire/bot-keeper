"use client"

import { useState } from "react"
import { ExternalLink, MoreVertical, Play, Power, Trash, Edit, Clock, Eye } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { ProjectIcon, type IconType } from "@/components/project-icon"
import { UptimeChart } from "@/components/uptime-chart"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatRelativeTime } from "@/lib/utils"
import { EditProjectDialog } from "@/components/edit-project-dialog"
import { EnhancedStatusBadge } from "@/components/enhanced-status-badge"
import { toast } from "@/components/ui/use-toast"

type Project = {
  id: string
  name: string
  url: string
  status: "online" | "offline" | "unknown"
  uptime: string
  lastPinged?: string
  isDefault?: boolean
  description?: string
  enabled: boolean
  pingHistory?: boolean[]
  iconType?: IconType
  iconUrl?: string
  discord_webhook_enabled?: boolean
  discord_webhook_url?: string
}

interface ProjectCardProps {
  project: Project
  index?: number
  onUpdate?: () => void
  onPingNow?: (id: string) => void
  onToggleEnabled?: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string, updates: Partial<Project>) => void
  isPinging?: boolean
  isToggling?: boolean
}

export function ProjectCard({
  project,
  index = 0,
  onUpdate,
  onPingNow,
  onToggleEnabled,
  onDelete,
  onEdit,
  isPinging = false,
  isToggling = false,
}: ProjectCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLocalPinging, setIsLocalPinging] = useState(false)
  const [isLocalToggling, setIsLocalToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  // Calculate response time (mock data for now)
  const getResponseTime = () => {
    // This would normally come from your API
    const times = [31, 42, 28, 35, 29, 33]
    return times[index % times.length]
  }

  const responseTime = getResponseTime()

  // Determine icon type - default to "globe" if not specified
  const iconType = project.iconType || "globe"

  // Parse uptime to ensure it's a valid number
  const parseUptime = (uptime: string): number => {
    if (!uptime) return 0
    const cleanedUptime = uptime.replace("%", "").trim()
    const uptimeValue = Number.parseFloat(cleanedUptime)
    return isNaN(uptimeValue) ? 0 : uptimeValue
  }

  const uptimeValue = parseUptime(project.uptime)

  // Local ping function if onPingNow is not provided
  const handlePingNow = async () => {
    if (onPingNow) {
      onPingNow(project.id)
      return
    }

    setIsLocalPinging(true)
    try {
      const response = await fetch("/api/ping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project.id,
          manual: true,
          silent: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `${project.name} pinged successfully!`,
        })
        if (onUpdate) {
          onUpdate()
        }
      } else {
        toast({
          title: "Warning",
          description: data.error || "Failed to ping project",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error pinging project:", error)
      toast({
        title: "Error",
        description: "Failed to ping project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLocalPinging(false)
    }
  }

  // Local toggle function if onToggleEnabled is not provided
  const handleToggleEnabled = async () => {
    if (onToggleEnabled) {
      onToggleEnabled(project.id)
      return
    }

    setIsLocalToggling(true)
    try {
      const response = await fetch(`/api/projects?id=${project.id}&action=toggle`, {
        method: "PATCH",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `${project.name} ${data.project.enabled ? "enabled" : "disabled"} successfully!`,
        })
        if (onUpdate) {
          onUpdate()
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update project",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling project:", error)
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLocalToggling(false)
    }
  }

  // Local delete function if onDelete is not provided
  const handleDelete = async () => {
    if (onDelete) {
      onDelete(project.id)
      return
    }

    if (project.isDefault) {
      toast({
        title: "Cannot Delete",
        description: "Default projects cannot be deleted.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects?id=${project.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Project removed successfully",
        })
        if (onUpdate) {
          onUpdate()
        }
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to remove project",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "Failed to remove project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const currentlyPinging = isPinging || isLocalPinging
  const currentlyToggling = isToggling || isLocalToggling

  return (
    <motion.div
      className="group bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      onClick={() => router.push(`/dashboard/project/${project.id}`)}
    >
      {/* Header */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
              <ProjectIcon type={iconType} customUrl={project.iconUrl} size={48} />
            </motion.div>
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="font-semibold text-foreground text-lg truncate group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center transition-colors truncate"
              >
                <span className="truncate">{project.url}</span>
                <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
              </a>
              {project.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/project/${project.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View Details</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePingNow} disabled={currentlyPinging}>
                <Play className="mr-2 h-4 w-4" />
                <span>{currentlyPinging ? "Pinging..." : "Ping now"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleEnabled} disabled={currentlyToggling}>
                <Power className="mr-2 h-4 w-4" />
                <span>{currentlyToggling ? "Updating..." : project.enabled ? "Disable" : "Enable"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
                disabled={project.isDefault || isDeleting}
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status */}
        <div className="p-4 bg-muted/20 rounded-lg">
          <div className="text-xs text-muted-foreground font-medium mb-2">Current Status</div>
          {project.enabled ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
              <EnhancedStatusBadge
                status={project.status}
                animation={project.status === "online" ? "none" : "pulse"}
                className="mr-3"
              />
              <span className="text-sm font-medium">
                for {project.lastPinged ? formatRelativeTime(new Date(project.lastPinged)) : "N/A"}
              </span>
            </motion.div>
          ) : (
            <div className="flex items-center">
              <EnhancedStatusBadge status="warning" className="mr-3" />
              <span className="text-sm font-medium text-amber-600">Monitoring paused</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20"
          >
            <div className="text-xs text-muted-foreground font-medium mb-1">Total Uptime</div>
            <div className="text-xl font-bold text-green-600">{uptimeValue.toFixed(1)}%</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20"
          >
            <div className="text-xs text-muted-foreground font-medium mb-1">Response Time</div>
            <div className="text-xl font-bold text-blue-600">{responseTime}ms</div>
          </motion.div>
        </div>

        {/* Chart */}
        <div className="mb-6">
          {project.pingHistory && project.pingHistory.length > 0 ? (
            <UptimeChart data={project.pingHistory} height={80} showLabels={true} color="#60a5fa" />
          ) : (
            <div className="h-20 flex items-center justify-center text-muted-foreground text-sm bg-muted/20 rounded-lg">
              No data available
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-border/30">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>Last: {project.lastPinged ? formatRelativeTime(new Date(project.lastPinged)) : "Never"}</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePingNow}
              disabled={currentlyPinging || !project.enabled}
              className="h-8 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
            >
              {currentlyPinging ? "Pinging..." : "Ping"}
            </Button>
            <Button
              size="sm"
              variant={project.enabled ? "destructive" : "default"}
              onClick={handleToggleEnabled}
              disabled={currentlyToggling}
              className="h-8 transition-all"
            >
              {currentlyToggling ? "..." : project.enabled ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Project Dialog */}
      <EditProjectDialog
        project={project}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={(updates) => {
          if (onEdit) {
            onEdit(project.id, updates)
          }
          setIsEditDialogOpen(false)
          if (onUpdate) {
            onUpdate()
          }
        }}
      />
    </motion.div>
  )
}
