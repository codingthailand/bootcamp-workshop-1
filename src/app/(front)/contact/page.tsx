import { MailIcon, PhoneIcon, ClockIcon } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { ContactForm } from "./contact-form"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-3">ติดต่อเรา</h1>
        <p className="text-muted-foreground">
          มีคำถามหรือข้อสงสัย? ส่งข้อความหาเราได้เลย
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-8 md:gap-12">
        <div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MailIcon className="size-5 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">contact@example.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <PhoneIcon className="size-5 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">เบอร์โทรศัพท์</p>
                <p className="text-muted-foreground">02-xxx-xxxx</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ClockIcon className="size-5 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">เวลาทำการ</p>
                <p className="text-muted-foreground">
                  จันทร์ - ศุกร์ 09:00 - 18:00 น.
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <p className="text-muted-foreground text-sm leading-relaxed">
            ทีมงานของเราพร้อมให้ความช่วยเหลือคุณในทุกเรื่อง
            ไม่ว่าจะเป็นคำถามเกี่ยวกับสินค้า การสั่งซื้อ หรือข้อเสนอแนะต่าง ๆ
            เรายินดีรับฟังและพร้อมตอบกลับโดยเร็วที่สุด
          </p>
        </div>

        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
