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

  const mainNavItems = [
    {
      title: t('sidebar.dashboard'),
      url: '/',
      icon: Home,
      resource: 'dashboard',
    },
    {
      title: t('sidebar.units'),
      url: '/properties',
      icon: Building2,
      resource: 'properties',
    },
    {
      title: t('hotels.title'),
      url: '/hotels',
      icon: Hotel,
      resource: 'hotels',
    },
    {
      title: t('sidebar.condominiums'),
      url: '/condominiums',
      icon: MapPin,
      resource: 'condominiums',
    },
    {
      title: t('sidebar.owners'),
      url: '/owners',
      icon: Briefcase,
      resource: 'owners',
    },
    {
      title: t('sidebar.tenants'),
      url: '/tenants',
      icon: Users,
      resource: 'tenants',
    },
    {
      title: t('sidebar.calendar'),
      url: '/calendar',
      icon: Calendar,
      resource: 'calendar',
    },
    {
      title: t('sidebar.financial'),
      url: '/financial',
      icon: DollarSign,
      resource: 'financial',
    },
    {
      title: t('common.invoices'),
      url: '/invoices',
      icon: FileText,
      resource: 'financial',
    },
    {
      title: t('common.short_term'),
      url: '/short-term',
      icon: Building2,
      resource: 'short_term',
    },
    {
      title: t('common.visits'),
      url: '/visits',
      icon: MapPin,
      resource: 'visits',
    },
    {
      title: t('common.renewals'),
      url: '/renewals',
      icon: Repeat,
      resource: 'renewals',
    },
    {
      title: t('sidebar.reports'),
      url: '/reports',
      icon: FileText,
      resource: 'reports',
    },
    {
      title: t('common.market_analysis'),
      url: '/market-analysis',
      icon: PieChart,
      resource: 'market_analysis',
    },
  ]

  const operationsItems = [
    {
      title: t('sidebar.performance'),
      url: '/performance',
      icon: Activity,
      resource: 'performance',
    },
    {
      title: t('sidebar.guest_services'),
      url: '/guest-services',
      icon: HeartHandshake,
      resource: 'guest_services',
    },
    {
      title: t('sidebar.pos'),
      url: '/pos',
      icon: ShoppingCart,
      resource: 'pos',
    },
    {
      title: t('sidebar.marketing'),
      url: '/marketing',
      icon: Zap,
      resource: 'marketing',
    },
    {
      title: t('common.tasks'),
      url: '/tasks',
      icon: Wrench,
      resource: 'tasks',
    },
    {
      title: 'Housekeeping',
      url: '/housekeeping',
      icon: HardHat,
      resource: 'tasks',
    },
    {
      title: 'Night Audit',
      url: '/night-audit',
      icon: MoonStar,
      resource: 'financial',
    },
    {
      title: t('sidebar.partners'),
      url: '/partners',
      icon: HardHat,
      resource: 'partners',
    },
    {
      title: t('common.messages'),
      url: '/messages',
      icon: MessageSquare,
      resource: 'messages',
    },
    {
      title: t('common.workflows'),
      url: '/workflows',
      icon: Repeat,
      resource: 'workflows',
    },
  ]

  const systemItems = [
    {
      title: t('sidebar.settings'),
      url: '/settings',
      icon: Settings,
      resource: 'settings',
    },
    {
      title: t('common.service_pricing'),
      url: '/service-pricing',
      icon: DollarSign,
      resource: 'service_pricing',
    },
    {
      title: t('sidebar.users'),
      url: '/users',
      icon: Users,
      resource: 'users',
    },
    {
      title: t('sidebar.publicity_admin'),
      url: '/admin/publicity',
      icon: Megaphone,
      resource: 'publicity',
    },
    {
      title: t('sidebar.migration_hub'),
      url: '/admin/migration',
      icon: Database,
      resource: 'migration',
    },
    {
      title: t('common.advanced_analytics'),
      url: '/admin/analytics',
      icon: PieChart,
      resource: 'analytics',
    },
    {
      title: t('common.automation_rules'),
      url: '/admin/automation',
      icon: Zap,
      resource: 'automation',
    },
  ]

  const portalItems = [
    {
      title: t('sidebar.tenant_portal'),
      url: '/portal/tenant',
      icon: Home,
      resource: 'portal',
      role: 'tenant',
    },
    {
      title: t('sidebar.owner_portal'),
      url: '/portal/owner',
      icon: Briefcase,
      resource: 'portal',
      role: 'property_owner',
    },
    {
      title: t('sidebar.partner_portal'),
      url: '/portal/partner',
      icon: HardHat,
      resource: 'portal',
      role: 'partner',
    },
    {
      title: t('sidebar.partner_portal'),
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
                            {t('common.messages')}
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
                            {t('sidebar.financial')}
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
                          {t('common.messages')}
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
                            {t('common.tasks')}
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
                            {t('common.messages')}
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
                  {t('sidebar.main_menu')}
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
                  {t('common.operations')}
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
                  {t('sidebar.system')}
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
