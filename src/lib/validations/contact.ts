import * as z from "zod"

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.email("Invalid email format").min(1, "Email is required"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
})

export type ContactFormValues = z.infer<typeof contactSchema>
