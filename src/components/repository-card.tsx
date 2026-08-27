import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, GitFork, Eye } from "lucide-react"
import { getLanguageColor } from "@/components/language-badge"

interface RepositoryCardProps {
  repo: {
    name: string
    url: string
    description?: string
    stars?: number
    forks?: number
    watchers?: number
    language?: string
    isPublic?: boolean
  }
  className?: string
}

export function RepositoryCard({ repo, className }: RepositoryCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">
              <a href={repo.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {repo.name}
              </a>
            </CardTitle>
            {repo.isPublic !== undefined && (
              <Badge variant="outline" className="text-xs mt-1">
                {repo.isPublic ? "Public" : "Private"}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {repo.description && <CardDescription className="line-clamp-2 mb-3">{repo.description}</CardDescription>}

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {repo.language && (
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
              <span>{repo.language}</span>
            </div>
          )}

          {repo.stars !== undefined && repo.stars > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              <span>{repo.stars}</span>
            </div>
          )}

          {repo.forks !== undefined && repo.forks > 0 && (
            <div className="flex items-center gap-1">
              <GitFork className="h-3.5 w-3.5" />
              <span>{repo.forks}</span>
            </div>
          )}

          {repo.watchers !== undefined && repo.watchers > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{repo.watchers}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
