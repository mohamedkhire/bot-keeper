// Environment variables and configuration
export const config = {
  appName: "BotKeeper",
  // Use the environment variables with fallbacks
  appUrl: process.env.NEXT_PUBLIC_VERCEL_URL || "uptimer-test1.vercel.app",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://uptimer-test1.vercel.app/api",
  // Add a new property for the full base URL with https
  baseUrl: `https://${process.env.NEXT_PUBLIC_VERCEL_URL || "uptimer-test1.vercel.app"}`,
  pingInterval: 3 * 60 * 1000, // 3 minutes
  refreshInterval: 30 * 1000, // 30 seconds
}
