"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
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
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-11 items-center gap-2 px-2 group-data-[state=collapsed]:justify-center">
          <div className="flex flex-1 items-center gap-2.5 min-w-0 group-data-[state=collapsed]:hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-[11px] font-bold tracking-tight">
              LF
            </div>
            <span className="font-semibold text-sm tracking-tight truncate text-sidebar-foreground">
              LocalFriend
            </span>
          </div>
          <SidebarTrigger className="shrink-0 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest uppercase text-sidebar-foreground/40 px-2 mb-0.5 h-7">
            {t("title")}
          </SidebarGroupLabel>
          <SidebarMenu>
            {sidebarItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <SidebarMenuItem
                  key={item.href}
                  className={cn(
                    "relative rounded-md transition-colors",
                    active && "bg-sidebar-accent",
                  )}
                >
                  {active && (
                    <span className="absolute left-0 inset-y-1.5 w-[3px] rounded-full bg-sidebar-primary" />
                  )}
                  <SidebarMenuButton
                    isActive={active}
                    asChild
                    className="w-full pl-3 hover:bg-sidebar-accent/60 data-[active=true]:bg-transparent"
                  >
                    <Link href={item.href} className="flex items-center gap-2.5">
                      <item.icon
                        className={cn(
                          "size-4 shrink-0 transition-colors",
                          active ? "text-sidebar-primary" : "text-sidebar-foreground/50",
                        )}
                      />
                      <span className={cn("text-sm", active ? "font-medium text-sidebar-accent-foreground" : "text-sidebar-foreground/80")}>
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-2 py-2 gap-1">
        <SidebarMenuButton
          asChild
          className={cn(
            "w-full rounded-md pl-3 hover:bg-sidebar-accent/60 transition-colors",
            pathname.startsWith("/workers/profile") && "bg-sidebar-accent",
          )}
        >
          <Link href="/workers/profile" className="flex items-center gap-2.5">
            <div className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors",
              pathname.startsWith("/workers/profile")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "bg-sidebar-accent text-sidebar-foreground/60",
            )}>
              <User className="size-3.5" />
            </div>
            <span className={cn(
              "text-sm",
              pathname.startsWith("/workers/profile")
                ? "font-medium text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80",
            )}>
              {t("profile")}
            </span>
          </Link>
        </SidebarMenuButton>

        <SidebarSeparator className="my-0.5 bg-sidebar-border/60" />

        <SidebarMenuButton asChild className="w-full rounded-md">
          <Button
            onClick={handleLogout}
            disabled={isLoading}
            className="cursor-pointer justify-start gap-2.5 pl-3 text-sidebar-foreground/60 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            variant="ghost"
          >
            <LogOut className="size-4 shrink-0" />
            <span className="text-sm">{t("logout")}</span>
          </Button>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};
