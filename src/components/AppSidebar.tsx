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
} from 'lucide-react'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { Logo } from '@/components/Logo'
import { NavUser } from '@/components/NavUser'

export function AppSidebar() {
  const location = useLocation()
  const { currentUser, hasPermissionSync, simulationMode, simulationRole } =
    useAuthStore()
  const { t } = useLanguageStore()

  const effectiveRole =
    simulationMode && simulationRole ? simulationRole : currentUser?.role
  const effectiveUser =
    simulationMode && simulationRole && currentUser
      ? ({ ...currentUser, role: simulationRole, permissions: [] } as any)
      : (currentUser as any)

  const mainNavItems = React.useMemo(
    () => [
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
        title: t('sidebar.financial', 'Financial'),
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
    ],
    [t],
  )

  const operationsItems = React.useMemo(
    () => [
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
    ],
    [t],
  )

  const systemItems = React.useMemo(
    () => [
      {
        title: t('sidebar.settings', 'Settings'),
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
    ],
    [t],
  )

  const portalItems = React.useMemo(
    () => [
      {
        title: t('menu.dashboard', 'Main Dashboard'),
        url: '/',
        icon: Home,
        resource: 'dashboard',
        role: 'tenant',
      },
      {
        title: t('menu.dashboard', 'Main Dashboard'),
        url: '/',
        icon: Home,
        resource: 'dashboard',
        role: 'property_owner',
      },
      {
        title: t('menu.dashboard', 'Main Dashboard'),
        url: '/',
        icon: Home,
        resource: 'dashboard',
        role: 'partner',
      },
      {
        title: t('menu.dashboard', 'Main Dashboard'),
        url: '/',
        icon: Home,
        resource: 'dashboard',
        role: 'partner_employee',
      },
    ],
    [t],
  )

  const filteredMain = React.useMemo(
    () =>
      mainNavItems.filter((item) =>
        hasPermissionSync(effectiveUser, item.resource as any, 'view'),
      ),
    [mainNavItems, effectiveUser, hasPermissionSync],
  )

  const filteredOps = React.useMemo(
    () =>
      operationsItems.filter((item) =>
        hasPermissionSync(effectiveUser, item.resource as any, 'view'),
      ),
    [operationsItems, effectiveUser, hasPermissionSync],
  )

  const filteredSystem = React.useMemo(
    () =>
      systemItems.filter((item) => {
        if (item.roles && effectiveUser?.role === 'platform_owner') {
          return true
        }
        const hasPerm = hasPermissionSync(
          effectiveUser,
          item.resource as any,
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
              {t(`roles.${effectiveRole}`) || effectiveRole}
            </span>
          )}
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
                            {t('menu.messages', 'Messages')} (PM Sync)
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
                        </span>{' '}
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
        <NavUser user={currentUser as any} />
      </SidebarFooter>
    </Sidebar>
  )
}
