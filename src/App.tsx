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
import Owners from './pages/Owners'
import OwnerDetails from './pages/OwnerDetails'
import Partners from './pages/Partners'
import Condominiums from './pages/Condominiums'
import { AppProvider } from '@/stores/AppContext'

const App = () => (
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
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/owners" element={<Owners />} />
            <Route path="/owners/:id" element={<OwnerDetails />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/financial" element={<Financial />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppProvider>
)

export default App
