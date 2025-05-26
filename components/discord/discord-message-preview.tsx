"use client"

import { useState, useEffect } from "react"

interface DiscordMessagePreviewProps {
  username: string
  avatarUrl?: string
  content?: string
  embedTitle: string
  embedDescription: string
  embedColor: string
  embedThumbnail?: string
  embedImage?: string
  embedAuthorName?: string
  embedAuthorUrl?: string
  embedAuthorIconUrl?: string
  embedFooterText?: string
  embedFooterIconUrl?: string
  includeTimestamp: boolean
  includeUptime: boolean
  includeResponseTime: boolean
  includeDowntime: boolean
  includeButtons: boolean
}

export function DiscordMessagePreview({
  username,
  avatarUrl,
  content,
  embedTitle,
  embedDescription,
  embedColor,
  embedThumbnail,
  embedImage,
  embedAuthorName,
  embedAuthorUrl,
  embedAuthorIconUrl,
  embedFooterText,
  embedFooterIconUrl,
  includeTimestamp,
  includeUptime,
  includeResponseTime,
  includeDowntime,
  includeButtons,
}: DiscordMessagePreviewProps) {
  const [timestamp, setTimestamp] = useState<string>("")

  useEffect(() => {
    // Format the current time as a Discord timestamp
    const now = new Date()
    setTimestamp(
      now.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
    )
  }, [])

  return (
    <div className="bg-[#36393f] text-white rounded-md p-4 max-w-full overflow-hidden">
      {/* Message header with avatar and username */}
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#5865F2] text-white font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <div className="font-semibold">{username}</div>
          <div className="text-xs text-gray-400">Today at {timestamp}</div>
        </div>
      </div>

      {/* Message content */}
      {content && <div className="mb-2 break-words whitespace-pre-wrap">{content}</div>}

      {/* Embed */}
      <div className="border-l-4 rounded-sm pl-3 mt-2 bg-[#2f3136] p-3" style={{ borderColor: embedColor }}>
        {/* Author */}
        {embedAuthorName && (
          <div className="flex items-center mb-2">
            {embedAuthorIconUrl && (
              <img
                src={embedAuthorIconUrl || "/placeholder.svg"}
                alt=""
                className="w-6 h-6 rounded-full mr-2 object-cover"
              />
            )}
            <div className="text-sm font-medium">
              {embedAuthorUrl ? (
                <a href={embedAuthorUrl} className="text-white hover:underline">
                  {embedAuthorName}
                </a>
              ) : (
                embedAuthorName
              )}
            </div>
          </div>
        )}

        {/* Title */}
        <div className="text-lg font-semibold mb-1">{embedTitle}</div>

        {/* Description */}
        <div className="text-sm mb-2 whitespace-pre-wrap">{embedDescription}</div>

        {/* Thumbnail */}
        {embedThumbnail && (
          <div className="absolute top-0 right-0 mt-4 mr-4">
            <img src={embedThumbnail || "/placeholder.svg"} alt="" className="w-16 h-16 rounded object-cover" />
          </div>
        )}

        {/* Fields */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          {includeUptime && (
            <div>
              <div className="text-xs font-semibold text-gray-400">Uptime</div>
              <div className="text-sm">99.9%</div>
            </div>
          )}
          {includeResponseTime && (
            <div>
              <div className="text-xs font-semibold text-gray-400">Response Time</div>
              <div className="text-sm">123ms</div>
            </div>
          )}
        </div>

        {includeDowntime && (
          <div className="mb-2">
            <div className="text-xs font-semibold text-gray-400">Last Downtime</div>
            <div className="text-sm">None in the last 7 days</div>
          </div>
        )}

        {/* Image */}
        {embedImage && (
          <div className="mt-2 mb-2">
            <img
              src={embedImage || "/placeholder.svg"}
              alt=""
              className="max-w-full rounded max-h-[300px] object-cover"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center mt-2 text-xs text-gray-400">
          {embedFooterIconUrl && (
            <img
              src={embedFooterIconUrl || "/placeholder.svg"}
              alt=""
              className="w-4 h-4 rounded-full mr-2 object-cover"
            />
          )}
          <span>{embedFooterText || "Powered by Bot Keeper"}</span>
          {includeTimestamp && <span className="ml-2">• Today at {timestamp}</span>}
        </div>
      </div>

      {/* Buttons */}
      {includeButtons && (
        <div className="mt-2 flex gap-2">
          <button className="bg-[#4f545c] hover:bg-[#686d73] text-white text-sm px-4 py-2 rounded transition-colors">
            View Statistics
          </button>
          <button className="bg-[#4f545c] hover:bg-[#686d73] text-white text-sm px-4 py-2 rounded transition-colors">
            View Dashboard
          </button>
        </div>
      )}
    </div>
  )
}
