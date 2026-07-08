"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/product", label: "Product" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/users", label: "Users" },
];

export const NavMenu = ({ className, ...props }: ComponentProps<"nav">) => (
  <nav className={cn("flex items-center gap-1", className)} {...props}>
    {links.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        className="rounded-md px-3 py-1.5 text-[14px] font-medium text-text-secondary transition-colors hover:bg-muted hover:text-foreground"
      >
        {link.label}
      </Link>
    ))}
  </nav>
);
