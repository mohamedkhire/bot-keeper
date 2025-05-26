"use client"

interface SparklineChartProps {
  data: boolean[] | number[]
  width?: number
  height?: number
  color?: string
  showDots?: boolean
  strokeWidth?: number
  className?: string
}

export function SparklineChart({
  data,
  width = 200,
  height = 40,
  color = "#3b82f6",
  showDots = false,
  strokeWidth = 2,
  className = "",
}: SparklineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-muted-foreground text-xs ${className}`}
        style={{ width, height }}
      >
        No data
      </div>
    )
  }

  // Convert boolean data to numbers (true = 1, false = 0)
  const numericData = data.map((d) => (typeof d === "boolean" ? (d ? 1 : 0) : d))

  // Calculate min and max for scaling
  const min = Math.min(...numericData)
  const max = Math.max(...numericData)
  const range = max - min || 1

  // Generate SVG path
  const points = numericData.map((value, index) => {
    const x = (index / (numericData.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return { x, y, value }
  })

  const pathData = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))" }}
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id={`gradient-${color.replace("#", "")}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Fill area */}
        <path
          d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
          fill={`url(#gradient-${color.replace("#", "")})`}
        />

        {/* Main line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* Dots */}
        {showDots &&
          points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={strokeWidth}
              fill={color}
              className="transition-all duration-300 hover:r-3"
            />
          ))}

        {/* Highlight last point */}
        <circle
          cx={points[points.length - 1]?.x || 0}
          cy={points[points.length - 1]?.y || 0}
          r={strokeWidth + 1}
          fill={color}
          className="animate-pulse"
        />
      </svg>

      {/* Tooltip on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
        <div className="absolute top-0 right-0 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg border">
          {typeof data[data.length - 1] === "boolean"
            ? data[data.length - 1]
              ? "Online"
              : "Offline"
            : `${data[data.length - 1]}%`}
        </div>
      </div>
    </div>
  )
}
