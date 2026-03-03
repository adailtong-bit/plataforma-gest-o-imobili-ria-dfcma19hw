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
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { Logo } from '@/components/Logo'
import { NavUser } from '@/components/NavUser'

export function AppSidebar() {
  const location = useLocation()
  const { currentUser, checkPermission, hasPermissionSync } = useAuthStore()
  const { t } = useLanguageStore()

  const getTitle = (key: string, fallback: string) => {
    const text = t(key)
    if (!text || text === key || text.includes('.')) return fallback
    return text
  }

  const mainNavItems = [
    {
      title: getTitle('sidebar.dashboard', 'Dashboard'),
      url: '/',
      icon: Home,
      resource: 'dashboard',
    },
    {
      title: getTitle('sidebar.units', 'Properties'),
      url: '/properties',
      icon: Building2,
      resource: 'properties',
    },
    {
      title: getTitle('hotels.title', 'Hotels'),
      url: '/hotels',
      icon: Hotel,
      resource: 'hotels',
    },
    {
      title: getTitle('sidebar.condominiums', 'Condominiums'),
      url: '/condominiums',
      icon: MapPin,
      resource: 'condominiums',
    },
    {
      title: getTitle('sidebar.owners', 'Owners'),
      url: '/owners',
      icon: Briefcase,
      resource: 'owners',
    },
    {
      title: getTitle('sidebar.tenants', 'Tenants'),
      url: '/tenants',
      icon: Users,
      resource: 'tenants',
    },
    {
      title: getTitle('sidebar.calendar', 'Calendar'),
      url: '/calendar',
      icon: Calendar,
      resource: 'calendar',
    },
    {
      title: getTitle('sidebar.financial', 'Financial'),
      url: '/financial',
      icon: DollarSign,
      resource: 'financial',
    },
    {
      title: getTitle('common.invoices', 'Invoices'),
      url: '/invoices',
      icon: FileText,
      resource: 'financial',
    },
    {
      title: getTitle('common.short_term', 'Short Term'),
      url: '/short-term',
      icon: Building2,
      resource: 'short_term',
    },
    {
      title: getTitle('common.visits', 'Visits'),
      url: '/visits',
      icon: MapPin,
      resource: 'visits',
    },
    {
      title: getTitle('common.renewals', 'Renewals'),
      url: '/renewals',
      icon: Repeat,
      resource: 'renewals',
    },
    {
      title: getTitle('sidebar.reports', 'Reports'),
      url: '/reports',
      icon: FileText,
      resource: 'reports',
    },
    {
      title: getTitle('common.market_analysis', 'Market Analysis'),
      url: '/market-analysis',
      icon: PieChart,
      resource: 'market_analysis',
    },
  ]

  const operationsItems = [
    {
      title: getTitle('sidebar.performance', 'Performance'),
      url: '/performance',
      icon: Activity,
      resource: 'performance',
    },
    {
      title: getTitle('sidebar.guest_services', 'Guest Services'),
      url: '/guest-services',
      icon: HeartHandshake,
      resource: 'guest_services',
    },
    {
      title: getTitle('sidebar.pos', 'POS'),
      url: '/pos',
      icon: ShoppingCart,
      resource: 'pos',
    },
    {
      title: getTitle('sidebar.marketing', 'Marketing'),
      url: '/marketing',
      icon: Zap,
      resource: 'marketing',
    },
    {
      title: getTitle('common.tasks', 'Tasks'),
      url: '/tasks',
      icon: Wrench,
      resource: 'tasks',
    },
    {
      title: getTitle('sidebar.housekeeping', 'Housekeeping'),
      url: '/housekeeping',
      icon: HardHat,
      resource: 'tasks',
    },
    {
      title: getTitle('sidebar.night_audit', 'Night Audit'),
      url: '/night-audit',
      icon: MoonStar,
      resource: 'financial',
    },
    {
      title: getTitle('sidebar.partners', 'Partners'),
      url: '/partners',
      icon: HardHat,
      resource: 'partners',
    },
    {
      title: getTitle('common.messages', 'Messages'),
      url: '/messages',
      icon: MessageSquare,
      resource: 'messages',
    },
    {
      title: getTitle('common.workflows', 'Workflows'),
      url: '/workflows',
      icon: Repeat,
      resource: 'workflows',
    },
  ]

  const systemItems = [
    {
      title: getTitle('sidebar.settings', 'Settings'),
      url: '/settings',
      icon: Settings,
      resource: 'settings',
    },
    {
      title: getTitle('common.service_pricing', 'Service Pricing'),
      url: '/service-pricing',
      icon: DollarSign,
      resource: 'service_pricing',
    },
    {
      title: getTitle('sidebar.users', 'Users'),
      url: '/users',
      icon: Users,
      resource: 'users',
    },
    {
      title: getTitle('sidebar.publicity_admin', 'Publicity Admin'),
      url: '/admin/publicity',
      icon: Megaphone,
      resource: 'publicity',
    },
    {
      title: getTitle('sidebar.migration_hub', 'Migration Hub'),
      url: '/admin/migration',
      icon: Database,
      resource: 'migration',
    },
    {
      title: getTitle('common.advanced_analytics', 'Advanced Analytics'),
      url: '/admin/analytics',
      icon: PieChart,
      resource: 'analytics',
    },
    {
      title: getTitle('common.automation_rules', 'Automation Rules'),
      url: '/admin/automation',
      icon: Zap,
      resource: 'automation',
    },
  ]

  const portalItems = [
    {
      title: getTitle('sidebar.tenant_portal', 'Tenant Portal'),
      url: '/portal/tenant',
      icon: Home,
      resource: 'portal',
      role: 'tenant',
    },
    {
      title: getTitle('sidebar.owner_portal', 'Owner Portal'),
      url: '/portal/owner',
      icon: Briefcase,
      resource: 'portal',
      role: 'property_owner',
    },
    {
      title: getTitle('sidebar.partner_portal', 'Partner Portal'),
      url: '/portal/partner',
      icon: HardHat,
      resource: 'portal',
      role: 'partner',
    },
    {
      title: getTitle('sidebar.partner_portal', 'Partner Portal'),
      url: '/portal/partner',
      icon: HardHat,
      resource: 'portal',
      role: 'partner_employee',
    },
  ]

  const filteredMain = mainNavItems.filter((item) =>
    hasPermissionSync(currentUser as any, item.resource as any, 'view'),
  )

  const filteredOps = operationsItems.filter((item) =>
    hasPermissionSync(currentUser as any, item.resource as any, 'view'),
  )

  const filteredSystem = systemItems.filter((item) =>
    hasPermissionSync(currentUser as any, item.resource as any, 'view'),
  )

  const isPortalUser =
    currentUser?.role === 'tenant' ||
    currentUser?.role === 'property_owner' ||
    currentUser?.role === 'partner' ||
    currentUser?.role === 'partner_employee'

  const activePortalItem = portalItems.find(
    (item) => item.role === currentUser?.role,
  )

  return (
    <Sidebar className="bg-slate-900 border-r-slate-800 text-slate-300">
      <SidebarHeader className="p-4 pt-6 pb-2 shrink-0">
        <Logo className="w-32 mx-auto text-white mb-2" />
        <div className="text-center mt-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
            {t(`roles.${currentUser?.role}`) || currentUser?.role}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar">
        {isPortalUser ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 uppercase text-[10px] font-bold tracking-wider px-4 mb-2">
              Portal
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
                {/* Specific items for Owners */}
                {currentUser.role === 'property_owner' && (
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
                            {getTitle('common.messages', 'Messages')}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === '/financial'}
                        className="data-[active=true]:bg-trust-blue data-[active=true]:text-white hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <Link to="/financial" className="px-4 py-2.5">
                          <DollarSign className="h-4 w-4 mr-3" />
                          <span className="font-medium text-sm">
                            {getTitle('sidebar.financial', 'Financial')}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
                {/* Specific items for Tenants */}
                {currentUser.role === 'tenant' && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === '/messages'}
                      className="data-[active=true]:bg-trust-blue data-[active=true]:text-white hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <Link to="/messages" className="px-4 py-2.5">
                        <MessageSquare className="h-4 w-4 mr-3" />
                        <span className="font-medium text-sm">
                          {getTitle('common.messages', 'Messages')}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {/* Specific items for Partners */}
                {(currentUser.role === 'partner' ||
                  currentUser.role === 'partner_employee') && (
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
                            {getTitle('common.tasks', 'Tasks')}
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
                            {getTitle('common.messages', 'Messages')}
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
                  {getTitle('sidebar.main_menu', 'Main Menu')}
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
                  {getTitle('common.operations', 'Operations')}
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
                  {getTitle('sidebar.system', 'System')}
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
        <NavUser user={currentUser as any} />
      </SidebarFooter>
    </Sidebar>
  )
}
