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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" } satisfies ApiResponse<never>,
        { status: 401 }
      )
    }

    const { id } = await params
    const productId = parseInt(id)

    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: "ID ไม่ถูกต้อง" } satisfies ApiResponse<never>,
        { status: 400 }
      )
    }

    const existing = await prisma.products.findUnique({
      where: { id: productId },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "ไม่พบสินค้า" } satisfies ApiResponse<never>,
        { status: 404 }
      )
    }

    const body = await req.json()
    const parsed = productSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "ข้อมูลไม่ถูกต้อง" } satisfies ApiResponse<never>,
        { status: 400 }
      )
    }

    const product = await prisma.products.update({
      where: { id: productId },
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

    return NextResponse.json({ success: true, data } satisfies ApiResponse<AdminProduct>)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { success: false, error: "ไม่สามารถแก้ไขสินค้าได้" } satisfies ApiResponse<never>,
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" } satisfies ApiResponse<never>,
        { status: 401 }
      )
    }

    const { id } = await params
    const productId = parseInt(id)

    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: "ID ไม่ถูกต้อง" } satisfies ApiResponse<never>,
        { status: 400 }
      )
    }

    const existing = await prisma.products.findUnique({
      where: { id: productId },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "ไม่พบสินค้า" } satisfies ApiResponse<never>,
        { status: 404 }
      )
    }

    const orderCount = await prisma.order_items.count({
      where: { product_id: productId },
    })

    if (orderCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `ไม่สามารถลบสินค้าได้ เนื่องจากมีออเดอร์ที่เกี่ยวข้อง ${orderCount} รายการ`,
        } satisfies ApiResponse<never>,
        { status: 409 }
      )
    }

    await prisma.products.delete({
      where: { id: productId },
    })

    return NextResponse.json({ success: true, data: null } satisfies ApiResponse<null>)
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { success: false, error: "ไม่สามารถลบสินค้าได้" } satisfies ApiResponse<never>,
      { status: 500 }
    )
  }
}
