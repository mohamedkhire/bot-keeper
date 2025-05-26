import type { Metadata } from "next"
import DashboardClientPage from "./DashboardClientPage"

export const metadata: Metadata = {
  title: "Dashboard - Monitor Your Projects",
  description:
    "Monitor your Discord bots and web services with real-time uptime tracking, performance metrics, and instant notifications.",
  openGraph: {
    title: "Dashboard - Bot Keeper",
    description:
      "Monitor your Discord bots and web services with real-time uptime tracking, performance metrics, and instant notifications.",
    images: ["https://i.ibb.co/6RQHw77X/382-1x-shots-so.png"],
  },
}

export default function DashboardPage() {
  return <DashboardClientPage />
}
