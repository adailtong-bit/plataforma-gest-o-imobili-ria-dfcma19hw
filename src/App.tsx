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
import { AppProvider } from '@/stores/AppContext'
import { ThemeProvider } from '@/components/theme-provider'
import { useEffect } from 'react'

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
            <Routes>
              {/* Public Routes - No Layout */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Main Application Routes - Wrapped in DashboardLayout */}
              {/* The Layout handles: */}
              {/* 1. Sidebar/Header visibility based on authentication */}
              {/* 2. Public Landing page display for unauthenticated users at root */}
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:id" element={<PropertyDetails />} />
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
                <Route path="/service-pricing" element={<ServicePricing />} />
                <Route path="/market-analysis" element={<MarketAnalysis />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/workflows" element={<Workflows />} />
                <Route path="/renewals" element={<Renewals />} />
                <Route path="/visits" element={<Visits />} />

                {/* Admin */}
                <Route path="/admin/publicity" element={<PublicityAdmin />} />
                <Route path="/admin/migration" element={<MigrationHub />} />
                <Route path="/admin/analytics" element={<Analytics />} />
                <Route path="/admin/automation" element={<Automation />} />

                {/* Portals */}
                <Route path="/portal/tenant" element={<TenantPortal />} />
                <Route path="/portal/owner" element={<OwnerPortal />} />
                <Route path="/portal/partner" element={<PartnerPortal />} />

                {/* 404 Inside Layout so authenticated users still see nav */}
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
