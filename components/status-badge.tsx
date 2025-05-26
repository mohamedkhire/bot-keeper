"use client"

import { motion } from "framer-motion"

interface StatusBadgeProps {
  status: "online" | "offline" | "unknown"
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = {
    online: "bg-green-500",
    offline: "bg-red-500",
    unknown: "bg-gray-400",
  }

  return (
    <motion.div
      className={`w-3 h-3 rounded-full ${colors[status]} mr-2`}
      animate={{
        scale: status === "online" ? [1, 1.2, 1] : 1,
        opacity: status === "unknown" ? [0.5, 1, 0.5] : 1,
      }}
      transition={{
        duration: 2,
        repeat: status === "online" ? Number.POSITIVE_INFINITY : 0,
        repeatType: "reverse",
      }}
    />
  )
}
