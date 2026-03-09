"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { createClient } from "@/src/shared/lib/supabase/client"
import { Bookmark, Clock, LogOut, MessageSquare, Search, UserCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

const NAV_TABS = [
  { id: "search", icon: Search },
  { id: "reviews", icon: MessageSquare },
  { id: "saved", icon: Bookmark },
  { id: "recent", icon: Clock },
] as const

export const Header = () => {
  const pathname = usePathname();
  const activeTab = pathname.split('/')[2];
  const t = useTranslations("Locals.header.tabs")
  const tMenu = useTranslations("Shared.profile.userMenu")
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success(tMenu("logoutSuccess"))
    router.replace("/")
  }

  const isProfileActive = activeTab === "profile"

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 py-6">
        <ul className="flex items-center justify-center gap-8 overflow-x-auto">
          {NAV_TABS.map(({ id, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <li key={id}>
                <Link
                  href={`/locals/${id}`}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap pb-2 transition-all duration-300",
                    isActive
                      ? "text-primary font-bold border-b-2 border-primary"
                      : "text-gray-600 hover:text-gray-900 font-medium"
                  )}
                >
                  <Icon size={18} />
                  {t(id as "search" | "reviews" | "saved" | "recent")}
                </Link>
              </li>
            )
          })}

          {/* Profile dropdown */}
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap pb-2 transition-all duration-300 outline-none",
                  isProfileActive
                    ? "text-primary font-bold border-b-2 border-primary"
                    : "text-gray-600 hover:text-gray-900 font-medium"
                )}
              >
                <UserCircle size={18} />
                {t("profile")}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href="/locals/profile" className="flex items-center gap-2 cursor-pointer">
                    <UserCircle className="size-4" />
                    {tMenu("myProfile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="size-4" />
                  {tMenu("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        </ul>
      </nav>
    </header>
  )
}
