"use client"

import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, type Resolver } from "react-hook-form"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  productSchema,
  type ProductFormValues,
} from "@/lib/validations/product"
import type { AdminProduct, CategoryOption } from "@/types/admin"

const defaultValues: ProductFormValues = {
  name: "",
  description: "",
  price: 0 as unknown as number,
  categoryId: "",
}

interface ProductFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: AdminProduct | null
  categories: CategoryOption[]
  onSuccess: () => void
}

export function ProductFormModal({
  open,
  onOpenChange,
  product,
  categories,
  onSuccess,
}: ProductFormModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const isEdit = !!product

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      form.reset(
        product
          ? {
              name: product.name,
              description: product.description || "",
              price: product.price,
              categoryId: product.categoryId,
            }
          : defaultValues
      )
    }
  }, [open, product, form])

  const onSubmit = useCallback(
    async (data: ProductFormValues) => {
      setSubmitting(true)
      try {
        const url = isEdit
          ? `/api/admin/products/${product!.id}`
          : "/api/admin/products"
        const method = isEdit ? "PUT" : "POST"

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        const json = await res.json()

        if (!json.success) {
          toast.error(json.error || "เกิดข้อผิดพลาด")
          return
        }

        toast.success(isEdit ? "แก้ไขสินค้าสำเร็จ" : "เพิ่มสินค้าสำเร็จ")
        onSuccess()
      } catch {
        toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่")
      } finally {
        setSubmitting(false)
      }
    },
    [isEdit, product, onSuccess]
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? `แก้ไขข้อมูลสินค้า "${product?.name}"`
              : "กรอกข้อมูลสินค้าใหม่"}
          </SheetDescription>
        </SheetHeader>

        <form
          id="product-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col"
        >
          <FieldGroup className="flex-1 space-y-4 px-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-name">ชื่อสินค้า</FieldLabel>
                  <Input
                    {...field}
                    id="product-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="ชื่อสินค้า"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-desc">คำอธิบาย</FieldLabel>
                  <Textarea
                    {...field}
                    id="product-desc"
                    aria-invalid={fieldState.invalid}
                    rows={3}
                    placeholder="รายละเอียดสินค้า (ไม่บังคับ)"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="price"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-price">ราคา (บาท)</FieldLabel>
                  <Input
                    {...field}
                    id="product-price"
                    type="number"
                    step="0.01"
                    min="0"
                    aria-invalid={fieldState.invalid}
                    placeholder="0.00"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="categoryId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-category">หมวดหมู่</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger
                      id="product-category"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex items-center justify-end gap-2 border-t p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              ยกเลิก
            </Button>
            <Button type="submit" form="product-form" disabled={submitting}>
              {submitting && <Spinner className="size-4" />}
              {isEdit ? "บันทึก" : "เพิ่มสินค้า"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
