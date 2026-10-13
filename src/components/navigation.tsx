"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Menu, MessageSquareDot, X, User, Users, MessageCircle, Settings, Github, Bell } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoutButton } from "@/components/auth-buttons"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const routes = [
  {
    label: "Swipe",
    href: "/swipe",
    icon: Users,
    description: "Find new coding partners",
  },
  {
    label: "Matches",
    href: "/matches",
    icon: MessageCircle,
    description: "View your matches",
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
    description: "Manage your profile",
  },
]

export function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [menuState, setMenuState] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [notifications, setNotifications] = useState(3) // Mock notification count

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuState(false)
  }, [pathname])

  if (pathname === "/") return null

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className={cn(
          "fixed z-20 w-full px-2 group transition-all duration-300",
          isScrolled && "backdrop-blur-md bg-background/80 border-b",
        )}
      >
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" aria-label="PairPal home" className="flex items-center space-x-2">
                <MessageSquareDot className="text-primary" />
                <span className="text-xl font-bold">PairPal</span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {routes.map((route) => {
                const active =
                  route.href === "/matches"
                    ? pathname === "/matches" || pathname.startsWith("/chat")
                    : pathname === route.href
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    )}
                  >
                    <route.icon className="h-4 w-4" />
                    <span>{route.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Desktop right section */}
            <div className="hidden md:flex items-center gap-2">
              {status === "authenticated" && (
                <>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications > 0 && (
                      <Badge
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                        variant="destructive"
                      >
                        {notifications}
                      </Badge>
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={session.user.image || "/placeholder.svg"} alt={session.user.name} />
                          <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{session.user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">@{session.user.username}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href={`https://github.com/${session.user.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer"
                        >
                          <Github className="mr-2 h-4 w-4" />
                          <span>GitHub Profile</span>
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <LogoutButton />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              <ThemeToggle />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuState(!menuState)}
              aria-label={menuState ? "Close Menu" : "Open Menu"}
              className="relative z-20 -m-2.5 block cursor-pointer p-2.5 md:hidden"
            >
              <Menu className={cn("h-6 w-6 transition-all duration-200", menuState && "opacity-0 rotate-90 scale-0")} />
              <X
                className={cn(
                  "absolute inset-0 m-auto h-6 w-6 transition-all duration-200",
                  !menuState && "opacity-0 -rotate-90 scale-0",
                )}
              />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "fixed inset-0 z-10 bg-background/80 backdrop-blur-md transition-all duration-300",
            menuState ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none",
          )}
        >
          <div className="flex flex-col h-full pt-16 pb-6 px-6">
            {status === "authenticated" && (
              <div className="flex items-center gap-3 py-4 border-b mb-6">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.user.image || "/placeholder.svg"} alt={session.user.name} />
                  <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">@{session.user.username}</p>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {routes.map((route) => {
                const active =
                  route.href === "/matches"
                    ? pathname === "/matches" || pathname.startsWith("/chat")
                    : pathname === route.href
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    <div className="flex flex-col">
                      <span>{route.label}</span>
                      <span className="text-xs text-muted-foreground">{route.description}</span>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
