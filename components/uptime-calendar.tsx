"use client"

import { useState } from "react"
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"

type PingHistoryItem = {
  id: string
  project_id: string
  status: boolean
  response_time: number | null
  created_at: string
}

interface UptimeCalendarProps {
  history: PingHistoryItem[]
}

export function UptimeCalendar({ history }: UptimeCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get days in current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Group history by day
  const historyByDay = daysInMonth.map((day) => {
    const dayHistory = history.filter((item) => isSameDay(parseISO(item.created_at), day))

    // Calculate uptime percentage for the day
    let uptimePercentage = 0
    if (dayHistory.length > 0) {
      const onlineCount = dayHistory.filter((item) => item.status).length
      uptimePercentage = (onlineCount / dayHistory.length) * 100
    }

    // Calculate average response time
    const responseTimes = dayHistory
      .filter((item) => item.response_time !== null)
      .map((item) => item.response_time as number)

    const avgResponseTime = responseTimes.length
      ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
      : null

    return {
      date: day,
      history: dayHistory,
      uptimePercentage,
      avgResponseTime,
      hasData: dayHistory.length > 0,
    }
  })

  // Navigate to previous/next month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Get color based on uptime percentage
  const getUptimeColor = (percentage: number) => {
    if (percentage >= 99) return "bg-green-500"
    if (percentage >= 95) return "bg-green-400"
    if (percentage >= 90) return "bg-yellow-400"
    if (percentage >= 80) return "bg-orange-400"
    return "bg-red-500"
  }

  return (
    <div className="w-full">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day names */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {/* Empty cells for days before the start of the month */}
        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-start-${index}`} className="border rounded-md h-24 bg-gray-50"></div>
        ))}

        {/* Calendar days */}
        {historyByDay.map((dayData, index) => (
          <motion.div
            key={index}
            className="border rounded-md h-24 p-2 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.01 }}
          >
            <div className="flex justify-between items-start">
              <span className="font-medium">{format(dayData.date, "d")}</span>
              {dayData.hasData && (
                <div
                  className={`w-3 h-3 rounded-full ${getUptimeColor(dayData.uptimePercentage)}`}
                  title={`${dayData.uptimePercentage.toFixed(1)}% uptime`}
                ></div>
              )}
            </div>

            {dayData.hasData ? (
              <div className="mt-2 text-xs">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="font-medium">{dayData.uptimePercentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Response:</span>
                  <span className="font-medium">
                    {dayData.avgResponseTime ? `${dayData.avgResponseTime}ms` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pings:</span>
                  <span className="font-medium">{dayData.history.length}</span>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">No data</div>
            )}
          </motion.div>
        ))}

        {/* Empty cells for days after the end of the month */}
        {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
          <div key={`empty-end-${index}`} className="border rounded-md h-24 bg-gray-50"></div>
        ))}
      </div>
    </div>
  )
}
