export interface AdminStats {
  todaySales: number
  todayOrders: number
  pendingOrders: number
  totalProducts: number
  totalUsers: number
}

export interface RevenuePoint {
  date: string
  revenue: number
  orders: number
}

export interface AdminOrderItem {
  id: number
  customerName: string
  date: string
  total: number
  status: string
}
