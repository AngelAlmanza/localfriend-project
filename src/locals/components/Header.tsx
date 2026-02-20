import { cn } from "@/lib/utils";
import { Bookmark, Clock, MessageSquare, Search, UserCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface HeaderProps {
  activeTab: string;
}

export const Header = ({ activeTab }: HeaderProps) => {
  const t = useTranslations("Locals.header.tabs");

  const tabs = [
    { id: 'search', label: t('search'), icon: Search },
    { id: 'reviews', label: t('reviews'), icon: MessageSquare },
    { id: 'saved', label: t('saved'), icon: Bookmark },
    { id: 'recent', label: t('recent'), icon: Clock },
    { id: 'profile', label: t('profile'), icon: UserCircle },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 py-6">
        <ul className="flex items-center justify-center gap-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <Link
                  href={`/locals/${tab.id}`}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap pb-2 transition-all duration-300",
                    isActive
                      ? "text-primary font-bold border-b-2 border-primary"
                      : "text-gray-600 hover:text-gray-900 font-medium"
                  )}
                >
                  {Icon && <Icon size={18} />}
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  )
}