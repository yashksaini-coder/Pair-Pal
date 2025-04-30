"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { User, MapPin, Code, Star, PanelRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface SwipeCardProps {
  profile: {
    _id: string;
    username: string;
    avatarUrl?: string;
    tagline?: string;
    languages: string[];
    repos: Array<{
      name: string;
      url: string;
      description?: string;
      stars?: number;
      language?: string;
    }>;
    location?: string;
    score?: number;
  };
  onSwipe: (id: string, liked: boolean) => void;
}

export function SwipeCard({ profile, onSwipe }: SwipeCardProps) {
  const [exitX, setExitX] = useState<number>(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const likeOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1]);
  const nopeOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0]);
  
  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      setExitX(200);
      onSwipe(profile._id, true);
    } else if (info.offset.x < -100) {
      setExitX(-200);
      onSwipe(profile._id, false);
    }
  };
  
  const featuredRepos = profile.repos.slice(0, 2);
  
  return (
    <motion.div
      className="absolute top-0 left-0 right-0 w-full max-w-md mx-auto"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="w-full h-[560px] overflow-hidden relative">
        {/* Like/Nope Indicators */}
        <motion.div 
          className="absolute top-8 right-8 bg-green-500 text-white font-bold py-1 px-4 rounded-full transform rotate-12 z-10"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </motion.div>
        <motion.div 
          className="absolute top-8 left-8 bg-red-500 text-white font-bold py-1 px-4 rounded-full transform -rotate-12 z-10"
          style={{ opacity: nopeOpacity }}
        >
          NOPE
        </motion.div>
        
        {/* Profile content */}
        <div className="flex flex-col h-full">
          {/* Avatar and basic info */}
          <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/30">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-card bg-card">
                {profile.avatarUrl ? (
                  <Image 
                    src={profile.avatarUrl} 
                    alt={profile.username} 
                    layout="fill" 
                    objectFit="cover"
                  />
                ) : (
                  <User className="w-full h-full p-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>
          
          <CardContent className="flex-1 pt-16 pb-4 text-center">
            <h2 className="text-2xl font-bold mb-1">{profile.username}</h2>
            
            {profile.tagline && (
              <p className="text-muted-foreground mb-3">{profile.tagline}</p>
            )}
            
            {profile.location && (
              <div className="flex items-center justify-center gap-1 mb-3 text-sm text-muted-foreground">
                <MapPin size={14} />
                <span>{profile.location}</span>
              </div>
            )}
            
            {profile.score !== undefined && (
              <div className="mb-3 flex justify-center">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs px-2 py-1",
                    profile.score >= 80 ? "bg-green-500/10 text-green-600 dark:text-green-400" : 
                    profile.score >= 60 ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : 
                    profile.score >= 40 ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" : 
                    "bg-muted"
                  )}
                >
                  {profile.score}% Match
                </Badge>
              </div>
            )}
            
            {profile.languages.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2 flex items-center justify-center gap-1">
                  <Code size={14} />
                  <span>Top Languages</span>
                </h3>
                <div className="flex flex-wrap justify-center gap-1">
                  {profile.languages.slice(0, 5).map((lang) => (
                    <Badge key={lang} variant="secondary" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {featuredRepos.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center justify-center gap-1">
                  <PanelRight size={14} />
                  <span>Featured Repos</span>
                </h3>
                <div className="space-y-2">
                  {featuredRepos.map((repo) => (
                    <div 
                      key={repo.name} 
                      className="bg-muted/50 rounded p-2 text-left"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm truncate">
                          {repo.name}
                        </h4>
                        {repo.stars !== undefined && repo.stars > 0 && (
                          <div className="flex items-center text-xs text-yellow-500">
                            <Star size={12} className="mr-1" />
                            {repo.stars}
                          </div>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {repo.description}
                        </p>
                      )}
                      {repo.language && (
                        <Badge 
                          variant="outline" 
                          className="mt-2 text-xs px-1 py-0"
                        >
                          {repo.language}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center gap-8 py-4 border-t">
            <Button 
              onClick={() => {
                setExitX(-200);
                onSwipe(profile._id, false);
              }}
              size="lg" 
              variant="outline" 
              className="rounded-full w-12 h-12 p-0 bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:text-red-500"
            >
              ✕
            </Button>
            <Button 
              onClick={() => {
                setExitX(200);
                onSwipe(profile._id, true);
              }}
              size="lg" 
              className="rounded-full w-12 h-12 p-0 bg-green-500 hover:bg-green-600"
            >
              ✓
            </Button>
          </CardFooter>
        </div>
      </Card>
    </motion.div>
  );
}