"use client";

import React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { User, Users, MessageCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/auth-buttons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
const routes = [
  {
    label: "Swipe",
    href: "/swipe",
    icon: Users,
  },
  {
    label: "Matches",
    href: "/matches",
    icon: MessageCircle,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname === "/") return null;

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-20 w-full px-2 group"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 pb-10 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="PairPal home"
                className="flex items-center space-x-2"
              >
                <Logo />
                <span className="text-xl font-bold">PairPal</span>
              </Link>
              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>
            {/* Desktop menu */}
            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-12 text-sm">
                {routes.map((route) => {
                  const active =
                    route.href === "/matches"
                      ? pathname === "/matches" || pathname.startsWith("/chat")
                      : pathname === route.href;
                  return (
                    <li key={route.href} className="min-w-[100px]">
                      <Link
                        href={route.href}
                        className={cn(
                          "flex items-center justify-center gap-2 text-muted-foreground hover:text-accent-foreground px-4 py-2 rounded-md duration-150 w-full",
                          active && "text-foreground font-semibold bg-accent/10"
                        )}
                      >
                        <route.icon className="h-5 w-5 shrink-0" />
                        <span className="leading-none">{route.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            {/* Desktop right section */}
            <div className="hidden lg:flex items-center gap-2">
              <ThemeToggle />
              <LogoutButton />
            </div>
            {/* Mobile menu */}
            <div className={cn(
              "bg-background group-data-[state=active]:block mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:hidden lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent",
              menuState && "block"
            )}>
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {routes.map((route) => {
                    const active =
                      route.href === "/matches"
                        ? pathname === "/matches" || pathname.startsWith("/chat")
                        : pathname === route.href;
                    return (
                      <li key={route.href}>
                        <Link
                          href={route.href}
                          className={cn(
                            "flex items-center gap-1 text-muted-foreground hover:text-accent-foreground block duration-150",
                            active && "text-foreground"
                          )}
                        >
                          <route.icon className="h-4 w-4" />
                          <span>{route.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <ThemeToggle />
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </nav>
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
