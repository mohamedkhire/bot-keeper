"use client"

import { useEffect, useRef, useState } from "react"
import { logger } from "@/lib/logger"

// This component will ping the bots even when the website is not active
export default function PersistentPingClient() {
  const workerRef = useRef<Worker | null>(null)
  const [isWorkerActive, setIsWorkerActive] = useState(false)

  useEffect(() => {
    // Get the current origin for absolute URLs
    const origin = window.location.origin

    // Create a blob URL for our worker script
    const workerCode = `
      // Worker that runs independently of the main thread
      let active = true;
      let pingInterval;
      let retryCount = 0;
      let maxRetries = 5;
      let retryDelay = 5000; // 5 seconds
      
      // Store the origin passed from the main thread
      let baseUrl = "${origin}";
      
      // Function to ping all endpoints
      async function pingAll() {
        try {
          // Add timestamp to prevent caching
          const timestamp = Date.now();
          
          // Ping the worker endpoint with absolute URL
          const workerResponse = await fetch(baseUrl + '/api/worker?t=' + timestamp, { 
            method: 'GET',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
          if (!workerResponse.ok) {
            throw new Error('Worker endpoint returned status: ' + workerResponse.status);
          }
          
          // Also ping the direct bot endpoint with absolute URL
          const botResponse = await fetch(baseUrl + '/api/direct-bot-ping?t=' + timestamp, { 
            method: 'GET',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
          if (!botResponse.ok) {
            throw new Error('Bot endpoint returned status: ' + botResponse.status);
          }
          
          // Reset retry count on success
          retryCount = 0;
          
          // Send a message back to the main thread
          self.postMessage({ type: 'ping_complete', timestamp: new Date().toISOString() });
        } catch (error) {
          retryCount++;
          
          if (retryCount <= maxRetries) {
            self.postMessage({ 
              type: 'retry', 
              error: error.message, 
              retryCount: retryCount,
              maxRetries: maxRetries
            });
            
            // Wait and retry
            setTimeout(pingAll, retryDelay);
          } else {
            self.postMessage({ 
              type: 'error', 
              error: error.message,
              retryCount: retryCount,
              maxRetries: maxRetries
            });
            
            // Reset retry count after reporting the error
            retryCount = 0;
          }
        }
      }
      
      // Listen for messages from the main thread
      self.addEventListener('message', (event) => {
        if (event.data === 'start') {
          active = true;
          // Ping immediately
          pingAll();
          // Then set up interval (every 2 minutes)
          pingInterval = setInterval(() => {
            if (active) pingAll();
          }, 2 * 60 * 1000);
          
          self.postMessage({ type: 'started' });
        } else if (event.data === 'stop') {
          active = false;
          clearInterval(pingInterval);
          self.postMessage({ type: 'stopped' });
        } else if (event.data === 'ping_now') {
          // Force an immediate ping
          pingAll();
        }
      });
      
      // Send ready message
      self.postMessage({ type: 'ready' });
    `

    // Create a blob URL for the worker
    const blob = new Blob([workerCode], { type: "application/javascript" })
    const workerUrl = URL.createObjectURL(blob)

    try {
      // Create and start the worker
      workerRef.current = new Worker(workerUrl)
      setIsWorkerActive(true)

      // Listen for messages from the worker
      workerRef.current.addEventListener("message", (event) => {
        if (event.data.type === "ping_complete") {
          logger.info(`Background ping completed at ${event.data.timestamp}`)
        } else if (event.data.type === "error") {
          logger.error(
            `Background ping error: ${event.data.error} (Retry ${event.data.retryCount}/${event.data.maxRetries})`,
          )
        } else if (event.data.type === "retry") {
          logger.warn(
            `Background ping failed: ${event.data.error} - Retrying (${event.data.retryCount}/${event.data.maxRetries})`,
          )
        } else if (event.data.type === "started") {
          logger.info("Background ping worker started")
        } else if (event.data.type === "stopped") {
          logger.info("Background ping worker stopped")
        } else if (event.data.type === "ready") {
          logger.info("Background ping worker ready")
        }
      })

      // Start the worker
      workerRef.current.postMessage("start")

      // Also set up a backup interval in the main thread
      const mainThreadInterval = setInterval(
        () => {
          // This will run in the main thread as a backup
          fetch(`${origin}/api/worker?t=${Date.now()}`, {
            method: "GET",
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }).catch((error) => {
            logger.error("Main thread ping error:", error)
          })
        },
        3 * 60 * 1000,
      ) // Every 3 minutes

      // Clean up
      return () => {
        if (workerRef.current) {
          workerRef.current.postMessage("stop")
          workerRef.current.terminate()
          setIsWorkerActive(false)
        }
        URL.revokeObjectURL(workerUrl)
        clearInterval(mainThreadInterval)
      }
    } catch (error) {
      logger.error("Failed to create worker:", error)
      setIsWorkerActive(false)

      // Fallback to regular interval if worker creation fails
      const fallbackInterval = setInterval(
        () => {
          fetch(`${origin}/api/worker?t=${Date.now()}`, {
            method: "GET",
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }).catch((error) => {
            logger.error("Fallback ping error:", error)
          })
        },
        2 * 60 * 1000,
      ) // Every 2 minutes

      return () => clearInterval(fallbackInterval)
    }
  }, [])

  // Use the Page Visibility API to detect when the page is hidden/visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Page is hidden, trigger a ping before potentially losing connection
        fetch(`/api/worker?t=${Date.now()}`, {
          method: "GET",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }).catch((error) => {
          logger.error("Visibility change ping error:", error)
        })
      } else if (document.visibilityState === "visible" && workerRef.current && isWorkerActive) {
        // Page is visible again, force a ping
        workerRef.current.postMessage("ping_now")
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isWorkerActive])

  // This component doesn't render anything
  return null
}
