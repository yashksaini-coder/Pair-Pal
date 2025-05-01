"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { User, Loader2, Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { LinkPreview } from "@/components/ui/link-preview";
import { cn } from "@/lib/utils";

// Helper to extract URLs from text
function extractUrls(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
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
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagePollingInterval = useRef<NodeJS.Timeout | null>(null);
  
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
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
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
        setMessages(data.messages);
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
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? data.message : msg
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
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-medium">{user.username}</h2>
            {user.tagline && (
              <p className="text-xs text-muted-foreground">{user.tagline}</p>
            )}
          </div>
        </div>
        
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
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
                
                return (
                  <div
                    key={message._id}
                    className={cn(
                      "flex flex-col gap-2",
                      isCurrentUser ? "items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-end gap-2 max-w-[80%] group">
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
                          <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 max-w-[80%]">
                        {message.reactions.map((reaction: any, index: number) => (
                          <button
                            key={`${reaction.userId._id}-${reaction.emoji}-${index}`}
                            onClick={() => handleReaction(message._id, reaction.emoji)}
                            className={cn(
                              "rounded-full px-2 py-1 text-xs flex items-center gap-1 transition-colors",
                              "hover:bg-muted/80",
                              reaction.userId._id === session?.user?.id && "bg-muted"
                            )}
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-muted-foreground">
                              {reaction.userId.username}
                            </span>
                          </button>
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
        <form onSubmit={sendMessage} className="p-4 border-t bg-background">
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
            <Button type="submit" size="icon" disabled={sending}>
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