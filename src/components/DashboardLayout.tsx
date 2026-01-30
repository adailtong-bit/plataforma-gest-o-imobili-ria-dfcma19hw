import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppHeader } from '@/components/AppHeader'

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1 w-full min-h-screen transition-all duration-300 overflow-hidden">
        <AppHeader />
        <main className="flex-1 p-6 md:p-8 bg-muted/10 overflow-x-hidden">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
