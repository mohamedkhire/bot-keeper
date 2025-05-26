"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { config } from "@/lib/config"

export function ExternalPingSetup() {
  const [copied, setCopied] = useState<Record<string, boolean>>({})

  // Generate the URLs for the external ping services
  const baseUrl =
    typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : config.baseUrl

  const pingUrls = {
    standard: `${baseUrl}/api/external-ping`,
    direct: `${baseUrl}/api/direct-bot-ping`,
  }

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(pingUrls[key as keyof typeof pingUrls])
    setCopied({ ...copied, [key]: true })
    setTimeout(() => setCopied({ ...copied, [key]: false }), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>External Ping Service Setup</CardTitle>
        <CardDescription>
          To ensure your bots stay online 24/7, set up an external ping service to call these URLs every 5 minutes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="standard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="standard">Standard Ping</TabsTrigger>
            <TabsTrigger value="direct">Direct Bot Ping (Recommended)</TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="space-y-4">
            <div className="bg-gray-100 p-3 rounded-md flex items-center justify-between">
              <code className="text-sm break-all">{pingUrls.standard}</code>
              <Button variant="outline" size="sm" onClick={() => handleCopy("standard")}>
                {copied.standard ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              This endpoint pings your bots and updates their status in the dashboard.
            </p>
          </TabsContent>

          <TabsContent value="direct" className="space-y-4">
            <div className="bg-gray-100 p-3 rounded-md flex items-center justify-between">
              <code className="text-sm break-all">{pingUrls.direct}</code>
              <Button variant="outline" size="sm" onClick={() => handleCopy("direct")}>
                {copied.direct ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              <strong>Recommended:</strong> This endpoint directly pings your bots with minimal overhead, which is more
              effective at keeping Glitch projects awake.
            </p>
          </TabsContent>

          <div className="space-y-2 mt-4">
            <h3 className="text-sm font-medium">Recommended Services:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <a
                  href="https://uptimerobot.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  UptimeRobot
                </a>
                {" - Free plan includes 5-minute monitoring"}
              </li>
              <li>
                <a
                  href="https://cron-job.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Cron-Job.org
                </a>
                {" - Free service with flexible scheduling"}
              </li>
              <li>
                <a
                  href="https://kaffeine.herokuapp.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Kaffeine
                </a>
                {" - Simple service to keep Heroku apps awake"}
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm mt-4">
            <p className="font-medium text-yellow-800">Important</p>
            <p className="text-yellow-700">
              For Glitch projects, use the Direct Bot Ping URL as it's more effective at keeping your bots online. Set
              up multiple ping services for redundancy.
            </p>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
