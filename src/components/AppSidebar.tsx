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
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
import { hasPermission } from '@/lib/permissions'
import { User, Resource } from '@/lib/types'

export function AppSidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const { t } = useLanguageStore()
  const { currentUser } = useAuthStore()
  const { setOpenMobile, isMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

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
      title: 'Análise de Mercado',
      url: '/market-analysis',
      icon: TrendingUp,
      resource: 'market_analysis',
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
      title: 'Workflows',
      url: '/workflows',
      icon: Workflow,
      resource: 'workflows',
    },
    {
      title: t('common.financial'),
      url: '/financial',
      icon: DollarSign,
      resource: 'financial',
    },
    {
      title: t('common.messages'),
      url: '/messages',
      icon: MessageSquare,
      resource: 'messages',
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

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl text-navy overflow-hidden hover:opacity-80 transition-opacity"
          onClick={handleLinkClick}
        >
          <img
            src="https://img.usecurling.com/i?q=real%20estate&color=blue"
            alt="COREPM Logo"
            className="h-8 w-8 rounded-md shrink-0 object-contain"
          />
          <span className="truncate tracking-tight group-data-[collapsible=icon]:hidden">
            COREPM
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* Special Portal Links for specific roles - Usually these are the ONLY links they see, but if they have broader perms, they might see menu items too */}
        {(currentUser.role === 'tenant' ||
          currentUser.role === 'property_owner' ||
          currentUser.role === 'partner' ||
          currentUser.role === 'partner_employee') && (
          <SidebarGroup>
            <SidebarGroupLabel>Portal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {currentUser.role === 'tenant' && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/portal/tenant')}
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
            <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link to={item.url} onClick={handleLinkClick}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {showPublicity && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/admin/publicity')}
                    tooltip="Publicity Admin"
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
                    tooltip="Usuários"
                  >
                    <Link to="/users" onClick={handleLinkClick}>
                      <Users />
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
                    tooltip={t('common.settings')}
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
              <div className="flex flex-col text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="font-semibold truncate w-32">
                  {currentUser.name}
                </span>
                <span className="text-xs text-muted-foreground truncate w-32">
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
