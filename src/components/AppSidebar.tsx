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

  // Calculate unread messages
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
      title: 'Advanced Analytics',
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
      resource: 'settings', // Using settings permission for catalog management
    },
    {
      title: t('common.calendar'),
      url: '/calendar',
      icon: Calendar,
      resource: 'calendar',
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
      title: 'Automation Rules',
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
      resource: 'financial',
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

  const showUsers = hasPermission(currentUser as User, 'users', 'view')
  const showSettings = hasPermission(currentUser as User, 'settings', 'view')
  const showPublicity =
    currentUser.role === 'platform_owner' ||
    hasPermission(currentUser as User, 'publicity', 'view')
  const showMigration =
    currentUser.role === 'platform_owner' ||
    currentUser.role === 'software_tenant'

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl text-brand font-display overflow-hidden hover:opacity-80 transition-opacity"
          onClick={handleLinkClick}
        >
          <img
            src={logo}
            alt="COREPM Logo"
            className="h-8 w-8 rounded-md shrink-0 object-contain"
          />
          <span className="truncate tracking-tight group-data-[collapsible=icon]:hidden">
            COREPM
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {(currentUser.role === 'tenant' ||
          currentUser.role === 'property_owner' ||
          currentUser.role === 'partner' ||
          currentUser.role === 'partner_employee') && (
          <SidebarGroup>
            <SidebarGroupLabel className={cn(isMobile && 'text-white/70')}>
              {t('common.portal')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {currentUser.role === 'tenant' && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/portal/tenant')}
                      className={cn(
                        isMobile && 'text-white font-bold hover:text-white/90',
                      )}
                    >
                      <Link to="/portal/tenant" onClick={handleLinkClick}>
                        <LayoutTemplate />
                        <span>Portal Inquilino</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {currentUser.role === 'property_owner' && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/portal/owner')}
                      className={cn(
                        isMobile && 'text-white font-bold hover:text-white/90',
                      )}
                    >
                      <Link to="/portal/owner" onClick={handleLinkClick}>
                        <LayoutTemplate />
                        <span>Portal Proprietário</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {(currentUser.role === 'partner' ||
                  currentUser.role === 'partner_employee') && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/portal/partner')}
                      className={cn(
                        isMobile && 'text-white font-bold hover:text-white/90',
                      )}
                    >
                      <Link to="/portal/partner" onClick={handleLinkClick}>
                        <LayoutTemplate />
                        <span>Portal Parceiro</span>
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
            <SidebarGroupLabel className={cn(isMobile && 'text-white/70')}>
              Main Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                      className={cn(
                        isMobile && 'text-white font-bold hover:text-white/90',
                      )}
                    >
                      <Link
                        to={item.url}
                        onClick={handleLinkClick}
                        className="flex justify-between items-center w-full"
                      >
                        <div className="flex items-center gap-2">
                          <item.icon />
                          <span>{item.title}</span>
                        </div>
                        {item.badge !== undefined && (
                          <Badge
                            variant="destructive"
                            className="h-5 min-w-5 px-1 flex items-center justify-center text-[10px]"
                          >
                            {item.badge}
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
          <SidebarGroupLabel className={cn(isMobile && 'text-white/70')}>
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {showMigration && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/admin/migration')}
                    tooltip="Migration Hub"
                    className={cn(
                      isMobile && 'text-white font-bold hover:text-white/90',
                    )}
                  >
                    <Link to="/admin/migration" onClick={handleLinkClick}>
                      <Database />
                      <span>Migration Hub</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {showPublicity && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/admin/publicity')}
                    tooltip="Publicity Admin"
                    className={cn(
                      isMobile && 'text-white font-bold hover:text-white/90',
                    )}
                  >
                    <Link to="/admin/publicity" onClick={handleLinkClick}>
                      <Megaphone />
                      <span>Publicity Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {showUsers && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/users')}
                    tooltip="Users"
                    className={cn(
                      isMobile && 'text-white font-bold hover:text-white/90',
                    )}
                  >
                    <Link to="/users" onClick={handleLinkClick}>
                      <Users />
                      <span>Users</span>
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
                    className={cn(
                      isMobile && 'text-white font-bold hover:text-white/90',
                    )}
                  >
                    <Link to="/settings" onClick={handleLinkClick}>
                      <Settings />
                      <span>{t('common.settings')}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8 border border-muted/20">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'flex flex-col text-sm leading-tight group-data-[collapsible=icon]:hidden',
                  isMobile && 'text-white',
                )}
              >
                <span className="font-semibold truncate w-32">
                  {currentUser.name}
                </span>
                <span
                  className={cn(
                    'text-xs text-muted-foreground truncate w-32',
                    isMobile && 'text-white/70',
                  )}
                >
                  {currentUser.email}
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


