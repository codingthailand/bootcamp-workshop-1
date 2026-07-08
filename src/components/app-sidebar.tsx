"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, PackageIcon, Settings2Icon, CircleHelpIcon, CommandIcon } from "lucide-react"
import { authClient } from "@/lib/auth-client"

const data = {
  navMain: [
    {
      title: "แดชบอร์ด",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "สินค้า",
      url: "/dashboard/products",
      icon: <PackageIcon />,
    },
  ],
  navSecondary: [
    {
      title: "ตั้งค่า",
      url: "#",
      icon: <Settings2Icon />,
    },
    {
      title: "ช่วยเหลือ",
      url: "#",
      icon: <CircleHelpIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {
          session && <NavUser user={
            {
              name: session.user.name,
              email: session.user.email,
              role: session.user.role!,
            }
          } />
        }
      </SidebarFooter>
    </Sidebar>
  )
}
