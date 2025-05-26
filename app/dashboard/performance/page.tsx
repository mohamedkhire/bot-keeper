"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Activity,
  Zap,
  Server,
  Database,
  Wifi,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Monitor,
} from "lucide-react"

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
import { MetricCard } from "@/components/metric-card"
import { EnhancedButton } from "@/components/enhanced-button"

interface SystemMetrics {
  uptime: number
  responseTime: number
  throughput: number
  errorRate: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkLatency: number
  activeConnections: number
  requestsPerMinute: number
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  action: () => void
  variant: "default" | "destructive" | "outline"
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    fetchSystemMetrics()
    const interval = setInterval(fetchSystemMetrics, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemMetrics = async () => {
    try {
      setIsLoading(true)

      // Mock system metrics - in real app, this would come from your monitoring API
      const mockMetrics: SystemMetrics = {
        uptime: 99.8,
        responseTime: Math.floor(Math.random() * 50) + 20, // 20-70ms
        throughput: Math.floor(Math.random() * 1000) + 500, // 500-1500 req/min
        errorRate: Math.random() * 0.5, // 0-0.5%
        cpuUsage: Math.floor(Math.random() * 30) + 10, // 10-40%
        memoryUsage: Math.floor(Math.random() * 40) + 30, // 30-70%
        diskUsage: Math.floor(Math.random() * 20) + 45, // 45-65%
        networkLatency: Math.floor(Math.random() * 10) + 5, // 5-15ms
        activeConnections: Math.floor(Math.random() * 100) + 50, // 50-150
        requestsPerMinute: Math.floor(Math.random() * 500) + 200, // 200-700
      }

      setMetrics(mockMetrics)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch system metrics:", error)
      toast({
        title: "Error",
        description: "Failed to fetch system metrics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const quickActions: QuickAction[] = [
    {
      id: "health-check",
      title: "Run Health Check",
      description: "Perform a comprehensive system health check",
      icon: CheckCircle,
      action: () => {
        toast({ title: "Health Check", description: "Running comprehensive health check..." })
        // Implement health check logic
      },
      variant: "default",
    },
    {
      id: "clear-cache",
      title: "Clear Cache",
      description: "Clear system cache to improve performance",
      icon: RefreshCw,
      action: () => {
        toast({ title: "Cache Cleared", description: "System cache has been cleared successfully." })
        // Implement cache clearing logic
      },
      variant: "outline",
    },
    {
      id: "restart-services",
      title: "Restart Services",
      description: "Restart critical system services",
      icon: Server,
      action: () => {
        toast({ title: "Services Restarted", description: "Critical services have been restarted." })
        // Implement service restart logic
      },
      variant: "destructive",
    },
    {
      id: "optimize-db",
      title: "Optimize Database",
      description: "Run database optimization routines",
      icon: Database,
      action: () => {
        toast({ title: "Database Optimized", description: "Database optimization completed successfully." })
        // Implement database optimization logic
      },
      variant: "outline",
    },
    {
      id: "network-test",
      title: "Network Test",
      description: "Test network connectivity and latency",
      icon: Wifi,
      action: () => {
        toast({ title: "Network Test", description: "Running network connectivity tests..." })
        // Implement network testing logic
      },
      variant: "outline",
    },
    {
      id: "system-settings",
      title: "System Settings",
      description: "Configure system performance settings",
      icon: Settings,
      action: () => {
        toast({ title: "Settings", description: "Opening system settings..." })
        // Navigate to settings
      },
      variant: "outline",
    },
  ]

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "text-green-600"
    if (value <= thresholds.warning) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusBg = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "bg-green-500/10 border-green-500/20"
    if (value <= thresholds.warning) return "bg-yellow-500/10 border-yellow-500/20"
    return "bg-red-500/10 border-red-500/20"
  }

  if (isLoading && !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Performance</h1>
          <p className="text-muted-foreground">Real-time system metrics and performance monitoring</p>
          <p className="text-xs text-muted-foreground mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <EnhancedButton
          onClick={fetchSystemMetrics}
          variant="outline"
          icon={<RefreshCw className="w-4 h-4" />}
          isLoading={isLoading}
          loadingText="Refreshing..."
        >
          Refresh
        </EnhancedButton>
      </div>

      {/* System Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="System Uptime"
            value={`${metrics.uptime}%`}
            description="Last 30 days"
            icon={TrendingUp}
            trend="99.9% target"
            color="green"
          />
          <MetricCard
            title="Response Time"
            value={`${metrics.responseTime}ms`}
            description="Average latency"
            icon={Zap}
            trend="< 50ms target"
            color="blue"
          />
          <MetricCard
            title="Throughput"
            value={`${metrics.throughput}`}
            description="Requests/minute"
            icon={Activity}
            trend="+15% from last hour"
            color="purple"
          />
          <MetricCard
            title="Error Rate"
            value={`${metrics.errorRate.toFixed(2)}%`}
            description="Failed requests"
            icon={AlertTriangle}
            trend="< 1% target"
            color="red"
          />
        </div>
      )}

      {/* Detailed Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Resource Usage
              </EnhancedCardTitle>
              <EnhancedCardDescription>Current system resource utilization</EnhancedCardDescription>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-4">
              <div className={`p-4 rounded-lg border ${getStatusBg(metrics.cpuUsage, { good: 50, warning: 80 })}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">CPU Usage</span>
                  <span className={`text-lg font-bold ${getStatusColor(metrics.cpuUsage, { good: 50, warning: 80 })}`}>
                    {metrics.cpuUsage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${metrics.cpuUsage}%` }}
                  />
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${getStatusBg(metrics.memoryUsage, { good: 60, warning: 85 })}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span
                    className={`text-lg font-bold ${getStatusColor(metrics.memoryUsage, { good: 60, warning: 85 })}`}
                  >
                    {metrics.memoryUsage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${metrics.memoryUsage}%` }}
                  />
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${getStatusBg(metrics.diskUsage, { good: 70, warning: 90 })}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Disk Usage</span>
                  <span className={`text-lg font-bold ${getStatusColor(metrics.diskUsage, { good: 70, warning: 90 })}`}>
                    {metrics.diskUsage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${metrics.diskUsage}%` }}
                  />
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Network & Connections
              </EnhancedCardTitle>
              <EnhancedCardDescription>Network performance and connection metrics</EnhancedCardDescription>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-600">{metrics.networkLatency}ms</div>
                  <div className="text-sm text-muted-foreground">Network Latency</div>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-2xl font-bold text-green-600">{metrics.activeConnections}</div>
                  <div className="text-sm text-muted-foreground">Active Connections</div>
                </div>
              </div>

              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-600">{metrics.requestsPerMinute}</div>
                <div className="text-sm text-muted-foreground">Requests per Minute</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Peak: {Math.floor(metrics.requestsPerMinute * 1.3)} req/min
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      )}

      {/* Quick Actions */}
      <EnhancedCard>
        <EnhancedCardHeader>
          <EnhancedCardTitle>Quick Actions</EnhancedCardTitle>
          <EnhancedCardDescription>Perform common system maintenance and optimization tasks</EnhancedCardDescription>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <motion.div key={action.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant={action.variant}
                    className="w-full h-auto p-4 flex flex-col items-start gap-2"
                    onClick={action.action}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{action.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-left">{action.description}</p>
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  )
}
