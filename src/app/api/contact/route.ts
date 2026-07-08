import { NextRequest, NextResponse } from "next/server"
import { contactSchema } from "@/lib/validations/contact"
import { Resend } from "resend"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      )
    }

    const { name, email, message } = parsed.data

    const resend = new Resend(
      process.env.RESEND_API_KEY || process.env.SMTP_USER || ""
    )

    const receiverEmail =
      process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER || ""

    await resend.emails.send({
      from: `Contact Form <onboarding@resend.dev>`,
      to: receiverEmail,
      subject: `ข้อความติดต่อจาก ${name}`,
      replyTo: email,
      html: `
        <h2>ข้อความติดต่อใหม่</h2>
        <p><strong>ชื่อ:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>ข้อความ:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    })

    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { success: false, error: "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่ภายหลัง" },
      { status: 500 }
    )
  }
}
