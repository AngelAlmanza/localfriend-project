"use client"

import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { createClient } from "@/src/shared/lib/supabase/client";
import { AuthService } from "@/src/workers/services/AuthService";
import { BarChartIcon, BoxesIcon, CreditCardIcon, LayoutDashboardIcon, LogOut, PackageIcon, SettingsIcon, UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const AdminSidebar = () => {
  const t = useTranslations("Admins.sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const sidebarGeneralItems = useMemo(() => [
    {
      label: t("groups.general.items.dashboard"),
      href: "/admin",
      icon: LayoutDashboardIcon,
      exact: true,
    },
    {
      label: t("groups.general.items.users"),
      href: "/admin/users",
      icon: UserIcon,
      exact: false,
    },
    {
      label: t("groups.general.items.reports"),
      href: "/admin/reports",
      icon: BarChartIcon,
      exact: false,
    },
    {
      label: t("groups.general.items.settings"),
      href: "/admin/settings",
      icon: SettingsIcon,
      exact: false,
    },
  ], [t])

  const sidebarMonetizationItems = useMemo(() => [
    {
      label: t("groups.monetization.items.plans"),
      href: "/admin/plans",
      icon: CreditCardIcon,
      exact: false,
    },
  ], [t])

  const sidebarCategoriesItems = useMemo(() => [
    {
      label: t("groups.categories.items.products"),
      href: "/admin/categories/products",
      icon: PackageIcon,
      exact: false,
    },
    {
      label: t("groups.categories.items.services"),
      href: "/admin/categories/services",
      icon: BoxesIcon,
      exact: false,
    },
  ], [t])

  const handleLogout = async () => {
    setIsLoading(true);
    const client = createClient();
    const result = await AuthService.logout(client);
    setIsLoading(true);

    if (result.left) {
      toast.error(result.left.message);
    } else {
      toast.success(t("logoutSuccess"));
      router.replace("/", { scroll: true });
    }
  };

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
                className={cn(
                  (item.exact ? pathname === item.href : pathname.startsWith(item.href)) && "bg-sidebar-accent text-sidebar-accent-foreground",
                  "rounded-md"
                )}
              >
                <SidebarMenuButton asChild className="w-full">
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
            {t("groups.monetization.title")}
          </SidebarGroupLabel>
          <SidebarMenu>
            {sidebarMonetizationItems.map((item) => (
              <SidebarMenuItem
                key={item.href}
                className={cn(pathname.startsWith(item.href) && "bg-sidebar-accent text-sidebar-accent-foreground", "rounded-md")}
              >
                <SidebarMenuButton asChild className="w-full">
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
                <SidebarMenuButton asChild className="w-full">
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
          className={cn(
            pathname.startsWith("/admin/logout") &&
            "bg-sidebar-accent text-sidebar-accent-foreground",
            "rounded-md",
          )}
        >
          <Button
            onClick={handleLogout}
            disabled={isLoading}
            className="cursor-pointer justify-start border"
            variant="ghost"
          >
            <LogOut className="size-4" />
            <span>{t("logout")}</span>
          </Button>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}