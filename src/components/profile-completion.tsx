"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, PlusCircle } from "lucide-react"

interface ProfileCompletionProps {
  completionPercentage: number
  items: {
    name: string
    completed: boolean
    action?: () => void
  }[]
  className?: string
}

export function ProfileCompletion({ completionPercentage, items, className }: ProfileCompletionProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Profile Completion</CardTitle>
        <CardDescription>Complete your profile to improve match quality</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={item.completed ? "text-sm" : "text-sm text-muted-foreground"}>{item.name}</span>
                </div>
                {!item.completed && item.action && (
                  <Button variant="ghost" size="sm" onClick={item.action} className="h-7 px-2">
                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
