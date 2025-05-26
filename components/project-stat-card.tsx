"use client"

import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"

import { EnhancedCard, EnhancedCardContent } from "@/components/enhanced-card"
import { ProjectIcon } from "@/components/project-icon"
import { EnhancedStatusBadge } from "@/components/enhanced-status-badge"

type Project = {
  id: string
  name: string
  url: string
  status: "online" | "offline" | "unknown"
  uptime: string
  lastPinged?: string
  enabled: boolean
  pingHistory?: boolean[]
  iconType?: string
  iconUrl?: string
}

interface ProjectStatCardProps {
  project: Project
  index: number
  formatUptimeDuration: (uptime: string) => string
}

export function ProjectStatCard({ project, index, formatUptimeDuration }: ProjectStatCardProps) {
  // Calculate response time (mock data for now)
  const getResponseTime = () => {
    // This would normally come from your API
    const times = [31, 42, 28, 35, 29, 33]
    return times[index % times.length]
  }

  const responseTime = getResponseTime()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <EnhancedCard
        variant={project.status === "online" ? "default" : "destructive"}
        hover="lift"
        className="overflow-hidden"
      >
        <EnhancedCardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-4">
              <div className="flex items-center gap-3 mb-3">
                <ProjectIcon type={(project.iconType as any) || "globe"} customUrl={project.iconUrl} size={32} />
                <div>
                  <h3 className="font-medium">{project.name}</h3>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center transition-colors"
                  >
                    {project.url}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="flex items-center mt-1">
                    <EnhancedStatusBadge
                      status={project.status}
                      animation={project.status === "online" ? "none" : "pulse"}
                      className="mr-2"
                    />
                    {project.status}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Response Time</div>
                  <div className="mt-1 font-medium">{responseTime}ms</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Uptime</div>
                  <div className="mt-1 font-medium">{formatUptimeDuration(project.uptime)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Last Checked</div>
                  <div className="mt-1 font-medium">
                    {project.lastPinged ? new Date(project.lastPinged).toLocaleTimeString() : "Never"}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-32 bg-muted/30 flex items-center justify-center p-4">
              <div className="w-full h-16">
                {project.pingHistory && project.pingHistory.length > 0 ? (
                  <div className="flex h-full items-end justify-between gap-1">
                    {project.pingHistory.map((isUp, i) => (
                      <div
                        key={i}
                        className={`w-full h-${Math.max(
                          2,
                          Math.floor((i / project.pingHistory!.length) * 16),
                        )} rounded-sm ${isUp ? "bg-green-500" : "bg-red-500"}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No history
                  </div>
                )}
              </div>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    </motion.div>
  )
}
