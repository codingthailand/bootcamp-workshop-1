"use client"

import * as React from "react"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import type { AdminProduct } from "@/types/admin"

interface DeleteConfirmDialogProps {
  product: AdminProduct | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeleteConfirmDialog({
  product,
  onOpenChange,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = useCallback(async () => {
    if (!product) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      })
      const json = await res.json()

      if (!json.success) {
        toast.error(json.error || "Something went wrong")
        return
      }

      toast.success(`Deleted "${product.name}"`)
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setDeleting(false)
    }
  }, [product, onOpenChange, onSuccess])

  return (
    <AlertDialog open={!!product} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {product?.name}
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleting}
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
          >
            {deleting && <Spinner className="size-4" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
