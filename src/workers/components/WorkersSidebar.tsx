"use client"

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { LayoutDashboardIcon, LogOut, PackageIcon, SettingsIcon, User } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

export const WorkersSidebar = () => {
  const t = useTranslations("Workers.sidebar");
  const pathname = usePathname();

  const sidebarItems = useMemo(() => [
    {
      label: t("items.dashboard"),
      href: "/workers/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      label: t("items.services"),
      href: "/workers/services",
      icon: PackageIcon,
    },
    {
      label: t("items.products"),
      href: "/workers/products",
      icon: PackageIcon,
    },
    {
      label: t("items.settings"),
      href: "/workers/settings",
      icon: SettingsIcon,
    },
  ], [t])

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {t("title")}
          </SidebarGroupLabel>
          <SidebarMenu>
            {sidebarItems.map((item) => (
              <SidebarMenuItem
                key={item.href}
                className={cn(pathname.startsWith(item.href) && "bg-sidebar-accent text-sidebar-accent-foreground", "rounded-md")}
              >
                <SidebarMenuButton
                  asChild
                  className="w-full"
                >
                  <Link href={item.href} className="flex">
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton
          asChild
          className="w-full"
        >
          <Link href="/workers/profile">
            <User className="size-4" />
            <span>{t("profile")}</span>
          </Link>
        </SidebarMenuButton>
        <SidebarMenuButton
          asChild
          className="w-full"
        >
          <Link href="/workers/logout">
            <LogOut className="size-4" />
            <span>{t("logout")}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}