import type React from "react"
import type { FC } from "react"
import Image from "next/image"
import { FileText, Globe, Server, Code, Database, Bot, Zap, Activity } from "lucide-react"

export type IconType = "file" | "globe" | "server" | "code" | "database" | "bot" | "zap" | "activity" | "custom"

interface ProjectIconProps {
  type: IconType
  customUrl?: string
  size?: number
  className?: string
}

export const ProjectIcon: FC<ProjectIconProps> = ({ type, customUrl, size = 24, className = "" }) => {
  const iconClassName = `text-white ${className}`

  // If it's a custom icon with URL, render an image
  if (type === "custom" && customUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-md overflow-hidden bg-gradient-to-br from-orange-400 to-red-500 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={customUrl || "/placeholder.svg"}
          alt="Project icon"
          width={size}
          height={size}
          className="object-cover"
        />
      </div>
    )
  }

  // Otherwise render one of our predefined icons
  const IconWrapper = ({ children }: { children: React.ReactNode }) => (
    <div
      className={`flex items-center justify-center rounded-md ${getIconBackground(type)} ${className}`}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  )

  switch (type) {
    case "file":
      return (
        <IconWrapper>
          <FileText size={size * 0.6} className={iconClassName} />
        </IconWrapper>
      )
    case "globe":
      return (
        <IconWrapper>
          <Globe size={size * 0.6} className={iconClassName} />
        </IconWrapper>
      )
    case "server":
      return (
        <IconWrapper>
          <Server size={size * 0.6} className={iconClassName} />
        </IconWrapper>
      )
    case "code":
      return (
        <IconWrapper>
          <Code size={size * 0.6} className={iconClassName} />
        </IconWrapper>
      )
    case "database":
      return (
        <IconWrapper>
          <Database size={size * 0.6} className={iconClassName} />
        </IconWrapper>
      )
    case "bot":
      return (
        <IconWrapper>
          <Bot size={size * 0.6} className={iconClassName} />
        </IconWrapper>
      )
    case "zap":
      return (
        <IconWrapper>
          <Zap size={size * 0.6} className={iconClassName} />
        </IconWrapper>
      )
    case "activity":
      return (
        <IconWrapper>
          <Activity size={size * 0.6} className={iconClassName} />
        </IconWrapper>
      )
    default:
      return (
        <IconWrapper>
          <Globe size={size * 0.6} className={iconClassName} />
        </IconWrapper>
      )
  }
}

// Helper function to get background color based on icon type
function getIconBackground(type: IconType): string {
  switch (type) {
    case "file":
      return "bg-gradient-to-br from-orange-400 to-red-500"
    case "globe":
      return "bg-gradient-to-br from-blue-400 to-blue-600"
    case "server":
      return "bg-gradient-to-br from-purple-400 to-purple-600"
    case "code":
      return "bg-gradient-to-br from-green-400 to-green-600"
    case "database":
      return "bg-gradient-to-br from-yellow-400 to-yellow-600"
    case "bot":
      return "bg-gradient-to-br from-pink-400 to-pink-600"
    case "zap":
      return "bg-gradient-to-br from-indigo-400 to-indigo-600"
    case "activity":
      return "bg-gradient-to-br from-cyan-400 to-cyan-600"
    default:
      return "bg-gradient-to-br from-gray-400 to-gray-600"
  }
}
