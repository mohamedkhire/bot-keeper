"use client"

import { motion } from "framer-motion"

interface UptimeChartProps {
  data?: boolean[]
  height?: number
  showLabels?: boolean
  color?: string
}

export function UptimeChart({ data, height = 80, showLabels = false, color = "#3b82f6" }: UptimeChartProps) {
  // Mock data for the chart if no data provided
  const uptimeData = data || Array.from({ length: 7 }, () => Math.random() > 0.1)

  // Generate time labels
  const generateLabels = () => {
    const labels = []
    const now = new Date()
    for (let i = uptimeData.length - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 60 * 60 * 1000) // Hours ago
      labels.push(date.getHours().toString().padStart(2, "0"))
    }
    return labels
  }

  const labels = generateLabels()

  return (
    <div className="space-y-4">
      {showLabels && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last {uptimeData.length} hours</span>
          <span className="font-medium text-blue-600">
            {((uptimeData.filter(Boolean).length / uptimeData.length) * 100).toFixed(1)}% uptime
          </span>
        </div>
      )}

      <div className="flex items-end justify-between gap-1" style={{ height: `${height}px` }}>
        {uptimeData.map((isOnline, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center gap-1 flex-1"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <div className="w-full flex items-end" style={{ height: `${height - 20}px` }}>
              <motion.div
                className={`w-full rounded-sm transition-all duration-300 ${
                  isOnline
                    ? "bg-gradient-to-t from-blue-500 to-blue-400 shadow-sm"
                    : "bg-gradient-to-t from-red-500 to-red-400"
                }`}
                style={{
                  height: isOnline ? "100%" : "20%",
                  backgroundColor: isOnline ? color : "#ef4444",
                }}
                whileHover={{ scale: 1.05 }}
              />
            </div>
            {showLabels && <span className="text-xs text-muted-foreground font-mono">{labels[index]}</span>}
          </motion.div>
        ))}
      </div>

      {showLabels && (
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Online</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span>Offline</span>
          </div>
        </div>
      )}
    </div>
  )
}
