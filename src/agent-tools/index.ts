import * as z from "zod"
import { tool } from "langchain"
import { prisma } from "@/lib/prisma";

export const getCurrentDateTool = tool(
  () => {
    const currentDate = new Date();
    return currentDate.toLocaleDateString('th-TH') + ' ' + currentDate.toLocaleTimeString('th-TH');
  },
  {
    name: "get_current_date",
    description: "ดึงวันที่และเวลาปัจจุบัน เมื่อผู้ใช้ถามเกี่ยวกับวันที่และเวลา",
    schema: z.object({}),
  }
);

// เครื่องมือสำหรับตอบข้อมูลสินค้า
export const searchAllProductTool = tool(
  async ({ query }) => {
    const keyword = query.trim();

    if (!keyword) {
      return JSON.stringify({
        success: false,
        message: "กรุณาระบุคำค้นหาสินค้า",
        data: [],
      });
    }

    const id = Number(keyword);

    const products = await prisma.products.findMany({
      where: {
        OR: [
          ...(Number.isInteger(id)
            ? [
                {
                  id,
                },
              ]
            : []),

          {
            name: {
              contains: keyword,
            },
          },

          {
            description: {
              contains: keyword,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category_id: true,
      },
      orderBy: {
        id: "desc",
      },
      take: 10,
    });

    return JSON.stringify({
      success: true,
      total: products.length,
      data: products,
    });
  },
  {
    name: "search_product_database",
    description:
      "Search the product database by product id, product name, or product description.",
    schema: z.object({
      query: z
        .string()
        .describe("Search keyword. Can be product id, product name, or description."),
    }),
  }
);