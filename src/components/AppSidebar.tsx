import { useState, useEffect, useMemo } from 'react'
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
import * as Icons from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { Logo } from '@/components/Logo'
import { NavUser } from '@/components/NavUser'
import { supabase } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

type DbMenu = {
  id: string
  label: string
  icon: string
  route: string
  parent_id: string | null
  order_index: number
  role_required?: string | null
  section?: string
  resource?: string | null
  children?: DbMenu[]
}

function MenuItemRenderer({
  item,
  location,
  t,
}: {
  item: DbMenu
  location: any
  t: any
}) {
  const Icon = (Icons as any)[item.icon] || Icons.AlertCircle
  const title = t(item.label, item.label.split('.').pop() || item.label)
  const itemRoute = item.route || '/'
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
              <Icons.ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child) => {
                const childRoute = child.route || '/'
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

export function AppSidebar() {
  const location = useLocation()
  const { currentUser, hasPermissionSync, simulationMode, simulationRole } =
    useAuthStore()
  const { t } = useDbTranslations()
  const [dbMenus, setDbMenus] = useState<DbMenu[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchMenus = async () => {
      try {
        const { data, error } = await supabase
          .from('app_menus')
          .select('*')
          .order('order_index', { ascending: true })
        if (error) throw error
        if (isMounted) {
          setDbMenus((data as DbMenu[]) || [])
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to fetch menus:', err)
        if (isMounted) setLoading(false)
      }
    }
    fetchMenus()
    return () => {
      isMounted = false
    }
  }, [])

  const effectiveRole =
    simulationMode && simulationRole ? simulationRole : currentUser?.role
  const isPortalUser = [
    'tenant',
    'property_owner',
    'partner',
    'partner_employee',
  ].includes(effectiveRole || '')

  const mergedMenus = useMemo(() => {
    const filteredList = dbMenus.filter((item) => {
      if (item.section === 'portal') {
        return item.role_required === effectiveRole
      }
      if (isPortalUser) return false // Hide non-portal menus from portal users

      if (
        item.role_required &&
        effectiveRole !== 'platform_owner' &&
        effectiveRole !== 'master'
      ) {
        if (item.role_required !== effectiveRole) return false
      }

      if (item.resource && currentUser && hasPermissionSync) {
        return hasPermissionSync(
          currentUser as never,
          item.resource as never,
          'view',
        )
      }
      return true
    })

    const uniqueRoutes = new Set<string>()
    const deduplicatedList = filteredList.filter((m) => {
      if (m.route && m.route !== '#' && m.route !== '/') {
        if (uniqueRoutes.has(m.route)) return false
        uniqueRoutes.add(m.route)
      } else if (m.route === '/') {
        if (uniqueRoutes.has('/')) return false
        uniqueRoutes.add('/')
        uniqueRoutes.add('/dashboard')
      } else if (m.route === '/dashboard') {
        if (uniqueRoutes.has('/')) return false
        uniqueRoutes.add('/dashboard')
        uniqueRoutes.add('/')
      }
      return true
    })

    const nodeMap = new Map<string, DbMenu>()
    const roots: DbMenu[] = []
    deduplicatedList.forEach((m) => nodeMap.set(m.id, { ...m, children: [] }))
    deduplicatedList.forEach((m) => {
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
  }, [dbMenus, effectiveRole, currentUser, hasPermissionSync, isPortalUser])

  const renderGroup = (label: string, items: DbMenu[]) => {
    if (items.length === 0) return null
    return (
      <SidebarGroup className="mt-4 first:mt-0">
        <SidebarGroupLabel className="text-slate-500 uppercase text-[10px] font-bold tracking-wider px-4 mb-2">
          {label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
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
    )
  }

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
        {loading ? (
          <div className="p-4 space-y-8 animate-in fade-in duration-300">
            <div className="space-y-3">
              <Skeleton className="h-3 w-20 bg-slate-800" />
              <Skeleton className="h-10 w-full bg-slate-800" />
              <Skeleton className="h-10 w-full bg-slate-800" />
            </div>
          </div>
        ) : isPortalUser ? (
          renderGroup(
            t('sidebar.portal', 'Portal'),
            mergedMenus.filter((m) => m.section === 'portal'),
          )
        ) : (
          <>
            {renderGroup(
              t('sidebar.main_menu', 'Main Menu'),
              mergedMenus.filter((m) => m.section === 'main'),
            )}
            {renderGroup(
              t('common.operations', 'Operations'),
              mergedMenus.filter((m) => m.section === 'operations'),
            )}
            {renderGroup(
              t('menu.system', 'System'),
              mergedMenus.filter((m) => m.section === 'system'),
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
