"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Loader2,
  MapPin,
  Code,
  Edit,
  Building2,
  LinkIcon,
  Twitter,
  Github,
  Award,
  Briefcase,
  Sparkles,
  Star,
  GitFork,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileStats } from "@/components/profile-stats"
import { ContributionGraph } from "@/components/contribution-graphs"
import { ProfileCompletion } from "@/components/profile-completion"
import { AchievementBadge } from "@/components/achievement-badges"
import { RepositoryCard } from "@/components/repository-card"
import { getLanguageColor } from "@/components/language-badge"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tagline, setTagline] = useState("")
  const [editingTagline, setEditingTagline] = useState(false)
  const [savingTagline, setSavingTagline] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Fetch profile data
  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile()
    }
  }, [status])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/github/profile")
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setProfile(data.user)
        setTagline(data.user.tagline || "")
      }
    } catch (err) {
      setError("Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    setSavingTagline(true)
    try {
      const res = await fetch("/api/github/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tagline }),
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setProfile(data.user)
        setEditingTagline(false)
      }
    } catch (err) {
      setError("Failed to update profile")
    } finally {
      setSavingTagline(false)
    }
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profile) return 0

    const items = [
      !!profile.tagline,
      !!profile.bio,
      !!profile.location,
      profile.languages && profile.languages.length > 0,
      profile.repos && profile.repos.length > 0,
      !!profile.company,
      !!profile.blog,
      !!profile.twitterUsername,
    ]

    const completedItems = items.filter(Boolean).length
    return Math.round((completedItems / items.length) * 100)
  }

  // Generate mock achievements based on profile data
  const generateAchievements = () => {
    if (!profile) return []

    const achievements = []

    // Popular repository
    if (profile.repos && profile.repos.some((r: any) => r.stars > 10)) {
      achievements.push({
        name: "Popular Repository",
        description: "You have a repository with more than 10 stars",
        icon: <Star className="h-6 w-6" />,
        color: "bg-yellow-500",
      })
    }

    // Code linguist
    if (profile.languages && profile.languages.length >= 3) {
      achievements.push({
        name: "Code Linguist",
        description: "You code in 3 or more languages",
        icon: <Code className="h-6 w-6" />,
        color: "bg-green-500",
      })
    }

    // Team player
    if (profile.organizations && profile.organizations.length > 0) {
      achievements.push({
        name: "Team Player",
        description: "You're a member of at least one organization",
        icon: <Users className="h-6 w-6" />,
        color: "bg-blue-500",
      })
    }

    // Active contributor
    if (profile.publicRepos > 5) {
      achievements.push({
        name: "Active Contributor",
        description: "You have more than 5 public repositories",
        icon: <GitFork className="h-6 w-6" />,
        color: "bg-purple-500",
      })
    }

    return achievements
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
      <div className="container mx-auto max-w-3xl pt-20 md:pt-20 pb-20 md:pb-0">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-center text-red-500">Error</h2>
            <p className="text-center">{error}</p>
            <div className="flex justify-center mt-6">
              <Button onClick={fetchProfile}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-3xl pt-20 md:pt-20 pb-20 md:pb-0">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Profile Not Found</h2>
            <p className="text-center">We need to fetch your GitHub profile data.</p>
            <div className="flex justify-center mt-6">
              <Button onClick={() => updateProfile()}>Import GitHub Profile</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completionPercentage = calculateProfileCompletion()
  const achievements = generateAchievements()

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 pt-20 md:pt-20 pb-20 md:pb-0">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-6">
              {/* Profile image and name */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background mb-4">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl || "/placeholder.svg"}
                      alt={profile.username}
                      layout="fill"
                      objectFit="cover"
                      className="hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-4xl">
                      {profile.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold">{profile.name || profile.username}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>

                {/* Edit profile button */}
                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setEditingTagline(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <Separator />

              {/* Bio/Tagline */}
              <div className="space-y-2">
                {editingTagline ? (
                  <div className="space-y-2">
                    <Input
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Add a short tagline about yourself"
                      maxLength={100}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTagline(profile.tagline || "")
                          setEditingTagline(false)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={updateProfile} disabled={savingTagline}>
                        {savingTagline && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">{profile.tagline || profile.bio || "No bio set. Edit to add one."}</p>
                )}
              </div>

              <Separator />

              {/* Contact/Location info */}
              <div className="space-y-3">
                {profile.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {profile.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.company}</span>
                  </div>
                )}

                {profile.blog && (
                  <div className="flex items-center gap-2 text-sm">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-primary"
                    >
                      {profile.blog}
                    </a>
                  </div>
                )}

                {profile.twitterUsername && (
                  <div className="flex items-center gap-2 text-sm">
                    <Twitter className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`https://twitter.com/${profile.twitterUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-primary"
                    >
                      @{profile.twitterUsername}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`https://github.com/${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-primary"
                  >
                    {profile.username}
                  </a>
                </div>
              </div>

              <Separator />

              {/* Profile stats */}
              <ProfileStats
                stats={{
                  repos: profile.publicRepos || 0,
                  followers: profile.followers || 0,
                  following: profile.following || 0,
                  stars: profile.repos?.reduce((sum: number, repo: any) => sum + (repo.stars || 0), 0) || 0,
                }}
              />

              {/* Profile completion */}
              <ProfileCompletion
                completionPercentage={completionPercentage}
                items={[
                  { name: "Add profile picture", completed: !!profile.avatarUrl },
                  { name: "Add tagline", completed: !!profile.tagline, action: () => setEditingTagline(true) },
                  { name: "Add location", completed: !!profile.location },
                  { name: "Add bio", completed: !!profile.bio },
                  { name: "Connect social accounts", completed: !!profile.twitterUsername },
                ]}
                className="mt-6"
              />
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="repositories">Repositories</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Contribution graph */}
              <ContributionGraph />

              {/* Languages */}
              {profile.languages && profile.languages.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Code className="h-5 w-5 mr-2" />
                      Top Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((lang: string) => (
                        <Badge key={lang} className={getLanguageColor(lang)}>
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Popular repositories */}
              {profile.repos && profile.repos.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Popular Repositories
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.repos
                      .sort((a: any, b: any) => (b.stars || 0) - (a.stars || 0))
                      .slice(0, 4)
                      .map((repo: any, index: number) => (
                        <RepositoryCard
                          key={index}
                          repo={{
                            name: repo.name,
                            url: repo.url,
                            description: repo.description,
                            stars: repo.stars,
                            forks: repo.forks,
                            watchers: repo.watchers,
                            language: repo.language,
                            isPublic: true,
                          }}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Organizations */}
              {profile.organizations && profile.organizations.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2" />
                      Organizations
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {profile.organizations.map((org: any, index: number) => (
                        <a
                          key={index}
                          href={`https://github.com/${org.login}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="relative w-10 h-10 rounded-md overflow-hidden">
                            <Image
                              src={org.avatarUrl || "/placeholder.svg"}
                              alt={org.login}
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">{org.login}</div>
                            {org.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1">{org.description}</div>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Achievements */}
              {achievements.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Achievements
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {achievements.map((achievement, index) => (
                        <AchievementBadge
                          key={index}
                          icon={achievement.icon}
                          name={achievement.name}
                          description={achievement.description}
                          color={achievement.color}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="repositories" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.repos &&
                  profile.repos.map((repo: any, index: number) => (
                    <RepositoryCard
                      key={index}
                      repo={{
                        name: repo.name,
                        url: repo.url,
                        description: repo.description,
                        stars: repo.stars,
                        forks: repo.forks,
                        watchers: repo.watchers,
                        language: repo.language,
                        isPublic: true,
                      }}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6 mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Your Achievements</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex flex-col items-center text-center gap-2">
                        <AchievementBadge
                          icon={achievement.icon}
                          name={achievement.name}
                          description={achievement.description}
                          color={achievement.color}
                          size="lg"
                        />
                        <span className="text-sm font-medium">{achievement.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
