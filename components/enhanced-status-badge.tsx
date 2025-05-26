"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      status: {
        online:
          "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20",
        offline: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
        unknown:
          "bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20",
        warning:
          "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:ring-yellow-500/20",
      },
      animation: {
        pulse: "animate-pulse-status",
        none: "",
      },
    },
    defaultVariants: {
      status: "unknown",
      animation: "none",
    },
  },
)

export interface EnhancedStatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  className?: string
  showDot?: boolean
}

export function EnhancedStatusBadge({
  status = "unknown",
  animation = "none",
  className,
  showDot = true,
}: EnhancedStatusBadgeProps) {
  const statusText = {
    online: "Online",
    offline: "Offline",
    unknown: "Unknown",
    warning: "Warning",
  }

  return (
    <motion.span
      className={cn(statusBadgeVariants({ status, animation, className }))}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {showDot && (
        <span
          className={cn("mr-1 h-1.5 w-1.5 rounded-full", {
            "bg-green-500": status === "online",
            "bg-red-500": status === "offline",
            "bg-gray-500": status === "unknown",
            "bg-yellow-500": status === "warning",
          })}
        />
      )}
      {statusText[status as keyof typeof statusText]}
    </motion.span>
  )
}
