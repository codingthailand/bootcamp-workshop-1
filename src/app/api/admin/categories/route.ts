import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import type { ApiResponse, CategoryOption } from "@/types/admin"

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" } satisfies ApiResponse<never>,
        { status: 401 }
      )
    }

    const categories = await prisma.categories.findMany({
      orderBy: { name: "asc" },
    })

    const data: CategoryOption[] = categories.map((c) => ({
      id: String(c.id),
      name: c.name || "",
    }))

    return NextResponse.json({ success: true, data } satisfies ApiResponse<CategoryOption[]>)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { success: false, error: "ไม่สามารถโหลดหมวดหมู่ได้" } satisfies ApiResponse<never>,
      { status: 500 }
    )
  }
}
