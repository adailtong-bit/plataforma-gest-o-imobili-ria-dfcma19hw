import { useEffect, Component, ReactNode, ErrorInfo } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from '@/components/Layout'
import { AppProvider } from '@/stores/AppContext'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import useAuthStore from '@/stores/useAuthStore'
import { Skeleton } from '@/components/ui/skeleton'
import { TourGuide } from '@/components/tour/TourGuide'
import logoImg from '@/assets/summerpm-logo-d35a2.jpg'
import { TranslationProvider } from '@/hooks/use-db-translations'

import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import NotFound from '@/pages/NotFound'
import Properties from '@/pages/Properties'
import PropertyDetails from '@/pages/PropertyDetails'
import CalendarPage from '@/pages/Calendar'
import Tasks from '@/pages/Tasks'
import Financial from '@/pages/Financial'
import Invoices from '@/pages/Invoices'
import Messages from '@/pages/Messages'
import Settings from '@/pages/Settings'
import Tenants from '@/pages/Tenants'
import TenantDetails from '@/pages/TenantDetails'
import Owners from '@/pages/Owners'
import OwnerDetails from '@/pages/OwnerDetails'
import Partners from '@/pages/Partners'
import PartnerDetails from '@/pages/PartnerDetails'
import Condominiums from '@/pages/Condominiums'
import CondominiumDetails from '@/pages/CondominiumDetails'
import Hotels from '@/pages/Hotels'
import HotelDetails from '@/pages/HotelDetails'
import TowerDetails from '@/pages/TowerDetails'
import HotelRoomDetails from '@/pages/HotelRoomDetails'
import Users from '@/pages/Users'
import ServicePricing from '@/pages/ServicePricing'
import TenantPortal from '@/pages/portal/TenantPortal'
import OwnerPortal from '@/pages/portal/OwnerPortal'
import PartnerPortal from '@/pages/portal/PartnerPortal'
import MarketAnalysis from '@/pages/MarketAnalysis'
import Workflows from '@/pages/Workflows'
import Renewals from '@/pages/Renewals'
import PublicityAdmin from '@/pages/admin/PublicityAdmin'
import MigrationHub from '@/pages/admin/MigrationHub'
import FrontDesk from '@/pages/FrontDesk'
import Analytics from '@/pages/admin/Analytics'
import Automation from '@/pages/admin/Automation'
import AuditPanel from '@/pages/admin/AuditPanel'
import TranslationsAdmin from '@/pages/admin/TranslationsAdmin'
import EnvironmentManager from '@/pages/admin/EnvironmentManager'
import ShortTerm from '@/pages/ShortTerm'
import Reports from '@/pages/Reports'
import Visits from '@/pages/Visits'
import HelpHub from '@/pages/HelpHub'
import Housekeeping from '@/pages/Housekeeping'
import RoomConcierge from '@/pages/guest/RoomConcierge'
import OnlineCheckIn from '@/pages/guest/OnlineCheckIn'
import OnlineCheckOut from '@/pages/guest/OnlineCheckOut'
import NightAudit from '@/pages/NightAudit'
import Performance from '@/pages/Performance'
import GuestServices from '@/pages/GuestServices'
import PointOfSale from '@/pages/PointOfSale'
import Marketing from '@/pages/Marketing'
import Pricing from '@/pages/Pricing'

class GlobalErrorBoundary extends Component<
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
    console.error('Global application error:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 max-w-md w-full space-y-4">
            <h1 className="text-xl font-bold text-red-600">
              Application Error
            </h1>
            <p className="text-slate-600 text-sm">
              We encountered an unexpected error while rendering the
              application. Please try reloading the page.
            </p>
            <button
              onClick={() => (window.location.href = '/')}
              className="bg-trust-blue text-white px-4 py-2 rounded-md font-medium hover:bg-trust-blue/90 transition-colors w-full"
            >
              Reload Application
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const { session, loading: supabaseLoading } = useAuth()
  const { isAuthenticated: appAuthenticated, isAuthLoading: appLoading } =
    useAuthStore()
  const location = useLocation()

  const isLoading = supabaseLoading || appLoading
  const isAuth = !!session || appAuthenticated

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 gap-6 animate-in fade-in duration-500">
        <div className="flex flex-col items-center space-y-4 w-full max-w-sm">
          <Skeleton className="h-16 w-16 rounded-full shadow-sm" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

const App = () => {
  useEffect(() => {
    document.title = 'Summerpm'

    // Ensure favicon is set and properly bundled
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = logoImg
  }, [])

  return (
    <GlobalErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <AppProvider>
            <TranslationProvider>
              <BrowserRouter
                future={{
                  v7_startTransition: false,
                  v7_relativeSplatPath: false,
                }}
              >
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <TourGuide />
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/guest/:roomId" element={<RoomConcierge />} />
                    <Route
                      path="/guest/checkin/:bookingId"
                      element={<OnlineCheckIn />}
                    />
                    <Route
                      path="/guest/checkout/:bookingId"
                      element={<OnlineCheckOut />}
                    />

                    {/* Protected Routes */}
                    <Route
                      element={
                        <AuthGuard>
                          <Layout />
                        </AuthGuard>
                      }
                    >
                      {/* Real Estate Dashboard as Main Route */}
                      <Route path="/" element={<Dashboard />} />
                      {/* Dashboard Alias */}
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/help" element={<HelpHub />} />

                      {/* Restored Menu Aliases */}
                      <Route path="/bookings" element={<CalendarPage />} />
                      <Route path="/guests" element={<Tenants />} />
                      <Route path="/finance" element={<Financial />} />
                      <Route path="/ledger" element={<Financial />} />
                      <Route path="/campaigns" element={<Marketing />} />

                      {/* Advanced Management Tools */}
                      <Route path="/performance" element={<Performance />} />
                      <Route
                        path="/guest-services"
                        element={<GuestServices />}
                      />
                      <Route path="/pos" element={<PointOfSale />} />
                      <Route path="/marketing" element={<Marketing />} />

                      <Route path="/properties" element={<Properties />} />
                      <Route
                        path="/properties/:id"
                        element={<PropertyDetails />}
                      />
                      <Route
                        path="/properties/:id/:tab"
                        element={<PropertyDetails />}
                      />
                      <Route path="/hotels" element={<Hotels />} />
                      <Route path="/hotels/:id" element={<HotelDetails />} />
                      <Route
                        path="/hotels/:id/:tab"
                        element={<HotelDetails />}
                      />
                      {/* Direct Room Navigation */}
                      <Route
                        path="/hotels/:hotelId/rooms/:roomId"
                        element={<HotelRoomDetails />}
                      />
                      {/* Tower Room Navigation */}
                      <Route
                        path="/hotels/:hotelId/towers/:towerId/rooms/:roomId"
                        element={<HotelRoomDetails />}
                      />
                      <Route
                        path="/hotels/:id/towers/:towerId"
                        element={<TowerDetails />}
                      />
                      <Route path="/front-desk" element={<FrontDesk />} />
                      <Route path="/short-term" element={<ShortTerm />} />
                      <Route path="/condominiums" element={<Condominiums />} />
                      <Route
                        path="/condominiums/:id"
                        element={<CondominiumDetails />}
                      />
                      <Route path="/tenants" element={<Tenants />} />
                      <Route path="/tenants/:id" element={<TenantDetails />} />
                      <Route path="/owners" element={<Owners />} />
                      <Route path="/owners/:id" element={<OwnerDetails />} />
                      <Route
                        path="/owners/:id/:tab"
                        element={<OwnerDetails />}
                      />
                      <Route path="/partners" element={<Partners />} />
                      <Route
                        path="/partners/:id"
                        element={<PartnerDetails />}
                      />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/financial" element={<Financial />} />
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route
                        path="/service-pricing"
                        element={<ServicePricing />}
                      />
                      <Route
                        path="/market-analysis"
                        element={<MarketAnalysis />}
                      />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/workflows" element={<Workflows />} />
                      <Route path="/renewals" element={<Renewals />} />
                      <Route path="/visits" element={<Visits />} />
                      <Route path="/housekeeping" element={<Housekeeping />} />
                      <Route path="/night-audit" element={<NightAudit />} />

                      {/* Admin */}
                      <Route
                        path="/admin/publicity"
                        element={<PublicityAdmin />}
                      />
                      <Route
                        path="/admin/migration"
                        element={<MigrationHub />}
                      />
                      <Route path="/admin/analytics" element={<Analytics />} />
                      <Route
                        path="/admin/automation"
                        element={<Automation />}
                      />
                      <Route path="/admin/audit" element={<AuditPanel />} />
                      <Route
                        path="/admin/environment"
                        element={<EnvironmentManager />}
                      />
                      <Route
                        path="/admin/translations"
                        element={<TranslationsAdmin />}
                      />

                      {/* Portals - Protected by RequirePermission internally or here */}
                      <Route path="/portal/tenant" element={<TenantPortal />} />
                      <Route path="/portal/owner" element={<OwnerPortal />} />
                      <Route
                        path="/portal/partner"
                        element={<PartnerPortal />}
                      />

                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </TooltipProvider>
              </BrowserRouter>
            </TranslationProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  )
}

export default App
