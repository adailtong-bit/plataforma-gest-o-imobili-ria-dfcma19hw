import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Check, X } from 'lucide-react'
import { UserRole, Resource } from '@/lib/types'
import useAuthStore from '@/stores/useAuthStore'

const resources: Resource[] = [
  'dashboard',
  'properties',
  'tenants',
  'owners',
  'financial',
  'settings',
]

const roles: UserRole[] = [
  'platform_owner',
  'software_tenant',
  'internal_user',
  'partner',
  'property_owner',
  'tenant',
]

export function PermissionsMatrix() {
  const { rolePermissions } = useAuthStore()

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resource</TableHead>
            {roles.map((role) => (
              <TableHead
                key={role}
                className="capitalize text-center text-xs px-1"
              >
                {role.replace('_', ' ')}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((res) => (
            <TableRow key={res}>
              <TableCell className="font-medium capitalize">{res}</TableCell>
              {roles.map((role) => {
                const perms = rolePermissions[role]?.[res]
                const hasAccess = perms && perms.includes('view')
                return (
                  <TableCell key={`${role}-${res}`} className="text-center">
                    {hasAccess ? (
                      <Check className="h-4 w-4 mx-auto text-green-500" />
                    ) : (
                      <X className="h-4 w-4 mx-auto text-slate-300" />
                    )}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
