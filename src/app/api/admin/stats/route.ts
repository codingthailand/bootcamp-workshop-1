import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import type { AdminStats } from "@/types/admin"

export async function GET() {
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

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const [todayOrdersData, pendingOrdersCount, totalProducts, totalUsers] =
      await Promise.all([
        prisma.orders.findMany({
          where: { date: { gte: todayStart, lte: todayEnd } },
          select: { total_amount: true },
        }),
        prisma.orders.count({
          where: { status: "processing" },
        }),
        prisma.products.count(),
        prisma.user.count(),
      ])

    const todaySales = todayOrdersData.reduce(
      (sum, o) => sum + Number(o.total_amount || 0),
      0
    )
    const todayOrders = todayOrdersData.length

    const stats: AdminStats = {
      todaySales,
      todayOrders,
      pendingOrders: pendingOrdersCount,
      totalProducts,
      totalUsers,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Failed to load statistics" },
      { status: 500 }
    )
  }
}
