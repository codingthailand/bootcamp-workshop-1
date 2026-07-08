"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircleIcon } from "lucide-react"
import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { contactSchema, type ContactFormValues } from "@/lib/validations/contact"

export function ContactForm() {
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  function onSubmit(data: ContactFormValues) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        const json = await res.json()

        if (!res.ok || !json.success) {
          toast.error(json.error || "Something went wrong. Please try again.")
          return
        }

        form.reset()
        setSuccess(true)
      } catch {
        toast.error("Unable to send message. Please try again later.")
      }
    })
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-8">
        <CheckCircleIcon className="size-12 text-success" />
        <h3 className="font-heading text-[24px] font-bold tracking-[-0.03em]">Message Sent</h3>
        <p className="text-[13px] text-text-secondary">
          Thank you for reaching out. We&apos;ll get back to you soon.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSuccess(false)
            form.reset()
          }}
        >
          Send Another Message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-name">Name</FieldLabel>
              <Input
                {...field}
                id="contact-name"
                aria-invalid={fieldState.invalid}
                placeholder="Your name"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-email">Email</FieldLabel>
              <Input
                {...field}
                id="contact-email"
                type="email"
                aria-invalid={fieldState.invalid}
                placeholder="you@example.com"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name="message"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-message">Message</FieldLabel>
              <Textarea
                {...field}
                id="contact-message"
                rows={5}
                aria-invalid={fieldState.invalid}
                placeholder="What would you like to tell us?"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit" className="w-full mt-6" disabled={isPending}>
        {isPending ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
