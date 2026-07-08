import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "../globals.css";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";
import DLayout from "./dashboard/DLayout";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing your store",
};

async function AdminGuard({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <AdminGuard>
            <DLayout>{children}</DLayout>
          </AdminGuard>
        </Suspense>
      </body>
    </html>
  );
}
