import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import DashboardLayout from './components/DashboardLayout'
import Properties from './pages/Properties'
import PropertyDetails from './pages/PropertyDetails'
import CalendarPage from './pages/Calendar'
import Tasks from './pages/Tasks'
import Financial from './pages/Financial'
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
import { AppProvider } from '@/stores/AppContext'
import { useEffect } from 'react'

const App = () => {
  useEffect(() => {
    document.title = 'COREPM'
  }, [])

  return (
    <AppProvider>
      <BrowserRouter
        future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
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
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/users" element={<Users />} />
              <Route path="/service-pricing" element={<ServicePricing />} />
              <Route path="/market-analysis" element={<MarketAnalysis />} />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/renewals" element={<Renewals />} />
              {/* Portals */}
              <Route path="/portal/tenant" element={<TenantPortal />} />
              <Route path="/portal/owner" element={<OwnerPortal />} />
              <Route path="/portal/partner" element={<PartnerPortal />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
