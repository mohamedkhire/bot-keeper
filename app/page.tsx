"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Clock,
  Server,
  Shield,
  Zap,
  Globe,
  BarChart3,
  Bell,
  Users,
  CheckCircle,
  Menu,
  X,
  ChevronDown,
  Activity,
  TrendingUp,
  Smartphone,
  Code,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { config } from "@/lib/config"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false)

  const features = [
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Monitor your services every minute with instant notifications when issues arise.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Get notified via Discord, email, or webhooks the moment downtime is detected.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track response times, uptime percentages, and performance trends over time.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Globe,
      title: "Global Monitoring",
      description: "Monitor from multiple locations worldwide for accurate uptime measurements.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Shield,
      title: "SSL Monitoring",
      description: "Track SSL certificates and get alerts before they expire to prevent issues.",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get alerts within seconds of downtime with our optimized monitoring network.",
      color: "from-yellow-500 to-orange-500",
    },
  ]

  const stats = [
    { label: "Uptime Guarantee", value: "99.9%", icon: TrendingUp },
    { label: "Websites Monitored", value: "10K+", icon: Globe },
    { label: "Response Time", value: "<30s", icon: Clock },
    { label: "Happy Users", value: "5K+", icon: Users },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center">
                <Server className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">{config.appName}</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="relative">
                <button
                  className="flex items-center space-x-1 text-foreground/70 hover:text-foreground transition-colors"
                  onMouseEnter={() => setFeaturesDropdownOpen(true)}
                  onMouseLeave={() => setFeaturesDropdownOpen(false)}
                >
                  <span>Features</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {featuresDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg p-4"
                      onMouseEnter={() => setFeaturesDropdownOpen(true)}
                      onMouseLeave={() => setFeaturesDropdownOpen(false)}
                    >
                      <div className="space-y-3">
                        <Link
                          href="#monitoring"
                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <Activity className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">Real-time Monitoring</div>
                            <div className="text-sm text-muted-foreground">24/7 uptime tracking</div>
                          </div>
                        </Link>
                        <Link
                          href="#analytics"
                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <BarChart3 className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">Analytics</div>
                            <div className="text-sm text-muted-foreground">Detailed performance insights</div>
                          </div>
                        </Link>
                        <Link
                          href="#alerts"
                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <Bell className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">Smart Alerts</div>
                            <div className="text-sm text-muted-foreground">Instant notifications</div>
                          </div>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link href="#pricing" className="text-foreground/70 hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="#about" className="text-foreground/70 hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/dashboard" className="text-foreground/70 hover:text-foreground transition-colors">
                Dashboard
              </Link>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Mobile menu button */}
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-card border-t border-border"
            >
              <div className="px-4 py-6 space-y-4">
                <Link href="#features" className="block text-foreground hover:text-primary transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="block text-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
                <Link href="#about" className="block text-foreground hover:text-primary transition-colors">
                  About
                </Link>
                <Link href="/dashboard" className="block text-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <div className="pt-4 space-y-2">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button className="w-full bg-gradient-to-r from-primary to-primary-600">Get Started</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float"></div>
        <div
          className="absolute top-40 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-16 h-16 bg-accent/10 rounded-full blur-xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  <Zap className="w-4 h-4 mr-2" />
                  24/7 Uptime Monitoring
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
              >
                Keep Your
                <span className="block bg-gradient-to-r from-primary via-primary-600 to-secondary bg-clip-text text-transparent">
                  Services Online
                </span>
                24/7
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl text-muted-foreground max-w-2xl"
              >
                Monitor your websites, APIs, and Discord bots with real-time alerts, comprehensive analytics, and
                beautiful status pages. Never miss downtime again.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-lg px-8 py-4 group"
                  >
                    Start Monitoring Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                  <Code className="mr-2 w-5 h-5" />
                  View Demo
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex items-center space-x-6 text-sm text-muted-foreground"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Setup in 2 minutes</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Main Dashboard Card */}
              <Card className="relative bg-card/50 backdrop-blur-sm border-border/50 shadow-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold">All Systems Operational</span>
                    </div>
                    <Badge variant="secondary">Live</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Uptime Chart */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Uptime (30 days)</span>
                      <span className="font-semibold text-green-500">99.98%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "99.98%" }}
                        transition={{ duration: 2, delay: 1 }}
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      ></motion.div>
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Avg Response</div>
                      <div className="text-2xl font-bold">245ms</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Last Check</div>
                      <div className="text-sm font-medium text-green-500">2 seconds ago</div>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="space-y-3">
                    {[
                      { name: "Website", status: "online", response: "156ms" },
                      { name: "API", status: "online", response: "89ms" },
                      { name: "Discord Bot", status: "online", response: "234ms" },
                    ].map((service, index) => (
                      <motion.div
                        key={service.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.5 + index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium">{service.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{service.response}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Floating Notification Cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
                className="absolute -top-4 -right-4 bg-card border border-border rounded-lg p-3 shadow-lg"
              >
                <div className="flex items-center space-x-2 text-sm">
                  <Bell className="w-4 h-4 text-green-500" />
                  <span>Service restored</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.5, duration: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-card border border-border rounded-lg p-3 shadow-lg"
              >
                <div className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span>Performance improved</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything you need to monitor your services</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive monitoring tools with real-time alerts, detailed analytics, and beautiful dashboards
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <div
                      className={`inline-flex w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How it works</h2>
            <p className="text-xl text-muted-foreground">Get started with monitoring in three simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Add Your Services",
                description: "Simply enter the URLs of your websites, APIs, or services you want to monitor.",
                icon: Globe,
              },
              {
                step: "02",
                title: "Configure Alerts",
                description: "Set up notification channels like Discord, email, or webhooks to receive instant alerts.",
                icon: Bell,
              },
              {
                step: "03",
                title: "Monitor & Analyze",
                description: "Watch your services in real-time and analyze performance trends with detailed reports.",
                icon: BarChart3,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="relative"
              >
                <Card className="text-center bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group">
                  <CardHeader>
                    <div className="inline-flex w-16 h-16 bg-primary rounded-full items-center justify-center text-2xl font-bold text-primary-foreground mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      {item.step}
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{item.description}</CardDescription>
                  </CardContent>
                </Card>

                {/* Connection Line */}
                {index < 2 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border"></div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 rounded-2xl p-12 border border-primary/20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to monitor your services?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers who trust {config.appName} to keep their services online. Start monitoring
              for free today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-lg px-8 py-4 group"
                >
                  Start Monitoring Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                <Smartphone className="mr-2 w-5 h-5" />
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/50 backdrop-blur-sm border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">{config.appName}</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Keep your services online with reliable monitoring and instant alerts.
              </p>
              <div className="flex space-x-4">
                <ThemeToggle />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#about" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Status
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-12 pt-8 text-center text-muted-foreground">
            <p>© 2024 {config.appName}. All rights reserved. Created by Mohamed Khire.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
