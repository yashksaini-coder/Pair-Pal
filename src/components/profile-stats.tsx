import { CalendarDays, Code, Star, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileStatsProps {
  stats: {
    repos: number
    followers: number
    following: number
    stars?: number
    contributions?: number
  }
  className?: string
}

export function ProfileStats({ stats, className }: ProfileStatsProps) {
  return (
    <div className={cn("flex flex-wrap gap-4", className)}>
      <div className="flex items-center gap-1.5">
        <Code className="h-4 w-4 text-primary/70" />
        <span className="text-sm">
          <span className="font-medium">{stats.repos}</span> repositories
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Users className="h-4 w-4 text-primary/70" />
        <span className="text-sm">
          <span className="font-medium">{stats.followers}</span> followers
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Users className="h-4 w-4 text-primary/70" />
        <span className="text-sm">
          <span className="font-medium">{stats.following}</span> following
        </span>
      </div>

      {stats.stars !== undefined && (
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 text-primary/70" />
          <span className="text-sm">
            <span className="font-medium">{stats.stars}</span> stars
          </span>
        </div>
      )}

      {stats.contributions !== undefined && (
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-primary/70" />
          <span className="text-sm">
            <span className="font-medium">{stats.contributions}</span> contributions this year
          </span>
        </div>
      )}
    </div>
  )
}
