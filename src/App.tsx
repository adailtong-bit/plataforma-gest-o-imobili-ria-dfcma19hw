import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import NotFound from '@/pages/NotFound'
import DashboardLayout from '@/components/DashboardLayout'
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
import { AppProvider } from '@/stores/AppContext'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { Loader2 } from 'lucide-react'
import { TourGuide } from '@/components/tour/TourGuide'
import logoImg from '@/assets/summerpm-logo-d35a2.jpg'

const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const { session, loading: supabaseLoading } = useAuth()
  const { isAuthenticated: appAuthenticated, isAuthLoading: appLoading } =
    useAuthStore()
  const location = useLocation()

  const isLoading = supabaseLoading || appLoading
  const isAuth = !!session || appAuthenticated

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 gap-4 animate-in fade-in duration-500">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <h2 className="text-xl font-medium text-slate-700">Carregando...</h2>
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
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <AppProvider>
          <BrowserRouter
            future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
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
                      <DashboardLayout />
                    </AuthGuard>
                  }
                >
                  {/* Real Estate Dashboard as Main Route */}
                  <Route path="/" element={<Dashboard />} />
                  {/* Dashboard Alias */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/help" element={<HelpHub />} />

                  {/* Advanced Management Tools */}
                  <Route path="/performance" element={<Performance />} />
                  <Route path="/guest-services" element={<GuestServices />} />
                  <Route path="/pos" element={<PointOfSale />} />
                  <Route path="/marketing" element={<Marketing />} />

                  <Route path="/properties" element={<Properties />} />
                  <Route path="/properties/:id" element={<PropertyDetails />} />
                  <Route path="/hotels" element={<Hotels />} />
                  <Route path="/hotels/:id" element={<HotelDetails />} />
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
                  <Route path="/partners" element={<Partners />} />
                  <Route path="/partners/:id" element={<PartnerDetails />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/financial" element={<Financial />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/service-pricing" element={<ServicePricing />} />
                  <Route path="/market-analysis" element={<MarketAnalysis />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/workflows" element={<Workflows />} />
                  <Route path="/renewals" element={<Renewals />} />
                  <Route path="/visits" element={<Visits />} />
                  <Route path="/housekeeping" element={<Housekeeping />} />
                  <Route path="/night-audit" element={<NightAudit />} />

                  {/* Admin */}
                  <Route path="/admin/publicity" element={<PublicityAdmin />} />
                  <Route path="/admin/migration" element={<MigrationHub />} />
                  <Route path="/admin/analytics" element={<Analytics />} />
                  <Route path="/admin/automation" element={<Automation />} />
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
                  <Route path="/portal/partner" element={<PartnerPortal />} />

                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </TooltipProvider>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
