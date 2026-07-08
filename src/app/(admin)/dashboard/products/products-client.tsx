"use client"

import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductFormModal } from "./product-form-modal"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import {
  SearchIcon,
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import type { AdminProduct, CategoryOption } from "@/types/admin"

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export default function ProductsClient() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [inputVal, setInputVal] = useState("")
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set("search", search)
      const res = await fetch(`/api/admin/products?${params}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setProducts(json.data.products)
      setTotal(json.data.total)
      setTotalPages(json.data.totalPages)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load products"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/admin/categories")
        const json = await res.json()
        if (json.success) setCategories(json.data)
      } catch {
        // silently fail
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(inputVal)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [inputVal])

  function openCreate() {
    setEditProduct(null)
    setFormOpen(true)
  }

  function openEdit(product: AdminProduct) {
    setEditProduct(product)
    setFormOpen(true)
  }

  function handleSaveSuccess() {
    setFormOpen(false)
    setEditProduct(null)
    fetchProducts()
  }

  function handleDeleteSuccess() {
    setDeleteTarget(null)
    fetchProducts()
  }

  return (
    <>
      <Card className="@container/card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Products ({total})</CardTitle>
            <Button onClick={openCreate}>
              <PlusIcon className="size-4" />
              Add Product
            </Button>
          </div>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral" />
            <Input
              className="pl-9"
              placeholder="Search products..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-text-secondary">
              {search ? "No products found" : "No products yet"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="hidden max-w-xs truncate md:table-cell text-text-secondary">
                      {product.description || "-"}
                    </TableCell>
                    <TableCell>{currency.format(product.price)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {product.categoryName}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(product)}
                        >
                          <PencilIcon className="size-3" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2Icon className="size-3" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <p className="text-[13px] text-text-secondary">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeftIcon className="size-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ProductFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editProduct}
        categories={categories}
        onSuccess={handleSaveSuccess}
      />

      <DeleteConfirmDialog
        product={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}
