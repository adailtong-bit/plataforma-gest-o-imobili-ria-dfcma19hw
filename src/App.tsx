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

const App = () => (
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
)

export default App
