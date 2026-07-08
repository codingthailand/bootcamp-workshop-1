---

## Goal
สร้างหน้า Contact Us ใน `(front)` route group — **public ไม่ต้อง auth** — form รับข้อมูลแล้วส่ง email ผ่าน Route Handler

---

## File Structure

```
src/app/(front)/contact/
├── page.tsx              ← Server Component shell
└── contact-form.tsx      ← 'use client': react-hook-form + submit

src/app/api/contact/
└── route.ts              ← POST: validate + ส่ง email
```

---

## Layout & Responsive

**Desktop** — 2 คอลัมน์ side-by-side:
```
┌──────────────────┬──────────────────────────┐
│  ข้อมูลติดต่อ   │   Form                   │
│  - email         │   ชื่อ [          ]      │
│  - เบอร์โทร     │   Email [          ]      │
│  - เวลาทำการ    │   ข้อความ [          ]   │
│                  │   [  ส่งข้อความ  ]       │
└──────────────────┴──────────────────────────┘
```
- ใช้ Tailwind: `grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12`
- คอลัมน์ซ้าย (info) แคบกว่า: `md:grid-cols-[1fr_1.6fr]`

**Mobile** — stack เดี่ยว ลงมาตามลำดับ:
```
heading + sub
─────────────
contact info (icon + text แนวนอน)
─────────────
form stacked ทุก field
[ส่งข้อความ — full width]
```

---

## UI Details

**Contact Info Block (คอลัมน์ซ้าย):**
- icon + text แต่ละแถว ใช้ Lucide icons: `Mail`, `Phone`, `Clock`
- ข้อความ secondary color (`text-muted-foreground`)
- มี `<Separator />` คั่นก่อน paragraph อธิบาย

**Form (คอลัมน์ขวา):**
- ทุก field ใช้ `FormField` + `FormLabel` + `FormControl` + `FormMessage` จาก shadcn
- `name` — `<Input placeholder="กรอกชื่อของคุณ">`
- `email` — `<Input type="email" placeholder="example@email.com">`
- `message` — `<Textarea rows={5} placeholder="พิมพ์ข้อความที่ต้องการ...">`
- Submit button — `w-full` เสมอ (ทั้ง desktop และ mobile)

**Success State** (หลัง submit สำเร็จ):
- ซ่อน form ทั้งหมด
- แสดง icon `CheckCircle` + ข้อความยืนยัน + ปุ่ม "ส่งข้อความอีกครั้ง"
- center ทั้ง block ด้วย `flex flex-col items-center text-center gap-4 py-8`

---

## Zod Schema (ใช้ร่วมกัน client + server)

```ts
// src/lib/validations/contact.ts
import { z } from 'zod/v4'

export const contactSchema = z.object({
  name:    z.string().min(1, 'กรุณากรอกชื่อ').max(100),
  email:   z.string().min(1, 'กรุณากรอก Email').email('รูปแบบ Email ไม่ถูกต้อง'),
  message: z.string().min(10, 'ข้อความต้องมีอย่างน้อย 10 ตัวอักษร').max(2000),
})

export type ContactFormValues = z.infer<typeof contactSchema>
```

---

## Route Handler — `POST /api/contact`

- ไม่มี auth guard (public)
- Validate ด้วย `contactSchema.safeParse(body)`
- ส่ง email ผ่าน (SMTP) ด้วย Resend เท่านั้น

**Environment variables:**
```
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
CONTACT_RECEIVER_EMAIL=
```

**Response:**
```ts
type ApiResponse<T> = { success: true; data: T } | { success: false; error: string }
```

---

## ContactForm — Constraints

- `useTransition` สำหรับ pending state
- validation error แสดงใต้ field ด้วย `<FormMessage>`
- network/server error ใช้ `toast.error()` จาก Sonner
- `form.reset()` หลัง submit สำเร็จ แล้วเปลี่ยนเป็น success state

---

## Install (ถ้ายังไม่มี)

```bash
npm install resend
npx shadcn@latest add separator
```

## หลังจากทำเสร็จแล้วให้เพิ่มเมนู "ติดต่อเรา"
ที่ไฟล์ @src/components/nav-menu.tsx