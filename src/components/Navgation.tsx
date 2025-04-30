"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Users, MessageCircle, Home } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/auth-buttons";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();
  
  const routes = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      active: pathname === "/",
    },
    {
      label: "Swipe",
      href: "/swipe",
      icon: Users,
      active: pathname === "/swipe",
    },
    {
      label: "Matches",
      href: "/matches",
      icon: MessageCircle,
      active: pathname === "/matches" || pathname.startsWith("/chat"),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
      active: pathname === "/profile",
    },
  ];
  
  return (
    <header className="border-b">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">DevSync</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors",
                route.active ? 
                  "text-foreground" : 
                  "text-muted-foreground hover:text-foreground"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
      
      {/* Mobile bottom navigation */}
      <div className="block md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="flex justify-around items-center h-16">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                route.active ? 
                  "text-primary" : 
                  "text-muted-foreground"
              )}
            >
              <route.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{route.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

function Github(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}