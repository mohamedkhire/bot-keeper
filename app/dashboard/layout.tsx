"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  Bell,
  LayoutDashboard,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  BarChart3,
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { PageTransition } from "@/components/page-transition"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [systemStatus, setSystemStatus] = useState<{
    status: "operational" | "degraded" | "down"
    lastChecked: Date
    message: string
    details: string
  }>({
    status: "operational",
    lastChecked: new Date(),
    message: "All Systems Operational",
    details: "All services running normally",
  })

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setIsMobileMenuOpen(false)
      }
    }

    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem("sidebarCollapsed")
    if (savedSidebarState) {
      setIsSidebarCollapsed(JSON.parse(savedSidebarState))
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Save sidebar state to localStorage
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(isSidebarCollapsed))
    }
  }, [isSidebarCollapsed, isMobile])

  // Real system status check every 2 minutes
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const startTime = Date.now()

        // Check multiple endpoints for comprehensive status
        const [projectsResponse, statusResponse] = await Promise.all([
          fetch("/api/projects").catch(() => null),
          fetch("/api/status").catch(() => null),
        ])

        const responseTime = Date.now() - startTime

        if (projectsResponse?.ok && statusResponse?.ok) {
          if (responseTime > 2000) {
            setSystemStatus({
              status: "degraded",
              lastChecked: new Date(),
              message: "System Running Slowly",
              details: `Response time: ${responseTime}ms`,
            })
          } else {
            setSystemStatus({
              status: "operational",
              lastChecked: new Date(),
              message: "All Systems Operational",
              details: `Response time: ${responseTime}ms`,
            })
          }
        } else {
          setSystemStatus({
            status: "degraded",
            lastChecked: new Date(),
            message: "Some Services Unavailable",
            details: "API endpoints experiencing issues",
          })
        }
      } catch (error) {
        setSystemStatus({
          status: "down",
          lastChecked: new Date(),
          message: "System Unavailable",
          details: "Unable to connect to services",
        })
      }
    }

    checkSystemStatus()
    const interval = setInterval(checkSystemStatus, 2 * 60 * 1000) // Every 2 minutes
    return () => clearInterval(interval)
  }, [])

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Overview & metrics" },
    { href: "/dashboard/statistics", label: "Statistics", icon: BarChart3, description: "Detailed analytics" },
    { href: "/dashboard/history", label: "History", icon: Clock, description: "Activity timeline" },
    {
      href: "/dashboard/notifications",
      label: "Notifications",
      icon: Bell,
      badge: "2",
      description: "Alerts & settings",
    },
  ]

  const quickActions = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
    { href: "/dashboard/performance", label: "Performance", icon: Zap },
  ]

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname === "/dashboard/statistics") return "Statistics"
    if (pathname === "/dashboard/history") return "History"
    if (pathname === "/dashboard/notifications") return "Notifications"
    if (pathname === "/dashboard/performance") return "Performance"
    if (pathname?.includes("/project/")) return "Project Details"
    return "Dashboard"
  }

  const getPageDescription = () => {
    if (pathname === "/dashboard") return "Monitor your services and applications"
    if (pathname === "/dashboard/statistics") return "Detailed analytics and performance metrics"
    if (pathname === "/dashboard/history") return "Activity timeline and historical data"
    if (pathname === "/dashboard/notifications") return "Manage alerts and notification settings"
    if (pathname === "/dashboard/performance") return "System performance and health metrics"
    if (pathname?.includes("/project/")) return "Detailed project monitoring and analytics"
    return "Monitor your services and applications"
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const getStatusIcon = () => {
    switch (systemStatus.status) {
      case "operational":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "degraded":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case "down":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColors = () => {
    switch (systemStatus.status) {
      case "operational":
        return {
          bg: "bg-green-500/10",
          border: "border-green-500/20",
          text: "text-green-700 dark:text-green-400",
          dot: "bg-green-500",
        }
      case "degraded":
        return {
          bg: "bg-orange-500/10",
          border: "border-orange-500/20",
          text: "text-orange-700 dark:text-orange-400",
          dot: "bg-orange-500",
        }
      case "down":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          text: "text-red-700 dark:text-red-400",
          dot: "bg-red-500",
        }
    }
  }

  const statusColors = getStatusColors()

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-background">
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

        <div className="relative flex min-h-screen">
          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Fixed Sidebar */}
          <motion.aside
            initial={false}
            animate={{
              x: isMobile && !isMobileMenuOpen ? "-100%" : 0,
              width: isMobile ? 320 : isSidebarCollapsed ? 80 : 280,
            }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 z-50 h-screen bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-xl lg:relative lg:translate-x-0 flex flex-col"
            style={{ position: "fixed", height: "100vh" }}
          >
            {/* Sidebar Header */}
            <div className="flex h-20 items-center justify-between px-6 border-b border-border/50 bg-card/50">
              <AnimatePresence mode="wait">
                {!isSidebarCollapsed || isMobile ? (
                  <motion.div
                    key="logo-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href="/" className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="flex items-center gap-3 font-bold text-xl"
                      >
                        <div className="w-11 h-11 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                          <Activity className="w-6 h-6 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-extrabold">
                          Bot Keeper
                        </span>
                      </motion.div>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key="logo-collapsed"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-center w-full"
                  >
                    <Link href="/">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-11 h-11 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-primary/20"
                      >
                        <Activity className="w-6 h-6 text-white" />
                      </motion.div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden hover:bg-muted/60"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Navigation - Main Menu */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <div className="space-y-1">
                  {!isSidebarCollapsed || isMobile ? (
                    <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Main Menu
                    </h3>
                  ) : null}

                  {menuItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive =
                      pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))

                    if (isSidebarCollapsed && !isMobile) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Link
                                href={item.href}
                                className={`
                                  group relative flex items-center justify-center w-12 h-12 rounded-xl font-medium transition-all duration-200 mx-auto
                                  ${
                                    isActive
                                      ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 shadow-md"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:shadow-sm"
                                  }
                                `}
                              >
                                <Icon
                                  className={`w-5 h-5 transition-all duration-200 group-hover:scale-110 ${
                                    isActive ? "text-primary" : ""
                                  }`}
                                />
                                {item.badge && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-xs text-white font-medium">{item.badge}</span>
                                  </div>
                                )}
                              </Link>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-popover text-popover-foreground border shadow-md">
                            <div className="space-y-1">
                              <p className="font-medium">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    }

                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`
                            group relative flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-200
                            ${
                              isActive
                                ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:shadow-sm"
                            }
                          `}
                        >
                          <Icon
                            className={`w-5 h-5 transition-all duration-200 group-hover:scale-110 ${
                              isActive ? "text-primary" : ""
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium">{item.label}</span>
                            <p className="text-xs text-muted-foreground/80 truncate">{item.description}</p>
                          </div>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="ml-auto text-xs px-2 py-0.5 bg-red-500/10 text-red-600 border-red-500/20"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {isActive && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl border border-primary/30"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Quick Actions */}
                <div className="pt-6">
                  <Separator className="mb-4" />
                  {!isSidebarCollapsed || isMobile ? (
                    <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Quick Actions
                    </h3>
                  ) : null}

                  <div className="space-y-1">
                    {quickActions.map((item, index) => {
                      const Icon = item.icon

                      if (isSidebarCollapsed && !isMobile) {
                        return (
                          <Tooltip key={item.href}>
                            <TooltipTrigger asChild>
                              <Link
                                href={item.href}
                                className="group flex items-center justify-center w-12 h-10 rounded-lg font-medium transition-all duration-200 mx-auto text-muted-foreground hover:text-foreground hover:bg-muted/60"
                              >
                                <Icon className="w-4 h-4 transition-all duration-200 group-hover:scale-110" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="bg-popover text-popover-foreground border shadow-md"
                            >
                              <p>{item.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        )
                      }

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="group flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        >
                          <Icon className="w-4 h-4 transition-all duration-200 group-hover:scale-110" />
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </nav>

              {/* Enhanced System Status */}
              <div className="p-4 border-t border-border/50 bg-card/30 space-y-4">
                {!isSidebarCollapsed || isMobile ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex items-start gap-3 p-4 rounded-xl ${statusColors.bg} border ${statusColors.border}`}
                  >
                    <div className="flex-shrink-0 mt-1">{getStatusIcon()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`${statusColors.dot} w-2 h-2 rounded-full animate-pulse`} />
                        <span className={`text-sm font-medium ${statusColors.text}`}>{systemStatus.message}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{systemStatus.details}</p>
                      <p className="text-xs text-muted-foreground">
                        Last checked: {systemStatus.lastChecked.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                        <div
                          className={`w-12 h-12 rounded-xl ${statusColors.bg} border ${statusColors.border} flex items-center justify-center`}
                        >
                          {getStatusIcon()}
                        </div>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover text-popover-foreground border shadow-md">
                      <div className="space-y-1">
                        <p className={`font-medium ${statusColors.text}`}>{systemStatus.message}</p>
                        <p className="text-xs text-muted-foreground">{systemStatus.details}</p>
                        <p className="text-xs text-muted-foreground">
                          Last checked: {systemStatus.lastChecked.toLocaleTimeString()}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Collapse/Expand Button */}
                {!isMobile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <Button
                      variant="outline"
                      size={isSidebarCollapsed ? "icon" : "sm"}
                      onClick={toggleSidebar}
                      className="bg-background/50 border-border/50 hover:bg-muted/60 hover:border-border transition-all duration-200 shadow-sm"
                    >
                      {isSidebarCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <>
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          <span className="text-xs font-medium">Collapse</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.aside>

          {/* Main Content with proper margin for fixed sidebar */}
          <div
            className="flex-1 flex flex-col min-h-screen transition-all duration-300"
            style={{
              marginLeft: isMobile ? 0 : isSidebarCollapsed ? 80 : 280,
            }}
          >
            {/* Header */}
            <motion.header
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="sticky top-0 z-30 h-20 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
            >
              <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden hover:bg-muted/60"
                    onClick={() => setIsMobileMenuOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {getPageTitle()}
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{getPageDescription()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                  <ThemeToggle />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted/60">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-semibold">
                            U
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-3">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">User</p>
                          <p className="w-[200px] truncate text-sm text-muted-foreground">user@example.com</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.header>

            {/* Page Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
              <div className="max-w-7xl mx-auto w-full">
                <PageTransition>{children}</PageTransition>
              </div>
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
