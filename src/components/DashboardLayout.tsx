import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import useAuthStore from '@/stores/useAuthStore'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout() {
  const { simulationMode, simulationRole, setSimulationMode } = useAuthStore()

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-screen bg-slate-50 relative">
          {simulationMode && (
            <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-center gap-4 text-sm font-medium z-50 shadow-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Simulation Mode Active: Testing as{' '}
                <span className="capitalize">
                  {simulationRole?.replace('_', ' ')}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-white hover:text-white/80 hover:bg-orange-600 px-2 py-0 border border-white/20"
                onClick={() => setSimulationMode(false)}
              >
                Turn Off Bypass
              </Button>
            </div>
          )}
          <AppHeader />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
