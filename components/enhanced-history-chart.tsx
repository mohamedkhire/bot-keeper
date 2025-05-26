"use client"

import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import { motion } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts"

type PingHistoryItem = {
  id: string
  project_id: string
  status: boolean
  response_time: number | null
  created_at: string
}

interface EnhancedHistoryChartProps {
  history: PingHistoryItem[]
}

export function EnhancedHistoryChart({ history }: EnhancedHistoryChartProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Process data for the chart
  useEffect(() => {
    // This is moved to a useEffect to improve performance
    const processData = () => {
      setIsLoading(true)

      // Sort history by date
      const sortedHistory = [...history].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )

      // Group data points to reduce rendering load
      const groupedData = []
      const groupSize = Math.max(1, Math.floor(sortedHistory.length / 100)) // Limit to ~100 data points

      for (let i = 0; i < sortedHistory.length; i += groupSize) {
        const group = sortedHistory.slice(i, i + groupSize)
        const avgResponseTime =
          group
            .filter((item) => item.response_time !== null)
            .reduce((sum, item) => sum + (item.response_time || 0), 0) /
            group.filter((item) => item.response_time !== null).length || 0

        const statusCount = group.filter((item) => item.status).length
        const statusPercentage = (statusCount / group.length) * 100

        groupedData.push({
          timestamp: group[0].created_at,
          responseTime: avgResponseTime || 0,
          status: statusPercentage,
          date: format(parseISO(group[0].created_at), "MMM d, yyyy HH:mm"),
        })
      }

      setChartData(groupedData)
      setIsLoading(false)
    }

    processData()
  }, [history])

  if (isLoading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <motion.div
          className="h-8 w-8 border-2 border-b-transparent border-green-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        ></motion.div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{payload[0].payload.date}</p>
          <p className="text-sm text-gray-600">
            Status: <span className="font-medium">{payload[1].value.toFixed(0)}% Online</span>
          </p>
          <p className="text-sm text-gray-600">
            Response Time: <span className="font-medium">{payload[0].value.toFixed(0)}ms</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="responseTimeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="statusGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => format(new Date(value), "HH:mm")}
            interval={Math.floor(chartData.length / 10)}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            tick={{ fontSize: 12 }}
            label={{ value: "Response Time (ms)", angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            label={{ value: "Status (%)", angle: 90, position: "insideRight", style: { textAnchor: "middle" } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="responseTime"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#responseTimeGradient)"
            animationDuration={1000}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="status"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#statusGradient)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
