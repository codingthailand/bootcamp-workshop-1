import * as z from "zod"
import { tool } from "langchain"
import { prisma } from "@/lib/prisma";
import { SKILLS } from "@/skills";

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

    console.log(keyword);

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

export const loadSkill = tool(  
  async ({ skillName }) => {
    // Find and return the requested skill
    const skill = SKILLS.find((s) => s.name === skillName);
    if (skill) {
      return `Loaded skill: ${skillName}\n\n${skill.content}`;
    }

    // Skill not found
    const available = SKILLS.map((s) => s.name).join(", ");
    return `Skill '${skillName}' not found. Available skills: ${available}`;
  },
  {
    name: "load_skill",
    description: `Load the full content of a skill into the agent's context.

Use this when you need detailed information about how to handle a specific
type of request. This will provide you with comprehensive instructions,
policies, and guidelines for the skill area.`,
    schema: z.object({
      skillName: z.string().describe("The name of the skill to load"),
    }),
  }
);

// ExecuteSQL Tool
export const executeSql = tool(
  async ({ query }) => {
    try {
      const normalized = query.trim().toUpperCase();

      if (!normalized.startsWith("SELECT")) {
        return "Blocked: only SELECT queries are allowed.";
      }

      const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(query);

      if (rows.length > 0) {
        // Prisma คืน BigInt สำหรับ COUNT/int8 — แปลงเป็น Number ไม่ให้ JSON.stringify พัง
        return JSON.stringify(
          rows,
          (_, v) => (typeof v === "bigint" ? Number(v) : v),
          2,
        );
      }

      return "No results found.";
    } catch (error) {
      return `SQL Error: ${(error as Error).message}`;
    }
  },
  {
    name: "execute_sql",
    description: `Execute a read-only SELECT query against the MariaDB database.

Only SELECT statements are allowed. Supports:
- SELECT with WHERE, JOIN, GROUP BY, HAVING, ORDER BY, LIMIT
- Aggregations: COUNT, SUM, AVG, MIN, MAX
- Subqueries and CTEs (WITH ... SELECT)

Use standard MariaDB syntax.`,
    schema: z.object({
      query: z.string().describe("The SELECT query to execute"),
    }),
  }
);