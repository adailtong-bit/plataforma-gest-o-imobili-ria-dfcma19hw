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
  MonitorPlay,
  ShieldCheck,
} from 'lucide-react'
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

  const getTitle = (key: string, fallback: string) => {
    const text = t(key)
    if (!text || text === key || text.includes('.')) return fallback
    return text
  }

  const effectiveRole =
    simulationMode && simulationRole ? simulationRole : currentUser?.role
  const effectiveUser =
    simulationMode && simulationRole && currentUser
      ? ({ ...currentUser, role: simulationRole, permissions: [] } as any)
      : (currentUser as any)

  const mainNavItems = [
    {
      title: getTitle('sidebar.dashboard', 'Painel'),
      url: '/',
      icon: Home,
      resource: 'dashboard',
    },
    {
      title: getTitle('sidebar.units', 'Propriedades'),
      url: '/properties',
      icon: Building2,
      resource: 'properties',
    },
    {
      title: getTitle('hotels.title', 'Hotéis'),
      url: '/hotels',
      icon: Hotel,
      resource: 'hotels',
    },
    {
      title: getTitle('sidebar.condominiums', 'Condomínios'),
      url: '/condominiums',
      icon: MapPin,
      resource: 'condominiums',
    },
    {
      title: getTitle('sidebar.owners', 'Proprietários'),
      url: '/owners',
      icon: Briefcase,
      resource: 'owners',
    },
    {
      title: getTitle('sidebar.tenants', 'Inquilinos'),
      url: '/tenants',
      icon: Users,
      resource: 'tenants',
    },
    {
      title: getTitle('sidebar.calendar', 'Calendário'),
      url: '/calendar',
      icon: Calendar,
      resource: 'calendar',
    },
    {
      title: getTitle('sidebar.financial', 'Financeiro'),
      url: '/financial',
      icon: DollarSign,
      resource: 'financial',
    },
    {
      title: getTitle('common.invoices', 'Faturas'),
      url: '/invoices',
      icon: FileText,
      resource: 'financial',
    },
    {
      title: getTitle('common.short_term', 'Aluguel Temporada'),
      url: '/short-term',
      icon: Building2,
      resource: 'short_term',
    },
    {
      title: getTitle('common.visits', 'Visitas'),
      url: '/visits',
      icon: MapPin,
      resource: 'visits',
    },
    {
      title: getTitle('common.renewals', 'Renovações'),
      url: '/renewals',
      icon: Repeat,
      resource: 'renewals',
    },
    {
      title: getTitle('sidebar.reports', 'Relatórios'),
      url: '/reports',
      icon: FileText,
      resource: 'reports',
    },
    {
      title: getTitle('common.market_analysis', 'Análise de Mercado'),
      url: '/market-analysis',
      icon: PieChart,
      resource: 'market_analysis',
    },
  ]

  const operationsItems = [
    {
      title: getTitle('sidebar.performance', 'Desempenho'),
      url: '/performance',
      icon: Activity,
      resource: 'performance',
    },
    {
      title: getTitle('sidebar.guest_services', 'Serviços Hóspede'),
      url: '/guest-services',
      icon: HeartHandshake,
      resource: 'guest_services',
    },
    {
      title: getTitle('sidebar.pos', 'PDV'),
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
      title: getTitle('common.tasks', 'Tarefas'),
      url: '/tasks',
      icon: Wrench,
      resource: 'tasks',
    },
    {
      title: getTitle('sidebar.housekeeping', 'Limpeza'),
      url: '/housekeeping',
      icon: HardHat,
      resource: 'tasks',
    },
    {
      title: getTitle('sidebar.night_audit', 'Auditoria Noturna'),
      url: '/night-audit',
      icon: MoonStar,
      resource: 'financial',
    },
    {
      title: getTitle('sidebar.partners', 'Parceiros'),
      url: '/partners',
      icon: HardHat,
      resource: 'partners',
    },
    {
      title: getTitle('common.messages', 'Mensagens'),
      url: '/messages',
      icon: MessageSquare,
      resource: 'messages',
    },
    {
      title: getTitle('common.workflows', 'Fluxos de Trabalho'),
      url: '/workflows',
      icon: Repeat,
      resource: 'workflows',
    },
  ]

  const systemItems = [
    {
      title: getTitle('sidebar.settings', 'Configurações'),
      url: '/settings',
      icon: Settings,
      resource: 'settings',
    },
    {
      title: getTitle('common.service_pricing', 'Catálogo de Preços'),
      url: '/service-pricing',
      icon: DollarSign,
      resource: 'service_pricing',
    },
    {
      title: getTitle('sidebar.users', 'Usuários'),
      url: '/users',
      icon: Users,
      resource: 'users',
    },
    {
      title: getTitle(
        'sidebar.publicity_admin',
        'Administração de Publicidade',
      ),
      url: '/admin/publicity',
      icon: Megaphone,
      resource: 'publicity',
    },
    {
      title: getTitle('sidebar.migration_hub', 'Migração'),
      url: '/admin/migration',
      icon: Database,
      resource: 'migration',
    },
    {
      title: getTitle('common.advanced_analytics', 'Análise Avançada'),
      url: '/admin/analytics',
      icon: PieChart,
      resource: 'analytics',
    },
    {
      title: getTitle('common.automation_rules', 'Regras de Automação'),
      url: '/admin/automation',
      icon: Zap,
      resource: 'automation',
    },
    {
      title: getTitle('sidebar.audit_panel', 'Painel de Auditoria'),
      url: '/admin/audit',
      icon: ShieldCheck,
      resource: 'audit_logs',
      roles: ['platform_owner'],
    },
    {
      title: getTitle('sidebar.environment', 'Ambiente'),
      url: '/admin/environment',
      icon: MonitorPlay,
      resource: 'settings',
      roles: ['platform_owner'],
    },
  ]

  const portalItems = [
    {
      title: getTitle('sidebar.tenant_portal', 'Portal do Inquilino'),
      url: '/portal/tenant',
      icon: Home,
      resource: 'portal',
      role: 'tenant',
    },
    {
      title: getTitle('sidebar.owner_portal', 'Portal do Proprietário'),
      url: '/portal/owner',
      icon: Briefcase,
      resource: 'portal',
      role: 'property_owner',
    },
    {
      title: getTitle('sidebar.partner_portal', 'Portal do Parceiro'),
      url: '/portal/partner',
      icon: HardHat,
      resource: 'portal',
      role: 'partner',
    },
    {
      title: getTitle('sidebar.partner_portal', 'Portal do Parceiro'),
      url: '/portal/partner',
      icon: HardHat,
      resource: 'portal',
      role: 'partner_employee',
    },
  ]

  const filteredMain = mainNavItems.filter((item) =>
    hasPermissionSync(effectiveUser, item.resource as any, 'view'),
  )

  const filteredOps = operationsItems.filter((item) =>
    hasPermissionSync(effectiveUser, item.resource as any, 'view'),
  )

  const filteredSystem = systemItems.filter((item) => {
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
  })

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
                            {getTitle('common.messages', 'Mensagens')}
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
                            {getTitle('sidebar.financial', 'Financeiro')}
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
                          {getTitle('common.messages', 'Mensagens')}
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
                            {getTitle('common.tasks', 'Tarefas')}
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
                            {getTitle('common.messages', 'Mensagens')}
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
                  {getTitle('sidebar.main_menu', 'Menu Principal')}
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
                  {getTitle('common.operations', 'Operações')}
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
                  {getTitle('sidebar.system', 'Sistema')}
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
