import {
  lazy,
  Suspense,
  useEffect,
  Component,
  ReactNode,
  ErrorInfo,
} from 'react'
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
import { DashboardLayout } from '@/components/DashboardLayout'
import { AppProvider } from '@/stores/AppContext'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import useAuthStore from '@/stores/useAuthStore'
import { Skeleton } from '@/components/ui/skeleton'
import { TourGuide } from '@/components/tour/TourGuide'
import logoImg from '@/assets/summerpm-logo-d35a2.jpg'
import { TranslationProvider } from '@/hooks/use-db-translations'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Properties = lazy(() => import('@/pages/Properties'))
const PropertyDetails = lazy(() => import('@/pages/PropertyDetails'))
const CalendarPage = lazy(() => import('@/pages/Calendar'))
const Tasks = lazy(() => import('@/pages/Tasks'))
const Financial = lazy(() => import('@/pages/Financial'))
const Invoices = lazy(() => import('@/pages/Invoices'))
const Messages = lazy(() => import('@/pages/Messages'))
const Settings = lazy(() => import('@/pages/Settings'))
const Tenants = lazy(() => import('@/pages/Tenants'))
const TenantDetails = lazy(() => import('@/pages/TenantDetails'))
const Owners = lazy(() => import('@/pages/Owners'))
const OwnerDetails = lazy(() => import('@/pages/OwnerDetails'))
const Partners = lazy(() => import('@/pages/Partners'))
const PartnerDetails = lazy(() => import('@/pages/PartnerDetails'))
const Condominiums = lazy(() => import('@/pages/Condominiums'))
const CondominiumDetails = lazy(() => import('@/pages/CondominiumDetails'))
const Hotels = lazy(() => import('@/pages/Hotels'))
const HotelDetails = lazy(() => import('@/pages/HotelDetails'))
const TowerDetails = lazy(() => import('@/pages/TowerDetails'))
const HotelRoomDetails = lazy(() => import('@/pages/HotelRoomDetails'))
const Users = lazy(() => import('@/pages/Users'))
const ServicePricing = lazy(() => import('@/pages/ServicePricing'))
const TenantPortal = lazy(() => import('@/pages/portal/TenantPortal'))
const OwnerPortal = lazy(() => import('@/pages/portal/OwnerPortal'))
const PartnerPortal = lazy(() => import('@/pages/portal/PartnerPortal'))
const MarketAnalysis = lazy(() => import('@/pages/MarketAnalysis'))
const Workflows = lazy(() => import('@/pages/Workflows'))
const Renewals = lazy(() => import('@/pages/Renewals'))
const PublicityAdmin = lazy(() => import('@/pages/admin/PublicityAdmin'))
const MigrationHub = lazy(() => import('@/pages/admin/MigrationHub'))
const FrontDesk = lazy(() => import('@/pages/FrontDesk'))
const Analytics = lazy(() => import('@/pages/admin/Analytics'))
const Automation = lazy(() => import('@/pages/admin/Automation'))
const AuditPanel = lazy(() => import('@/pages/admin/AuditPanel'))
const TranslationsAdmin = lazy(() => import('@/pages/admin/TranslationsAdmin'))
const EnvironmentManager = lazy(
  () => import('@/pages/admin/EnvironmentManager'),
)
const ShortTerm = lazy(() => import('@/pages/ShortTerm'))
const Reports = lazy(() => import('@/pages/Reports'))
const Visits = lazy(() => import('@/pages/Visits'))
const HelpHub = lazy(() => import('@/pages/HelpHub'))
const Housekeeping = lazy(() => import('@/pages/Housekeeping'))
const RoomConcierge = lazy(() => import('@/pages/guest/RoomConcierge'))
const OnlineCheckIn = lazy(() => import('@/pages/guest/OnlineCheckIn'))
const OnlineCheckOut = lazy(() => import('@/pages/guest/OnlineCheckOut'))
const NightAudit = lazy(() => import('@/pages/NightAudit'))
const Performance = lazy(() => import('@/pages/Performance'))
const GuestServices = lazy(() => import('@/pages/GuestServices'))
const PointOfSale = lazy(() => import('@/pages/PointOfSale'))
const Marketing = lazy(() => import('@/pages/Marketing'))
const Pricing = lazy(() => import('@/pages/Pricing'))

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

const PageLoader = () => (
  <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center p-8 space-y-6">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="space-y-2 w-full max-w-[200px]">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5 mx-auto" />
    </div>
  </div>
)

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

const DebugCleanup = () => {
  const location = useLocation()

  useEffect(() => {
    // Robust global removal of residual currentRoute debug blocks from older layouts
    document.querySelectorAll('pre').forEach((pre) => {
      if (pre.textContent?.includes('currentRoute')) {
        pre.remove()
      }
    })
  }, [location.pathname])

  return null
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
                <DebugCleanup />
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <TourGuide />
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route
                        path="/guest/:roomId"
                        element={<RoomConcierge />}
                      />
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
                        <Route
                          path="/condominiums"
                          element={<Condominiums />}
                        />
                        <Route
                          path="/condominiums/:id"
                          element={<CondominiumDetails />}
                        />
                        <Route path="/tenants" element={<Tenants />} />
                        <Route
                          path="/tenants/:id"
                          element={<TenantDetails />}
                        />
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
                        <Route
                          path="/housekeeping"
                          element={<Housekeeping />}
                        />
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
                        <Route
                          path="/admin/analytics"
                          element={<Analytics />}
                        />
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
                        <Route
                          path="/portal/tenant"
                          element={<TenantPortal />}
                        />
                        <Route path="/portal/owner" element={<OwnerPortal />} />
                        <Route
                          path="/portal/partner"
                          element={<PartnerPortal />}
                        />

                        <Route path="*" element={<NotFound />} />
                      </Route>
                    </Routes>
                  </Suspense>
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
