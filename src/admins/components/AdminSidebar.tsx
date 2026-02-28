"use client"

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { BarChartIcon, LayoutDashboardIcon, PackageIcon, SettingsIcon, UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export const AdminSidebar = () => {
  const t = useTranslations("Admins.sidebar");
  const pathname = usePathname();

  const sidebarGeneralItems = useMemo(() => [
    {
      label: t("groups.general.items.dashboard"),
      href: "/admin/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      label: t("groups.general.items.reports"),
      href: "/admin/reports",
      icon: BarChartIcon,
    },
    {
      label: t("groups.general.items.users"),
      href: "/admin/users",
      icon: UserIcon,
    },
    {
      label: t("groups.general.items.settings"),
      href: "/admin/settings",
      icon: SettingsIcon,
    },
  ], [t])

  const sidebarCategoriesItems = useMemo(() => [
    {
      label: t("groups.categories.items.services"),
      href: "/admin/service-categories",
      icon: PackageIcon,
    },
    {
      label: t("groups.categories.items.products"),
      href: "/admin/product-categories",
      icon: PackageIcon,
    },
  ], [t])

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {t("groups.general.title")}
          </SidebarGroupLabel>
          <SidebarMenu>
            {sidebarGeneralItems.map((item) => (
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
        <SidebarGroup>
          <SidebarGroupLabel>
            {t("groups.categories.title")}
          </SidebarGroupLabel>
          <SidebarMenu>
            {sidebarCategoriesItems.map((item) => (
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
    </Sidebar>
  )
}