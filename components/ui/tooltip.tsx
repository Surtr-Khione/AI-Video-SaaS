import * as React from "react"
import { cn } from "@/lib/utils"

const tooltipStyles = {
  wrapper: "group relative inline-block",
  tooltip:
    "invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm whitespace-nowrap",
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
}

interface TooltipProps {
  children: React.ReactNode
  content: string
  position?: "top" | "bottom" | "left" | "right"
  className?: string
}

export function Tooltip({
  children,
  content,
  position = "top",
  className,
}: TooltipProps) {
  return (
    <div className={tooltipStyles.wrapper}>
      {children}
      <div
        className={cn(
          tooltipStyles.tooltip,
          tooltipStyles[position],
          className
        )}
      >
        {content}
        <div className="absolute w-2 h-2 bg-gray-900 rotate-45" />
      </div>
    </div>
  )
}
