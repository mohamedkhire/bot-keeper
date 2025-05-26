// Service Worker for persistent background pinging
const PING_INTERVAL = 2 * 60 * 1000 // 2 minutes
const ENDPOINTS = ["/api/worker", "/api/direct-bot-ping"]
const MAX_RETRIES = 3
const RETRY_DELAY = 5000 // 5 seconds

// Register the periodic sync (if supported)
self.addEventListener("install", (event) => {
  self.skipWaiting()

  // Try to register for periodic sync if available
  if ("periodicSync" in self.registration) {
    event.waitUntil(
      self.registration.periodicSync
        .register("ping-sync", {
          minInterval: PING_INTERVAL,
        })
        .catch((err) => {
          console.error("Periodic Sync could not be registered:", err)
        }),
    )
  }
})

// Activate immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

// Handle periodic sync events
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "ping-sync") {
    event.waitUntil(pingAllEndpoints())
  }
})

// Also handle push events as a backup
self.addEventListener("push", (event) => {
  event.waitUntil(pingAllEndpoints())
})

// Function to ping a single endpoint with retries
async function pingEndpointWithRetry(url, retries = 0) {
  try {
    // Add timestamp to prevent caching
    const timestamp = Date.now()
    url = new URL(url)
    url.searchParams.append("t", timestamp)

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`)
    }

    return true
  } catch (error) {
    console.error(`Service worker failed to ping ${url}:`, error)

    if (retries < MAX_RETRIES) {
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return pingEndpointWithRetry(url, retries + 1)
    }

    return false
  }
}

// Function to ping all endpoints
async function pingAllEndpoints() {
  // Get the service worker scope (origin)
  const baseUrl = self.registration.scope.replace(/\/$/, "")

  const pingPromises = ENDPOINTS.map((endpoint) => {
    // Create absolute URL
    const url = new URL(endpoint, baseUrl)
    return pingEndpointWithRetry(url)
  })

  return Promise.all(pingPromises)
}

// Set up a backup interval
setInterval(pingAllEndpoints, PING_INTERVAL)

// Handle messages from the client
self.addEventListener("message", (event) => {
  if (event.data === "ping") {
    event.waitUntil(pingAllEndpoints())
  }
})
