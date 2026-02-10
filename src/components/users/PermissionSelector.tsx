import { Permission, UserRole, Resource, Action } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { PERMISSIONS_MATRIX } from '@/lib/permissions'
import { useState, useEffect } from 'react'

interface PermissionSelectorProps {
  role: UserRole
  currentPermissions: Permission[]
  onChange: (permissions: Permission[]) => void
}

const resources: Resource[] = ['properties', 'financial', 'tenants', 'tasks']
const actions: Action[] = ['view', 'create', 'edit', 'delete']

export function PermissionSelector({
  role,
  currentPermissions,
  onChange,
}: PermissionSelectorProps) {
  // Simplistic implementation: override generic role perms
  // In a real app, this would be a complex matrix UI

  const handleToggle = (
    resource: Resource,
    action: Action,
    checked: boolean,
  ) => {
    let newPerms = [...currentPermissions]
    const resourcePerm = newPerms.find((p) => p.resource === resource)

    if (resourcePerm) {
      if (checked) {
        resourcePerm.actions = [...new Set([...resourcePerm.actions, action])]
      } else {
        resourcePerm.actions = resourcePerm.actions.filter((a) => a !== action)
      }
    } else if (checked) {
      newPerms.push({ resource, actions: [action] })
    }

    onChange(newPerms)
  }

  return (
    <div className="border rounded-md p-4 bg-muted/10">
      <h4 className="text-sm font-bold mb-3">Custom Permission Overrides</h4>
      <div className="grid gap-4">
        {resources.map((res) => (
          <div key={res} className="grid grid-cols-5 items-center gap-2">
            <span className="text-sm font-medium capitalize col-span-1">
              {res}
            </span>
            {actions.map((act) => {
              // Check if implicit in role
              const implicit = PERMISSIONS_MATRIX[role]?.[res]?.includes(act)
              // Check if overridden
              const override = currentPermissions
                .find((p) => p.resource === res)
                ?.actions.includes(act)
              const checked = implicit || override

              return (
                <div key={act} className="flex items-center space-x-1">
                  <Checkbox
                    id={`${res}-${act}`}
                    checked={checked}
                    disabled={implicit} // Cannot disable role-based base perms in this simplified model
                    onCheckedChange={(c) =>
                      handleToggle(res, act, c as boolean)
                    }
                  />
                  <Label
                    htmlFor={`${res}-${act}`}
                    className="text-xs capitalize cursor-pointer"
                  >
                    {act}
                  </Label>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
