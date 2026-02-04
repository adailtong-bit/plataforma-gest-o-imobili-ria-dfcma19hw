import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PERMISSIONS_MATRIX } from '@/lib/permissions'
import { Resource, UserRole, Permission, Action } from '@/lib/types'
import useLanguageStore from '@/stores/useLanguageStore'
import { ShieldAlert } from 'lucide-react'

interface PermissionSelectorProps {
  role: UserRole
  currentPermissions: Permission[]
  onChange: (permissions: Permission[]) => void
}

const ALL_RESOURCES: Resource[] = [
  'dashboard',
  'properties',
  'condominiums',
  'tenants',
  'owners',
  'partners',
  'calendar',
  'tasks',
  'financial',
  'messages',
  'users',
  'settings',
  'reports',
  'market_analysis',
  'short_term',
  'renewals',
  'workflows',
  'automation',
  'audit_logs',
  'visits',
  'publicity',
  'migration',
  'analytics',
  'portal',
]

export function PermissionSelector({
  role,
  currentPermissions,
  onChange,
}: PermissionSelectorProps) {
  const { t } = useLanguageStore()

  // State to track which resources are effectively enabled
  // We initialize this based on Role Defaults + Overrides
  const [enabledResources, setEnabledResources] = useState<Set<Resource>>(
    new Set(),
  )

  // Calculate effective state whenever role or currentPermissions prop changes (initial load)
  useEffect(() => {
    const effective = new Set<Resource>()
    const roleDefaults = PERMISSIONS_MATRIX[role] || {}

    ALL_RESOURCES.forEach((resource) => {
      // 1. Check for Override
      const override = currentPermissions.find((p) => p.resource === resource)

      if (override) {
        // If override exists, checking if it has 'view' action determines if it's enabled
        if (override.actions.includes('view')) {
          effective.add(resource)
        }
      } else {
        // 2. Fallback to Role Default
        const defaultActions = roleDefaults[resource]
        if (defaultActions && defaultActions.includes('view')) {
          effective.add(resource)
        }
      }
    })

    setEnabledResources(effective)
  }, [role, currentPermissions])

  const handleToggle = (resource: Resource, checked: boolean) => {
    const newEnabled = new Set(enabledResources)
    if (checked) {
      newEnabled.add(resource)
    } else {
      newEnabled.delete(resource)
    }
    setEnabledResources(newEnabled)

    // Calculate the new Overrides array to pass back to parent
    const newOverrides: Permission[] = []
    const roleDefaults = PERMISSIONS_MATRIX[role] || {}

    ALL_RESOURCES.forEach((res) => {
      const isEnabled = newEnabled.has(res)
      const roleHasAccess = roleDefaults[res]?.includes('view')

      if (isEnabled && !roleHasAccess) {
        // Case 1: Enabled manually (not in role) -> Add Override with full permissions
        // For simplicity in this UI, we grant full access relevant to the resource
        // Ideally we'd copy actions from a 'platform_owner' or a standard set
        const fullActions: Action[] = ['view', 'create', 'edit', 'delete']
        newOverrides.push({ resource: res, actions: fullActions })
      } else if (!isEnabled && roleHasAccess) {
        // Case 2: Disabled manually (but is in role) -> Add Override with empty actions
        newOverrides.push({ resource: res, actions: [] })
      }
      // Case 3: Matches role -> No override needed (implicit)
    })

    onChange(newOverrides)
  }

  return (
    <div className="space-y-4 border rounded-md p-4 bg-slate-50/50">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-trust-blue" />
            {t('users.permissions')} Override
          </h4>
          <p className="text-xs text-muted-foreground">
            Customize access for this user. These settings override the default{' '}
            <strong>{t(`roles.${role}`)}</strong> role.
          </p>
        </div>
        <Badge variant="outline" className="bg-white">
          {enabledResources.size} Allowed
        </Badge>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ALL_RESOURCES.map((resource) => {
            const isEnabled = enabledResources.has(resource)
            const roleDefaults = PERMISSIONS_MATRIX[role] || {}
            const isRoleDefault = roleDefaults[resource]?.includes('view')
            const isOverridden = isEnabled !== !!isRoleDefault

            return (
              <div
                key={resource}
                className={`flex items-center justify-between rounded-lg border p-3 shadow-sm transition-all ${
                  isEnabled
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-100 border-transparent opacity-80'
                }`}
              >
                <div className="space-y-0.5">
                  <Label
                    htmlFor={`perm-${resource}`}
                    className={`text-sm font-medium cursor-pointer ${isEnabled ? 'text-black' : 'text-slate-500'}`}
                  >
                    {t(`common.${resource}`) !== `common.${resource}`
                      ? t(`common.${resource}`)
                      : resource
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Label>
                  <div className="flex items-center gap-2 h-4">
                    {isRoleDefault && (
                      <span className="text-[10px] text-slate-400">
                        Default
                      </span>
                    )}
                    {isOverridden && (
                      <Badge
                        variant="secondary"
                        className="h-4 px-1 text-[9px] bg-blue-100 text-blue-700 hover:bg-blue-100 border-none"
                      >
                        Custom
                      </Badge>
                    )}
                  </div>
                </div>
                <Switch
                  id={`perm-${resource}`}
                  checked={isEnabled}
                  onCheckedChange={(c) => handleToggle(resource, c)}
                />
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
