import { SidebarProvider } from "@/components/ui/sidebar"
import { WorkersSidebar } from "@/src/workers/components/WorkersSidebar"

function WorkersLayout({ children }: { children: Readonly<React.ReactNode> }) {
  return (
    <SidebarProvider>
      <WorkersSidebar />
      <main className="flex-1 p-4">
        {children}
      </main>
    </SidebarProvider>
  )
}
export default WorkersLayout