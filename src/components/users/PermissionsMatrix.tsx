import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PERMISSIONS_MATRIX } from '@/lib/permissions'
import { Check, X } from 'lucide-react'
import { UserRole, Resource } from '@/lib/types'

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
                const perms = PERMISSIONS_MATRIX[role]?.[res]
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
