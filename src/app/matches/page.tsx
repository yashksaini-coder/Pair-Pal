"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { MatchCard } from "@/components/match-card";

export default function MatchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);
  
  // Fetch matches
  useEffect(() => {
    if (status === "authenticated") {
      fetchMatches();
    }
  }, [status]);
  
  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/matches");
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setMatches(data.matches);
      }
    } catch (err) {
      setError("Failed to load matches");
    } finally {
      setLoading(false);
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
        <Button onClick={fetchMatches}>Try Again</Button>
      </div>
    );
  }
  
  if (matches.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-4">No Matches Yet</h2>
        <p className="text-muted-foreground mb-6">
          You haven't matched with any developers yet. Head over to the Swipe page to find your coding partners!
        </p>
        <Button onClick={() => router.push("/swipe")}>Find Matches</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-2xl px-2">
      <h1 className="text-2xl font-bold mb-6">Your Matches</h1>
      
      <div className="grid gap-4">
        {matches.map((match) => (
          <MatchCard 
            key={match.match.id} 
            match={match.match} 
            user={match.user} 
          />
        ))}
      </div>
    </div>
  );
}

// Import needed component that was referenced
import { Button } from "@/components/ui/button";