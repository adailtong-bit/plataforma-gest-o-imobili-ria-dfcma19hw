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
import Analytics from '@/pages/admin/Analytics'
import Automation from '@/pages/admin/Automation'
import AuditPanel from '@/pages/admin/AuditPanel'
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
import { AppProvider } from '@/stores/AppContext'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/hooks/use-auth'
import { useEffect } from 'react'
import { RequirePermission } from '@/components/RequirePermission'
import { TourGuide } from '@/components/tour/TourGuide'
import logoImg from '@/assets/summerpm-logo-d35a2.jpg'

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
                <Route element={<DashboardLayout />}>
                  {/* Real Estate Dashboard as Main Route */}
                  <Route
                    path="/"
                    element={
                      <RequirePermission resource="dashboard">
                        <Dashboard />
                      </RequirePermission>
                    }
                  />
                  {/* Dashboard Alias */}
                  <Route
                    path="/dashboard"
                    element={
                      <RequirePermission resource="dashboard">
                        <Dashboard />
                      </RequirePermission>
                    }
                  />
                  <Route path="/help" element={<HelpHub />} />

                  {/* Advanced Management Tools */}
                  <Route
                    path="/performance"
                    element={
                      <RequirePermission resource="performance">
                        <Performance />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/guest-services"
                    element={
                      <RequirePermission resource="guest_services">
                        <GuestServices />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/pos"
                    element={
                      <RequirePermission resource="pos">
                        <PointOfSale />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/marketing"
                    element={
                      <RequirePermission resource="marketing">
                        <Marketing />
                      </RequirePermission>
                    }
                  />

                  <Route
                    path="/properties"
                    element={
                      <RequirePermission resource="properties">
                        <Properties />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/properties/:id"
                    element={
                      <RequirePermission resource="properties">
                        <PropertyDetails />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/hotels"
                    element={
                      <RequirePermission resource="hotels">
                        <Hotels />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/hotels/:id"
                    element={
                      <RequirePermission resource="hotels">
                        <HotelDetails />
                      </RequirePermission>
                    }
                  />
                  {/* Direct Room Navigation */}
                  <Route
                    path="/hotels/:hotelId/rooms/:roomId"
                    element={
                      <RequirePermission resource="hotels">
                        <HotelRoomDetails />
                      </RequirePermission>
                    }
                  />
                  {/* Tower Room Navigation */}
                  <Route
                    path="/hotels/:hotelId/towers/:towerId/rooms/:roomId"
                    element={
                      <RequirePermission resource="hotels">
                        <HotelRoomDetails />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/hotels/:id/towers/:towerId"
                    element={
                      <RequirePermission resource="hotels">
                        <TowerDetails />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/short-term"
                    element={
                      <RequirePermission resource="short_term">
                        <ShortTerm />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/condominiums"
                    element={
                      <RequirePermission resource="condominiums">
                        <Condominiums />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/condominiums/:id"
                    element={
                      <RequirePermission resource="condominiums">
                        <CondominiumDetails />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/tenants"
                    element={
                      <RequirePermission resource="tenants">
                        <Tenants />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/tenants/:id"
                    element={
                      <RequirePermission resource="tenants">
                        <TenantDetails />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/owners"
                    element={
                      <RequirePermission resource="owners">
                        <Owners />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/owners/:id"
                    element={
                      <RequirePermission resource="owners">
                        <OwnerDetails />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/partners"
                    element={
                      <RequirePermission resource="partners">
                        <Partners />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/partners/:id"
                    element={
                      <RequirePermission resource="partners">
                        <PartnerDetails />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/calendar"
                    element={
                      <RequirePermission resource="calendar">
                        <CalendarPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/tasks"
                    element={
                      <RequirePermission resource="tasks">
                        <Tasks />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/financial"
                    element={
                      <RequirePermission resource="financial">
                        <Financial />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/invoices"
                    element={
                      <RequirePermission resource="financial">
                        <Invoices />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/messages"
                    element={
                      <RequirePermission resource="messages">
                        <Messages />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <RequirePermission resource="settings">
                        <Settings />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <RequirePermission resource="users">
                        <Users />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/service-pricing"
                    element={
                      <RequirePermission resource="service_pricing">
                        <ServicePricing />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/market-analysis"
                    element={
                      <RequirePermission resource="market_analysis">
                        <MarketAnalysis />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <RequirePermission resource="reports">
                        <Reports />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/workflows"
                    element={
                      <RequirePermission resource="workflows">
                        <Workflows />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/renewals"
                    element={
                      <RequirePermission resource="renewals">
                        <Renewals />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/visits"
                    element={
                      <RequirePermission resource="visits">
                        <Visits />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/housekeeping"
                    element={
                      <RequirePermission resource="tasks">
                        <Housekeeping />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/night-audit"
                    element={
                      <RequirePermission resource="financial">
                        <NightAudit />
                      </RequirePermission>
                    }
                  />

                  {/* Admin */}
                  <Route
                    path="/admin/publicity"
                    element={
                      <RequirePermission resource="publicity">
                        <PublicityAdmin />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/admin/migration"
                    element={
                      <RequirePermission resource="migration">
                        <MigrationHub />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <RequirePermission resource="analytics">
                        <Analytics />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/admin/automation"
                    element={
                      <RequirePermission resource="automation">
                        <Automation />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/admin/audit"
                    element={
                      <RequirePermission resource="audit_logs" ignoreSimulation>
                        <AuditPanel />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/admin/environment"
                    element={
                      <RequirePermission resource="audit_logs" ignoreSimulation>
                        <EnvironmentManager />
                      </RequirePermission>
                    }
                  />

                  {/* Portals - Protected by RequirePermission internally or here */}
                  <Route
                    path="/portal/tenant"
                    element={
                      <RequirePermission resource="portal">
                        <TenantPortal />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/portal/owner"
                    element={
                      <RequirePermission resource="portal">
                        <OwnerPortal />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/portal/partner"
                    element={
                      <RequirePermission resource="portal">
                        <PartnerPortal />
                      </RequirePermission>
                    }
                  />

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
