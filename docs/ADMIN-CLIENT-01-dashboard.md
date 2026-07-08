---

## Goal
สร้าง Admin Dashboard ที่ **Client Components ทั้งหมด** — fetch ข้อมูลจาก Route Handlers ผ่าน `fetch()` ใน `useEffect`

---

## File Structure

```
src/app/(admin)/dashboard/
├── page.tsx              ← Server: check admin role → render <DashboardClient>
└── dashboard-client.tsx  ← 'use client': fetch + state + render ทุกอย่าง

src/components/admin/
├── kpi-card.tsx          ← KpiCard + KpiCardSkeleton
├── revenue-chart.tsx     ← Recharts LineChart — ต้องใช้ next/dynamic + { ssr: false }
├── recent-orders-table.tsx
└── period-selector.tsx   ← 7d / 30d / 90d toggle
```

---

## Route Handlers ที่ต้องมี (ทำใน ADMIN-CLIENT-02)

| Method | Path | Returns |
|--------|------|---------|
| GET | `/api/admin/stats` | `{ todaySales, todayOrders, pendingOrders, totalProducts, totalUsers }` |
| GET | `/api/admin/revenue?period=30d` | `[{ date: 'DD/MM', revenue: number, orders: number }]` |
| GET | `/api/admin/orders?limit=5` | `{ orders: AdminOrderItem[], total }` |

---

## Types

ให้คิด Types ที่จำเป็นเองได้เลย แต่ต้องมี

---

## DashboardClient — State

```ts
stats:          AdminStats | null;  statsLoading: boolean;  statsError: string | null
revenue:        RevenuePoint[];     revenueLoading: boolean
period:         '7d' | '30d' | '90d'   // default '30d'
orders:         AdminOrderItem[];   ordersLoading: boolean
```

## DashboardClient — Data Flow

```
mount → fetch stats, orders พร้อมกัน
period เปลี่ยน → fetch revenue ใหม่
setInterval(30_000) → refetch stats + orders  →  cleanup clearInterval
```

---

## Constraints

- ไม่มี async Server Component ในส่วนนี้เลย
- `page.tsx` ทำแค่ check `session.user.role !== 'admin'` แล้ว redirect หรือ render `<DashboardClient>`
- ราคา: `Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' })`
- วันที่: `toLocaleDateString('th-TH')`
- Error state: แสดงข้อความ + ปุ่มลองใหม่ ทุก section
