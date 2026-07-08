import { MailIcon, PhoneIcon, ClockIcon } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { ContactForm } from "./contact-form"

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="font-heading text-[clamp(1.75rem,4vw,32px)] font-bold tracking-[-0.03em]">
          Get in Touch
        </h1>
        <p className="mt-3 text-[15px] text-text-secondary">
          Have a question or need help? Send us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-8 md:gap-12">
        <div>
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <MailIcon className="size-5 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium text-[15px]">Email</p>
                <p className="text-[13px] text-text-secondary">contact@example.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <PhoneIcon className="size-5 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium text-[15px]">Phone</p>
                <p className="text-[13px] text-text-secondary">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ClockIcon className="size-5 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium text-[15px]">Hours</p>
                <p className="text-[13px] text-text-secondary">
                  Mon - Fri, 9:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <p className="text-[13px] leading-relaxed text-text-secondary">
            Our team is ready to help with product questions, orders, or feedback.
            We typically respond within 24 hours.
          </p>
        </div>

        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
