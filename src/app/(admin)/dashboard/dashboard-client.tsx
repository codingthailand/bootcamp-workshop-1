"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"
import { KpiCard, KpiCardSkeleton } from "@/components/admin/kpi-card"
import { RecentOrdersTable } from "@/components/admin/recent-orders-table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  RefreshCwIcon,
  DollarSignIcon,
  ShoppingCartIcon,
  ClockIcon,
  PackageIcon,
  UsersIcon,
} from "lucide-react"
import type { AdminStats, RevenuePoint, AdminOrderItem } from "@/types/admin"

const RevenueChart = dynamic(
  () =>
    import("@/components/admin/revenue-chart").then((m) => ({
      default: m.RevenueChart,
    })),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[360px] w-full rounded-xl" />
    ),
  }
)

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export default function DashboardClient() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [revenue, setRevenue] = useState<RevenuePoint[]>([])
  const [revenueLoading, setRevenueLoading] = useState(true)
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d")
  const [orders, setOrders] = useState<AdminOrderItem[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    setStatsError(null)
    try {
      const res = await fetch("/api/admin/stats")
      if (!res.ok) throw new Error("Failed to load statistics")
      const data = await res.json()
      setStats(data)
    } catch (err) {
      setStatsError(
        err instanceof Error ? err.message : "An error occurred"
      )
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const fetchRevenue = useCallback(
    async (p: "7d" | "30d" | "90d") => {
      setRevenueLoading(true)
      try {
        const res = await fetch(`/api/admin/revenue?period=${p}`)
        if (!res.ok) throw new Error("Failed to load revenue data")
        const data = await res.json()
        setRevenue(data)
      } catch {
        setRevenue([])
      } finally {
        setRevenueLoading(false)
      }
    },
    []
  )

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    setOrdersError(null)
    try {
      const res = await fetch("/api/admin/orders?limit=5")
      if (!res.ok) throw new Error("Failed to load orders")
      const data = await res.json()
      setOrders(data.orders)
    } catch (err) {
      setOrdersError(
        err instanceof Error ? err.message : "An error occurred"
      )
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchOrders()
  }, [fetchStats, fetchOrders])

  useEffect(() => {
    fetchRevenue(period)
  }, [period, fetchRevenue])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats()
      fetchOrders()
    }, 30_000)
    return () => clearInterval(interval)
  }, [fetchStats, fetchOrders])

  return (
    <>
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 xl:grid-cols-2 2xl:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <KpiCardSkeleton key={i} />
            ))
          : statsError
            ? (
              <div className="col-span-full flex flex-col items-center gap-2 py-8 text-center">
                <p className="text-[13px] text-text-secondary">
                  {statsError}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchStats}
                >
                  <RefreshCwIcon className="size-3" />
                  Retry
                </Button>
              </div>
            )
            : stats
              ? (
                <>
                  <KpiCard
                    title="Today's Sales"
                    value={currency.format(stats.todaySales)}
                    icon={DollarSignIcon}
                  />
                  <KpiCard
                    title="Today's Orders"
                    value={stats.todayOrders.toLocaleString()}
                    icon={ShoppingCartIcon}
                  />
                  <KpiCard
                    title="Pending Orders"
                    value={stats.pendingOrders.toLocaleString()}
                    icon={ClockIcon}
                  />
                  <KpiCard
                    title="Total Products"
                    value={stats.totalProducts.toLocaleString()}
                    icon={PackageIcon}
                  />
                  <KpiCard
                    title="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    icon={UsersIcon}
                  />
                </>
              )
              : null}
      </div>
      <div className="px-4 lg:px-6">
        <RevenueChart
          data={revenue}
          loading={revenueLoading}
          period={period}
          onPeriodChange={setPeriod}
        />
      </div>
      <div className="px-4 lg:px-6">
        <RecentOrdersTable
          orders={orders}
          loading={ordersLoading}
          error={ordersError}
          onRetry={fetchOrders}
        />
      </div>
    </>
  )
}
