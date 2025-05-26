"use client"

import { useState, useEffect } from "react"

export interface SystemStatus {
  status: "operational" | "degraded" | "outage" | "unknown"
  uptime: number
  responseTime: number
  activeServices: number
  totalServices: number
  lastIncident?: {
    title: string
    time: Date
    severity: "low" | "medium" | "high"
  }
  services: {
    name: string
    status: "operational" | "degraded" | "outage"
    responseTime?: number
  }[]
}

export function useSystemStatus() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: "unknown",
    uptime: 0,
    responseTime: 0,
    activeServices: 0,
    totalServices: 0,
    services: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSystemStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // In a real application, this would call your monitoring API
      // For now, we'll simulate realistic system status
      const response = await fetch("/api/system-status")

      if (!response.ok) {
        // Fallback to mock data if API is not available
        const mockStatus = generateMockSystemStatus()
        setSystemStatus(mockStatus)
        return
      }

      const data = await response.json()
      setSystemStatus(data)
    } catch (err) {
      console.error("Failed to fetch system status:", err)
      setError("Failed to fetch system status")

      // Fallback to mock data
      const mockStatus = generateMockSystemStatus()
      setSystemStatus(mockStatus)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate realistic mock system status
  const generateMockSystemStatus = (): SystemStatus => {
    const services = [
      { name: "API Gateway", status: "operational" as const, responseTime: 45 },
      { name: "Database", status: "operational" as const, responseTime: 12 },
      { name: "Monitoring", status: "operational" as const, responseTime: 23 },
      { name: "Notifications", status: "operational" as const, responseTime: 67 },
      { name: "Discord Bot", status: "operational" as const, responseTime: 89 },
    ]

    // Randomly introduce some issues for realism
    const random = Math.random()
    if (random < 0.1) {
      // 10% chance of degraded service
      services[Math.floor(Math.random() * services.length)].status = "degraded"
    } else if (random < 0.02) {
      // 2% chance of outage
      services[Math.floor(Math.random() * services.length)].status = "outage"
    }

    const activeServices = services.filter((s) => s.status === "operational").length
    const degradedServices = services.filter((s) => s.status === "degraded").length
    const outageServices = services.filter((s) => s.status === "outage").length

    let overallStatus: SystemStatus["status"] = "operational"
    if (outageServices > 0) {
      overallStatus = "outage"
    } else if (degradedServices > 0) {
      overallStatus = "degraded"
    }

    const avgResponseTime = services.reduce((sum, s) => sum + (s.responseTime || 0), 0) / services.length
    const uptime = ((activeServices + degradedServices * 0.5) / services.length) * 100

    return {
      status: overallStatus,
      uptime: Math.round(uptime * 100) / 100,
      responseTime: Math.round(avgResponseTime),
      activeServices,
      totalServices: services.length,
      services,
      lastIncident:
        outageServices > 0 || degradedServices > 0
          ? {
              title: outageServices > 0 ? "Service Outage Detected" : "Performance Degradation",
              time: new Date(Date.now() - Math.random() * 3600000), // Random time in last hour
              severity: outageServices > 0 ? "high" : "medium",
            }
          : undefined,
    }
  }

  useEffect(() => {
    fetchSystemStatus()

    // Update every 2 minutes
    const interval = setInterval(fetchSystemStatus, 2 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    systemStatus,
    isLoading,
    error,
    refetch: fetchSystemStatus,
  }
}
