// Add this code to your Discord bot (Node.js)
const http = require("http")
const url = require("url")

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Parse the URL
  const parsedUrl = url.parse(req.url, true)

  // Set CORS headers to allow requests from any origin
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(200)
    res.end()
    return
  }

  // Check if this is a keepalive ping
  if (parsedUrl.pathname === "/" && parsedUrl.query.keepalive === "true") {
    // Log the ping (optional)
    console.log(`Received keepalive ping at ${new Date().toISOString()}`)

    // Send a success response
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(
      JSON.stringify({
        status: "online",
        bot: "active",
        timestamp: new Date().toISOString(),
      }),
    )
    return
  }

  // For any other request, just return a simple message
  res.writeHead(200, { "Content-Type": "text/plain" })
  res.end("Discord bot is running!")
})

// Listen on the port Glitch provides or default to 3000
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`)
})

// Your existing Discord bot code continues below...
