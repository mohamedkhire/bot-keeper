"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Menu, CheckCircle, AlertTriangle, XCircle, Wifi } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSystemStatus } from "@/hooks/use-system-status"

type SidebarProps = {
  children: React.ReactNode
  logo: React.ReactNode
  menuItems: {
    href: string
    label: string
    icon: React.ElementType
  }[]
  footer?: React.ReactNode
}

export function EnhancedSidebar({ children, logo, menuItems, footer }: SidebarProps) {
  const pathname = usePathname()
  const [sidebarState, setSidebarState] = React.useState<"expanded" | "collapsed" | "hidden">("expanded")
  const [isMobile, setIsMobile] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const { systemStatus, isLoading } = useSystemStatus()

  // Check if we're on mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarState("hidden")
      } else {
        setSidebarState((localStorage.getItem("sidebarState") as "expanded" | "collapsed") || "expanded")
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Save sidebar state to localStorage
  React.useEffect(() => {
    if (!isMobile && sidebarState !== "hidden") {
      localStorage.setItem("sidebarState", sidebarState)
    }
  }, [sidebarState, isMobile])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen)
    } else {
      setSidebarState(sidebarState === "expanded" ? "collapsed" : "expanded")
    }
  }

  const getStatusIcon = () => {
    if (isLoading) {
      return <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" />
    }

    switch (systemStatus.status) {
      case "operational":
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case "degraded":
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />
      case "outage":
        return <XCircle className="w-3 h-3 text-red-500" />
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />
    }
  }

  const getStatusText = () => {
    if (isLoading) return "Checking..."

    switch (systemStatus.status) {
      case "operational":
        return "All Systems Operational"
      case "degraded":
        return "Partial Outage"
      case "outage":
        return "Major Outage"
      default:
        return "Status Unknown"
    }
  }

  const getStatusColor = () => {
    switch (systemStatus.status) {
      case "operational":
        return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
      case "degraded":
        return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
      case "outage":
        return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800"
    }
  }

  // Mobile sidebar
  const mobileSidebar = (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 z-40 h-full w-80 bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-xl flex flex-col"
          >
            <div className="h-20 px-6 border-b border-border/50 bg-card/50 flex items-center justify-between">
              <div className="flex items-center">{logo}</div>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>

            {/* System Status */}
            <div className="p-4 border-b border-border/30">
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor()}`}>
                {getStatusIcon()}
                <div className="flex-1">
                  <div className="text-sm font-medium">{getStatusText()}</div>
                  <div className="text-xs opacity-75">Last updated: {new Date().toLocaleTimeString()}</div>
                </div>
                <Wifi className="w-4 h-4 opacity-60" />
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:shadow-sm",
                    )}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
            {footer && <div className="border-t p-4">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  // Desktop sidebar
  const desktopSidebar = (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-full bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-xl flex flex-col transition-all duration-300",
        sidebarState === "collapsed" ? "w-20" : "w-80",
        "hidden md:flex",
      )}
    >
      <div className="h-20 px-6 border-b border-border/50 bg-card/50 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {sidebarState === "expanded" ? (
            <motion.div
              key="logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center"
            >
              {logo}
            </motion.div>
          ) : (
            <motion.div
              key="logo-small"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center w-full"
            >
              {React.isValidElement(logo) && React.cloneElement(logo as React.ReactElement, { small: true })}
            </motion.div>
          )}
        </AnimatePresence>

        {sidebarState === "expanded" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* System Status - Desktop */}
      {sidebarState === "expanded" && (
        <div className="p-4 border-b border-border/30">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor()}`}
          >
            {getStatusIcon()}
            <div className="flex-1">
              <div className="text-sm font-medium">{getStatusText()}</div>
              <div className="text-xs opacity-75">Updated: {new Date().toLocaleTimeString()}</div>
            </div>
            <Wifi className="w-4 h-4 opacity-60" />
          </motion.div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-4 space-y-1">
        <TooltipProvider delayDuration={300}>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))

            return sidebarState === "collapsed" ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-center px-0 py-3.5 rounded-xl font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:shadow-sm",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-popover text-popover-foreground">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:shadow-sm",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </TooltipProvider>
      </div>

      {footer && sidebarState === "expanded" && <div className="border-t p-4">{footer}</div>}

      {sidebarState === "collapsed" && (
        <div className="border-t p-2 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar */}
      {mobileSidebar}

      {/* Desktop sidebar */}
      {desktopSidebar}

      {/* Main content */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          sidebarState === "collapsed" ? "md:ml-20" : "md:ml-80",
        )}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
