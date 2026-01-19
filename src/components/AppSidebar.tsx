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
  LayoutDashboard,
  Tag,
  Command,
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
      title: t('common.service_pricing'),
      url: '/service-pricing',
      icon: Tag,
      resource: 'partners', // Reusing partners permission for pricing as it is related
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

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-navy overflow-hidden">
          <div className="bg-tiffany text-white p-1.5 rounded-md shrink-0 flex items-center justify-center shadow-sm">
            <Command className="h-5 w-5 text-gold stroke-[3]" />
          </div>
          <span className="truncate tracking-tight group-data-[collapsible=icon]:hidden">
            COREPM
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Special Portal Links for specific roles */}
        {(currentUser.role === 'tenant' ||
          currentUser.role === 'property_owner' ||
          currentUser.role === 'partner') && (
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
                      <Link to="/portal/tenant">
                        <LayoutDashboard />
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
                      <Link to="/portal/owner">
                        <LayoutDashboard />
                        <span>Portal Proprietário</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {currentUser.role === 'partner' && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/portal/partner')}
                    >
                      <Link to="/portal/partner">
                        <LayoutDashboard />
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
                      <Link to={item.url}>
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
              {showUsers && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/users')}
                    tooltip="Usuários"
                  >
                    <Link to="/users">
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
                    <Link to="/settings">
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
              <Avatar className="h-8 w-8 border border-tiffany/20">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-tiffany/10 text-tiffany">
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
