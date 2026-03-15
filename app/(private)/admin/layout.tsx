import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/src/admins/components/AdminSidebar"
import { ReactNode } from "react"

function AdminLayout({ children }: { children: Readonly<ReactNode> }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="flex-1 p-4">
        {children}
      </main>
    </SidebarProvider>
  )
}
export default AdminLayout