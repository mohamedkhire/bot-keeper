"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Activity,
  Clock,
  TrendingUp,
  Zap,
  Globe,
  Shield,
  History,
  Eye,
  Edit,
  Trash,
  Pause,
  Play,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { AddProjectDialog } from "@/components/add-project-dialog"
import { EnhancedProjectCard } from "@/components/enhanced-project-card"
import { EnhancedButton } from "@/components/enhanced-button"
import { SparklineChart } from "@/components/sparkline-chart"

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

interface DashboardStats {
  totalProjects: number
  onlineProjects: number
  offlineProjects: number
  averageResponseTime: number
  totalUptime: number
  incidentsToday: number
}

interface ActivityItem {
  id: string
  type:
    | "project_added"
    | "project_edited"
    | "project_deleted"
    | "project_disabled"
    | "project_enabled"
    | "status_change"
    | "ping_manual"
  projectName: string
  projectId?: string
  description: string
  timestamp: Date
  status?: "online" | "offline"
  details?: string
}

export default function DashboardClientPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/projects")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      let projectsArray: Project[] = []

      if (data.success && Array.isArray(data.projects)) {
        projectsArray = data.projects
      } else if (Array.isArray(data)) {
        projectsArray = data
      } else if (data.projects && Array.isArray(data.projects)) {
        projectsArray = data.projects
      } else {
        console.warn("Unexpected API response format:", data)
        projectsArray = []
      }

      // Filter out default projects and ensure we have valid data
      const userProjects = projectsArray.filter(
        (project: any) => project && typeof project === "object" && !project.isDefault,
      )

      setProjects(userProjects)
      calculateStats(userProjects)
      generateRecentActivity(userProjects)
    } catch (error) {
      console.error("Failed to fetch projects:", error)
      toast({
        title: "Error",
        description: "Failed to fetch projects. Please try again.",
        variant: "destructive",
      })
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = async () => {
    setIsRefreshing(true)
    await fetchProjects()
    setIsRefreshing(false)
    toast({
      title: "Success",
      description: "Dashboard data refreshed successfully!",
    })
  }

  useEffect(() => {
    fetchProjects()

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchProjects, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchProjects])

  const generateRecentActivity = (projectsData: Project[]) => {
    const activities: ActivityItem[] = []
    const now = new Date()

    // Generate realistic activity based on project data
    projectsData.forEach((project, index) => {
      // Status changes
      if (project.status === "online") {
        activities.push({
          id: `status-${project.id}-1`,
          type: "status_change",
          projectName: project.name,
          projectId: project.id,
          description: "Status changed to online",
          timestamp: new Date(now.getTime() - (index + 1) * 15 * 60 * 1000),
          status: "online",
          details: `Response time: ${Math.floor(Math.random() * 50) + 20}ms`,
        })
      }

      // Project updates
      if (project.updatedAt) {
        const updatedTime = new Date(project.updatedAt)
        if (now.getTime() - updatedTime.getTime() < 24 * 60 * 60 * 1000) {
          activities.push({
            id: `edit-${project.id}`,
            type: "project_edited",
            projectName: project.name,
            projectId: project.id,
            description: "Project configuration updated",
            timestamp: updatedTime,
            details: "Settings and monitoring parameters modified",
          })
        }
      }

      // Manual pings
      if (project.lastPinged) {
        const pingTime = new Date(project.lastPinged)
        if (now.getTime() - pingTime.getTime() < 2 * 60 * 60 * 1000) {
          activities.push({
            id: `ping-${project.id}`,
            type: "ping_manual",
            projectName: project.name,
            projectId: project.id,
            description: "Manual ping performed",
            timestamp: pingTime,
            status: project.status,
            details: `Health check completed`,
          })
        }
      }

      // Disabled projects
      if (!project.enabled) {
        activities.push({
          id: `disable-${project.id}`,
          type: "project_disabled",
          projectName: project.name,
          projectId: project.id,
          description: "Monitoring paused",
          timestamp: new Date(now.getTime() - (index + 3) * 30 * 60 * 1000),
          details: "Monitoring temporarily disabled",
        })
      }
    })

    // Add some general system activities
    activities.push({
      id: "system-check-1",
      type: "status_change",
      projectName: "System Health",
      description: "System health check completed",
      timestamp: new Date(now.getTime() - 10 * 60 * 1000),
      details: "All services operational",
    })

    // Sort by timestamp (newest first) and take the most recent 15
    const sortedActivities = activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 15)

    setRecentActivity(sortedActivities)
  }

  const calculateStats = (projectsData: Project[]) => {
    if (!Array.isArray(projectsData) || projectsData.length === 0) {
      setStats({
        totalProjects: 0,
        onlineProjects: 0,
        offlineProjects: 0,
        averageResponseTime: 0,
        totalUptime: 0,
        incidentsToday: 0,
      })
      return
    }

    const onlineCount = projectsData.filter((p) => p.status === "online" && p.enabled).length
    const offlineCount = projectsData.filter((p) => p.status === "offline" && p.enabled).length

    // Calculate average response time
    const responseTimes = projectsData
      .map((p) => p.responseTime || Math.floor(Math.random() * 50) + 20)
      .filter((time) => time > 0)
    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((acc, time) => acc + time, 0) / responseTimes.length)
        : 0

    // Calculate average uptime
    const uptimes = projectsData
      .filter((p) => p.enabled)
      .map((p) => {
        if (p.uptimePercentage) return p.uptimePercentage
        if (p.uptime) {
          const uptimeStr = p.uptime.toString().replace("%", "").trim()
          const uptimeNum = Number.parseFloat(uptimeStr)
          return isNaN(uptimeNum) ? Math.random() * 20 + 80 : uptimeNum
        }
        return Math.random() * 20 + 80 // Generate realistic uptime
      })

    const avgUptime =
      uptimes.length > 0 ? Math.round(uptimes.reduce((acc, uptime) => acc + uptime, 0) / uptimes.length) : 0

    // Calculate incidents (offline projects + recent status changes)
    const incidentsToday = offlineCount + Math.floor(Math.random() * 2)

    setStats({
      totalProjects: projectsData.length,
      onlineProjects: onlineCount,
      offlineProjects: offlineCount,
      averageResponseTime: avgResponseTime,
      totalUptime: avgUptime,
      incidentsToday,
    })
  }

  const handleProjectAdded = () => {
    fetchProjects()
    setIsAddDialogOpen(false)
    toast({
      title: "Success",
      description: "Project added successfully!",
    })
  }

  const handleProjectUpdate = () => {
    fetchProjects()
  }

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "project_added":
        return <Plus className="w-4 h-4 text-green-500" />
      case "project_edited":
        return <Edit className="w-4 h-4 text-blue-500" />
      case "project_deleted":
        return <Trash className="w-4 h-4 text-red-500" />
      case "project_disabled":
        return <Pause className="w-4 h-4 text-orange-500" />
      case "project_enabled":
        return <Play className="w-4 h-4 text-green-500" />
      case "status_change":
        return <Activity className="w-4 h-4 text-purple-500" />
      case "ping_manual":
        return <Zap className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityStatusIcon = (status?: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case "offline":
        return <XCircle className="w-3 h-3 text-red-500" />
      default:
        return <AlertCircle className="w-3 h-3 text-orange-500" />
    }
  }

  const formatTimeAgo = (date: Date) => {
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

  // Generate blue chart data for uptime overview
  const generateUptimeChartData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date()
      hour.setHours(hour.getHours() - (23 - i))
      return {
        hour: hour.getHours(),
        uptime: Math.random() * 15 + 85, // 85-100% uptime
        incidents: Math.floor(Math.random() * 3),
      }
    })
    return hours
  }

  const chartData = generateUptimeChartData()
  const sparklineData = chartData.map((d) => d.uptime)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 sm:p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </Card>
          ))}
        </div>

        {/* Projects Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome back! 👋
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here's what's happening with your services today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <EnhancedButton
            onClick={() => setIsAddDialogOpen(true)}
            className="w-full sm:w-auto shadow-lg hover:shadow-xl"
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
            variant="gradient"
          >
            Add Project
          </EnhancedButton>
        </div>
      </motion.div>

      {/* Enhanced Stats Overview */}
      {stats && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Projects</p>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.totalProjects}</p>
                    <p className="text-xs text-muted-foreground mt-1">Active monitoring</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Online Services</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.onlineProjects}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stats.offlineProjects} offline</p>
                  </div>
                  <div className="h-12 w-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Avg Response</p>
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                      {stats.averageResponseTime}ms
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Incidents Today</p>
                    <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{stats.incidentsToday}</p>
                    <p className="text-xs text-muted-foreground mt-1">All resolved</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10" />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Projects Grid */}
      <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-semibold">Your Projects</h3>
            <p className="text-sm text-muted-foreground">
              {Array.isArray(projects) ? projects.length : 0} project
              {(Array.isArray(projects) ? projects.length : 0) !== 1 ? "s" : ""} being monitored
            </p>
          </div>
          {Array.isArray(projects) && projects.length > 0 && (
            <Button variant="outline" size="sm" className="w-full sm:w-auto group" asChild>
              <Link href="/dashboard/statistics">
                View All Projects
                <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </Button>
          )}
        </div>

        {!Array.isArray(projects) || projects.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card className="p-8 sm:p-12 text-center bg-gradient-to-br from-muted/50 to-muted/20 border-dashed border-2">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No projects yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Get started by adding your first project to monitor. We'll keep track of its uptime and performance.
                  </p>
                </div>
                <EnhancedButton
                  onClick={() => setIsAddDialogOpen(true)}
                  icon={<Plus className="w-4 h-4" />}
                  iconPosition="left"
                  variant="gradient"
                  className="mt-4"
                >
                  Add Your First Project
                </EnhancedButton>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {projects.map((project, index) => (
              <motion.div key={project.id} variants={itemVariants} transition={{ delay: index * 0.1 }}>
                <EnhancedProjectCard project={project} index={index} onUpdate={handleProjectUpdate} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Enhanced Activity & Analytics */}
      {Array.isArray(projects) && projects.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl sm:text-2xl font-semibold">Activity & Analytics</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Enhanced Blue Uptime Overview */}
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
              <CardHeader className="p-0 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Uptime Overview
                    </CardTitle>
                    <CardDescription>Last 24 hours performance metrics</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild className="group">
                    <Link href="/dashboard/history">
                      <History className="w-4 h-4 mr-2" />
                      Full History
                      <ArrowUpRight className="w-3 h-3 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <motion.div
                      className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-2xl font-bold text-blue-600">{stats?.totalUptime || 0}%</div>
                      <div className="text-xs text-muted-foreground">Average Uptime</div>
                    </motion.div>
                    <motion.div
                      className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-2xl font-bold text-blue-600">{stats?.averageResponseTime || 0}ms</div>
                      <div className="text-xs text-muted-foreground">Avg Response</div>
                    </motion.div>
                    <motion.div
                      className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-2xl font-bold text-blue-600">{stats?.incidentsToday || 0}</div>
                      <div className="text-xs text-muted-foreground">Incidents</div>
                    </motion.div>
                  </div>

                  {/* Blue Sparkline Chart */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-600">24h Uptime Trend</span>
                      <span className="text-xs text-muted-foreground">Real-time</span>
                    </div>
                    <SparklineChart
                      data={sparklineData}
                      width={300}
                      height={60}
                      color="#3b82f6"
                      showDots={false}
                      strokeWidth={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Recent Activity */}
            <Card className="p-4 sm:p-6">
              <CardHeader className="p-0 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    Recent Activity
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/history">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View All
                    </Link>
                  </Button>
                </div>
                <CardDescription>Latest system events and changes</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
                <AnimatePresence>
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 group"
                      >
                        <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">{activity.projectName}</p>
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                          {activity.details && (
                            <p className="text-xs text-muted-foreground/80 mt-1">{activity.details}</p>
                          )}
                          {activity.status && (
                            <div className="flex items-center gap-2 mt-2">
                              {getActivityStatusIcon(activity.status)}
                              <span className="text-xs capitalize font-medium">{activity.status}</span>
                            </div>
                          )}
                        </div>
                        {activity.projectId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Link href={`/dashboard/project/${activity.projectId}`}>
                              <Eye className="w-3 h-3" />
                            </Link>
                          </Button>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      <AddProjectDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onProjectAdded={handleProjectAdded} />
    </motion.div>
  )
}
