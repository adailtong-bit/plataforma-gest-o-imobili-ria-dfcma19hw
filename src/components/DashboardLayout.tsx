import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import useAuthStore from '@/stores/useAuthStore'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Component, ErrorInfo, ReactNode } from 'react'

class LayoutErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Layout error:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-slate-50">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Application Error
          </h1>
          <p className="text-slate-600 mb-6 max-w-md">
            A critical error occurred while rendering the application layout.
          </p>
          <Button
            onClick={() => (window.location.href = '/')}
            className="bg-trust-blue text-white"
          >
            Reload Application
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}

export function DashboardLayout() {
  const { simulationMode, simulationRole, setSimulationMode } = useAuthStore()

  return (
    <LayoutErrorBoundary>
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
    </LayoutErrorBoundary>
  )
}
