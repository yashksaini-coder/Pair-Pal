"use client"

import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { User, MessageSquare, Calendar, Code } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserStatus } from "@/components/user-status"
import { motion } from "framer-motion"

interface MatchCardProps {
  match: {
    id: string
    createdAt: string
  }
  user: {
    id: string
    username: string
    avatarUrl?: string
    tagline?: string
    languages?: string[]
    location?: string
  }
  lastMessage?: {
    content: string
    createdAt: string
  }
  status?: "online" | "offline" | "away" | "busy"
  index?: number
}

export function MatchCard({ match, user, lastMessage, status = "offline", index = 0 }: MatchCardProps) {
  const matchDate = new Date(match.createdAt)
  const timeAgo = formatDistanceToNow(matchDate, { addSuffix: true })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="flex">
            {/* User avatar */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl || "/placeholder.svg"}
                  alt={user.username}
                  layout="fill"
                  objectFit="cover"
                  className="hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <UserStatus status={status} className="absolute bottom-2 right-2" />
            </div>

            {/* User info */}
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{user.username}</h3>
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </div>

              {user.tagline && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{user.tagline}</p>}

              {/* User languages */}
              {user.languages && user.languages.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Code className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {user.languages.slice(0, 3).map((lang, i) => (
                      <Badge key={i} variant="outline" className="text-xs py-0 h-5">
                        {lang}
                      </Badge>
                    ))}
                    {user.languages.length > 3 && (
                      <Badge variant="outline" className="text-xs py-0 h-5">
                        +{user.languages.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Location */}
              {user.location && (
                <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Matched {timeAgo}</span>
                </div>
              )}

              {/* Last message preview */}
              {lastMessage && (
                <div className="mt-2 flex items-start gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                  <p className="text-sm line-clamp-1">{lastMessage.content}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-end">
          <Link href={`/chat/${match.id}`} className="w-full sm:w-auto">
            <Button variant="default" className="w-full sm:w-auto">
              <MessageSquare className="h-4 w-4 mr-2" />
              {lastMessage ? "Continue Chat" : "Start Chat"}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
