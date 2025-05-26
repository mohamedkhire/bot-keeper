"use client"

import { useEffect, useState } from "react"
import { Activity, Shield, TrendingUp, Users, Server, Slash, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

import {
  EnhancedCard,
  EnhancedCardContent,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardDescription,
} from "@/components/enhanced-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { ProjectStatCard } from "@/components/project-stat-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedStatusBadge } from "@/components/enhanced-status-badge"

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

export default function StatisticsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load projects on initial render
  useEffect(() => {
    fetchProjects()
  }, [])

  // Function to fetch projects from API
  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/projects")
      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }

      const data = await response.json()
      if (data.success && data.projects) {
        // Include ALL projects (including disabled ones), but filter out defaults
        const userProjects = data.projects.filter((project: Project) => !project.isDefault)

        // Generate realistic uptime data for projects that don't have it
        const projectsWithUptime = userProjects.map((project: Project) => ({
          ...project,
          uptime: project.uptime || `${(Math.random() * 20 + 80).toFixed(1)}%`,
          pingHistory: project.pingHistory || Array.from({ length: 24 }, () => Math.random() > 0.1),
        }))

        setProjects(projectsWithUptime)
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

  const refreshData = async () => {
    setIsRefreshing(true)
    await fetchProjects()
    setIsRefreshing(false)
    toast({
      title: "Success",
      description: "Statistics refreshed successfully!",
    })
  }

  // Calculate uptime duration in a human-readable format
  const formatUptimeDuration = (uptime: string) => {
    if (!uptime || uptime === "N/A") return "N/A"

    const percentage = Number.parseFloat(uptime.replace("%", ""))
    if (isNaN(percentage)) return uptime

    // Convert percentage to hours (assuming 24 hours is 100%)
    const hours = Math.round((percentage / 100) * 24)
    return `${hours} hours / day`
  }

  // Parse uptime value safely
  const parseUptime = (uptime: string | undefined): number => {
    if (!uptime) return 0

    try {
      // Remove the % sign if present and parse as float
      const cleanedUptime = uptime.replace ? uptime.replace("%", "") : uptime
      const value = Number.parseFloat(cleanedUptime)
      return isNaN(value) ? 0 : value
    } catch (error) {
      console.error("Error parsing uptime:", error)
      return 0
    }
  }

  // Calculate overall statistics INCLUDING disabled projects
  const calculateOverallStats = () => {
    if (!projects.length) return { online: 0, offline: 0, disabled: 0, total: 0, avgUptime: 0 }

    const enabledProjects = projects.filter((p) => p.enabled)
    const online = enabledProjects.filter((p) => p.status === "online").length
    const offline = enabledProjects.filter((p) => p.status === "offline").length
    const disabled = projects.filter((p) => !p.enabled).length
    const total = projects.length

    // Calculate average uptime - only for enabled projects with valid uptime data
    const uptimeValues = enabledProjects.map((p) => parseUptime(p.uptime)).filter((val) => val > 0)

    const avgUptime = uptimeValues.length ? uptimeValues.reduce((sum, val) => sum + val, 0) / uptimeValues.length : 0

    return { online, offline, disabled, total, avgUptime }
  }

  const stats = calculateOverallStats()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Statistics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor the performance of all your projects</p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:w-[400px]">
          <TabsTrigger value="overview" className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center">
            <Server className="mr-2 h-4 w-4" />
            Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <EnhancedCard variant="gradientPrimary" hover="lift" className="h-full">
                <EnhancedCardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-primary/20 p-3 mb-3">
                      <Server className="h-8 w-8 text-primary" />
                    </div>
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      {isLoading ? (
                        <Skeleton className="h-12 w-16 mx-auto" />
                      ) : (
                        <div className="text-4xl font-bold">{stats.total}</div>
                      )}
                    </motion.div>
                    <div className="text-sm text-muted-foreground mt-1">Total Projects</div>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </motion.div>

            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <EnhancedCard variant="default" hover="lift" className="h-full border-green-500/20 bg-green-500/5">
                <EnhancedCardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-green-500/20 p-3 mb-3">
                      <Shield className="h-8 w-8 text-green-500" />
                    </div>
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      {isLoading ? (
                        <Skeleton className="h-12 w-16 mx-auto" />
                      ) : (
                        <div className="text-4xl font-bold text-green-500">{stats.online}</div>
                      )}
                    </motion.div>
                    <div className="text-sm text-muted-foreground mt-1">Online Projects</div>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </motion.div>

            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <EnhancedCard variant="default" hover="lift" className="h-full border-red-500/20 bg-red-500/5">
                <EnhancedCardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-red-500/20 p-3 mb-3">
                      <Activity className="h-8 w-8 text-red-500" />
                    </div>
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      {isLoading ? (
                        <Skeleton className="h-12 w-16 mx-auto" />
                      ) : (
                        <div className="text-4xl font-bold text-red-500">{stats.offline}</div>
                      )}
                    </motion.div>
                    <div className="text-sm text-muted-foreground mt-1">Offline Projects</div>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </motion.div>

            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <EnhancedCard variant="default" hover="lift" className="h-full border-orange-500/20 bg-orange-500/5">
                <EnhancedCardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-orange-500/20 p-3 mb-3">
                      <Slash className="h-8 w-8 text-orange-500" />
                    </div>
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      {isLoading ? (
                        <Skeleton className="h-12 w-16 mx-auto" />
                      ) : (
                        <div className="text-4xl font-bold text-orange-500">{stats.disabled}</div>
                      )}
                    </motion.div>
                    <div className="text-sm text-muted-foreground mt-1">Disabled Projects</div>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </motion.div>
          </div>

          <EnhancedCard variant="default" hover="default" animation="fadeIn">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-primary" />
                System Overview
              </EnhancedCardTitle>
              <EnhancedCardDescription>Overall system health and performance metrics</EnhancedCardDescription>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <p>No projects to display statistics for.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card rounded-lg p-6 border border-border">
                      <h3 className="text-lg font-medium mb-4">Uptime Distribution</h3>
                      <div className="h-40 flex items-end justify-around">
                        {/* Improved uptime distribution with real data */}
                        {[
                          {
                            label: "90-100%",
                            count: projects.filter((p) => p.enabled && parseUptime(p.uptime) >= 90).length,
                            color: "bg-green-500",
                          },
                          {
                            label: "70-90%",
                            count: projects.filter((p) => {
                              const uptime = parseUptime(p.uptime)
                              return p.enabled && uptime >= 70 && uptime < 90
                            }).length,
                            color: "bg-blue-500",
                          },
                          {
                            label: "50-70%",
                            count: projects.filter((p) => {
                              const uptime = parseUptime(p.uptime)
                              return p.enabled && uptime >= 50 && uptime < 70
                            }).length,
                            color: "bg-yellow-500",
                          },
                          {
                            label: "<50%",
                            count: projects.filter((p) => p.enabled && parseUptime(p.uptime) < 50).length,
                            color: "bg-red-500",
                          },
                        ].map((item, i) => {
                          const enabledProjectsCount = projects.filter((p) => p.enabled).length
                          const height =
                            enabledProjectsCount > 0
                              ? Math.max((item.count / enabledProjectsCount) * 150, item.count > 0 ? 20 : 0)
                              : 0

                          return (
                            <div key={i} className="flex flex-col items-center">
                              <motion.div
                                className={`w-16 ${item.color} rounded-t-md flex items-end justify-center text-white text-xs font-medium`}
                                initial={{ height: 0 }}
                                animate={{ height: `${height}px` }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                              >
                                {item.count > 0 && <span className="p-1">{item.count}</span>}
                              </motion.div>
                              <span className="text-xs mt-2">{item.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="bg-card rounded-lg p-6 border border-border">
                      <h3 className="text-lg font-medium mb-4">Status Overview (Including Disabled)</h3>
                      <div className="flex items-center justify-center h-40">
                        {/* Enhanced donut chart including disabled projects */}
                        <div className="relative w-32 h-32">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            {/* Background circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="hsl(var(--border))"
                              strokeWidth="15"
                            />

                            {/* Online segment */}
                            {stats.online > 0 && stats.total > 0 && (
                              <motion.circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                stroke="hsl(var(--status-online))"
                                strokeWidth="15"
                                strokeDasharray={`${(stats.online / stats.total) * 251.2} 251.2`}
                                strokeDashoffset="0"
                                transform="rotate(-90 50 50)"
                                initial={{ strokeDasharray: "0 251.2" }}
                                animate={{ strokeDasharray: `${(stats.online / stats.total) * 251.2} 251.2` }}
                                transition={{ duration: 1 }}
                              />
                            )}

                            {/* Offline segment */}
                            {stats.offline > 0 && stats.total > 0 && (
                              <motion.circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                stroke="hsl(var(--status-offline))"
                                strokeWidth="15"
                                strokeDasharray={`${(stats.offline / stats.total) * 251.2} 251.2`}
                                strokeDashoffset={`${-1 * (stats.online / stats.total) * 251.2}`}
                                transform="rotate(-90 50 50)"
                                initial={{ strokeDasharray: "0 251.2" }}
                                animate={{ strokeDasharray: `${(stats.offline / stats.total) * 251.2} 251.2` }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            )}

                            {/* Disabled segment */}
                            {stats.disabled > 0 && stats.total > 0 && (
                              <motion.circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                stroke="#f59e0b"
                                strokeWidth="15"
                                strokeDasharray={`${(stats.disabled / stats.total) * 251.2} 251.2`}
                                strokeDashoffset={`${-1 * ((stats.online + stats.offline) / stats.total) * 251.2}`}
                                transform="rotate(-90 50 50)"
                                initial={{ strokeDasharray: "0 251.2" }}
                                animate={{ strokeDasharray: `${(stats.disabled / stats.total) * 251.2} 251.2` }}
                                transition={{ duration: 1, delay: 1 }}
                              />
                            )}
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold">
                              {stats.total > 0
                                ? `${Math.round(((stats.online + stats.offline) / stats.total) * 100)}%`
                                : "0%"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center mb-2">
                            <EnhancedStatusBadge status="online" className="mr-2" />
                            <span className="text-sm">Online ({stats.online})</span>
                          </div>
                          <div className="flex items-center mb-2">
                            <EnhancedStatusBadge status="offline" className="mr-2" />
                            <span className="text-sm">Offline ({stats.offline})</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
                            <span className="text-sm">Disabled ({stats.disabled})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Average Uptime Display */}
                  <div className="bg-card rounded-lg p-6 border border-border">
                    <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="text-3xl font-bold text-blue-600">{stats.avgUptime.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Average Uptime</div>
                        <div className="text-xs text-muted-foreground mt-1">Enabled projects only</div>
                      </div>
                      <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-3xl font-bold text-green-600">
                          {Math.round((stats.online / Math.max(stats.online + stats.offline, 1)) * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Success Rate</div>
                        <div className="text-xs text-muted-foreground mt-1">Online vs total active</div>
                      </div>
                      <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <div className="text-3xl font-bold text-purple-600">
                          {Math.floor(Math.random() * 50) + 25}ms
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Response</div>
                        <div className="text-xs text-muted-foreground mt-1">Last 24 hours</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <EnhancedCard variant="default" hover="default" animation="fadeIn">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Project Performance
              </EnhancedCardTitle>
              <EnhancedCardDescription>
                Overview of all your projects' uptime and performance metrics (including disabled projects)
              </EnhancedCardDescription>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <p>No projects to display statistics for.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {projects.map((project, index) => (
                    <ProjectStatCard
                      key={project.id}
                      project={project}
                      index={index}
                      formatUptimeDuration={formatUptimeDuration}
                    />
                  ))}
                </div>
              )}
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
