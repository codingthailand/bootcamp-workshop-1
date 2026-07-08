## Goal
สร้าง Product CRUD ครบชุด — Route Handlers ทุก method + Client Components สำหรับ list/create/edit/delete  
ใช้ **react-hook-form + Zod** สำหรับ validation ทั้ง client และ server

---

## Shared Zod Schema

```ts
// src/lib/validations/product.ts
import { z } from 'zod/v4'

export const productSchema = z.object({
  name:        z.string().min(1, 'กรุณากรอกชื่อสินค้า').max(255),
  description: z.string().max(2000).optional().or(z.literal('')),
  price:       z.coerce.number().positive('ราคาต้องมากกว่า 0'),  // coerce เพราะ input ส่ง string
  categoryId:  z.string().min(1, 'กรุณาเลือกหมวดหมู่'),
})

export type ProductFormValues = z.infer<typeof productSchema>
```

ใช้ schema เดียวกันทั้ง `zodResolver()` ใน form และ `schema.safeParse()` ใน Route Handler

---

## Route Handlers

### Admin Guard (ใส่ทุก handler)
```ts
const session = await auth.api.getSession({ headers: request.headers })
if (!session || session.user.role !== 'admin') {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
}
```

### Endpoints

| File | Method | Path |
|------|--------|------|
| `route.ts` | GET | `/api/admin/products` — list + `?search=` + `?page=` |
| `route.ts` | POST | `/api/admin/products` — create |
| `[id]/route.ts` | PUT | `/api/admin/products/[id]` — update |
| `[id]/route.ts` | DELETE | `/api/admin/products/[id]` — delete |
| `categories/route.ts` | GET | `/api/admin/categories` — dropdown |

### Serialize Decimal ก่อน return
```ts
price: Number(product.price)   // Prisma Decimal → number
```

### Delete Guard
```ts
const count = await prisma.order_items.count({ where: { product_id: id } })
if (count > 0) return 409 + error message บอกจำนวน
```

---

## Client Components

### File Structure
```
src/app/(admin)/dashboard/products/
├── page.tsx                  ← Server: check role → render <ProductsClient>
├── products-client.tsx       ← 'use client': list + search + pagination
├── product-form-modal.tsx    ← 'use client': react-hook-form (create/edit)
└── delete-confirm-dialog.tsx ← 'use client': AlertDialog confirm

src/app/api/admin/
├── products/route.ts
├── products/[id]/route.ts
└── categories/route.ts
```

### ProductsClient — State
```ts
products: AdminProduct[];  categories: CategoryOption[]
loading: boolean;          total: number;  page: number
inputVal: string           // raw input
search:   string           // debounced → trigger fetch
formOpen: boolean;         editProduct: AdminProduct | null  // null = create
deleteTarget: AdminProduct | null
```

### Debounce Search
```ts
useEffect(() => {
  const t = setTimeout(() => { setSearch(inputVal); setPage(1) }, 300)
  return () => clearTimeout(t)
}, [inputVal])
```

### ProductFormModal

```ts
// reset เมื่อ open หรือ product เปลี่ยน
useEffect(() => {
  if (open) form.reset(product ?? defaultValues)
}, [open, product])
```

> **shadcn Select ต้องใช้ `field.onChange`** — ไม่ใช่ `register` เพราะไม่ใช่ native `<select>`

### Types
```ts
// src/types/admin.ts
type ApiResponse<T> = { success: true; data: T } | { success: false; error: string }
type AdminProduct   = { id: string; name: string; description: string | null; price: number; categoryId: string; categoryName: string }
type CategoryOption = { id: string; name: string }
```

---

## UX Requirements
- Form: disable + spinner ขณะ submit
- Delete: AlertDialog ทุกครั้ง แสดงชื่อสินค้าใน dialog
- Toast: `toast.success` / `toast.error` (Sonner) ทุก action
- หลัง save/delete สำเร็จ: ปิด modal + refetch list
