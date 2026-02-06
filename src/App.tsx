import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import DashboardLayout from './components/DashboardLayout'
import Properties from './pages/Properties'
import PropertyDetails from './pages/PropertyDetails'
import CalendarPage from './pages/Calendar'
import Tasks from './pages/Tasks'
import Financial from './pages/Financial'
import Invoices from './pages/Invoices'
import Messages from './pages/Messages'
import Settings from './pages/Settings'
import Tenants from './pages/Tenants'
import TenantDetails from './pages/TenantDetails'
import Owners from './pages/Owners'
import OwnerDetails from './pages/OwnerDetails'
import Partners from './pages/Partners'
import PartnerDetails from './pages/PartnerDetails'
import Condominiums from './pages/Condominiums'
import CondominiumDetails from './pages/CondominiumDetails'
import Hotels from './pages/Hotels'
import HotelDetails from './pages/HotelDetails'
import TowerDetails from './pages/TowerDetails'
import Users from './pages/Users'
import ServicePricing from './pages/ServicePricing'
import TenantPortal from './pages/portal/TenantPortal'
import OwnerPortal from './pages/portal/OwnerPortal'
import PartnerPortal from './pages/portal/PartnerPortal'
import MarketAnalysis from './pages/MarketAnalysis'
import Workflows from './pages/Workflows'
import Renewals from './pages/Renewals'
import PublicityAdmin from './pages/admin/PublicityAdmin'
import MigrationHub from './pages/admin/MigrationHub'
import Analytics from './pages/admin/Analytics'
import Automation from './pages/admin/Automation'
import ShortTerm from './pages/ShortTerm'
import Reports from './pages/Reports'
import Visits from './pages/Visits'
import HelpHub from './pages/HelpHub'
import { AppProvider } from '@/stores/AppContext'
import { ThemeProvider } from '@/components/theme-provider'
import { useEffect } from 'react'
import { RequirePermission } from '@/components/RequirePermission'
import { TourGuide } from '@/components/tour/TourGuide'

const App = () => {
  useEffect(() => {
    document.title = 'COREPM'
  }, [])

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
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

              {/* Protected Routes */}
              <Route element={<DashboardLayout />}>
                <Route
                  path="/"
                  element={
                    <RequirePermission resource="dashboard">
                      <Index />
                    </RequirePermission>
                  }
                />
                <Route path="/help" element={<HelpHub />} />
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
                    <RequirePermission resource="settings">
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

                {/* Portals - Also protected by RequirePermission internally or here */}
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
    </ThemeProvider>
  )
}

export default App
