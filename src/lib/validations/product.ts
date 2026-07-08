import { z } from "zod/v4"

export const productSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อสินค้า").max(255),
  description: z.string().max(2000).optional().or(z.literal("")),
  price: z.coerce.number().positive("ราคาต้องมากกว่า 0"),
  categoryId: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
})

export type ProductFormValues = z.infer<typeof productSchema>
