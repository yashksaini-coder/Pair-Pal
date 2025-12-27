import { CheckCheck, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageStatusProps {
  status: "sending" | "sent" | "delivered" | "read"
  className?: string
}

export function MessageStatus({ status, className }: MessageStatusProps) {
  return (
    <span className={cn("text-xs flex items-center", className)}>
      {status === "sending" && <span className="text-muted-foreground">Sending...</span>}

      {status === "sent" && <Check className="h-3 w-3 text-muted-foreground" />}

      {status === "delivered" && <CheckCheck className="h-3 w-3 text-muted-foreground" />}

      {status === "read" && <CheckCheck className="h-3 w-3 text-primary" />}
    </span>
  )
}
