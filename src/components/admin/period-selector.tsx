"use client"

import * as React from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface PeriodSelectorProps {
  value: "7d" | "30d" | "90d"
  onValueChange: (value: "7d" | "30d" | "90d") => void
}

export function PeriodSelector({ value, onValueChange }: PeriodSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onValueChange(v as "7d" | "30d" | "90d")
      }}
      variant="outline"
    >
      <ToggleGroupItem value="7d">7 Days</ToggleGroupItem>
      <ToggleGroupItem value="30d">30 Days</ToggleGroupItem>
      <ToggleGroupItem value="90d">90 Days</ToggleGroupItem>
    </ToggleGroup>
  )
}
