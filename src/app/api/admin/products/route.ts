import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { productSchema } from "@/lib/validations/product"
import type { ApiResponse, AdminProduct } from "@/types/admin"

async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") {
    return false
  }
  return true
}

export async function GET(req: NextRequest) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" } satisfies ApiResponse<never>,
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = 10
    const skip = (page - 1) * limit

    const where = search
      ? { name: { contains: search } }
      : {}

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        include: { categories: true },
        orderBy: { id: "desc" },
        skip,
        take: limit,
      }),
      prisma.products.count({ where }),
    ])

    const data: AdminProduct[] = products.map((p) => ({
      id: String(p.id),
      name: p.name || "",
      description: p.description || null,
      price: Number(p.price || 0),
      categoryId: String(p.category_id ?? ""),
      categoryName: p.categories?.name || "",
    }))

    return NextResponse.json({
      success: true,
      data: { products: data, total, page, totalPages: Math.ceil(total / limit) },
    } satisfies ApiResponse<{ products: AdminProduct[]; total: number; page: number; totalPages: number }>)
  } catch (error) {
    console.error("Error listing products:", error)
    return NextResponse.json(
      { success: false, error: "Failed to load products" } satisfies ApiResponse<never>,
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" } satisfies ApiResponse<never>,
        { status: 401 }
      )
    }

    const body = await req.json()
    const parsed = productSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid data", errors: parsed.error.flatten().fieldErrors } satisfies ApiResponse<never> & { errors: unknown },
        { status: 400 }
      )
    }

    const product = await prisma.products.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        price: parsed.data.price,
        category_id: parseInt(parsed.data.categoryId),
      },
      include: { categories: true },
    })

    const data: AdminProduct = {
      id: String(product.id),
      name: product.name || "",
      description: product.description || null,
      price: Number(product.price || 0),
      categoryId: String(product.category_id ?? ""),
      categoryName: product.categories?.name || "",
    }

    return NextResponse.json(
      { success: true, data } satisfies ApiResponse<AdminProduct>,
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create product" } satisfies ApiResponse<never>,
      { status: 500 }
    )
  }
}
