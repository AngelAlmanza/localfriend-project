"use client"

import { Header } from "@/src/locals/components/Header"
import { usePathname } from "next/navigation";

function LocalLayout({ children }: { children: Readonly<React.ReactNode> }) {
  const pathname = usePathname();
  const activeTab = pathname.split('/')[2];

  return (
    <>
      <Header activeTab={activeTab} />
      <main className="max-w-7xl mx-auto px-6 py-6">
        {children}
      </main>
    </>
  )
}

export default LocalLayout