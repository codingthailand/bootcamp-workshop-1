"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCwIcon } from "lucide-react"
import type { AdminOrderItem } from "@/types/admin"

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  processing: { label: "กำลังดำเนินการ", variant: "secondary" },
  received: { label: "รับแล้ว", variant: "default" },
  delivered: { label: "จัดส่งแล้ว", variant: "outline" },
}

interface RecentOrdersTableProps {
  orders: AdminOrderItem[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

const currency = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
})

export function RecentOrdersTable({
  orders,
  loading,
  error,
  onRetry,
}: RecentOrdersTableProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>ออเดอร์ล่าสุด</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCwIcon className="size-3" />
              ลองใหม่
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            ไม่มีออเดอร์
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัส</TableHead>
                <TableHead>ลูกค้า</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead>ยอดรวม</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const status =
                  statusMap[order.status] ?? {
                    label: order.status,
                    variant: "secondary" as const,
                  }
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      #{order.id}
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      {new Date(order.date).toLocaleDateString("th-TH")}
                    </TableCell>
                    <TableCell>{currency.format(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
