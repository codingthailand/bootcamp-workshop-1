"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { PeriodSelector } from "@/components/admin/period-selector"
import { Skeleton } from "@/components/ui/skeleton"
import type { RevenuePoint } from "@/types/admin"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
  orders: {
    label: "Orders",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

interface RevenueChartProps {
  data: RevenuePoint[]
  loading: boolean
  period: "7d" | "30d" | "90d"
  onPeriodChange: (period: "7d" | "30d" | "90d") => void
}

function formatRevenue(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

export function RevenueChart({
  data,
  loading,
  period,
  onPeriodChange,
}: RevenueChartProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Revenue</CardTitle>
          <PeriodSelector value={period} onValueChange={onPeriodChange} />
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No data
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <LineChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) =>
                  `$${(value / 1000).toFixed(0)}k`
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      if (name === "revenue") {
                        return (
                          <div className="flex w-full items-center gap-2">
                            <span>
                              {chartConfig[name]?.label}
                            </span>
                            <span className="ml-auto font-mono font-medium tabular-nums">
                              {formatRevenue(value as number)}
                            </span>
                          </div>
                        )
                      }
                      return (
                        <div className="flex w-full items-center gap-2">
                          <span>
                            {chartConfig[name as keyof typeof chartConfig]?.label}
                          </span>
                          <span className="ml-auto font-mono font-medium tabular-nums">
                            {value} items
                          </span>
                        </div>
                      )
                    }}
                    indicator="dot"
                  />
                }
              />
              <Line
                dataKey="revenue"
                type="monotone"
                stroke="var(--color-revenue)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="orders"
                type="monotone"
                stroke="var(--color-orders)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
