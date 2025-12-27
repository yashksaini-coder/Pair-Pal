import { cn } from "@/lib/utils"

interface UserStatusProps {
  status: "online" | "offline" | "away" | "busy"
  className?: string
  showLabel?: boolean
}

export function UserStatus({ status, className, showLabel = false }: UserStatusProps) {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    away: "bg-yellow-500",
    busy: "bg-red-500",
  }

  const statusLabels = {
    online: "Online",
    offline: "Offline",
    away: "Away",
    busy: "Busy",
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className={cn("block h-2 w-2 rounded-full", statusColors[status])} />
      {showLabel && <span className="text-xs text-muted-foreground">{statusLabels[status]}</span>}
    </div>
  )
}
