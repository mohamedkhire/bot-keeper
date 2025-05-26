"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva("rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300", {
  variants: {
    variant: {
      default: "",
      primary: "border-primary/50 bg-primary/5 dark:bg-primary/10",
      secondary: "border-secondary/50 bg-secondary/5 dark:bg-secondary/10",
      accent: "border-accent/50 bg-accent/5 dark:bg-accent/10",
      destructive: "border-destructive/50 bg-destructive/5 dark:bg-destructive/10",
      gradient: "card-gradient border-transparent",
      gradientPrimary: "card-gradient-primary border-primary/20",
    },
    hover: {
      default: "hover:border-primary/50 hover:shadow-md",
      lift: "hover-lift",
      glow: "hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]",
      none: "",
    },
    size: {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
    animation: {
      fadeIn: "animate-fade-in",
      slideUp: "animate-slide-up",
      slideDown: "animate-slide-down",
      scale: "animate-scale",
      none: "",
    },
  },
  defaultVariants: {
    variant: "default",
    hover: "default",
    size: "md",
    animation: "none",
  },
})

export interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  asChild?: boolean
  animationDelay?: number
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant, hover, size, animation, animationDelay = 0, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(cardVariants({ variant, hover, size, animation, className }))}
        initial={
          animation !== "none"
            ? {
                opacity: 0,
                y: animation === "slideUp" ? 20 : animation === "slideDown" ? -20 : 0,
                scale: animation === "scale" ? 0.95 : 1,
              }
            : false
        }
        animate={
          animation !== "none"
            ? {
                opacity: 1,
                y: 0,
                scale: 1,
              }
            : false
        }
        transition={{
          duration: 0.4,
          delay: animationDelay,
          ease: [0.25, 0.1, 0.25, 1.0], // Cubic bezier for a nice easing
        }}
        whileHover={
          hover === "lift"
            ? { y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }
            : hover === "glow"
              ? { boxShadow: "0 0 15px rgba(var(--primary-rgb), 0.5)" }
              : undefined
        }
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)
EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
)
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
)
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
EnhancedCardDescription.displayName = "EnhancedCardDescription"

const EnhancedCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
)
EnhancedCardContent.displayName = "EnhancedCardContent"

const EnhancedCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
)
EnhancedCardFooter.displayName = "EnhancedCardFooter"

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
}
