import {
  useState,
  useEffect,
  useMemo,
  Component,
  ErrorInfo,
  ReactNode,
  ElementType,
} from 'react'
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
  ChevronRight,
} from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { Logo } from '@/components/Logo'
import { NavUser } from '@/components/NavUser'
import { supabase } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

type AuthUser = {
  role?: string
  permissions?: unknown[]
  [key: string]: unknown
}

class SidebarErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
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

const iconMap: Record<string, ElementType> = {
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
  route: string
  path?: string
  parent_id: string | null
  order_index: number
  role_required?: string | null
  required_role?: string[] | null
  section?: string
  resource?: string | null
  children?: DbMenu[]
}

const hardcodedMenus: DbMenu[] = [
  // Main
  {
    id: 'dashboard',
    label: 'menu.dashboard',
    route: '/',
    icon: 'Home',
    section: 'main',
    order_index: 1,
    parent_id: null,
    resource: 'dashboard',
  },
  {
    id: 'properties',
    label: 'menu.properties',
    route: '/properties',
    icon: 'Building2',
    section: 'main',
    order_index: 2,
    parent_id: null,
    resource: 'properties',
  },
  {
    id: 'hotels',
    label: 'hotels.title',
    route: '/hotels',
    icon: 'Hotel',
    section: 'main',
    order_index: 3,
    parent_id: null,
    resource: 'hotels',
  },
  {
    id: 'condominiums',
    label: 'sidebar.condominiums',
    route: '/condominiums',
    icon: 'MapPin',
    section: 'main',
    order_index: 4,
    parent_id: null,
    resource: 'condominiums',
  },
  {
    id: 'owners',
    label: 'sidebar.owners',
    route: '/owners',
    icon: 'Briefcase',
    section: 'main',
    order_index: 5,
    parent_id: null,
    resource: 'owners',
  },
  {
    id: 'tenants',
    label: 'sidebar.tenants',
    route: '/tenants',
    icon: 'Users',
    section: 'main',
    order_index: 6,
    parent_id: null,
    resource: 'tenants',
  },
  {
    id: 'calendar',
    label: 'sidebar.calendar',
    route: '/calendar',
    icon: 'Calendar',
    section: 'main',
    order_index: 7,
    parent_id: null,
    resource: 'calendar',
  },
  {
    id: 'financial',
    label: 'menu.finances',
    route: '/financial',
    icon: 'DollarSign',
    section: 'main',
    order_index: 8,
    parent_id: null,
    resource: 'financial',
  },
  {
    id: 'invoices',
    label: 'menu.invoices',
    route: '/invoices',
    icon: 'FileText',
    section: 'main',
    order_index: 9,
    parent_id: null,
    resource: 'financial',
  },
  {
    id: 'short-term',
    label: 'common.short_term',
    route: '/short-term',
    icon: 'Building2',
    section: 'main',
    order_index: 10,
    parent_id: null,
    resource: 'short_term',
  },
  {
    id: 'visits',
    label: 'common.visits',
    route: '/visits',
    icon: 'MapPin',
    section: 'main',
    order_index: 11,
    parent_id: null,
    resource: 'visits',
  },
  {
    id: 'renewals',
    label: 'common.renewals',
    route: '/renewals',
    icon: 'Repeat',
    section: 'main',
    order_index: 12,
    parent_id: null,
    resource: 'renewals',
  },
  {
    id: 'reports',
    label: 'sidebar.reports',
    route: '/reports',
    icon: 'FileText',
    section: 'main',
    order_index: 13,
    parent_id: null,
    resource: 'reports',
  },
  {
    id: 'market-analysis',
    label: 'common.market_analysis',
    route: '/market-analysis',
    icon: 'PieChart',
    section: 'main',
    order_index: 14,
    parent_id: null,
    resource: 'market_analysis',
  },

  // Operations
  {
    id: 'performance',
    label: 'sidebar.performance',
    route: '/performance',
    icon: 'Activity',
    section: 'operations',
    order_index: 1,
    parent_id: null,
    resource: 'performance',
  },
  {
    id: 'guest-services',
    label: 'sidebar.guest_services',
    route: '/guest-services',
    icon: 'HeartHandshake',
    section: 'operations',
    order_index: 2,
    parent_id: null,
    resource: 'guest_services',
  },
  {
    id: 'pos',
    label: 'sidebar.pos',
    route: '/pos',
    icon: 'ShoppingCart',
    section: 'operations',
    order_index: 3,
    parent_id: null,
    resource: 'pos',
  },
  {
    id: 'marketing',
    label: 'sidebar.marketing',
    route: '/marketing',
    icon: 'Zap',
    section: 'operations',
    order_index: 4,
    parent_id: null,
    resource: 'marketing',
  },
  {
    id: 'tasks',
    label: 'menu.tasks',
    route: '/tasks',
    icon: 'Wrench',
    section: 'operations',
    order_index: 5,
    parent_id: null,
    resource: 'tasks',
  },
  {
    id: 'front-desk',
    label: 'sidebar.front_desk',
    route: '/front-desk',
    icon: 'ConciergeBell',
    section: 'operations',
    order_index: 6,
    parent_id: null,
    resource: 'properties',
  },
  {
    id: 'housekeeping',
    label: 'sidebar.housekeeping',
    route: '/housekeeping',
    icon: 'HardHat',
    section: 'operations',
    order_index: 7,
    parent_id: null,
    resource: 'tasks',
  },
  {
    id: 'night-audit',
    label: 'sidebar.night_audit',
    route: '/night-audit',
    icon: 'MoonStar',
    section: 'operations',
    order_index: 8,
    parent_id: null,
    resource: 'financial',
  },
  {
    id: 'partners',
    label: 'sidebar.partners',
    route: '/partners',
    icon: 'HardHat',
    section: 'operations',
    order_index: 9,
    parent_id: null,
    resource: 'partners',
  },
  {
    id: 'messages',
    label: 'menu.messages',
    route: '/messages',
    icon: 'MessageSquare',
    section: 'operations',
    order_index: 10,
    parent_id: null,
    resource: 'messages',
  },
  {
    id: 'workflows',
    label: 'common.workflows',
    route: '/workflows',
    icon: 'Repeat',
    section: 'operations',
    order_index: 11,
    parent_id: null,
    resource: 'workflows',
  },

  // System
  {
    id: 'settings',
    label: 'menu.settings',
    route: '/settings',
    icon: 'Settings',
    section: 'system',
    order_index: 1,
    parent_id: null,
    resource: 'settings',
  },
  {
    id: 'pricing',
    label: 'menu.system.pricing',
    route: '/pricing',
    icon: 'DollarSign',
    section: 'system',
    order_index: 2,
    parent_id: null,
    resource: 'settings',
  },
  {
    id: 'service-pricing',
    label: 'common.service_pricing',
    route: '/service-pricing',
    icon: 'DollarSign',
    section: 'system',
    order_index: 3,
    parent_id: null,
    resource: 'service_pricing',
  },
  {
    id: 'users',
    label: 'menu.system.users',
    route: '/users',
    icon: 'Users',
    section: 'system',
    order_index: 4,
    parent_id: null,
    resource: 'users',
  },
  {
    id: 'publicity-admin',
    label: 'menu.system.ad_admin',
    route: '/admin/publicity',
    icon: 'Megaphone',
    section: 'system',
    order_index: 5,
    parent_id: null,
    resource: 'publicity',
  },
  {
    id: 'migration-hub',
    label: 'menu.system.migration_hub',
    route: '/admin/migration',
    icon: 'Database',
    section: 'system',
    order_index: 6,
    parent_id: null,
    resource: 'migration',
  },
  {
    id: 'analytics',
    label: 'menu.system.advanced_analytics',
    route: '/admin/analytics',
    icon: 'PieChart',
    section: 'system',
    order_index: 7,
    parent_id: null,
    resource: 'analytics',
  },
  {
    id: 'automation',
    label: 'menu.system.automation_rules',
    route: '/admin/automation',
    icon: 'Zap',
    section: 'system',
    order_index: 8,
    parent_id: null,
    resource: 'automation',
  },
  {
    id: 'audit',
    label: 'sidebar.audit_panel',
    route: '/admin/audit',
    icon: 'ShieldCheck',
    section: 'system',
    order_index: 9,
    parent_id: null,
    resource: 'audit_logs',
    role_required: 'platform_owner',
  },
  {
    id: 'environment',
    label: 'sidebar.environment',
    route: '/admin/environment',
    icon: 'MonitorPlay',
    section: 'system',
    order_index: 10,
    parent_id: null,
    resource: 'settings',
    role_required: 'platform_owner',
  },
  {
    id: 'translations',
    label: 'sidebar.translations',
    route: '/admin/translations',
    icon: 'Languages',
    section: 'system',
    order_index: 11,
    parent_id: null,
    resource: 'settings',
    role_required: 'platform_owner',
  },
]

const portalMenus: DbMenu[] = [
  {
    id: 'portal-tenant',
    label: 'menu.main_dashboard',
    route: '/',
    icon: 'Home',
    section: 'portal',
    order_index: 1,
    parent_id: null,
    resource: 'dashboard',
    role_required: 'tenant',
  },
  {
    id: 'portal-owner',
    label: 'menu.main_dashboard',
    route: '/',
    icon: 'Home',
    section: 'portal',
    order_index: 1,
    parent_id: null,
    resource: 'dashboard',
    role_required: 'property_owner',
  },
  {
    id: 'portal-partner',
    label: 'menu.main_dashboard',
    route: '/',
    icon: 'Home',
    section: 'portal',
    order_index: 1,
    parent_id: null,
    resource: 'dashboard',
    role_required: 'partner',
  },
  {
    id: 'portal-partner-employee',
    label: 'menu.main_dashboard',
    route: '/',
    icon: 'Home',
    section: 'portal',
    order_index: 1,
    parent_id: null,
    resource: 'dashboard',
    role_required: 'partner_employee',
  },

  {
    id: 'portal-owner-msg',
    label: 'menu.messages_pm_sync',
    route: '/messages',
    icon: 'MessageSquare',
    section: 'portal',
    order_index: 2,
    parent_id: null,
    resource: 'messages',
    role_required: 'property_owner',
  },
  {
    id: 'portal-tenant-msg',
    label: 'menu.messages',
    route: '/messages',
    icon: 'MessageSquare',
    section: 'portal',
    order_index: 2,
    parent_id: null,
    resource: 'messages',
    role_required: 'tenant',
  },
  {
    id: 'portal-partner-tasks',
    label: 'menu.tasks',
    route: '/tasks',
    icon: 'Wrench',
    section: 'portal',
    order_index: 2,
    parent_id: null,
    resource: 'tasks',
    role_required: 'partner',
  },
  {
    id: 'portal-partner-msg',
    label: 'menu.messages',
    route: '/messages',
    icon: 'MessageSquare',
    section: 'portal',
    order_index: 3,
    parent_id: null,
    resource: 'messages',
    role_required: 'partner',
  },
  {
    id: 'portal-pe-tasks',
    label: 'menu.tasks',
    route: '/tasks',
    icon: 'Wrench',
    section: 'portal',
    order_index: 2,
    parent_id: null,
    resource: 'tasks',
    role_required: 'partner_employee',
  },
  {
    id: 'portal-pe-msg',
    label: 'menu.messages',
    route: '/messages',
    icon: 'MessageSquare',
    section: 'portal',
    order_index: 3,
    parent_id: null,
    resource: 'messages',
    role_required: 'partner_employee',
  },
]

function MenuItemRenderer({
  item,
  location,
  t,
}: {
  item: DbMenu
  location: any
  t: any
}) {
  const Icon = iconMap[item.icon] || AlertCircle
  const title = t(item.label, item.label.split('.').pop() || item.label)
  const itemRoute = item.route || item.path || '/'
  const isActive =
    location.pathname === itemRoute ||
    (itemRoute !== '/' && location.pathname.startsWith(itemRoute + '/'))

  if (item.children && item.children.length > 0) {
    return (
      <Collapsible defaultOpen={isActive} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              tooltip={title}
              className="hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium text-sm">{title}</span>
              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child) => {
                const childRoute = child.route || child.path || '/'
                return (
                  <SidebarMenuSubItem key={child.id}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={location.pathname === childRoute}
                      className="data-[active=true]:bg-trust-blue data-[active=true]:text-white hover:bg-slate-800 hover:text-white"
                    >
                      <Link to={childRoute}>
                        <span>
                          {t(
                            child.label,
                            child.label.split('.').pop() || child.label,
                          )}
                        </span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={location.pathname === itemRoute}
        tooltip={title}
        className="data-[active=true]:bg-trust-blue data-[active=true]:text-white hover:bg-slate-800 hover:text-white transition-colors"
      >
        <Link to={itemRoute} className="px-4 py-2.5">
          <Icon className="h-4 w-4 mr-3" />
          <span className="font-medium text-sm">{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function AppSidebarContent() {
  const location = useLocation()
  const { currentUser, hasPermissionSync, simulationMode, simulationRole } =
    useAuthStore()
  const { t } = useDbTranslations()

  const [dbMenus, setDbMenus] = useState<DbMenu[]>([])
  const [menusLoading, setMenusLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()

    const fetchMenus = async () => {
      try {
        const timeoutId = setTimeout(() => abortController.abort(), 5000)
        const { data, error } = await supabase
          .from('app_menus')
          .select('*')
          .order('order_index', { ascending: true })
          .abortSignal(abortController.signal)

        clearTimeout(timeoutId)

        if (error) throw error

        if (isMounted) {
          if (data && data.length > 0) {
            setDbMenus(data as DbMenu[])
          }
          setMenusLoading(false)
        }
      } catch (err) {
        console.error('Failed to fetch menus or timed out:', err)
        if (isMounted) {
          setMenusLoading(false)
        }
      }
    }

    fetchMenus()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [])

  const effectiveRole =
    simulationMode && simulationRole ? simulationRole : currentUser?.role
  const effectiveUser = (
    simulationMode && simulationRole && currentUser
      ? { ...currentUser, role: simulationRole, permissions: [] }
      : currentUser
  ) as AuthUser

  const mergedMenus = useMemo(() => {
    const map = new Map<string, DbMenu>()

    // Fallback/base menus
    hardcodedMenus.forEach((m) => map.set(m.route || m.path || m.id, m))
    portalMenus.forEach((m) => map.set(m.id, m))

    // Priority override from Database based on route key to prevent duplication
    if (dbMenus.length > 0) {
      dbMenus.forEach((m) => {
        const key = m.route || m.path || m.id
        map.set(key, { ...map.get(key), ...m })
      })
    }

    const flatList = Array.from(map.values())

    const filteredList = flatList.filter((item) => {
      if (item.section === 'portal') {
        return item.role_required === effectiveRole
      }

      const requiredRoles =
        item.required_role || (item.role_required ? [item.role_required] : null)
      if (requiredRoles && effectiveUser?.role === 'platform_owner') return true
      if (
        requiredRoles &&
        (!effectiveUser || !requiredRoles.includes(effectiveUser.role))
      ) {
        return false
      }

      if (item.resource) {
        return hasPermissionSync(
          effectiveUser as never,
          item.resource as never,
          'view',
        )
      }
      return true
    })

    const nodeMap = new Map<string, DbMenu>()
    const roots: DbMenu[] = []

    filteredList.forEach((m) => nodeMap.set(m.id, { ...m, children: [] }))

    filteredList.forEach((m) => {
      if (m.parent_id && nodeMap.has(m.parent_id)) {
        nodeMap.get(m.parent_id)!.children!.push(nodeMap.get(m.id)!)
      } else {
        roots.push(nodeMap.get(m.id)!)
      }
    })

    const sortNodes = (nodes: DbMenu[]) => {
      nodes.sort((a, b) => a.order_index - b.order_index)
      nodes.forEach((n) => {
        if (n.children && n.children.length > 1) sortNodes(n.children)
      })
    }
    sortNodes(roots)

    return roots
  }, [dbMenus, effectiveUser, effectiveRole, hasPermissionSync])

  const isPortalUser = [
    'tenant',
    'property_owner',
    'partner',
    'partner_employee',
  ].includes(effectiveRole || '')

  const mainItems = mergedMenus.filter((m) => m.section === 'main')
  const opsItems = mergedMenus.filter((m) => m.section === 'operations')
  const sysItems = mergedMenus.filter((m) => m.section === 'system')
  const activePortalItems = mergedMenus.filter((m) => m.section === 'portal')

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
        {menusLoading ? (
          <div className="p-4 space-y-8 animate-in fade-in duration-300">
            <div className="space-y-3">
              <Skeleton className="h-3 w-20 bg-slate-800" />
              <Skeleton className="h-10 w-full bg-slate-800" />
              <Skeleton className="h-10 w-full bg-slate-800" />
              <Skeleton className="h-10 w-full bg-slate-800" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-3 w-24 bg-slate-800" />
              <Skeleton className="h-10 w-full bg-slate-800" />
              <Skeleton className="h-10 w-full bg-slate-800" />
            </div>
          </div>
        ) : isPortalUser ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 uppercase text-[10px] font-bold tracking-wider px-4 mb-2">
              {t('sidebar.portal', 'Portal')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {activePortalItems.map((item) => (
                  <MenuItemRenderer
                    key={item.id}
                    item={item}
                    location={location}
                    t={t}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <>
            {mainItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-slate-500 uppercase text-[10px] font-bold tracking-wider px-4 mb-2">
                  {t('sidebar.main_menu', 'Main Menu')}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {mainItems.map((item) => (
                      <MenuItemRenderer
                        key={item.id}
                        item={item}
                        location={location}
                        t={t}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {opsItems.length > 0 && (
              <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-slate-500 uppercase text-[10px] font-bold tracking-wider px-4 mb-2">
                  {t('common.operations', 'Operations')}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {opsItems.map((item) => (
                      <MenuItemRenderer
                        key={item.id}
                        item={item}
                        location={location}
                        t={t}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {sysItems.length > 0 && (
              <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-slate-500 uppercase text-[10px] font-bold tracking-wider px-4 mb-2">
                  {t('menu.system', 'System')}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {sysItems.map((item) => (
                      <MenuItemRenderer
                        key={item.id}
                        item={item}
                        location={location}
                        t={t}
                      />
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
