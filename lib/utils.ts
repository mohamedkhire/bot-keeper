import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to format relative time (e.g., "2 minutes ago")
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return diffInSeconds <= 1 ? "just now" : `${diffInSeconds} seconds ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? "1 minute ago" : `${diffInMinutes} minutes ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`
}
