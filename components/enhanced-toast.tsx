"use client"

import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export interface ToastProps {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
  onClose: (id: string) => void
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastStyles = {
  success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
  error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
  warning:
    "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200",
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
}

const iconStyles = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-orange-500",
  info: "text-blue-500",
}

export function EnhancedToast({ id, title, description, type, duration = 5000, onClose }: ToastProps) {
  const Icon = toastIcons[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${toastStyles[type]}
        max-w-md w-full
      `}
      layout
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconStyles[type]}`} />

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{title}</div>
        {description && <div className="text-sm opacity-90 mt-1">{description}</div>}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-70 hover:opacity-100 transition-opacity"
        onClick={() => onClose(id)}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        onAnimationComplete={() => onClose(id)}
      />
    </motion.div>
  )
}

export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <EnhancedToast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}
