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

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export interface AdminProduct {
  id: string
  name: string
  description: string | null
  price: number
  categoryId: string
  categoryName: string
}

export interface CategoryOption {
  id: string
  name: string
}
