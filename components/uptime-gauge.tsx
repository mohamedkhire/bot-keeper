"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface UptimeGaugeProps {
  value: number
}

export function UptimeGauge({ value }: UptimeGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    // Animate the value
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 300)

    return () => clearTimeout(timer)
  }, [value])

  // Calculate the angle for the gauge needle
  const angle = (animatedValue / 100) * 180

  // Determine color based on uptime value
  const getColor = (value: number) => {
    if (value >= 99) return "#10b981" // Green
    if (value >= 95) return "#22c55e" // Light green
    if (value >= 90) return "#eab308" // Yellow
    if (value >= 80) return "#f97316" // Orange
    return "#ef4444" // Red
  }

  const color = getColor(animatedValue)

  return (
    <div className="relative w-64 h-32 mx-auto">
      {/* Gauge background */}
      <div className="absolute w-full h-full overflow-hidden">
        <div className="absolute bottom-0 w-full h-full rounded-t-full bg-gray-100"></div>
      </div>

      {/* Gauge fill */}
      <div className="absolute bottom-0 w-full h-full overflow-hidden">
        <motion.div
          className="absolute bottom-0 w-full rounded-t-full"
          style={{
            backgroundColor: color,
            height: "100%",
            opacity: 0.2,
          }}
          initial={{ transform: "scale(0)" }}
          animate={{ transform: `scale(${animatedValue / 100})` }}
          transition={{ duration: 1, type: "spring" }}
        ></motion.div>
      </div>

      {/* Gauge needle */}
      <div className="absolute bottom-0 left-1/2 w-1 h-1">
        <motion.div
          className="relative w-1 h-32 -ml-0.5 bg-gray-800 rounded-t-full origin-bottom"
          initial={{ rotate: 0 }}
          animate={{ rotate: angle }}
          transition={{ duration: 1, type: "spring" }}
        ></motion.div>
      </div>

      {/* Gauge center */}
      <div className="absolute bottom-0 left-1/2 w-4 h-4 -ml-2 -mb-2 bg-gray-800 rounded-full"></div>

      {/* Gauge labels */}
      <div className="absolute bottom-0 w-full flex justify-between px-2 text-xs text-gray-500">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>

      {/* Value display */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-10 text-center">
        <motion.div
          className="text-3xl font-bold"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {animatedValue.toFixed(1)}%
        </motion.div>
        <div className="text-sm text-gray-500">Uptime</div>
      </div>
    </div>
  )
}
