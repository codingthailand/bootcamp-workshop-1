import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import type { RevenuePoint } from "@/types/admin"

const periodDays: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "30d"
    const days = periodDays[period] || 30

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const orders = await prisma.orders.findMany({
      where: { date: { gte: startDate } },
      select: { date: true, total_amount: true },
      orderBy: { date: "asc" },
    })

    const grouped: Record<string, { revenue: number; orders: number }> = {}
    for (const o of orders) {
      if (!o.date) continue
      const d = String(o.date.getDate()).padStart(2, "0")
      const m = String(o.date.getMonth() + 1).padStart(2, "0")
      const key = `${d}/${m}`
      if (!grouped[key]) {
        grouped[key] = { revenue: 0, orders: 0 }
      }
      grouped[key].revenue += Number(o.total_amount || 0)
      grouped[key].orders += 1
    }

    const result: RevenuePoint[] = []
    const cursor = new Date(startDate)
    const now = new Date()
    while (cursor <= now) {
      const d = String(cursor.getDate()).padStart(2, "0")
      const m = String(cursor.getMonth() + 1).padStart(2, "0")
      const key = `${d}/${m}`
      result.push({
        date: key,
        revenue: grouped[key]?.revenue ?? 0,
        orders: grouped[key]?.orders ?? 0,
      })
      cursor.setDate(cursor.getDate() + 1)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching revenue data:", error)
    return NextResponse.json(
      { error: "Failed to load revenue data" },
      { status: 500 }
    )
  }
}
