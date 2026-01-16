import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
        <footer className="border-t py-4 px-6 text-center text-xs text-muted-foreground">
          <p>
            © 2026 Plataforma de Gestão Imobiliária v0.0.1. Todos os direitos
            reservados.
          </p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
