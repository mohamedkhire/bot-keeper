import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Home, Search, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Page Not Found - 404",
  description:
    "The page you're looking for doesn't exist. Return to the dashboard or explore our uptime monitoring features.",
  openGraph: {
    title: "Page Not Found - Bot Keeper",
    description:
      "The page you're looking for doesn't exist. Return to the dashboard or explore our uptime monitoring features.",
    images: ["https://i.ibb.co/6RQHw77X/382-1x-shots-so.png"],
  },
  twitter: {
    title: "Page Not Found - Bot Keeper",
    description:
      "The page you're looking for doesn't exist. Return to the dashboard or explore our uptime monitoring features.",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-2 border-dashed border-muted-foreground/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-10 h-10 text-orange-500" />
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              404 - Page Not Found
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Oops! The page you're looking for seems to have gone offline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Don't worry, even the best monitoring systems have their blind spots. Let's get you back to tracking
                your projects.
              </p>

              <div className="bg-muted/30 rounded-lg p-4 border border-muted-foreground/20">
                <h3 className="font-semibold mb-2 flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  What you can do:
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Check the URL for any typos</li>
                  <li>• Return to the dashboard to monitor your projects</li>
                  <li>• Use the navigation menu to find what you need</li>
                  <li>• Contact support if you believe this is an error</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="group">
                <Link href="/dashboard">
                  <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild className="group">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Home
                </Link>
              </Button>
            </div>

            <div className="text-center pt-4 border-t border-muted-foreground/20">
              <p className="text-xs text-muted-foreground">Error Code: 404 | Page Not Found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
