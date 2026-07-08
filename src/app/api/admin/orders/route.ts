import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import type { AdminOrderItem } from "@/types/admin"

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
    const limit = Math.min(parseInt(searchParams.get("limit") || "5"), 50)

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        take: limit,
        orderBy: { date: "desc" },
        include: {
          customers: { select: { name: true } },
        },
      }),
      prisma.orders.count(),
    ])

    const formatted: AdminOrderItem[] = orders.map((o) => ({
      id: o.id,
      customerName: o.customers?.name || "ไม่ระบุ",
      date: o.date?.toISOString() || new Date().toISOString(),
      total: Number(o.total_amount || 0),
      status: o.status || "processing",
    }))

    return NextResponse.json({ orders: formatted, total })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "ไม่สามารถโหลดข้อมูลออเดอร์ได้" },
      { status: 500 }
    )
  }
}
