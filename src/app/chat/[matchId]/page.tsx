"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { User, Loader2, Send, Smile, ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { LinkPreview } from "@/components/link-preview";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Group reactions by emoji
function groupReactions(reactions: any[]) {
  return reactions.reduce((acc, reaction) => {
    const key = reaction.emoji;
    if (!acc[key]) {
      acc[key] = { emoji: key, count: 0, users: [] };
    }
    acc[key].count++;
    acc[key].users.push(reaction.userId);
    return acc;
  }, {});
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  
  const [matchData, setMatchData] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagePollingInterval = useRef<NodeJS.Timeout | null>(null);
  const lastMessageRef = useRef<string | null>(null);
  
  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);
  
  // Fetch match data and messages
  useEffect(() => {
    if (status === "authenticated" && matchId) {
      fetchMatchData();
      fetchMessages();
      
      // Poll for new messages every 5 seconds
      messagePollingInterval.current = setInterval(fetchMessages, 2000);
      
      return () => {
        if (messagePollingInterval.current) {
          clearInterval(messagePollingInterval.current);
        }
      };
    }
  }, [status, matchId]);
  
  // Handle scrolling
  useEffect(() => {
    if (scrollRef.current && shouldScrollToBottom) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldScrollToBottom]);

  // Check if user has scrolled up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isScrolledToBottom = 
      Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 50;
    setShouldScrollToBottom(isScrolledToBottom);
  };
  
  const fetchMatchData = async () => {
    try {
      const res = await fetch("/api/matches");
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        // Find the specific match
        const match = data.matches.find((m: any) => m.match.id === matchId);
        
        if (match) {
          setMatchData(match);
        } else {
          setError("Match not found");
        }
      }
    } catch (err) {
      setError("Failed to load match data");
    }
  };
  
  const fetchMessages = async () => {
    if (!matchId) return;
    
    try {
      const res = await fetch(`/api/messages?matchId=${matchId}`);
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        // Check if there are new messages
        const lastMessage = data.messages[data.messages.length - 1];
        const hasNewMessages = lastMessage?._id !== lastMessageRef.current;
        
        if (hasNewMessages) {
          setMessages(data.messages);
          lastMessageRef.current = lastMessage?._id;
          
          // Only auto-scroll if we're already at the bottom or it's our message
          if (shouldScrollToBottom || lastMessage?.senderId._id === session?.user?.id) {
            setShouldScrollToBottom(true);
          }
        }
      }
    } catch (err) {
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };
  
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !matchId) return;
    
    setSending(true);
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
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      }
    } catch (err) {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

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
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        // Update the specific message with new reaction data
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId ? {
              ...msg,
              reactions: data.message.reactions
            } : msg
          )
        );
      }
    } catch (err) {
      setError("Failed to add reaction");
    }
  };
  
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-4 text-red-500">Error</h2>
        <p className="mb-4">{error}</p>
        <Button onClick={() => router.push("/matches")}>
          Back to Matches
        </Button>
      </div>
    );
  }
  
  if (!matchData) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-4">Match Not Found</h2>
        <p className="text-muted-foreground mb-6">
          This match does not exist or you don't have access to it.
        </p>
        <Button onClick={() => router.push("/matches")}>
          Back to Matches
        </Button>
      </div>
    );
  }
  
  const { user } = matchData;
  
  return (
    <div className="container mx-auto max-w-2xl">
      <div className="flex flex-col h-[calc(100vh-12rem)]">
        {/* Chat header */}
        <div className="flex items-center p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
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
          <div className="flex-1">
            <h2 className="font-medium">{user.username}</h2>
            {user.tagline && (
              <p className="text-xs text-muted-foreground">{user.tagline}</p>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push("/matches")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" onScroll={handleScroll}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No messages yet. Say hello to start the conversation!
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.senderId._id === session?.user?.id;
                const time = formatDistanceToNow(new Date(message.createdAt), {
                  addSuffix: true,
                });
                
                const groupedReactions = groupReactions(message.reactions || []);
                
                return (
                  <div
                    key={message._id}
                    className={cn(
                      "flex flex-col gap-2",
                      isCurrentUser ? "items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "flex items-end gap-2 group",
                      isCurrentUser ? "flex-row-reverse" : "flex-row",
                      "max-w-[80%]"
                    )}>
                      {!isCurrentUser && (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          {message.senderId.avatarUrl ? (
                            <Image
                              src={message.senderId.avatarUrl}
                              alt={message.senderId.username}
                              layout="fill"
                              objectFit="cover"
                            />
                          ) : (
                            <User className="w-full h-full p-1 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div
                          className={cn(
                            "rounded-lg p-3 relative group",
                            isCurrentUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          <p>{message.content}</p>
                          <div className={cn(
                            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
                            isCurrentUser ? "-left-10" : "-right-10"
                          )}>
                            <EmojiPicker 
                              onEmojiSelect={(emoji: any) => 
                                handleReaction(message._id, emoji.native)
                              } 
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
                      </div>
                    </div>

                    {/* Reactions */}
                    {Object.values(groupedReactions).length > 0 && (
                      <div className={cn(
                        "flex flex-wrap gap-1",
                        isCurrentUser ? "justify-end" : "justify-start",
                        "max-w-[80%]"
                      )}>
                        {Object.values(groupedReactions).map((reaction: any) => (
                          <TooltipProvider key={reaction.emoji}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleReaction(message._id, reaction.emoji)}
                                  className={cn(
                                    "rounded-full px-2 py-1 text-xs flex items-center gap-1 transition-colors",
                                    "hover:bg-muted/80",
                                    reaction.users.some((u: any) => u._id === session?.user?.id) && "bg-muted"
                                  )}
                                >
                                  <span>{reaction.emoji}</span>
                                  <span className="text-muted-foreground">
                                    {reaction.count}
                                  </span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {reaction.users
                                  .map((u: any) => u.username)
                                  .join(", ")}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    )}

                    <span
                      className={cn(
                        "text-xs text-muted-foreground",
                        isCurrentUser ? "text-right" : "text-left"
                      )}
                    >
                      {time}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        
        {/* Message input */}
        <form onSubmit={sendMessage} className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            <EmojiPicker
              onEmojiSelect={(emoji: any) => {
                setNewMessage((prev) => prev + emoji.native);
              }}
            />
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={sending}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={sending || !newMessage.trim()}
              className={cn(
                "transition-transform",
                newMessage.trim() && "hover:scale-105"
              )}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}