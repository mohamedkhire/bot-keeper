"use client"

import type React from "react"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EnhancedButtonProps extends ButtonProps {
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  loading?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient"
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ className, variant = "default", icon, iconPosition = "left", loading, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading

    const buttonVariants = {
      gradient:
        "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl",
    }

    return (
      <motion.div whileHover={{ scale: isDisabled ? 1 : 1.02 }} whileTap={{ scale: isDisabled ? 1 : 0.98 }}>
        <Button
          ref={ref}
          variant={variant === "gradient" ? "default" : variant}
          className={cn(
            "relative overflow-hidden transition-all duration-200",
            variant === "gradient" && buttonVariants.gradient,
            className,
          )}
          disabled={isDisabled}
          {...props}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!loading && icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
          {children}
          {!loading && icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
        </Button>
      </motion.div>
    )
  },
)

EnhancedButton.displayName = "EnhancedButton"
