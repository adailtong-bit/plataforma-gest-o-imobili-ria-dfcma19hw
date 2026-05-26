import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
export function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen bg-slate-50 relative z-0">
        <AppHeader />
        <main className="flex-1 p-6 overflow-auto relative">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
