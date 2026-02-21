import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppHeader } from '@/components/AppHeader'
import { PublicityFooter } from '@/components/PublicityFooter'

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1 w-full min-h-screen transition-all duration-300 overflow-hidden bg-white">
        <AppHeader />
        <main className="flex-1 flex flex-col p-6 md:p-8 bg-white overflow-x-hidden min-h-0">
          <div className="flex-1">
            <Outlet />
          </div>
          <PublicityFooter />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
