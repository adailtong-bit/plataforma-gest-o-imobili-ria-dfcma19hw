import React, { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  Home,
  Building2,
  Users,
  Calendar,
  Settings,
  Wrench,
  DollarSign,
  MessageSquare,
  FileText,
  PieChart,
  Repeat,
  Megaphone,
  HardHat,
  Database,
  Briefcase,
  Activity,
  HeartHandshake,
  ShoppingCart,
  Zap,
  MapPin,
  Hotel,
  MoonStar,
  ConciergeBell,
  MonitorPlay,
  ShieldCheck,
  Languages,
  AlertCircle,
} from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { Logo } from '@/components/Logo'
import { NavUser } from '@/components/NavUser'
import { supabase } from '@/lib/supabase/client'

type AuthUser = {
  role?: string
  permissions?: unknown[]
  [key: string]: unknown
}

// Error Boundary for the Sidebar component
class SidebarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Sidebar error:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-slate-900 h-full flex flex-col items-center justify-center text-slate-400">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-sm text-center">Failed to load navigation.</p>
        </div>
      )
    }
    return this.props.children
  }
}

const iconMap: Record<string, React.ElementType> = {
  Home,
  Building2,
  Users,
  Calendar,
  Settings,
  Wrench,
  DollarSign,
  MessageSquare,
  FileText,
  PieChart,
  Repeat,
  Megaphone,
  HardHat,
  Database,
  Briefcase,
  Activity,
  HeartHandshake,
  ShoppingCart,
  Zap,
  MapPin,
  Hotel,
  MoonStar,
  ConciergeBell,
  MonitorPlay,
  ShieldCheck,
  Languages,
}

type DbMenu = {
  id: string
  label: string
  icon: string
  path: string
  parent_id: string | null
  order_index: number
  required_role: string[] | null
  section: string
  resource: string | null
}

function AppSidebarContent() {
  const location = useLocation()
  const { currentUser, hasPermissionSync, simulationMode, simulationRole } =
    useAuthStore()
  const { t } = useDbTranslations()

  const [dbMenus, setDbMenus] = useState<DbMenu[]>([])
  const [menusLoading, setMenusLoading] = useState(true)
  const [menuError, setMenuError] = useState(false)

  useEffect(() => {
    let isMounted = true
    const fetchMenus = async () => {
      try {
        const { data, error } = await supabase
          .from('app_menus')
          .select('*')
          .order('order_index', { ascending: true })

        if (error) throw error

        if (isMounted) {
          if (data && data.length > 0) {
            setDbMenus(data)
          } else {
            setMenuError(true)
          }
          setMenusLoading(false)
        }
      } catch (err) {
        console.error('Failed to fetch menus:', err)
        if (isMounted) {
          setMenuError(true)
          setMenusLoading(false)
        }
      }
    }

    fetchMenus()

    return () => {
      isMounted = false
    }
  }, [])

  const effectiveRole =
    simulationMode && simulationRole ? simulationRole : currentUser?.role
  const effectiveUser = (
    simulationMode && simulationRole && currentUser
      ? { ...currentUser, role: simulationRole, permissions: [] }
      : currentUser
  ) as AuthUser

  const mapDbMenu = (m: DbMenu) => ({
    title: t(m.label, m.label.split('.').pop() || m.label),
    url: m.path,
    icon: iconMap[m.icon] || AlertCircle,
    resource: m.resource,
    roles: m.required_role,
    role: m.required_role?.[0],
  })

  const mainNavItems = useMemo(() => {
    if (!menusLoading && !menuError && dbMenus.length > 0) {
      return dbMenus.filter((m) => m.section === 'main').map(mapDbMenu)
    }
    return [
      {
        title: t('menu.dashboard', 'Dashboard'),
        url: '/',
        icon: Home,
        resource: 'dashboard',
      },
      {
        title: t('menu.properties', 'Properties'),
        url: '/properties',
        icon: Building2,
        resource: 'properties',
      },
      {
        title: t('hotels.title', 'Hotels'),
        url: '/hotels',
        icon: Hotel,
        resource: 'hotels',
      },
      {
        title: t('sidebar.condominiums', 'Condominiums'),
        url: '/condominiums',
        icon: MapPin,
        resource: 'condominiums',
      },
      {
        title: t('sidebar.owners', 'Owners'),
        url: '/owners',
        icon: Briefcase,
        resource: 'owners',
      },
      {
        title: t('sidebar.tenants', 'Tenants'),
        url: '/tenants',
        icon: Users,
        resource: 'tenants',
      },
      {
        title: t('sidebar.calendar', 'Calendar'),
        url: '/calendar',
        icon: Calendar,
        resource: 'calendar',
      },
      {
        title: t('menu.finances', 'Finances'),
        url: '/financial',
        icon: DollarSign,
        resource: 'financial',
      },
      {
        title: t('menu.invoices', 'Invoices'),
        url: '/invoices',
        icon: FileText,
        resource: 'financial',
      },
      {
        title: t('common.short_term', 'Short Term Rental'),
        url: '/short-term',
        icon: Building2,
        resource: 'short_term',
      },
      {
        title: t('common.visits', 'Visits'),
        url: '/visits',
        icon: MapPin,
        resource: 'visits',
      },
      {
        title: t('common.renewals', 'Renewals'),
        url: '/renewals',
        icon: Repeat,
        resource: 'renewals',
      },
      {
        title: t('sidebar.reports', 'Reports'),
        url: '/reports',
        icon: FileText,
        resource: 'reports',
      },
      {
        title: t('common.market_analysis', 'Market Analysis'),
        url: '/market-analysis',
        icon: PieChart,
        resource: 'market_analysis',
      },
    ]
  }, [t, dbMenus, menusLoading, menuError])

  const operationsItems = useMemo(() => {
    if (!menusLoading && !menuError && dbMenus.length > 0) {
      return dbMenus.filter((m) => m.section === 'operations').map(mapDbMenu)
    }
    return [
      {
        title: t('sidebar.performance', 'Performance'),
        url: '/performance',
        icon: Activity,
        resource: 'performance',
      },
      {
        title: t('sidebar.guest_services', 'Guest Services'),
        url: '/guest-services',
        icon: HeartHandshake,
        resource: 'guest_services',
      },
      {
        title: t('sidebar.pos', 'POS'),
        url: '/pos',
        icon: ShoppingCart,
        resource: 'pos',
      },
      {
        title: t('sidebar.marketing', 'Marketing'),
        url: '/marketing',
        icon: Zap,
        resource: 'marketing',
      },
      {
        title: t('menu.tasks', 'Tasks'),
        url: '/tasks',
        icon: Wrench,
        resource: 'tasks',
      },
      {
        title: t('sidebar.front_desk', 'Front Desk'),
        url: '/front-desk',
        icon: ConciergeBell,
        resource: 'properties',
      },
      {
        title: t('sidebar.housekeeping', 'Housekeeping'),
        url: '/housekeeping',
        icon: HardHat,
        resource: 'tasks',
      },
      {
        title: t('sidebar.night_audit', 'Night Audit'),
        url: '/night-audit',
        icon: MoonStar,
        resource: 'financial',
      },
      {
        title: t('sidebar.partners', 'Partners'),
        url: '/partners',
        icon: HardHat,
        resource: 'partners',
      },
      {
        title: t('menu.messages', 'Messages'),
        url: '/messages',
        icon: MessageSquare,
        resource: 'messages',
      },
      {
        title: t('common.workflows', 'Workflows'),
        url: '/workflows',
        icon: Repeat,
        resource: 'workflows',
      },
    ]
  }, [t, dbMenus, menusLoading, menuError])

  const systemItems = useMemo(() => {
    if (!menusLoading && !menuError && dbMenus.length > 0) {
      return dbMenus.filter((m) => m.section === 'system').map(mapDbMenu)
    }
    return [
      {
        title: t('menu.settings', 'Settings'),
        url: '/settings',
        icon: Settings,
        resource: 'settings',
      },
      {
        title: t('sidebar.pricing', 'Pricing'),
        url: '/pricing',
        icon: DollarSign,
        resource: 'settings',
      },
      {
        title: t('common.service_pricing', 'Price Catalog'),
        url: '/service-pricing',
        icon: DollarSign,
        resource: 'service_pricing',
      },
      {
        title: t('sidebar.users', 'Users'),
        url: '/users',
        icon: Users,
        resource: 'users',
      },
      {
        title: t('sidebar.publicity_admin', 'Publicity Administration'),
        url: '/admin/publicity',
        icon: Megaphone,
        resource: 'publicity',
      },
      {
        title: t('sidebar.migration_hub', 'Migration Hub'),
        url: '/admin/migration',
        icon: Database,
        resource: 'migration',
      },
      {
        title: t('common.advanced_analytics', 'Advanced Analytics'),
        url: '/admin/analytics',
        icon: PieChart,
        resource: 'analytics',
      },
      {
        title: t('common.automation_rules', 'Automation Rules'),
        url: '/admin/automation',
        icon: Zap,
        resource: 'automation',
      },
      {
        title: t('sidebar.audit_panel', 'Audit Panel'),
        url: '/admin/audit',
        icon: ShieldCheck,
        resource: 'audit_logs',
        roles: ['platform_owner'],
      },
      {
        title: t('sidebar.environment', 'Environment'),
        url: '/admin/environment',
        icon: MonitorPlay,
        resource: 'settings',
        roles: ['platform_owner'],
      },
      {
        title: t('sidebar.translations', 'Translations'),
        url: '/admin/translations',
        icon: Languages,
        resource: 'settings',
        roles: ['platform_owner', 'master', 'internal_user', 'software_tenant'],
      },
    ]
  }, [t, dbMenus, menusLoading, menuError])

  const portalItems = useMemo(() => {
    if (!menusLoading && !menuError && dbMenus.length > 0) {
      return dbMenus.filter((m) => m.section === 'portal').map(mapDbMenu)
    }
    return [
      {
        title: t('menu.main_dashboard', 'Main Dashboard'),
        url: '/',
        icon: Home,
        resource: 'dashboard',
        role: 'tenant',
      },
      {
        title: t('menu.main_dashboard', 'Main Dashboard'),
        url: '/',
        icon: Home,
        resource: 'dashboard',
        role: 'property_owner',
      },
      {
        title: t('menu.main_dashboard', 'Main Dashboard'),
        url: '/',
        icon: Home,
        resource: 'dashboard',
        role: 'partner',
      },
      {
        title: t('menu.main_dashboard', 'Main Dashboard'),
        url: '/',
        icon: Home,
        resource: 'dashboard',
        role: 'partner_employee',
      },
    ]
  }, [t, dbMenus, menusLoading, menuError])

  const filteredMain = useMemo(
    () =>
      mainNavItems.filter((item) =>
        hasPermissionSync(effectiveUser, item.resource as never, 'view'),
      ),
    [mainNavItems, effectiveUser, hasPermissionSync],
  )

  const filteredOps = useMemo(
    () =>
      operationsItems.filter((item) =>
        hasPermissionSync(effectiveUser, item.resource as never, 'view'),
      ),
    [operationsItems, effectiveUser, hasPermissionSync],
  )

  const filteredSystem = useMemo(
    () =>
      systemItems.filter((item) => {
        if (item.roles && effectiveUser?.role === 'platform_owner') {
          return true
        }
        const hasPerm = hasPermissionSync(
          effectiveUser,
          item.resource as never,
          'view',
        )
        if (
          item.roles &&
          (!effectiveUser || !item.roles.includes(effectiveUser.role))
        ) {
          return false
        }
        return hasPerm
      }),
    [systemItems, effectiveUser, hasPermissionSync],
  )

  const isPortalUser = [
    'tenant',
    'property_owner',
    'partner',
    'partner_employee',
  ].includes(effectiveRole || '')

  const activePortalItem = portalItems.find(
    (item) => item.role === effectiveRole,
  )

  return (
    <Sidebar className="bg-slate-900 border-r-slate-800 text-slate-300">
      <SidebarHeader className="p-4 pt-6 pb-2 shrink-0">
        <Logo className="w-32 mx-auto text-white mb-2" />
        <div className="text-center mt-2">
          {currentUser && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
              {t(`roles.${effectiveRole}`, effectiveRole as string)}
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar">
        {isPortalUser ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 uppercase text-[10px] font-bold tracking-wider px-4 mb-2">
              {t('sidebar.portal', 'Portal')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {activePortalItem && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        location.pathname === activePortalItem.url ||
                        location.pathname === '/'
                      }
                      className="data-[active=true]:bg-trust-blue data-[active=true]:text-white hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <Link to={activePortalItem.url} className="px-4 py-2.5">
                        <activePortalItem.icon className="h-4 w-4 mr-3" />
                        <span className="font-medium text-sm">
                          {activePortalItem.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {effectiveRole === 'property_owner' && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === '/messages'}
                        className="data-[active=true]:bg-trust-blue data-[active=true]:text-white hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <Link to="/messages" className="px-4 py-2.5">
                          <MessageSquare className="h-4 w-4 mr-3" />
                          <span className="font-medium text-sm">
                            {t('menu.messages_pm_sync', 'Messages (PM Sync)')}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
                {effectiveRole === 'tenant' && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === '/messages'}
                      className="data-[active=true]:bg-trust-blue data-[active=true]:text-white hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <Link to="/messages" className="px-4 py-2.5">
                        <MessageSquare className="h-4 w-4 mr-3" />
                        <span className="font-medium text-sm">
                          {t('menu.messages', 'Messages')}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {(effectiveRole === 'partner' ||
                  effectiveRole === 'partner_employee') && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === '/tasks'}
                        className="data-[active=true]:bg-trust-blue data-[active=true]:text-white hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <Link to="/tasks" className="px-4 py-2.5">
                          <Wrench className="h-4 w-4 mr-3" />
                          <span className="font-medium text-sm">
                            {t('menu.tasks', 'Tasks')}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === '/messages'}
                        className="data-[active=true]:bg-trust-blue data-[active=true]:text-white hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <Link to="/messages" className="px-4 py-2.5">
                          <MessageSquare className="h-4 w-4 mr-3" />
                          <span className="font-medium text-sm">
                            {t('menu.messages', 'Messages')}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <>
            {filteredMain.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-slate-500 uppercase text-[10px] font-bold tracking-wider px-4 mb-2">
                  {t('sidebar.main_menu', 'Main Menu')}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredMain.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === item.url}
                          className="data-[active=true]:bg-trust-blue data-[active=true]:text-white hover:bg-slate-800 hover:text-white transition-colors"
                        >
                          <Link to={item.url} className="px-4 py-2.5">
                            <item.icon className="h-4 w-4 mr-3" />
                            <span className="font-medium text-sm">
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {filteredOps.length > 0 && (
              <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-slate-500 uppercase text-[10px] font-bold tracking-wider px-4 mb-2">
                  {t('common.operations', 'Operations')}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredOps.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === item.url}
                          className="data-[active=true]:bg-trust-blue data-[active=true]:text-white hover:bg-slate-800 hover:text-white transition-colors"
                        >
                          <Link to={item.url} className="px-4 py-2.5">
                            <item.icon className="h-4 w-4 mr-3" />
                            <span className="font-medium text-sm">
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {filteredSystem.length > 0 && (
              <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-slate-500 uppercase text-[10px] font-bold tracking-wider px-4 mb-2">
                  {t('sidebar.system', 'System')}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredSystem.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === item.url}
                          className="data-[active=true]:bg-trust-blue data-[active=true]:text-white hover:bg-slate-800 hover:text-white transition-colors"
                        >
                          <Link to={item.url} className="px-4 py-2.5">
                            <item.icon className="h-4 w-4 mr-3" />
                            <span className="font-medium text-sm">
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-800 p-4 shrink-0 bg-slate-900 z-10">
        <NavUser user={currentUser as never} />
      </SidebarFooter>
    </Sidebar>
  )
}

export function AppSidebar() {
  return (
    <SidebarErrorBoundary>
      <AppSidebarContent />
    </SidebarErrorBoundary>
  )
}
