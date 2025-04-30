"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, MapPin, Code, Edit, Building, Building2, Eye, FileCode, GitFork, Link, Twitter, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getLanguageColor } from "@/components/language-badge";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tagline, setTagline] = useState("");
  const [editingTagline, setEditingTagline] = useState(false);
  const [savingTagline, setSavingTagline] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);
  
  // Fetch profile data
  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);
  
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/github/profile");
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setProfile(data.user);
        setTagline(data.user.tagline || "");
      }
    } catch (err) {
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };
  
  const updateProfile = async () => {
    setSavingTagline(true);
    try {
      const res = await fetch("/api/github/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tagline }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setProfile(data.user);
        setEditingTagline(false);
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSavingTagline(false);
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
      <div className="container mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={fetchProfile}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="container mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">We need to fetch your GitHub profile data.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => updateProfile()}>
              Import GitHub Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-3xl px-2 py-2">
      <Card className="mb-6">
        <CardHeader className="relative">
          <div className="absolute inset-0 h-32 bg-gradient-to-r from-primary/20 to-primary/10 rounded-t-lg"></div>
          <div className="relative z-10 flex flex-col items-center pt-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-background">
              {profile.avatarUrl ? (
                <Image 
                  src={profile.avatarUrl} 
                  alt={profile.username} 
                  layout="fill" 
                  objectFit="cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-2xl">
                  {profile.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <CardTitle className="mt-4 text-2xl">
              {profile.name || profile.username}
            </CardTitle>
            <div className="text-sm text-muted-foreground">@{profile.username}</div>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-2">
              {profile.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin size={14} />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.company && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Building2 size={14} />
                  <span>{profile.company}</span>
                </div>
              )}
              {profile.blog && (
                <a 
                  href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                >
                  <Link size={14} />
                  <span>Website</span>
                </a>
              )}
              {profile.twitterUsername && (
                <a 
                  href={`https://twitter.com/${profile.twitterUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                >
                  <Twitter size={14} />
                  <span>@{profile.twitterUsername}</span>
                </a>
              )}
            </div>

            {/* GitHub Stats */}
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{profile.followers} followers</span>
              </div>
              <div className="flex items-center gap-1">
                <UserPlus size={14} />
                <span>{profile.following} following</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork size={14} />
                <span>{profile.publicRepos} repos</span>
              </div>
              <div className="flex items-center gap-1">
                <FileCode size={14} />
                <span>{profile.publicGists} gists</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          {/* Tagline */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Tagline</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setEditingTagline(!editingTagline)}
              >
                <Edit size={14} className="mr-1" />
                Edit
              </Button>
            </div>
            
            {editingTagline ? (
              <div className="space-y-2">
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Add a short tagline about yourself (e.g., React dev seeking AI collaborators)"
                  maxLength={100}
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setTagline(profile.tagline || "");
                      setEditingTagline(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={updateProfile}
                    disabled={savingTagline}
                  >
                    {savingTagline && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                {profile.tagline || "No tagline set. Edit to add one."}
              </p>
            )}
          </div>
          
          <Separator />
          
          {/* Bio */}
          {profile.bio && (
            <>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Bio</h3>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
              
              <Separator />
            </>
          )}
          
          {/* Languages */}
          {profile.languages && profile.languages.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Code size={16} />
                <h3 className="text-sm font-medium">Top Languages</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang: string) => (
                  <Badge key={lang} className={getLanguageColor(lang)}>
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Organizations */}
          {profile.organizations && profile.organizations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                <Building size={16} />
                <h3 className="text-sm font-medium">Organizations</h3>
              </div>
              <div className="flex flex-wrap gap-4">
                {profile.organizations.map((org: any) => (
                  <a
                    key={org.login}
                    href={`https://github.com/${org.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative w-8 h-8 rounded-md overflow-hidden">
                      <Image
                        src={org.avatarUrl}
                        alt={org.login}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{org.login}</div>
                      {org.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {org.description}
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {/* Repositories */}
          {profile.repos && profile.repos.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Top Repositories</h3>
              <div className="space-y-3">
                {profile.repos.map((repo: any) => (
                  <div 
                    key={repo.name} 
                    className="rounded-lg border p-3 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <a 
                        href={repo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        {repo.name}
                      </a>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {repo.stars > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {repo.stars}
                          </div>
                        )}
                        {repo.forks > 0 && (
                          <div className="flex items-center gap-1">
                            <GitFork className="h-4 w-4" />
                            {repo.forks}
                          </div>
                        )}
                        {repo.watchers > 0 && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {repo.watchers}
                          </div>
                        )}
                      </div>
                    </div>
                    {repo.description && (
                      <p className="text-sm text-muted-foreground">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {repo.language && (
                        <Badge 
                          variant="outline" 
                          className={getLanguageColor(repo.language)}
                        >
                          {repo.language}
                        </Badge>
                      )}
                      {repo.topics && repo.topics.map((topic: string) => (
                        <Badge 
                          key={topic}
                          variant="outline"
                          className="bg-primary/10"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Star(props: React.SVGProps<SVGSVGElement>) {
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}