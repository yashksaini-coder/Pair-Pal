"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { User, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
        <div className="flex items-center p-4 border-b">
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
                const isCurrentUser = message.senderId._id === session?.user?.id
                const time = formatDistanceToNow(new Date(message.createdAt), {
                  addSuffix: true,
                });
                
                return (
                  <div
                    key={message._id}
                    className={cn(
                      "flex",
                      isCurrentUser ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className="flex items-end gap-2 max-w-[80%]">
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
                      
                      <div
                        className={cn(
                          "rounded-lg p-3",
                          isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p>{message.content}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            isCurrentUser
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {time}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        
        {/* Message input */}
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" disabled={sending || !newMessage.trim()}>
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