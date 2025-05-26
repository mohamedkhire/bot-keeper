// Simple logging utility for consistent logging across the application

type LogLevel = "debug" | "info" | "warn" | "error"

// Configure log levels that should be displayed
// In production, you might want to only show warn and error
const SHOW_LOG_LEVELS: LogLevel[] = ["debug", "info", "warn", "error"]

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (SHOW_LOG_LEVELS.includes("debug")) {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  },

  info: (message: string, ...args: any[]) => {
    if (SHOW_LOG_LEVELS.includes("info")) {
      console.log(`[INFO] ${message}`, ...args)
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (SHOW_LOG_LEVELS.includes("warn")) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  },

  error: (message: string, ...args: any[]) => {
    if (SHOW_LOG_LEVELS.includes("error")) {
      console.error(`[ERROR] ${message}`, ...args)
    }
  },

  // Log ping results in a consistent format
  pingResult: (url: string, success: boolean, responseTime?: number, method = "HEAD") => {
    const status = success ? "SUCCESS" : "FAILED"
    const timeInfo = responseTime ? `${responseTime}ms` : "N/A"
    logger.info(`Ping ${status} [${method}] ${url} - ${timeInfo}`)
  },

  // Special logger for cron jobs
  cron: (message: string, ...args: any[]) => {
    console.log(`[CRON ${new Date().toISOString()}] ${message}`, ...args)
  },
}
