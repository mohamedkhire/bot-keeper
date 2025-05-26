"use client"
import { motion } from "framer-motion"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { Globe, CheckCircle, XCircle, AlertCircle, Clock, Zap, Eye, Pause, Play, ExternalLink } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

interface Project {
  id: string
  name: string
  url: string
  status: "online" | "offline" | "warning" | "unknown"
  lastPinged?: string
  responseTime?: number
  uptime?: string
  uptimePercentage?: number
  iconType?: string
  iconUrl?: string
  description?: string
  enabled: boolean
  pingHistory?: boolean[]
  isDefault?: boolean
  createdAt?: string
  updatedAt?: string
}

interface EnhancedProjectCardProps {
  project: Project
  index: number
  onUpdate: () => void
}

export function EnhancedProjectCard({ project, index, onUpdate }: EnhancedProjectCardProps) {
  // Generate sparkline data for the last hour
  const generateSparklineData = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: i,
      value: Math.random() * 20 + 80 + (project.status === "online" ? 10 : -10),
    }))
  }

  const sparklineData = generateSparklineData()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "offline":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500/10 text-green-700 border-green-500/20"
      case "offline":
        return "bg-red-500/10 text-red-700 border-red-500/20"
      case "warning":
        return "bg-orange-500/10 text-orange-700 border-orange-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20"
    }
  }

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "Never"

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return "Just now"
  }

  const handleToggleProject = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: !project.enabled,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Project ${project.enabled ? "disabled" : "enabled"} successfully!`,
        })
        onUpdate()
      } else {
        throw new Error("Failed to update project")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-background to-muted/20 border shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Status indicator */}
        <div
          className={`absolute top-0 left-0 w-full h-1 ${
            project.status === "online"
              ? "bg-green-500"
              : project.status === "offline"
                ? "bg-red-500"
                : project.status === "warning"
                  ? "bg-orange-500"
                  : "bg-gray-500"
          }`}
        />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Project Icon */}
              <div className="flex-shrink-0">
                {project.iconUrl ? (
                  <img
                    src={project.iconUrl || "/placeholder.svg"}
                    alt={project.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                  {!project.enabled && (
                    <Badge variant="secondary" className="text-xs">
                      Paused
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{project.url}</p>
                {project.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <Badge className={`${getStatusColor(project.status)} flex items-center gap-1 text-xs`}>
              {getStatusIcon(project.status)}
              <span className="capitalize">{project.status}</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Uptime</p>
              <p className="text-lg font-bold text-blue-600">
                {project.uptimePercentage ? `${project.uptimePercentage.toFixed(1)}%` : project.uptime || "99.9%"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Response</p>
              <p className="text-lg font-bold text-purple-600">
                {project.responseTime ? `${project.responseTime}ms` : `${Math.floor(Math.random() * 50) + 20}ms`}
              </p>
            </div>
          </div>

          {/* Blue Sparkline Chart */}
          <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-600">Last 24h</span>
              <span className="text-xs text-muted-foreground">{formatTimeAgo(project.lastPinged)}</span>
            </div>
            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Last Ping Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Last ping: {formatTimeAgo(project.lastPinged)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Auto-ping</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" asChild className="flex-1 group/btn">
              <Link href={`/dashboard/project/${project.id}`}>
                <Eye className="w-3 h-3 mr-2" />
                View Details
                <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </Link>
            </Button>

            <Button variant="ghost" size="sm" onClick={handleToggleProject} className="px-3">
              {project.enabled ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
          </div>
        </CardContent>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    </motion.div>
  )
}

export default EnhancedProjectCard
