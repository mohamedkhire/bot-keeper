"use client"

import { useEffect } from "react"

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register the service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/ping-worker.js")
          .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope)

            // Send a ping message to the service worker
            if (registration.active) {
              registration.active.postMessage("ping")
            }

            // Set up periodic messaging to the service worker
            setInterval(
              () => {
                if (registration.active) {
                  registration.active.postMessage("ping")
                }
              },
              5 * 60 * 1000,
            ) // Every 5 minutes
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error)
          })
      })
    }
  }, [])

  return null
}
