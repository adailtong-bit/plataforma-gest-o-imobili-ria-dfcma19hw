import { useMemo } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import {
  Home,
  Building,
  Calendar,
  ClipboardList,
  DollarSign,
  MessageSquare,
  Settings,
  Users,
  Briefcase,
  UserCheck,
  Building2,
  LayoutTemplate,
  TrendingUp,
  Workflow,
  RefreshCw,
  Megaphone,
  BriefcaseBusiness,
  FileText,
  Tags,
  Database,
  BarChart2,
  Zap,
  PieChart,
  CalendarDays,
  Hotel,
  HelpCircle,
  Activity,
  ShoppingBag,
  CreditCard,
  Gift,
  ChevronRight,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
import useMessageStore from '@/stores/useMessageStore'
import usePublicityStore from '@/stores/usePublicityStore'
import { User, Resource } from '@/lib/types'
import logo from '@/assets/logo-estilizado.jpg'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DataMask } from '@/components/DataMask'
import { useAdRotation } from '@/hooks/useAdRotation'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'

export function AppSidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const { t } = useLanguageStore()
  const { currentUser, hasPermissionSync: authHasPermission } = useAuthStore()
  const { messages } = useMessageStore()
  const { advertisements } = usePublicityStore()
  const { setOpenMobile, isMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const unreadMessagesCount = messages.reduce(
    (acc, msg) => acc + (msg.unread || 0),
    0,
  )

  const sidebarAds = useMemo(
    () => advertisements.filter((a) => a.active && a.placement === 'sidebar'),
    [advertisements],
  )
  const visibleSidebarAds = useAdRotation(sidebarAds, 1, 15)
  const adToShow = visibleSidebarAds.length > 0 ? visibleSidebarAds[0] : null

  const allMenuItems = [
    {
      title: t('sidebar.dashboard') || 'Dashboard',
      url: '/',
      icon: Home,
      resource: 'dashboard',
    },
    {
      title: t('sidebar.performance') || 'Performance',
      url: '/performance',
      icon: Activity,
      resource: 'performance',
    },
    {
      title: t('common.short_term') || 'Short Term',
      url: '/short-term',
      icon: BriefcaseBusiness,
      resource: 'short_term',
    },
    {
      title: t('sidebar.guest_services') || 'Guest Services',
      url: '/guest-services',
      icon: ShoppingBag,
      resource: 'guest_services',
    },
    {
      title: t('sidebar.pos') || 'POS',
      url: '/pos',
      icon: CreditCard,
      resource: 'pos',
    },
    {
      title: t('sidebar.marketing') || 'Marketing',
      url: '/marketing',
      icon: Gift,
      resource: 'marketing',
    },
    {
      title: t('common.renewals') || 'Renovações',
      url: '/renewals',
      icon: RefreshCw,
      resource: 'renewals',
    },
    {
      title: t('market_analysis.title') || 'Análise de Mercado',
      url: '/market-analysis',
      icon: TrendingUp,
      resource: 'market_analysis',
    },
    {
      title: t('sidebar.reports') || 'Relatórios',
      url: '/reports',
      icon: PieChart,
      resource: 'reports',
    },
    {
      title: t('sidebar.tenants') || 'Inquilinos',
      url: '/tenants',
      icon: Users,
      resource: 'tenants',
    },
    {
      title: t('sidebar.owners') || 'Proprietários',
      url: '/owners',
      icon: UserCheck,
      resource: 'owners',
    },
    {
      title: t('common.partners') || 'Parceiros',
      url: '/partners',
      icon: Briefcase,
      resource: 'partners',
    },
    {
      title: t('common.service_pricing') || 'Price Catalog',
      url: '/service-pricing',
      icon: Tags,
      resource: 'settings',
    },
    {
      title: t('common.calendar') || 'Calendário',
      url: '/calendar',
      icon: Calendar,
      resource: 'calendar',
    },
    {
      title: t('common.visits') || 'Visitas',
      url: '/visits',
      icon: CalendarDays,
      resource: 'visits',
    },
    {
      title: t('common.tasks') || 'Tarefas',
      url: '/tasks',
      icon: ClipboardList,
      resource: 'tasks',
    },
    {
      title: t('common.workflows') || 'Workflows',
      url: '/workflows',
      icon: Workflow,
      resource: 'workflows',
    },
    {
      title: 'Financeiro',
      url: '/financial',
      icon: DollarSign,
      resource: 'financial',
    },
    {
      title: t('common.invoices') || 'Faturas',
      url: '/invoices',
      icon: FileText,
      resource: 'financial',
    },
    {
      title: t('common.messages') || 'Mensagens',
      url: '/messages',
      icon: MessageSquare,
      resource: 'messages',
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
  ]

  const visibleMenuItems = allMenuItems.filter((item) =>
    authHasPermission(currentUser as User, item.resource as Resource, 'view'),
  )

  const isActive = (url: string) => {
    if (url === '/' && pathname === '/') return true
    if (url !== '/' && pathname.startsWith(url)) return true
    return false
  }

  const showMigration = authHasPermission(
    currentUser as User,
    'migration',
    'view',
  )
  const showPublicity = authHasPermission(
    currentUser as User,
    'publicity',
    'view',
  )
  const showUsers = authHasPermission(currentUser as User, 'users', 'view')
  const showSettings = authHasPermission(
    currentUser as User,
    'settings',
    'view',
  )
  const showAnalytics = authHasPermission(
    currentUser as User,
    'analytics',
    'view',
  )
  const showAutomation = authHasPermission(
    currentUser as User,
    'automation',
    'view',
  )

  const hasPortfolioAccess =
    authHasPermission(currentUser as User, 'properties', 'view') ||
    authHasPermission(currentUser as User, 'hotels', 'view') ||
    authHasPermission(currentUser as User, 'condominiums', 'view')

  const isTenant = currentUser?.role === 'tenant'
  const isOwner = currentUser?.role === 'property_owner'
  const isPartner =
    currentUser?.role === 'partner' || currentUser?.role === 'partner_employee'

  return (
    <Sidebar
      collapsible="icon"
      className="bg-white border-r z-50 fixed left-0 top-0 h-screen shadow-md"
    >
      <SidebarHeader className="h-16 flex items-center px-4 border-b bg-white">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl text-black font-display overflow-hidden hover:opacity-80 transition-opacity"
          onClick={handleLinkClick}
        >
          <img
            src={logo}
            alt="COREPM Logo"
            className="h-8 w-8 rounded-md shrink-0 object-contain"
          />
          <span className="truncate tracking-tight group-data-[collapsible=icon]:hidden text-black">
            COREPM
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-white" id="sidebar-menu">
        {(isTenant || isOwner || isPartner) && (
          <SidebarGroup>
            <SidebarGroupLabel
              className={cn(isMobile && 'text-black', 'text-black font-bold')}
            >
              {t('common.portal')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isTenant && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/portal/tenant')}
                      className="text-black font-medium hover:bg-slate-100"
                    >
                      <Link to="/portal/tenant" onClick={handleLinkClick}>
                        <LayoutTemplate />
                        <span>{t('sidebar.tenant_portal')}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {isOwner && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/portal/owner')}
                      className="text-black font-medium hover:bg-slate-100"
                    >
                      <Link to="/portal/owner" onClick={handleLinkClick}>
                        <LayoutTemplate />
                        <span>{t('sidebar.owner_portal')}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {isPartner && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/portal/partner')}
                      className="text-black font-medium hover:bg-slate-100"
                    >
                      <Link to="/portal/partner" onClick={handleLinkClick}>
                        <LayoutTemplate />
                        <span>{t('sidebar.partner_portal')}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleMenuItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel
              className={cn(isMobile && 'text-black', 'text-black font-bold')}
            >
              {t('sidebar.main_menu')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleMenuItems
                  .filter((item) => item.url === '/')
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={item.title}
                        className="text-black font-medium hover:bg-slate-100"
                      >
                        <Link
                          to={item.url}
                          onClick={handleLinkClick}
                          className="flex justify-between items-center w-full"
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="text-black" />
                            <span>{item.title}</span>
                          </div>
                          {item.badge !== undefined && (
                            <Badge
                              variant="destructive"
                              className="h-5 min-w-5 px-1 flex items-center justify-center text-[10px]"
                            >
                              <DataMask>{item.badge}</DataMask>
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}

                {hasPortfolioAccess && (
                  <Collapsible defaultOpen className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip="Portfólio"
                          className="text-black font-medium hover:bg-slate-100"
                        >
                          <Building2 className="text-black" />
                          <span>
                            <DataMask>
                              {t('sidebar.portfolio') || 'Portfólio'}
                            </DataMask>
                          </span>
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90 text-black" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {authHasPermission(
                            currentUser as User,
                            'properties',
                            'view',
                          ) && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive('/properties')}
                              >
                                <Link
                                  to="/properties"
                                  onClick={handleLinkClick}
                                >
                                  <span>
                                    <DataMask>Propriedades</DataMask>
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                          {authHasPermission(
                            currentUser as User,
                            'hotels',
                            'view',
                          ) && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive('/hotels')}
                              >
                                <Link to="/hotels" onClick={handleLinkClick}>
                                  <span>
                                    <DataMask>
                                      {t('hotels.title') || 'Hotéis'}
                                    </DataMask>
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                          {authHasPermission(
                            currentUser as User,
                            'condominiums',
                            'view',
                          ) && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive('/condominiums')}
                              >
                                <Link
                                  to="/condominiums"
                                  onClick={handleLinkClick}
                                >
                                  <span>
                                    <DataMask>
                                      {t('sidebar.condominiums') ||
                                        'Condomínios'}
                                    </DataMask>
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )}

                {visibleMenuItems
                  .filter((item) => item.url !== '/')
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={item.title}
                        className="text-black font-medium hover:bg-slate-100"
                      >
                        <Link
                          to={item.url}
                          onClick={handleLinkClick}
                          className="flex justify-between items-center w-full"
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="text-black" />
                            <span>{item.title}</span>
                          </div>
                          {item.badge !== undefined && (
                            <Badge
                              variant="destructive"
                              className="h-5 min-w-5 px-1 flex items-center justify-center text-[10px]"
                            >
                              <DataMask>{item.badge}</DataMask>
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel
            className={cn(isMobile && 'text-black', 'text-black font-bold')}
          >
            {t('sidebar.system')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {showMigration && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/admin/migration')}
                    tooltip={t('sidebar.migration_hub')}
                    className="text-black font-medium hover:bg-slate-100"
                  >
                    <Link to="/admin/migration" onClick={handleLinkClick}>
                      <Database className="text-black" />
                      <span>{t('sidebar.migration_hub')}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {showPublicity && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/admin/publicity')}
                    tooltip={t('sidebar.publicity_admin')}
                    className="text-black font-medium hover:bg-slate-100"
                  >
                    <Link to="/admin/publicity" onClick={handleLinkClick}>
                      <Megaphone className="text-black" />
                      <span>{t('sidebar.publicity_admin')}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {showAnalytics && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/admin/analytics')}
                    tooltip={
                      t('common.advanced_analytics') || 'Advanced Analytics'
                    }
                    className="text-black font-medium hover:bg-slate-100"
                  >
                    <Link to="/admin/analytics" onClick={handleLinkClick}>
                      <BarChart2 className="text-black" />
                      <span>
                        {t('common.advanced_analytics') || 'Advanced Analytics'}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {showAutomation && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/admin/automation')}
                    tooltip={t('common.automation_rules') || 'Automation Rules'}
                    className="text-black font-medium hover:bg-slate-100"
                  >
                    <Link to="/admin/automation" onClick={handleLinkClick}>
                      <Zap className="text-black" />
                      <span>
                        {t('common.automation_rules') || 'Automation Rules'}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {showUsers && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/users')}
                    tooltip="Usuários"
                    className="text-black font-medium hover:bg-slate-100"
                  >
                    <Link to="/users" onClick={handleLinkClick}>
                      <Users className="text-black" />
                      <span>Usuários</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {showSettings && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/settings')}
                    tooltip="Configurações"
                    className="text-black font-medium hover:bg-slate-100"
                  >
                    <Link to="/settings" onClick={handleLinkClick}>
                      <Settings className="text-black" />
                      <span>Configurações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/help')}
                  tooltip={t('common.help_hub')}
                  className="text-black font-medium hover:bg-slate-100"
                >
                  <Link to="/help" onClick={handleLinkClick}>
                    <HelpCircle className="text-black" />
                    <span>{t('common.help_hub')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-white">
        {adToShow && (
          <div
            key={adToShow.id}
            className="p-3 mx-2 mb-2 bg-slate-50 rounded-lg border group-data-[collapsible=icon]:hidden relative overflow-hidden group animate-in fade-in duration-500"
          >
            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">
              Sponsored
            </p>
            <div className="relative h-24 mb-2 rounded-md overflow-hidden">
              <img
                src={adToShow.imageUrl}
                alt={adToShow.title}
                crossOrigin="anonymous"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg'
                  e.currentTarget.onerror = null
                }}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <p className="text-xs font-bold text-slate-900 line-clamp-1">
              {adToShow.title}
            </p>
            <a
              href={adToShow.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline mt-1 block"
            >
              Learn more
            </a>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8 border border-slate-200">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback className="bg-slate-100 text-black font-bold">
                  {currentUser?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'flex flex-col text-sm leading-tight group-data-[collapsible=icon]:hidden',
                )}
              >
                <span className="font-bold truncate w-32 text-black">
                  <DataMask>{currentUser?.name}</DataMask>
                </span>
                <span
                  className={cn('text-xs text-black truncate w-32 font-medium')}
                >
                  <DataMask>{currentUser?.email}</DataMask>
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
