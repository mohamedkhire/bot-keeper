"use client"

import { useRef } from "react"
import { format, parseISO } from "date-fns"
import { motion } from "framer-motion"

type PingHistoryItem = {
  id: string
  project_id: string
  status: boolean
  response_time: number | null
  created_at: string
}

interface DetailedHistoryChartProps {
  history: PingHistoryItem[]
}

export function DetailedHistoryChart({ history }: DetailedHistoryChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  // Process data for the chart
  const processData = () => {
    // Sort history by date
    const sortedHistory = [...history].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )

    // Group by day for the x-axis labels
    const days = new Map<string, PingHistoryItem[]>()

    sortedHistory.forEach((item) => {
      const date = format(parseISO(item.created_at), "yyyy-MM-dd")
      if (!days.has(date)) {
        days.set(date, [])
      }
      days.get(date)?.push(item)
    })

    return {
      sortedHistory,
      days: Array.from(days.entries()),
    }
  }

  const { sortedHistory, days } = processData()

  // Calculate chart dimensions
  const chartHeight = 300
  const chartWidth = "100%"
  const barWidth = `calc(${100 / Math.max(sortedHistory.length, 1)}% - 1px)`
  const maxResponseTime = Math.max(
    ...sortedHistory.filter((item) => item.response_time !== null).map((item) => item.response_time as number),
    500, // Minimum scale
  )

  return (
    <div className="w-full">
      <div className="relative" style={{ height: `${chartHeight}px`, width: chartWidth }} ref={chartRef}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
          <div>{maxResponseTime}ms</div>
          <div>{Math.round(maxResponseTime * 0.75)}ms</div>
          <div>{Math.round(maxResponseTime * 0.5)}ms</div>
          <div>{Math.round(maxResponseTime * 0.25)}ms</div>
          <div>0ms</div>
        </div>

        {/* Chart area */}
        <div className="absolute left-14 right-0 top-0 bottom-0">
          {/* Horizontal grid lines */}
          <div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-gray-200 w-full" style={{ top: `${i * 25}%` }} />
            ))}
          </div>

          {/* Bars */}
          <div className="absolute left-0 right-0 top-0 bottom-0 flex items-end">
            {sortedHistory.map((item, index) => {
              const responseHeight = item.response_time ? (item.response_time / maxResponseTime) * 100 : 0

              return (
                <motion.div
                  key={item.id}
                  className="flex flex-col items-center justify-end h-full"
                  style={{ width: barWidth }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.01 }}
                >
                  {/* Status indicator */}
                  <div
                    className={`w-full h-1 mb-1 ${item.status ? "bg-green-500" : "bg-red-500"}`}
                    title={`Status: ${item.status ? "Online" : "Offline"}`}
                  />

                  {/* Response time bar */}
                  {item.response_time && (
                    <motion.div
                      className="w-full bg-blue-500"
                      style={{ height: `${responseHeight}%` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${responseHeight}%` }}
                      transition={{ duration: 0.5, delay: index * 0.01 }}
                      title={`Response time: ${item.response_time}ms`}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="mt-2 pl-14 flex justify-between text-xs text-gray-500">
        {days.map(([date], index) => (
          <div key={index}>{format(parseISO(date), "MMM d")}</div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 mr-1"></div>
          <span>Online</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 mr-1"></div>
          <span>Offline</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 mr-1"></div>
          <span>Response Time</span>
        </div>
      </div>
    </div>
  )
}
