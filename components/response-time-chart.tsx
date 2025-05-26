"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { format, parseISO } from "date-fns"

type PingHistoryItem = {
  id: string
  project_id: string
  status: boolean
  response_time: number | null
  created_at: string
}

interface ResponseTimeChartProps {
  history: PingHistoryItem[]
}

export function ResponseTimeChart({ history }: ResponseTimeChartProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [averageResponseTime, setAverageResponseTime] = useState(0)

  // Process data for the chart
  useEffect(() => {
    const processData = () => {
      setIsLoading(true)

      // Filter out entries with null response times
      const validHistory = history.filter((item) => item.response_time !== null && item.status)

      // Calculate average response time
      const totalResponseTime = validHistory.reduce((sum, item) => sum + (item.response_time || 0), 0)
      const avg = validHistory.length > 0 ? totalResponseTime / validHistory.length : 0
      setAverageResponseTime(avg)

      // Sort by date
      const sortedHistory = [...validHistory].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )

      // Take the most recent entries (up to 20)
      const recentHistory = sortedHistory.slice(-20)

      // Format data for the chart
      const formattedData = recentHistory.map((item) => ({
        time: format(parseISO(item.created_at), "HH:mm"),
        responseTime: item.response_time,
        timestamp: item.created_at,
      }))

      setChartData(formattedData)
      setIsLoading(false)
    }

    processData()
  }, [history])

  if (isLoading) {
    return (
      <div className="h-[200px] w-full flex items-center justify-center">
        <motion.div
          className="h-8 w-8 border-2 border-b-transparent border-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        ></motion.div>
      </div>
    )
  }

  // Function to determine bar color based on response time
  const getBarColor = (responseTime: number) => {
    if (responseTime < 100) return "#10b981" // Green for fast
    if (responseTime < 300) return "#22c55e" // Light green
    if (responseTime < 500) return "#eab308" // Yellow
    if (responseTime < 1000) return "#f97316" // Orange
    return "#ef4444" // Red for slow
  }

  return (
    <div className="h-[200px] w-full">
      <div className="mb-2 text-center">
        <span className="text-sm text-gray-500">Average Response Time: </span>
        <span className="font-medium">{averageResponseTime.toFixed(0)}ms</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={50} />
          <YAxis
            tick={{ fontSize: 10 }}
            label={{
              value: "Response Time (ms)",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fontSize: 10 },
            }}
          />
          <Tooltip
            formatter={(value: number) => [`${value}ms`, "Response Time"]}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Bar dataKey="responseTime" animationDuration={1000}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.responseTime)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
