import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/navbar";
import { Suspense } from "react";

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ?? "Genesis UI",
  description: "Discover and share design system files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <Navbar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
