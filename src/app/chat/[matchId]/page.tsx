"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import {
  User,
  Loader2,
  Send,
  ArrowLeft,
  Phone,
  Video,
  Info,
  MoreVertical,
  Paperclip,
  Mic,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EmojiPicker } from "@/components/ui/emoji-picker"
import { LinkPreview } from "@/components/link-preview"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageStatus } from "@/components/message-status"
import { UserStatus } from "@/components/user-status"
import { cn } from "@/lib/utils"

// Group reactions by emoji
function groupReactions(reactions: any[]) {
  return reactions.reduce((acc, reaction) => {
    const key = reaction.emoji
    if (!acc[key]) {
      acc[key] = { emoji: key, count: 0, users: [] }
    }
    acc[key].count++
    acc[key].users.push(reaction.userId)
    return acc
  }, {})
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const matchId = params.matchId as string

  const [matchData, setMatchData] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true)
  const [userStatus, setUserStatus] = useState<"online" | "offline" | "away" | "busy">("offline")
  const [isTyping, setIsTyping] = useState(false)
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const messagePollingInterval = useRef<NodeJS.Timeout | null>(null)
  const lastMessageRef = useRef<string | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Fetch match data and messages
  useEffect(() => {
    if (status === "authenticated" && matchId) {
      fetchMatchData()
      fetchMessages()

      // Poll for new messages every 2 seconds
      messagePollingInterval.current = setInterval(fetchMessages, 2000)

      // Simulate user coming online after a delay
      setTimeout(() => {
        setUserStatus("online")
      }, 3000)

      return () => {
        if (messagePollingInterval.current) {
          clearInterval(messagePollingInterval.current)
        }
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
    }
  }, [status, matchId])

  // Handle scrolling
  useEffect(() => {
    if (scrollRef.current && shouldScrollToBottom) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, shouldScrollToBottom])

  // Check if user has scrolled up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const isScrolledToBottom = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 50
    setShouldScrollToBottom(isScrolledToBottom)
  }

  // Simulate typing indicator
  const simulateTypingIndicator = () => {
    // Only show typing indicator if the other user is online
    if (userStatus === "online" && Math.random() > 0.7) {
      setIsTyping(true)

      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set a timeout to hide the typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
      }, 3000)
    }
  }

  const fetchMatchData = async () => {
    try {
      const res = await fetch("/api/matches")
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        // Find the specific match
        const match = data.matches.find((m: any) => m.match.id === matchId)

        if (match) {
          setMatchData(match)
        } else {
          setError("Match not found")
        }
      }
    } catch (err) {
      setError("Failed to load match data")
    }
  }

  const fetchMessages = async () => {
    if (!matchId) return

    try {
      const res = await fetch(`/api/messages?matchId=${matchId}`)
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        // Check if there are new messages
        const lastMessage = data.messages[data.messages.length - 1]
        const hasNewMessages = lastMessage?._id !== lastMessageRef.current

        if (hasNewMessages) {
          setMessages(data.messages)
          lastMessageRef.current = lastMessage?._id

          // Only auto-scroll if we're already at the bottom or it's our message
          if (shouldScrollToBottom || lastMessage?.senderId.username === session?.user?.username) {
            setShouldScrollToBottom(true)
          }

          // If the new message is from the other user, simulate typing for the next response
          if (lastMessage?.senderId.username !== session?.user?.username) {
            simulateTypingIndicator()
          }
        }
      }
    } catch (err) {
      setError("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !matchId) return

    setSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId,
          content: newMessage,
        }),
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setMessages((prev) => [...prev, data.message])
        setNewMessage("")

        // Simulate typing indicator from the other user
        simulateTypingIndicator()
      }
    } catch (err) {
      setError("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const res = await fetch("/api/messages", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          emoji,
        }),
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        // Update the specific message with new reaction data
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  reactions: data.message.reactions,
                }
              : msg,
          ),
        )
      }
    } catch (err) {
      setError("Failed to add reaction")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10 pt-20 md:pt-20 pb-20 md:pb-0 ">
        <h2 className="text-xl font-semibold mb-4 text-red-500">Error</h2>
        <p className="mb-4">{error}</p>
        <Button onClick={() => router.push("/matches")}>Back to Matches</Button>
      </div>
    )
  }

  if (!matchData) {
    return (
      <div className="text-center py-10 pt-20 md:pt-20 pb-20 md:pb-0">
        <h2 className="text-xl font-semibold mb-4">Match Not Found</h2>
        <p className="text-muted-foreground mb-6">This match does not exist or you don't have access to it.</p>
        <Button onClick={() => router.push("/matches")}>Back to Matches</Button>
      </div>
    )
  }

  const { user } = matchData

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  return (
    <div className="container mx-auto max-w-4xl pt-20 md:pt-20 pb-20 md:pb-0">
      <div className="flex flex-col h-[calc(100vh-12rem)] border rounded-lg shadow-sm overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => router.push("/matches")} className="mr-2 md:hidden">
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="relative">
              <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl || "/placeholder.svg"}
                    alt={user.username}
                    layout="fill"
                    objectFit="cover"
                    className="hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                )}
              </div>
              <UserStatus status={userStatus} className="absolute bottom-0 right-0 translate-x-1" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-medium truncate">{user.username}</h2>
                {isTyping && <span className="text-xs text-muted-foreground animate-pulse">typing...</span>}
              </div>
              {user.tagline && <p className="text-xs text-muted-foreground truncate">{user.tagline}</p>}
              {!user.tagline && <UserStatus status={userStatus} showLabel className="mt-0.5" />}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Voice call</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <Video className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Video call</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View profile</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="md:hidden">
                  <Phone className="h-4 w-4 mr-2" />
                  Voice call
                </DropdownMenuItem>
                <DropdownMenuItem className="md:hidden">
                  <Video className="h-4 w-4 mr-2" />
                  Video call
                </DropdownMenuItem>
                <DropdownMenuItem className="md:hidden">
                  <Info className="h-4 w-4 mr-2" />
                  View profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  View profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to matches
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" onScroll={handleScroll}>
          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No messages yet. Say hello to start the conversation!</p>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([date, messagesForDate]) => (
                <div key={date} className="space-y-4">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t"></div>
                    </div>
                    <div className="relative bg-background px-2 text-xs text-muted-foreground">
                      {new Date(date).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  {(messagesForDate as any[]).map((message) => {
                    const isCurrentUser = session?.user?.username === message.senderId.username
                    const time = format(new Date(message.createdAt), "h:mm a")
                    const groupedReactions = groupReactions(message.reactions || [])

                    // Determine message status
                    let messageStatus: "sending" | "sent" | "delivered" | "read" = "sent"
                    if (isCurrentUser) {
                      if (sending && message._id === messages[messages.length - 1]?._id) {
                        messageStatus = "sending"
                      } else if (message.reactions && message.reactions.length > 0) {
                        messageStatus = "read"
                      } else {
                        messageStatus = "delivered"
                      }
                    }

                    return (
                      <div
                        key={message._id}
                        className={cn("flex flex-col gap-1", isCurrentUser ? "items-end" : "items-start")}
                      >
                        <div
                          className={cn(
                            "flex items-end gap-2 group max-w-[80%]",
                            isCurrentUser ? "flex-row-reverse" : "flex-row",
                          )}
                        >
                          {!isCurrentUser && (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden">
                              {message.senderId.avatarUrl ? (
                                <Image
                                  src={message.senderId.avatarUrl || "/placeholder.svg"}
                                  alt={message.senderId.username}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              ) : (
                                <User className="w-full h-full p-1 text-muted-foreground" />
                              )}
                            </div>
                          )}

                          <div className="space-y-1 max-w-full">
                            {!isCurrentUser && <p className="text-xs font-medium ml-1">{message.senderId.username}</p>}
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-2 relative group",
                                isCurrentUser
                                  ? "bg-primary text-primary-foreground rounded-tr-none"
                                  : "bg-muted rounded-tl-none",
                              )}
                            >
                              <p className="break-words">{message.content}</p>
                              <div
                                className={cn(
                                  "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
                                  isCurrentUser ? "-left-10" : "-right-10",
                                )}
                              >
                                <EmojiPicker
                                  onEmojiSelect={(emoji: any) => handleReaction(message._id, emoji.native)}
                                />
                              </div>
                            </div>

                            {/* Link Preview */}
                            {message.linkPreview && (
                              <LinkPreview
                                url={message.linkPreview.url}
                                title={message.linkPreview.title}
                                description={message.linkPreview.description}
                                image={message.linkPreview.image}
                              />
                            )}

                            {/* Time and status */}
                            <div
                              className={cn(
                                "flex items-center gap-1 text-xs text-muted-foreground",
                                isCurrentUser ? "justify-end" : "justify-start",
                              )}
                            >
                              <span>{time}</span>
                              {isCurrentUser && <MessageStatus status={messageStatus} />}
                            </div>
                          </div>
                        </div>

                        {/* Reactions */}
                        {Object.values(groupedReactions).length > 0 && (
                          <div
                            className={cn(
                              "flex flex-wrap gap-1",
                              isCurrentUser ? "justify-end" : "justify-start",
                              "max-w-[80%]",
                            )}
                          >
                            {Object.values(groupedReactions).map((reaction: any) => (
                              <TooltipProvider key={reaction.emoji}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => handleReaction(message._id, reaction.emoji)}
                                      className={cn(
                                        "rounded-full px-2 py-1 text-xs flex items-center gap-1.5 transition-all",
                                        "hover:bg-primary/10",
                                        reaction.users.some((u: any) => u.username === session?.user?.username)
                                          ? "bg-primary/15"
                                          : "bg-muted/50",
                                      )}
                                    >
                                      <span>{reaction.emoji}</span>
                                      <span className="text-muted-foreground">{reaction.count}</span>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {reaction.users.map((u: any) => u.username).join(", ")}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl || "/placeholder.svg"}
                      alt={user.username}
                      layout="fill"
                      objectFit="cover"
                    />
                  ) : (
                    <User className="w-full h-full p-1 text-muted-foreground" />
                  )}
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce"
                      style={{ animationDelay: "200ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce"
                      style={{ animationDelay: "400ms" }}
                    ></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Message input */}
        <form
          onSubmit={sendMessage}
          className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <div className="flex items-center gap-2">
            <DropdownMenu open={attachmentMenuOpen} onOpenChange={setAttachmentMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Paperclip className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" alignOffset={5}>
                <DropdownMenuItem>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Paperclip className="h-4 w-4 mr-2" />
                  File
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <EmojiPicker
              onEmojiSelect={(emoji: any) => {
                setNewMessage((prev) => prev + emoji.native)
              }}
            />

            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={sending}
            />

            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 hidden md:flex">
              <Mic className="h-4 w-4" />
            </Button>

            <Button
              type="submit"
              size="icon"
              disabled={sending || !newMessage.trim()}
              className={cn("transition-transform", newMessage.trim() && "hover:scale-105")}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
