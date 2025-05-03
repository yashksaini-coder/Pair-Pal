"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ContributionGraphProps {
  data?: {
    date: string
    count: number
  }[]
  className?: string
}

export function ContributionGraph({ data = [], className }: ContributionGraphProps) {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear.toString())

  // Memoize graph data to avoid unnecessary recalculations and state updates
  const graphData = useMemo(() => {
    if (data.length > 0) {
      // Use provided data, filtered by year
      const filtered: Record<string, number> = {}
      data.forEach((item) => {
        if (item.date.startsWith(year)) {
          filtered[item.date] = item.count
        }
      })
      return filtered
    } else {
      // Generate mock data for the selected year
      const mock: Record<string, number> = {}
      const yearNum = Number(year)
      const start = new Date(yearNum, 0, 1)
      const end = yearNum === currentYear ? new Date() : new Date(yearNum, 11, 31)
      for (
        let d = new Date(start);
        d <= end;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().split("T")[0]
        // Weighted random for demo
        const rand = Math.random()
        let count = 0
        if (rand > 0.6) count = 1
        if (rand > 0.8) count = 2
        if (rand > 0.92) count = 3
        if (rand > 0.97) count = 4
        mock[dateStr] = count
      }
      return mock
    }
  }, [data, year, currentYear])

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const totalContributions = useMemo(
    () => Object.values(graphData).reduce((sum, count) => sum + count, 0),
    [graphData]
  )

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          {totalContributions} contributions in {year}
        </CardTitle>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder={year} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={currentYear.toString()}>{currentYear}</SelectItem>
            <SelectItem value={(currentYear - 1).toString()}>{currentYear - 1}</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="text-xs flex justify-between mb-1">
          {months.map((month) => (
            <div key={month} className="text-muted-foreground">
              {month}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-52 gap-1">
          {Object.entries(graphData).map(([date, count]) => {
            let bgColor = "bg-muted/30"
            if (count === 1) bgColor = "bg-primary/30"
            if (count === 2) bgColor = "bg-primary/50"
            if (count === 3) bgColor = "bg-primary/70"
            if (count >= 4) bgColor = "bg-primary"
            return (
              <div
                key={date}
                className={`w-3 h-3 rounded-sm ${bgColor} hover:ring-1 hover:ring-primary transition-all`}
                title={`${date}: ${count} contributions`}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
