"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwipeCard } from "@/components/swipe-card";
import { MatchNotification } from "@/components/match-notification";

export default function SwipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  
  // Fetch profiles
  useEffect(() => {
    if (status === "authenticated") {
      fetchProfiles();
    }
  }, [status]);
  
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profiles");
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setProfiles(data.profiles);
      }
    } catch (err) {
      setError("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSwipe = async (id: string, liked: boolean) => {
    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetId: id, liked }),
      });
      
      const data = await res.json();
      
      // Check if there's a match
      if (data.matchCreated) {
        // Find the profile that matched
        const matchedProfile = profiles[currentIndex];
        setMatchedUser(matchedProfile);
        setMatchId(data.matchId);
        setShowMatchNotification(true);
      }
      
      // Move to next profile
      setCurrentIndex((prev) => prev + 1);
      
      // If we're running out of profiles, fetch more
      if (currentIndex + 1 >= profiles.length - 2) {
        fetchProfiles();
      }
      
    } catch (err) {
      setError("Failed to record swipe");
    }
  };
  
  const handleViewMatch = () => {
    setShowMatchNotification(false);
    if (matchId) {
      router.push(`/chat/${matchId}`);
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
        <Button onClick={fetchProfiles}>Try Again</Button>
      </div>
    );
  }
  
  if (profiles.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-4">No Profiles Available</h2>
        <p className="text-muted-foreground mb-6">
          We couldn't find any more profiles for you to match with right now.
          Check back later or update your profile to get better matches!
        </p>
        <Link href="/profile">
          <Button>View Your Profile</Button>
        </Link>
      </div>
    );
  }
  
  if (currentIndex >= profiles.length) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-4">No More Profiles</h2>
        <p className="text-muted-foreground mb-6">
          You've seen all available profiles. Check back later for more potential matches!
        </p>
        <Button onClick={fetchProfiles}>Refresh Profiles</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-lg py-10 px-2">
      <h1 className="md:text-2xl font-bold text-center md:mb-8 mb-4">
        Find Your Coding Partner
      </h1>
      
      <div className="relative h-[600px]">
        {profiles.map((profile, index) => (
          <div 
            key={profile._id} 
            className={index === currentIndex ? "block" : "hidden"}
          >
            <SwipeCard 
              profile={profile} 
              onSwipe={handleSwipe} 
            />
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
  );
}