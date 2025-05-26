"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format, subDays } from "date-fns"
import {
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  RefreshCw,
  AlertTriangle,
  Zap,
  Globe,
  Timer,
  Wifi,
  WifiOff,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react"
import { motion } from "framer-motion"

import { EnhancedButton } from "@/components/enhanced-button"
import {
  EnhancedCard,
  EnhancedCardContent,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardDescription,
} from "@/components/enhanced-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { EnhancedStatusBadge } from "@/components/enhanced-status-badge"
import { EnhancedHistoryChart } from "@/components/enhanced-history-chart"
import { UptimeCalendar } from "@/components/uptime-calendar"
import { ResponseTimeChart } from "@/components/response-time-chart"
import { Progress } from "@/components/ui/progress"

type PingHistoryItem = {
  id: string
  project_id: string
  status: boolean
  response_time: number | null
  created_at: string
  error_message?: string
}

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
}

type ProjectStats = {
  uptime: number
  avgResponseTime: number
  totalPings: number
  successfulPings: number
  failedPings: number
  outages: number
  longestOutage: number
  shortestResponseTime: number
  longestResponseTime: number
  lastOutage: Date | null
  availability: number
  reliability: number
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [pingHistory, setPingHistory] = useState<PingHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPinging, setIsPinging] = useState(false)
  const [dateRange, setDateRange] = useState<"24h" | "7d" | "30d" | "all">("7d")
  const [viewMode, setViewMode] = useState<"overview" | "timeline" | "calendar">("overview")

  // Fetch project and ping history on mount
  useEffect(() => {
    if (!projectId) return

    const fetchProjectData = async () => {
      setIsLoading(true)
      try {
        // Fetch project details
        const projectResponse = await fetch("/api/projects")
        if (!projectResponse.ok) {
          throw new Error("Failed to fetch projects")
        }

        const projectData = await projectResponse.json()
        if (projectData.success && projectData.projects) {
          const foundProject = projectData.projects.find((p: Project) => p.id === projectId)
          if (foundProject) {
            setProject(foundProject)
            fetchPingHistory(foundProject.id)
          } else {
            toast({
              title: "Error",
              description: "Project not found",
              variant: "destructive",
            })
            router.push("/dashboard")
          }
        }
      } catch (error) {
        console.error("Error fetching project data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch project data. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchProjectData()
  }, [projectId, router])

  // Fetch ping history for a project
  const fetchPingHistory = async (id: string) => {
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
        setPingHistory(data.history)
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

  // Handle date range change
  const handleDateRangeChange = (value: "24h" | "7d" | "30d" | "all") => {
    setDateRange(value)
    if (project) {
      fetchPingHistory(project.id)
    }
  }

  // Handle ping now
  const handlePingNow = async () => {
    if (!project) return

    setIsPinging(true)

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

      const data = await response.json()

      if (data.success) {
        setProject(data.project)
        toast({
          title: "Success",
          description: `${data.project.name} pinged successfully!`,
        })

        // Refresh ping history
        fetchPingHistory(project.id)
      } else {
        toast({
          title: "Error",
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
      setIsPinging(false)
    }
  }

  // Calculate comprehensive statistics
  const calculateStats = (): ProjectStats => {
    if (!pingHistory.length) {
      return {
        uptime: 0,
        avgResponseTime: 0,
        totalPings: 0,
        successfulPings: 0,
        failedPings: 0,
        outages: 0,
        longestOutage: 0,
        shortestResponseTime: 0,
        longestResponseTime: 0,
        lastOutage: null,
        availability: 0,
        reliability: 0,
      }
    }

    const successfulPings = pingHistory.filter((ping) => ping.status).length
    const failedPings = pingHistory.length - successfulPings
    const uptime = (successfulPings / pingHistory.length) * 100

    const responseTimes = pingHistory
      .filter((ping) => ping.response_time !== null && ping.status)
      .map((ping) => ping.response_time as number)

    const avgResponseTime = responseTimes.length
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0

    const shortestResponseTime = responseTimes.length ? Math.min(...responseTimes) : 0
    const longestResponseTime = responseTimes.length ? Math.max(...responseTimes) : 0

    // Calculate outages
    const outages = calculateOutages(pingHistory)
    const longestOutage = outages.length ? Math.max(...outages.map((o) => o.duration)) : 0
    const lastOutage = outages.length ? outages[0].start : null

    // Calculate availability (percentage of time service was available)
    const availability = uptime

    // Calculate reliability (consistency of response times)
    const responseTimeVariance =
      responseTimes.length > 1
        ? responseTimes.reduce((acc, time) => acc + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length
        : 0
    const reliability =
      responseTimes.length > 0 ? Math.max(0, 100 - (Math.sqrt(responseTimeVariance) / avgResponseTime) * 100) : 0

    return {
      uptime,
      avgResponseTime,
      totalPings: pingHistory.length,
      successfulPings,
      failedPings,
      outages: outages.length,
      longestOutage,
      shortestResponseTime,
      longestResponseTime,
      lastOutage,
      availability,
      reliability: Math.min(100, reliability),
    }
  }

  // Calculate outages from ping history
  const calculateOutages = (history: PingHistoryItem[]) => {
    if (!history.length) return []

    const outages: { start: Date; end: Date; duration: number }[] = []
    let currentOutage: { start: Date; end: Date } | null = null

    // Sort history by date
    const sortedHistory = [...history].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

    for (let i = 0; i < sortedHistory.length; i++) {
      const ping = sortedHistory[i]
      const pingTime = new Date(ping.created_at)

      if (!ping.status) {
        // Start of an outage
        if (!currentOutage) {
          currentOutage = { start: pingTime, end: pingTime }
        } else {
          // Continue the outage
          currentOutage.end = pingTime
        }
      } else if (currentOutage) {
        // End of an outage
        const duration = (currentOutage.start.getTime() - currentOutage.end.getTime()) / (1000 * 60) // in minutes
        outages.push({ ...currentOutage, duration })
        currentOutage = null
      }
    }

    // If there's an ongoing outage
    if (currentOutage) {
      const duration = (currentOutage.start.getTime() - currentOutage.end.getTime()) / (1000 * 60) // in minutes
      outages.push({ ...currentOutage, duration })
    }

    return outages
  }

  const stats = calculateStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <EnhancedButton variant="ghost" size="sm" asChild className="mr-2">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Link>
            </EnhancedButton>
            <div>
              <h1 className="text-3xl font-bold">Project Analytics</h1>
              <p className="text-muted-foreground">Comprehensive monitoring insights</p>
            </div>
          </div>

          {project && (
            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={handlePingNow}
              disabled={isPinging || !project.enabled}
              isLoading={isPinging}
              loadingText="Pinging..."
              icon={<RefreshCw className="h-4 w-4" />}
            >
              Ping Now
            </EnhancedButton>
          )}
        </div>

        <EnhancedCard variant="default" hover="default" animation="fadeIn" className="mb-8">
          <EnhancedCardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                {isLoading ? (
                  <Skeleton className="h-8 w-48" />
                ) : project ? (
                  <>
                    <div className="flex items-center gap-3">
                      <EnhancedStatusBadge
                        status={project.status as "online" | "offline" | "unknown"}
                        className="mr-2"
                      />
                      <EnhancedCardTitle className="text-2xl">{project.name}</EnhancedCardTitle>
                    </div>
                    <EnhancedCardDescription className="mt-2 text-lg">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        {project.url}
                      </a>
                    </EnhancedCardDescription>
                  </>
                ) : (
                  <EnhancedCardTitle>Project not found</EnhancedCardTitle>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={dateRange} onValueChange={handleDateRangeChange as (value: string) => void}>
                  <SelectTrigger className="w-[180px] h-12">
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
          </EnhancedCardHeader>
          <EnhancedCardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-[400px] w-full" />
              </div>
            ) : project ? (
              <div>
                {/* Enhanced Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <EnhancedCard variant="default" hover="lift" className="h-full">
                      <EnhancedCardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Availability</p>
                            <p className="text-3xl font-bold text-green-600">{stats.availability.toFixed(1)}%</p>
                          </div>
                          <div className="p-3 bg-green-500/10 rounded-xl">
                            <Wifi className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                        <Progress value={stats.availability} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          {stats.successfulPings} of {stats.totalPings} checks successful
                        </p>
                      </EnhancedCardContent>
                    </EnhancedCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <EnhancedCard variant="default" hover="lift" className="h-full">
                      <EnhancedCardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.avgResponseTime.toFixed(0)}ms</p>
                          </div>
                          <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Timer className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Min: {stats.shortestResponseTime}ms</span>
                            <span>Max: {stats.longestResponseTime}ms</span>
                          </div>
                          <Progress value={Math.min(100, (stats.avgResponseTime / 1000) * 100)} className="h-2" />
                        </div>
                      </EnhancedCardContent>
                    </EnhancedCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <EnhancedCard variant="default" hover="lift" className="h-full">
                      <EnhancedCardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Reliability</p>
                            <p className="text-3xl font-bold text-purple-600">{stats.reliability.toFixed(1)}%</p>
                          </div>
                          <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Zap className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                        <Progress value={stats.reliability} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">Response time consistency</p>
                      </EnhancedCardContent>
                    </EnhancedCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <EnhancedCard variant="default" hover="lift" className="h-full">
                      <EnhancedCardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Incidents</p>
                            <p className="text-3xl font-bold text-red-600">{stats.outages}</p>
                          </div>
                          <div className="p-3 bg-red-500/10 rounded-xl">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Longest: {stats.longestOutage.toFixed(0)} min</p>
                          <p className="text-xs text-muted-foreground">
                            Last: {stats.lastOutage ? format(stats.lastOutage, "MMM dd, HH:mm") : "None"}
                          </p>
                        </div>
                      </EnhancedCardContent>
                    </EnhancedCard>
                  </motion.div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2"
                  >
                    <EnhancedCard variant="default" hover="lift" className="h-full">
                      <EnhancedCardHeader>
                        <EnhancedCardTitle className="flex items-center gap-2">
                          <LineChart className="h-5 w-5" />
                          Performance Overview
                        </EnhancedCardTitle>
                      </EnhancedCardHeader>
                      <EnhancedCardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-4 bg-muted/30 rounded-xl">
                            <p className="text-2xl font-bold text-green-600">{stats.successfulPings}</p>
                            <p className="text-sm text-muted-foreground">Successful</p>
                          </div>
                          <div className="text-center p-4 bg-muted/30 rounded-xl">
                            <p className="text-2xl font-bold text-red-600">{stats.failedPings}</p>
                            <p className="text-sm text-muted-foreground">Failed</p>
                          </div>
                          <div className="text-center p-4 bg-muted/30 rounded-xl">
                            <p className="text-2xl font-bold text-blue-600">{stats.totalPings}</p>
                            <p className="text-sm text-muted-foreground">Total Checks</p>
                          </div>
                          <div className="text-center p-4 bg-muted/30 rounded-xl">
                            <p className="text-2xl font-bold text-purple-600">{dateRange}</p>
                            <p className="text-sm text-muted-foreground">Time Range</p>
                          </div>
                        </div>
                        {pingHistory.length > 0 && <ResponseTimeChart history={pingHistory} />}
                      </EnhancedCardContent>
                    </EnhancedCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <EnhancedCard variant="default" hover="lift" className="h-full">
                      <EnhancedCardHeader>
                        <EnhancedCardTitle className="flex items-center gap-2">
                          <PieChart className="h-5 w-5" />
                          Status Distribution
                        </EnhancedCardTitle>
                      </EnhancedCardHeader>
                      <EnhancedCardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm">Online</span>
                            </div>
                            <span className="font-semibold">
                              {((stats.successfulPings / stats.totalPings) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={(stats.successfulPings / stats.totalPings) * 100} className="h-2" />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-sm">Offline</span>
                            </div>
                            <span className="font-semibold">
                              {((stats.failedPings / stats.totalPings) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={(stats.failedPings / stats.totalPings) * 100} className="h-2" />

                          <div className="pt-4 border-t">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-primary">{stats.availability.toFixed(2)}%</p>
                              <p className="text-sm text-muted-foreground">Overall Uptime</p>
                            </div>
                          </div>
                        </div>
                      </EnhancedCardContent>
                    </EnhancedCard>
                  </motion.div>
                </div>

                <Tabs
                  value={viewMode}
                  onValueChange={(value) => setViewMode(value as "overview" | "timeline" | "calendar")}
                >
                  <TabsList className="mb-6 h-12">
                    <TabsTrigger value="overview" className="flex items-center gap-2 px-6">
                      <BarChart3 className="h-4 w-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="flex items-center gap-2 px-6">
                      <Activity className="h-4 w-4" />
                      Timeline
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="flex items-center gap-2 px-6">
                      <Calendar className="h-4 w-4" />
                      Calendar
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    {pingHistory.length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <EnhancedCard variant="default" hover="lift" animation="fadeIn">
                          <EnhancedCardHeader>
                            <EnhancedCardTitle className="text-xl">Detailed Analytics</EnhancedCardTitle>
                            <EnhancedCardDescription>
                              Comprehensive monitoring data for the selected time period
                            </EnhancedCardDescription>
                          </EnhancedCardHeader>
                          <EnhancedCardContent>
                            <EnhancedHistoryChart history={pingHistory} />
                          </EnhancedCardContent>
                        </EnhancedCard>
                      </motion.div>
                    ) : (
                      <div className="text-center py-12">
                        <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">No monitoring data available for this project.</p>
                        <p className="text-sm text-muted-foreground mt-2">Start monitoring to see analytics here.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-6">
                    {pingHistory.length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <EnhancedCard variant="default" hover="lift" animation="fadeIn">
                          <EnhancedCardHeader>
                            <EnhancedCardTitle className="text-xl">Timeline View</EnhancedCardTitle>
                            <EnhancedCardDescription>
                              Chronological view of all monitoring events
                            </EnhancedCardDescription>
                          </EnhancedCardHeader>
                          <EnhancedCardContent>
                            <EnhancedHistoryChart history={pingHistory} />
                          </EnhancedCardContent>
                        </EnhancedCard>
                      </motion.div>
                    ) : (
                      <div className="text-center py-12">
                        <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">No timeline data available.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="calendar" className="space-y-6">
                    {pingHistory.length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <EnhancedCard variant="default" hover="lift" animation="fadeIn">
                          <EnhancedCardHeader>
                            <EnhancedCardTitle className="text-xl">Calendar View</EnhancedCardTitle>
                            <EnhancedCardDescription>Monthly overview of service availability</EnhancedCardDescription>
                          </EnhancedCardHeader>
                          <EnhancedCardContent>
                            <UptimeCalendar history={pingHistory} />
                          </EnhancedCardContent>
                        </EnhancedCard>
                      </motion.div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">No calendar data available.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Recent Events Table */}
                {pingHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8"
                  >
                    <EnhancedCard variant="default" hover="lift" animation="fadeIn">
                      <EnhancedCardHeader>
                        <EnhancedCardTitle className="text-xl">Recent Events</EnhancedCardTitle>
                        <EnhancedCardDescription>Latest monitoring results and status changes</EnhancedCardDescription>
                      </EnhancedCardHeader>
                      <EnhancedCardContent>
                        <div className="border rounded-xl overflow-hidden">
                          <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted/30">
                              <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  Timestamp
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  Status
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
                              {pingHistory.slice(0, 15).map((ping, index) => (
                                <motion.tr
                                  key={ping.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="hover:bg-muted/20 transition-colors"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    {format(new Date(ping.created_at), "MMM dd, HH:mm:ss")}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      {ping.status ? (
                                        <Wifi className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <WifiOff className="h-4 w-4 text-red-600" />
                                      )}
                                      <span
                                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                          ping.status
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                        }`}
                                      >
                                        {ping.status ? "Online" : "Offline"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {ping.response_time ? (
                                      <span
                                        className={`font-medium ${
                                          ping.response_time < 200
                                            ? "text-green-600"
                                            : ping.response_time < 500
                                              ? "text-yellow-600"
                                              : "text-red-600"
                                        }`}
                                      >
                                        {ping.response_time}ms
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">N/A</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                                    {ping.error_message || "Success"}
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </EnhancedCardContent>
                    </EnhancedCard>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">Project not found.</p>
                <EnhancedButton variant="outline" className="mt-4" asChild>
                  <Link href="/dashboard">Return to Dashboard</Link>
                </EnhancedButton>
              </div>
            )}
          </EnhancedCardContent>
        </EnhancedCard>
      </div>
    </div>
  )
}
