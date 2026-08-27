import type React from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AchievementBadgeProps {
  icon: React.ReactNode
  name: string
  description?: string
  color?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function AchievementBadge({
  icon,
  name,
  description,
  color = "bg-primary",
  size = "md",
  className,
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "rounded-full flex items-center justify-center text-white",
              sizeClasses[size],
              color,
              className,
            )}
          >
            {icon}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div>
            <p className="font-medium">{name}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
