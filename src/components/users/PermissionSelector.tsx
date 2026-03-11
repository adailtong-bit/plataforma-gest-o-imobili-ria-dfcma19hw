import { Permission, UserRole, Resource, Action } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import useAuthStore from '@/stores/useAuthStore'

interface PermissionSelectorProps {
  role: UserRole
  currentPermissions: Permission[]
  onChange: (permissions: Permission[]) => void
}

const resources: Resource[] = [
  'dashboard',
  'properties',
  'condominiums',
  'tenants',
  'owners',
  'partners',
  'tasks',
  'financial',
  'messages',
  'settings',
  'reports',
  'workflows',
  'renewals',
  'portal',
]

const actions: Action[] = ['view', 'create', 'edit', 'delete']

export function PermissionSelector({
  role,
  currentPermissions,
  onChange,
}: PermissionSelectorProps) {
  const { rolePermissions } = useAuthStore()

  const handleToggle = (
    resource: Resource,
    action: Action,
    checked: boolean,
  ) => {
    const newPerms = [...currentPermissions]
    const resourceIndex = newPerms.findIndex((p) => p.resource === resource)

    if (resourceIndex >= 0) {
      if (checked) {
        newPerms[resourceIndex].actions = [
          ...new Set([...newPerms[resourceIndex].actions, action]),
        ]
      } else {
        newPerms[resourceIndex].actions = newPerms[
          resourceIndex
        ].actions.filter((a) => a !== action)
        if (newPerms[resourceIndex].actions.length === 0) {
          newPerms.splice(resourceIndex, 1)
        }
      }
    } else if (checked) {
      newPerms.push({ resource, actions: [action] })
    }

    onChange(newPerms)
  }

  return (
    <div className="border rounded-md p-4 bg-muted/10 h-[300px] overflow-y-auto">
      <div className="grid gap-2">
        <div className="grid grid-cols-5 items-center gap-2 border-b pb-2 mb-2">
          <span className="text-xs font-bold text-slate-500">Module</span>
          <span className="text-xs font-bold text-center">View</span>
          <span className="text-xs font-bold text-center">Create</span>
          <span className="text-xs font-bold text-center">Edit</span>
          <span className="text-xs font-bold text-center">Delete</span>
        </div>
        {resources.map((res) => (
          <div
            key={res}
            className="grid grid-cols-5 items-center gap-2 border-b border-slate-100 pb-2 last:border-0"
          >
            <span
              className="text-xs font-medium capitalize col-span-1 truncate"
              title={res}
            >
              {res.replace('_', ' ')}
            </span>
            {actions.map((act) => {
              const implicit = rolePermissions[role]?.[res]?.includes(act)
              const override = currentPermissions
                .find((p) => p.resource === res)
                ?.actions.includes(act)
              const checked = implicit || override

              return (
                <div key={act} className="flex items-center justify-center">
                  <Checkbox
                    id={`${res}-${act}`}
                    checked={checked}
                    disabled={implicit}
                    onCheckedChange={(c) =>
                      handleToggle(res, act, c as boolean)
                    }
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
