"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Github, Instagram, Linkedin, Moon, Sun, Twitter } from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"


function FooterSection() {
  const [isDarkMode, setIsDarkMode] = React.useState(true)
  const [isChatOpen, setIsChatOpen] = React.useState(false)

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 lg:gap-32 md:grid-cols-1 lg:grid-cols-2">
          <div className="relative order-2 lg:order-2 flex lg:justify-end">
            <div className="max-w-md w-full">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">Stay Connected</h2>
              <p className="mb-6 text-muted-foreground">
                We are a community of people who are passionate about helping each other.
              </p>
              <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
            </div>
          </div>
          <div className="relative order-1 lg:order-1">
            <h3 className="mb-4 text-lg font-semibold">Follow on</h3>
            <div className="mb-6 flex space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Github className="h-4 w-4" />
                      <span className="sr-only">GitHub</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <a href="https://github.com/yashksaini-coder" target="_blank" rel="noreferrer">@yashksaini-coder</a>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <a href="https://x.com/yash_k_saini" target="_blank" rel="noreferrer">@yash_k_saini</a>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <a href="https://www.instagram.com/yashksaini.codes/" target="_blank" rel="noreferrer">@yashksaini.codes</a>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Linkedin className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <a href="https://www.linkedin.com/in/yashksaini/" target="_blank" rel="noreferrer">@yashksaini</a>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="md:mt-4 mt-8 text-xs md:text-sm text-muted-foreground flex md:flex-row flex-col md:gap-0 gap-2 items-center justify-between">
              <div className="space-y-2">
                <p>
                  Build in public by{" "}
                  <a
                    href="https://x.com/yash_k_saini"
                    className="text-primary font-medium hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    @yash_k_saini
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export { FooterSection }