import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppHeader } from '@/components/AppHeader'

export default function DashboardLayout() {
  // Removed authentication check redirect to Landing
  // Now allows rendering the application shell in "Guest/Masked" mode

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col flex-1 w-full min-h-screen transition-all duration-300">
        <AppHeader />
        <main className="flex-1 p-6 md:p-8 bg-muted/10 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}
