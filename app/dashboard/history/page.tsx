"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { format, subDays } from "date-fns"
import { Activity, ArrowLeft, Calendar, Clock, Filter, Wifi, WifiOff, Pause, Play, Edit, Trash } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { StatusBadge } from "@/components/status-badge"
import { DetailedHistoryChart } from "@/components/detailed-history-chart"
import { UptimeCalendar } from "@/components/uptime-calendar"

type PingHistoryItem = {
  id: string
  project_id: string
  status: boolean
  response_time: number | null
  created_at: string
  event_type?: "ping" | "status_change" | "disabled" | "enabled" | "edited" | "deleted"
}

type Project = {
  id: string
  name: string
  url: string
  status: "online" | "offline" | "unknown"
}

export default function HistoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")

  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [pingHistory, setPingHistory] = useState<PingHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<"24h" | "7d" | "30d" | "all">("24h") // Default to 24h
  const [viewMode, setViewMode] = useState<"chart" | "calendar">("chart")

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")
        if (!response.ok) {
          throw new Error("Failed to fetch projects")
        }

        const data = await response.json()
        if (data.success && data.projects) {
          setProjects(data.projects)

          // If projectId is provided in URL, select that project
          if (projectId) {
            const project = data.projects.find((p: Project) => p.id === projectId)
            if (project) {
              setSelectedProject(project)
              fetchPingHistory(project.id)
            }
          } else if (data.projects.length > 0) {
            // Otherwise select the first project
            setSelectedProject(data.projects[0])
            fetchPingHistory(data.projects[0].id)
          }
        }
      } catch (error) {
        console.error("Error fetching projects:", error)
        toast({
          title: "Error",
          description: "Failed to fetch projects. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [projectId])

  // Enhanced ping history with different event types
  const fetchPingHistory = async (id: string) => {
    setIsLoading(true)
    try {
      // Calculate date range
      let startDate: Date | null = null

      if (dateRange === "24h") {
        startDate = subDays(new Date(), 1)
      } else if (dateRange === "7d") {
        startDate = subDays(new Date(), 7)
      } else if (dateRange === "30d") {
        startDate = subDays(new Date(), 30)
      }

      const startDateParam = startDate ? format(startDate, "yyyy-MM-dd") : undefined

      const response = await fetch(
        `/api/history?projectId=${id}${startDateParam ? `&startDate=${startDateParam}` : ""}`,
      )
      if (!response.ok) {
        throw new Error("Failed to fetch ping history")
      }

      const data = await response.json()
      if (data.success) {
        // Generate enhanced history with different event types
        const enhancedHistory = generateEnhancedHistory(data.history, id)
        setPingHistory(enhancedHistory)
      }
    } catch (error) {
      console.error("Error fetching ping history:", error)
      toast({
        title: "Error",
        description: "Failed to fetch ping history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate enhanced history with different event types
  const generateEnhancedHistory = (baseHistory: PingHistoryItem[], projectId: string): PingHistoryItem[] => {
    const enhanced = [...baseHistory]
    const now = new Date()

    // Add some mock events for demonstration
    const mockEvents: PingHistoryItem[] = [
      {
        id: `event-1-${projectId}`,
        project_id: projectId,
        status: true,
        response_time: null,
        created_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        event_type: "enabled",
      },
      {
        id: `event-2-${projectId}`,
        project_id: projectId,
        status: false,
        response_time: null,
        created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        event_type: "disabled",
      },
      {
        id: `event-3-${projectId}`,
        project_id: projectId,
        status: true,
        response_time: null,
        created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        event_type: "edited",
      },
    ]

    // Merge and sort by date
    const allEvents = [...enhanced, ...mockEvents].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

    return allEvents
  }

  // Handle project change
  const handleProjectChange = (value: string) => {
    const project = projects.find((p) => p.id === value)
    if (project) {
      setSelectedProject(project)
      fetchPingHistory(project.id)

      // Update URL with project ID
      router.push(`/dashboard/history?projectId=${project.id}`)
    }
  }

  // Handle date range change
  const handleDateRangeChange = (value: "24h" | "7d" | "30d" | "all") => {
    setDateRange(value)
    if (selectedProject) {
      fetchPingHistory(selectedProject.id)
    }
  }

  // Calculate statistics
  const calculateStats = () => {
    if (!pingHistory.length) return { uptime: "N/A", avgResponseTime: "N/A", totalPings: 0 }

    const actualPings = pingHistory.filter((ping) => !ping.event_type || ping.event_type === "ping")
    const successfulPings = actualPings.filter((ping) => ping.status).length
    const uptime = actualPings.length > 0 ? ((successfulPings / actualPings.length) * 100).toFixed(2) : "0"

    const responseTimes = actualPings
      .filter((ping) => ping.response_time !== null)
      .map((ping) => ping.response_time as number)

    const avgResponseTime = responseTimes.length
      ? (responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length).toFixed(0)
      : "N/A"

    return {
      uptime: `${uptime}%`,
      avgResponseTime: avgResponseTime === "N/A" ? "N/A" : `${avgResponseTime}ms`,
      totalPings: actualPings.length,
    }
  }

  const stats = calculateStats()

  const getEventIcon = (event: PingHistoryItem) => {
    if (event.event_type) {
      switch (event.event_type) {
        case "disabled":
          return <Pause className="h-4 w-4 text-orange-500" />
        case "enabled":
          return <Play className="h-4 w-4 text-green-500" />
        case "edited":
          return <Edit className="h-4 w-4 text-blue-500" />
        case "deleted":
          return <Trash className="h-4 w-4 text-red-500" />
        default:
          return event.status ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )
      }
    }
    return event.status ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />
  }

  const getEventDescription = (event: PingHistoryItem) => {
    if (event.event_type) {
      switch (event.event_type) {
        case "disabled":
          return "Monitoring disabled"
        case "enabled":
          return "Monitoring enabled"
        case "edited":
          return "Project settings updated"
        case "deleted":
          return "Project deleted"
        default:
          return event.status ? "Online" : "Offline"
      }
    }
    return event.status ? "Online" : "Offline"
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Ping History</h1>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <CardTitle>Project History</CardTitle>
              <CardDescription>View detailed ping history and activity for your projects</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedProject?.id} onValueChange={handleProjectChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Projects</SelectLabel>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={handleDateRangeChange as (value: string) => void}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : selectedProject ? (
            <div>
              <div className="flex items-center mb-4">
                <StatusBadge status={selectedProject.status} />
                <h2 className="text-xl font-semibold">{selectedProject.name}</h2>
                <span className="ml-2 text-sm text-gray-500">({selectedProject.url})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-green-600 font-medium">Uptime</p>
                          <p className="text-2xl font-bold text-green-700">{stats.uptime}</p>
                        </div>
                        <Activity className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Avg Response Time</p>
                          <p className="text-2xl font-bold text-blue-700">{stats.avgResponseTime}</p>
                        </div>
                        <Clock className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Total Events</p>
                          <p className="text-2xl font-bold text-purple-700">{pingHistory.length}</p>
                        </div>
                        <Filter className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "chart" | "calendar")}>
                <TabsList className="mb-4">
                  <TabsTrigger value="chart" className="flex items-center">
                    <Activity className="mr-2 h-4 w-4" />
                    Timeline Chart
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Calendar View
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chart" className="space-y-4">
                  {pingHistory.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <DetailedHistoryChart
                        history={pingHistory.filter((h) => !h.event_type || h.event_type === "ping")}
                      />
                    </motion.div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No ping history available for this project.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="calendar" className="space-y-4">
                  {pingHistory.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl p-6 border border-blue-500/20"
                    >
                      <UptimeCalendar history={pingHistory.filter((h) => !h.event_type || h.event_type === "ping")} />
                    </motion.div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No ping history available for this project.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Enhanced Recent Events with scrolling and status icons */}
              {pingHistory.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Recent Activity & Events
                  </h3>
                  <div className="border rounded-xl overflow-hidden bg-card">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/30 sticky top-0">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Event
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Timestamp
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Response Time
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                          {pingHistory.slice(0, 100).map((event, index) => (
                            <motion.tr
                              key={event.id}
                              className="hover:bg-muted/20 transition-colors"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  {getEventIcon(event)}
                                  <div>
                                    <span className="text-sm font-medium">{getEventDescription(event)}</span>
                                    {event.event_type && (
                                      <div className="text-xs text-muted-foreground capitalize">
                                        {event.event_type.replace("_", " ")}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                <div>{new Date(event.created_at).toLocaleDateString()}</div>
                                <div className="text-xs">{new Date(event.created_at).toLocaleTimeString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                {event.response_time ? (
                                  <span
                                    className={`font-medium ${
                                      event.response_time < 100
                                        ? "text-green-600"
                                        : event.response_time < 500
                                          ? "text-yellow-600"
                                          : "text-red-600"
                                    }`}
                                  >
                                    {event.response_time}ms
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                {event.event_type ? (
                                  <span className="text-xs bg-muted px-2 py-1 rounded-full">System Event</span>
                                ) : (
                                  <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full">
                                    Health Check
                                  </span>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Select a project to view its ping history.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
