"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { createClient } from "@/src/shared/lib/supabase/client";
import {
  CreditCardIcon,
  LayoutDashboardIcon,
  LogOut,
  PackageIcon,
  SettingsIcon,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AuthService } from "../services/AuthService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const WorkersSidebar = () => {
  const t = useTranslations("Workers.sidebar");
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const sidebarItems = useMemo(
    () => [
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
        label: t("items.subscription"),
        href: "/workers/subscription",
        icon: CreditCardIcon,
      },
      {
        label: t("items.settings"),
        href: "/workers/settings",
        icon: SettingsIcon,
      },
    ],
    [t],
  );

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
          <SidebarGroupLabel>{t("title")}</SidebarGroupLabel>
          <SidebarMenu>
            {sidebarItems.map((item) => (
              <SidebarMenuItem
                key={item.href}
                className={cn(
                  pathname.startsWith(item.href) &&
                    "bg-sidebar-accent text-sidebar-accent-foreground",
                  "rounded-md",
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
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton
          asChild
          className={cn(
            pathname.startsWith("/workers/profile") &&
              "bg-sidebar-accent text-sidebar-accent-foreground",
            "rounded-md",
          )}
        >
          <Link href="/workers/profile">
            <User className="size-4" />
            <span>{t("profile")}</span>
          </Link>
        </SidebarMenuButton>
        <SidebarMenuButton
          asChild
          className={cn(
            pathname.startsWith("/workers/logout") &&
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
  );
};
