"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SwipeCard } from "@/components/swipe-card"
import { MatchNotification } from "@/components/match-notification"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

export default function SwipePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [profiles, setProfiles] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showMatchNotification, setShowMatchNotification] = useState(false)
  const [matchedUser, setMatchedUser] = useState<any>(null)
  const [matchId, setMatchId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    minMatchScore: 0,
    languages: [] as string[],
    onlyWithRepos: false,
  })
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])

  // Fetch profiles
  useEffect(() => {
    if (status === "authenticated") {
      fetchProfiles()
    }
  }, [status])

  const fetchProfiles = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/profiles")
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setProfiles(data.profiles)

        // Extract all unique languages for filtering
        const languages = new Set<string>()
        data.profiles.forEach((profile: any) => {
          if (profile.languages) {
            profile.languages.forEach((lang: string) => languages.add(lang))
          }
        })
        setAvailableLanguages(Array.from(languages))
      }
    } catch (err) {
      setError("Failed to load profiles")
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = async (id: string, liked: boolean) => {
    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetId: id, liked }),
      })

      const data = await res.json()

      // Check if there's a match
      if (data.matchCreated) {
        // Find the profile that matched
        const matchedProfile = profiles[currentIndex]
        setMatchedUser(matchedProfile)
        setMatchId(data.matchId)
        setShowMatchNotification(true)
      }

      // Move to next profile
      setCurrentIndex((prev) => prev + 1)

      // If we're running out of profiles, fetch more
      if (currentIndex + 1 >= profiles.length - 2) {
        fetchProfiles()
      }
    } catch (err) {
      setError("Failed to record swipe")
    }
  }

  const handleViewMatch = () => {
    setShowMatchNotification(false)
    if (matchId) {
      router.push(`/chat/${matchId}`)
    }
  }

  // Filter profiles based on selected filters
  const filteredProfiles = profiles.filter((profile) => {
    // Filter by minimum match score
    if (profile.score < filters.minMatchScore) {
      return false
    }

    // Filter by selected languages
    if (filters.languages.length > 0) {
      const hasMatchingLanguage = profile.languages.some((lang: string) => filters.languages.includes(lang))
      if (!hasMatchingLanguage) {
        return false
      }
    }

    // Filter by having repositories
    if (filters.onlyWithRepos && (!profile.repos || profile.repos.length === 0)) {
      return false
    }

    return true
  })

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 pt-20 md:pt-20 pb-20 md:pb-0 px-4 md:px-8">
        <h2 className="text-xl font-semibold mb-4 text-red-500">Error</h2>
        <p className="mb-4">{error}</p>
        <Button onClick={fetchProfiles}>Try Again</Button>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-8 pt-20 md:pt-20 pb-20 md:pb-0 px-4 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-xl font-semibold mb-4">No Profiles Available</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            We couldn't find any more profiles for you to match with right now. Check back later or update your profile
            to get better matches!
          </p>
          <Link href="/profile">
            <Button>View Your Profile</Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  if (currentIndex >= filteredProfiles.length) {
    return (
      <div className="text-center py-8 pt-20 md:pt-20 pb-20 md:pb-0 px-4 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-xl font-semibold mb-4">No More Profiles</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You've seen all available profiles. Check back later for more potential matches!
          </p>
          <Button onClick={fetchProfiles}>Refresh Profiles</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto pt-20 max-w-lg py-10 px-4 md:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Find Your Coding Partner</h1>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Sliders className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="p-2">
              <label className="text-xs font-medium">Minimum Match Score</label>
              <div className="flex items-center mt-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={filters.minMatchScore}
                  onChange={(e) => setFilters({ ...filters, minMatchScore: Number.parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="ml-2 text-xs">{filters.minMatchScore}%</span>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuCheckboxItem
              checked={filters.onlyWithRepos}
              onCheckedChange={(checked) => setFilters({ ...filters, onlyWithRepos: checked as boolean })}
            >
              Has repositories
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs">Languages</DropdownMenuLabel>
            <div className="max-h-40 overflow-y-auto p-1">
              {availableLanguages.map((language) => (
                <DropdownMenuCheckboxItem
                  key={language}
                  checked={filters.languages.includes(language)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilters({ ...filters, languages: [...filters.languages, language] })
                    } else {
                      setFilters({ ...filters, languages: filters.languages.filter((l) => l !== language) })
                    }
                  }}
                >
                  {language}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative h-[600px]">
        {filteredProfiles.map((profile, index) => (
          <div key={profile._id} className={index === currentIndex ? "block" : "hidden"}>
            <SwipeCard profile={profile} onSwipe={handleSwipe} />
          </div>
        ))}
      </div>

      <MatchNotification
        isOpen={showMatchNotification}
        username={matchedUser?.username || ""}
        avatarUrl={matchedUser?.avatarUrl}
        onClose={() => setShowMatchNotification(false)}
        onViewMatch={handleViewMatch}
      />
    </div>
  )
}
