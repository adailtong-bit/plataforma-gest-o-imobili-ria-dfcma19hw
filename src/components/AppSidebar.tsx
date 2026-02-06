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
  HelpCircle
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
import useMessageStore from '@/stores/useMessageStore'
import { hasPermission } from '@/lib/permissions'
import { User, Resource } from '@/lib/types'
import logo from '@/assets/logo-estilizado.jpg'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DataMask } from '@/components/DataMask'

export function AppSidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const { t } = useLanguageStore()
  const { currentUser } = useAuthStore()
  const { messages } = useMessageStore()
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

  const allMenuItems = [
    {
      title: t('common.dashboard'),
      url: '/',
      icon: Home,
      resource: 'dashboard',
    },
    {
      title: t('common.properties'),
      url: '/properties',
      icon: Building,
      resource: 'properties',
    },
    {
      title: t('hotels.title'),
      url: '/hotels',
      icon: Hotel,
      resource: 'hotels',
    },
    {
      title: t('common.short_term'),
      url: '/short-term',
      icon: BriefcaseBusiness,
      resource: 'short_term',
    },
    {
      title: t('common.renewals'),
      url: '/renewals',
      icon: RefreshCw,
      resource: 'renewals',
    },
    {
      title: t('common.market_analysis'),
      url: '/market-analysis',
      icon: TrendingUp,
      resource: 'market_analysis',
    },
    {
      title: t('common.advanced_analytics'),
      url: '/admin/analytics',
      icon: BarChart2,
      resource: 'analytics',
    },
    {
      title: t('common.reports'),
      url: '/reports',
      icon: PieChart,
      resource: 'reports',
    },
    {
      title: t('common.condominiums'),
      url: '/condominiums',
      icon: Building2,
      resource: 'condominiums',
    },
    {
      title: t('common.tenants'),
      url: '/tenants',
      icon: Users,
      resource: 'tenants',
    },
    {
      title: t('common.owners'),
      url: '/owners',
      icon: UserCheck,
      resource: 'owners',
    },
    {
      title: t('common.partners'),
      url: '/partners',
      icon: Briefcase,
      resource: 'partners',
    },
    {
      title: t('common.service_pricing'),
      url: '/service-pricing',
      icon: Tags,
      resource: 'settings', // Part of Settings essentially
    },
    {
      title: t('common.calendar'),
      url: '/calendar',
      icon: Calendar,
      resource: 'calendar',
    },
    {
      title: t('common.visits'),
      url: '/visits',
      icon: CalendarDays,
      resource: 'visits', // Visits Resource
    },
    {
      title: t('common.tasks'),
      url: '/tasks',
      icon: ClipboardList,
      resource: 'tasks',
    },
    {
      title: t('common.workflows'),
      url: '/workflows',
      icon: Workflow,
      resource: 'workflows',
    },
    {
      title: t('common.automation_rules'),
      url: '/admin/automation',
      icon: Zap,
      resource: 'automation',
    },
    {
      title: t('common.financial'),
      url: '/financial',
      icon: DollarSign,
      resource: 'financial',
    },
    {
      title: t('common.invoices'),
      url: '/invoices',
      icon: FileText,
      resource: 'financial', // Part of Financial
    },
    {
      title: t('common.messages'),
      url: '/messages',
      icon: MessageSquare,
      resource: 'messages',
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
  ]

  const visibleMenuItems = allMenuItems.filter((item) =>
    hasPermission(currentUser as User, item.resource as Resource, 'view'),
  )

  const isActive = (url: string) => {
    if (url === '/' && pathname === '/') return true
    if (url !== '/' && pathname.startsWith(url)) return true
    return false
  }

  // System menu items checks
  const showMigration = hasPermission(currentUser as User, 'migration', 'view')
  const showPublicity = hasPermission(currentUser as User, 'publicity', 'view')
  const showUsers = hasPermission(currentUser as User, 'users', 'view')
  const showSettings = hasPermission(currentUser as User, 'settings', 'view')

  // Portals logic remains similar but leverages role check implicitly via hasPermission usually
  const isTenant = currentUser.role === 'tenant'
  const isOwner = currentUser.role === 'property_owner'
  const isPartner =
    currentUser.role === 'partner' || currentUser.role === 'partner_employee'

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
        {/* Portal Links - Shown based on Role directly as they are specialized views */}
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
                {visibleMenuItems.map((item) => (
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
              {showUsers && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/users')}
                    tooltip={t('sidebar.users')}
                    className="text-black font-medium hover:bg-slate-100"
                  >
                    <Link to="/users" onClick={handleLinkClick}>
                      <Users className="text-black" />
                      <span>{t('sidebar.users')}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {showSettings && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/settings')}
                    tooltip={t('common.settings')}
                    className="text-black font-medium hover:bg-slate-100"
                  >
                    <Link to="/settings" onClick={handleLinkClick}>
                      <Settings className="text-black" />
                      <span>{t('common.settings')}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {/* Help Hub Link */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/help')}
                  tooltip="Help Hub"
                  className="text-black font-medium hover:bg-slate-100"
                >
                  <Link to="/help" onClick={handleLinkClick}>
                    <HelpCircle className="text-black" />
                    <span>Help Hub</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8 border border-slate-200">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-slate-100 text-black font-bold">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'flex flex-col text-sm leading-tight group-data-[collapsible=icon]:hidden',
                )}
              >
                <span className="font-bold truncate w-32 text-black">
                  <DataMask>{currentUser.name}</DataMask>
                </span>
                <span
                  className={cn('text-xs text-black truncate w-32 font-medium')}
                >
                  <DataMask>{currentUser.email}</DataMask>
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

