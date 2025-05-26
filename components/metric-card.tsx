"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string
  description: string
  icon: LucideIcon
  trend?: string
  color: "blue" | "green" | "orange" | "red" | "purple"
  className?: string
}

const colorVariants = {
  blue: {
    bg: "from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30",
    border: "border-blue-200/50 dark:border-blue-800/50",
    icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    text: "text-blue-700 dark:text-blue-300",
    trend: "text-blue-600/80 dark:text-blue-400/80",
  },
  green: {
    bg: "from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30",
    border: "border-green-200/50 dark:border-green-800/50",
    icon: "bg-green-500/10 text-green-600 dark:text-green-400",
    text: "text-green-700 dark:text-green-300",
    trend: "text-green-600/80 dark:text-green-400/80",
  },
  orange: {
    bg: "from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30",
    border: "border-orange-200/50 dark:border-orange-800/50",
    icon: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    text: "text-orange-700 dark:text-orange-300",
    trend: "text-orange-600/80 dark:text-orange-400/80",
  },
  red: {
    bg: "from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30",
    border: "border-red-200/50 dark:border-red-800/50",
    icon: "bg-red-500/10 text-red-600 dark:text-red-400",
    text: "text-red-700 dark:text-red-300",
    trend: "text-red-600/80 dark:text-red-400/80",
  },
  purple: {
    bg: "from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30",
    border: "border-purple-200/50 dark:border-purple-800/50",
    icon: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    text: "text-purple-700 dark:text-purple-300",
    trend: "text-purple-600/80 dark:text-purple-400/80",
  },
}

export function MetricCard({ title, value, description, icon: Icon, trend, color, className }: MetricCardProps) {
  const variant = colorVariants[color]

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={className}
    >
      <Card
        className={cn(
          "relative overflow-hidden bg-gradient-to-br border-2 shadow-lg hover:shadow-xl transition-all duration-300",
          variant.bg,
          variant.border,
        )}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-12 translate-x-12" />
        <CardContent className="relative p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1 min-w-0">
              <p className={cn("text-xs sm:text-sm font-semibold uppercase tracking-wider", variant.text)}>{title}</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground truncate">{value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">{description}</p>
              {trend && <p className={cn("text-xs font-medium", variant.trend)}>{trend}</p>}
            </div>
            <div className={cn("p-3 sm:p-4 rounded-2xl shadow-sm flex-shrink-0", variant.icon)}>
              <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
