import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real application, you would check your actual services
    // This could include database connections, external APIs, etc.

    const services = [
      {
        name: "API Gateway",
        status: "operational" as const,
        responseTime: Math.floor(Math.random() * 50) + 20,
      },
      {
        name: "Database",
        status: "operational" as const,
        responseTime: Math.floor(Math.random() * 20) + 5,
      },
      {
        name: "Monitoring Service",
        status: "operational" as const,
        responseTime: Math.floor(Math.random() * 30) + 15,
      },
      {
        name: "Notification System",
        status: "operational" as const,
        responseTime: Math.floor(Math.random() * 40) + 30,
      },
      {
        name: "Discord Integration",
        status: "operational" as const,
        responseTime: Math.floor(Math.random() * 60) + 40,
      },
    ]

    // Simulate occasional issues (5% chance)
    if (Math.random() < 0.05) {
      const randomService = services[Math.floor(Math.random() * services.length)]
      randomService.status = Math.random() < 0.7 ? "degraded" : "outage"
      randomService.responseTime = randomService.status === "outage" ? 0 : randomService.responseTime * 2
    }

    const activeServices = services.filter((s) => s.status === "operational").length
    const degradedServices = services.filter((s) => s.status === "degraded").length
    const outageServices = services.filter((s) => s.status === "outage").length

    let overallStatus: "operational" | "degraded" | "outage" = "operational"
    if (outageServices > 0) {
      overallStatus = "outage"
    } else if (degradedServices > 0) {
      overallStatus = "degraded"
    }

    const avgResponseTime =
      services.filter((s) => s.responseTime > 0).reduce((sum, s) => sum + s.responseTime, 0) /
      services.filter((s) => s.responseTime > 0).length

    const uptime = ((activeServices + degradedServices * 0.5) / services.length) * 100

    const systemStatus = {
      status: overallStatus,
      uptime: Math.round(uptime * 100) / 100,
      responseTime: Math.round(avgResponseTime || 0),
      activeServices,
      totalServices: services.length,
      services,
      lastIncident:
        outageServices > 0 || degradedServices > 0
          ? {
              title: outageServices > 0 ? "Service Outage Detected" : "Performance Degradation",
              time: new Date(Date.now() - Math.random() * 3600000),
              severity: outageServices > 0 ? "high" : "medium",
            }
          : undefined,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(systemStatus)
  } catch (error) {
    console.error("Error fetching system status:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch system status",
        status: "unknown",
        uptime: 0,
        responseTime: 0,
        activeServices: 0,
        totalServices: 0,
        services: [],
      },
      { status: 500 },
    )
  }
}
