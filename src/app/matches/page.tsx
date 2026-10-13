"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, Search, Users, Filter } from "lucide-react"
import { MatchCard } from "@/components/match-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

export default function MatchesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [matches, setMatches] = useState<any[]>([])
  const [filteredMatches, setFilteredMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Fetch matches
  useEffect(() => {
    if (status === "authenticated") {
      fetchMatches()
    }
  }, [status])

  // Filter matches based on search query and filters
  useEffect(() => {
    if (!matches.length) {
      setFilteredMatches([])
      return
    }

    let filtered = [...matches]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (match) =>
          match.user.username.toLowerCase().includes(query) ||
          (match.user.tagline && match.user.tagline.toLowerCase().includes(query)),
      )
    }

    // Apply tab filter
    if (activeTab === "recent") {
      filtered = filtered.sort((a, b) => new Date(b.match.createdAt).getTime() - new Date(a.match.createdAt).getTime())
    } else if (activeTab === "active") {
      // Sort by those with messages first
      filtered = filtered.sort((a, b) => {
        const aHasMessages = a.lastMessage !== undefined
        const bHasMessages = b.lastMessage !== undefined
        if (aHasMessages && !bHasMessages) return -1
        if (!aHasMessages && bHasMessages) return 1
        return 0
      })
    }

    // Apply online filter
    if (showOnlineOnly) {
      filtered = filtered.filter((match) => match.user.status === "online")
    }

    setFilteredMatches(filtered)
  }, [matches, searchQuery, activeTab, showOnlineOnly])

  const fetchMatches = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/matches")
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        // Add random status and last message for demo purposes
        const enhancedMatches = data.matches.map((match: any, index: number) => {
          // Assign random status
          const statuses = ["online", "offline", "away", "busy"]
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

          // Add last message to some matches
          let lastMessage
          if (index % 3 !== 0) {
            // 2/3 of matches have messages
            const messages = [
              "Hey, how's it going?",
              "I saw your React project, it looks great!",
              "Would you be interested in collaborating?",
              "Thanks for the message!",
              "When are you free to chat about the project?",
            ]
            const randomMessage = messages[Math.floor(Math.random() * messages.length)]

            lastMessage = {
              content: randomMessage,
              createdAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(), // Random time in the last week
            }
          }

          return {
            ...match,
            user: {
              ...match.user,
              status: randomStatus,
            },
            lastMessage,
          }
        })

        setMatches(enhancedMatches)
        setFilteredMatches(enhancedMatches)
      }
    } catch (err) {
      setError("Failed to load matches")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] pt-20 md:pt-20 pb-20 md:pb-0">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10 pt-20 md:pt-20 pb-20 md:pb-0">
        <h2 className="text-xl font-semibold mb-4 text-red-500">Error</h2>
        <p className="mb-4">{error}</p>
        <Button onClick={fetchMatches}>Try Again</Button>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-10 pt-20 md:pt-20 pb-20 md:pb-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-xl font-semibold mb-4">No Matches Yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You haven't matched with any developers yet. Head over to the Swipe page to find your coding partners!
          </p>
          <Button onClick={() => router.push("/swipe")}>
            <Users className="h-4 w-4 mr-2" />
            Find Matches
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 pt-20 md:pt-20 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Your Matches</h1>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search matches..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={showOnlineOnly} onCheckedChange={setShowOnlineOnly}>
                Online only
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Matches</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="active">Active Chats</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredMatches.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No matches found with the current filters.</p>
          <Button
            variant="link"
            onClick={() => {
              setSearchQuery("")
              setActiveTab("all")
              setShowOnlineOnly(false)
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMatches.map((match, index) => (
            <MatchCard
              key={match.match.id}
              match={match.match}
              user={match.user}
              lastMessage={match.lastMessage}
              status={match.user.status}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}
