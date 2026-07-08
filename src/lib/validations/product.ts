import { z } from "zod/v4"

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  description: z.string().max(2000).optional().or(z.literal("")),
  price: z.coerce.number().positive("Price must be greater than 0"),
  categoryId: z.string().min(1, "Please select a category"),
})

export type ProductFormValues = z.infer<typeof productSchema>
