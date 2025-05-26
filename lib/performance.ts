// Performance optimization utilities

// Debounce function for search and input handling
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function for scroll and resize events
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    threshold: 0.1,
    rootMargin: "50px",
    ...options,
  })
}

// Memory-efficient data caching
class LRUCache<T> {
  private cache = new Map<string, T>()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  get(key: string): T | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  clear(): void {
    this.cache.clear()
  }
}

export const dataCache = new LRUCache(50)

// Preload critical resources
export function preloadResource(href: string, as: string): void {
  if (typeof window !== "undefined") {
    const link = document.createElement("link")
    link.rel = "preload"
    link.href = href
    link.as = as
    document.head.appendChild(link)
  }
}

// Optimize images
export function getOptimizedImageUrl(url: string, width: number, height: number, quality = 75): string {
  // This would integrate with your image optimization service
  // For now, return the original URL
  return url
}

// Bundle size optimization - dynamic imports
export const loadComponent = (componentName: string) => {
  switch (componentName) {
    case "Chart":
      return import("@/components/charts/chart")
    case "Calendar":
      return import("@/components/calendar/calendar")
    case "Editor":
      return import("@/components/editor/editor")
    default:
      return Promise.reject(new Error(`Component ${componentName} not found`))
  }
}

// Performance monitoring
export function measurePerformance(name: string, fn: () => void): void {
  if (typeof window !== "undefined" && "performance" in window) {
    const start = performance.now()
    fn()
    const end = performance.now()
    console.log(`${name} took ${end - start} milliseconds`)
  } else {
    fn()
  }
}

// Web Vitals tracking
export function trackWebVitals(): void {
  if (typeof window !== "undefined") {
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log)
      getFID(console.log)
      getFCP(console.log)
      getLCP(console.log)
      getTTFB(console.log)
    })
  }
}
