"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MatchCardProps {
  match: {
    id: string;
    createdAt: string;
  };
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
    tagline?: string;
    languages?: string[];
    location?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
  };
}

export function MatchCard({ match, user, lastMessage }: MatchCardProps) {
  const matchDate = new Date(match.createdAt);
  const timeAgo = formatDistanceToNow(matchDate, { addSuffix: true });
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.username}
                layout="fill"
                objectFit="cover"
              />
            ) : (
              <User className="w-full h-full p-2 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium truncate">{user.username}</h3>
            
            {user.tagline ? (
              <p className="text-sm text-muted-foreground truncate">
                {user.tagline}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Matched {timeAgo}
              </p>
            )}
            
            {lastMessage && (
              <p className="text-sm truncate mt-1">
                {lastMessage.content}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link href={`/chat/${match.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            {lastMessage ? "View Chat" : "Start Chat"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}