import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PERMISSIONS_MATRIX } from '@/lib/permissions'
import { Resource, UserRole } from '@/lib/types'
import useLanguageStore from '@/stores/useLanguageStore'
import { Check, X } from 'lucide-react'

// Resources to display in order
const DISPLAY_RESOURCES: Resource[] = [
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
  'market_analysis',
  'workflows',
  'renewals',
  'short_term',
  'reports',
  'visits',
  'portal',
]

const ROLES: UserRole[] = [
  'platform_owner',
  'software_tenant',
  'internal_user',
  'partner',
  'property_owner',
  'tenant',
  'partner_employee',
]

export function PermissionsMatrix() {
  const { t } = useLanguageStore()

  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="w-[200px] font-bold text-black border-r">
              {t('common.resource')} / {t('common.role')}
            </TableHead>
            {ROLES.map((role) => (
              <TableHead
                key={role}
                className="text-center font-bold text-black min-w-[100px]"
              >
                {t(`roles.${role}`)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {DISPLAY_RESOURCES.map((resource) => (
            <TableRow key={resource} className="hover:bg-slate-50">
              <TableCell className="font-medium capitalize text-black border-r">
                {t(`common.${resource}`) !== `common.${resource}`
                  ? t(`common.${resource}`)
                  : resource.replace(/_/g, ' ')}
              </TableCell>
              {ROLES.map((role) => {
                const perms = PERMISSIONS_MATRIX[role]
                const resourcePerms = perms ? perms[resource] : undefined
                const hasAccess =
                  resourcePerms && resourcePerms.includes('view')

                return (
                  <TableCell
                    key={`${role}-${resource}`}
                    className="text-center"
                  >
                    {hasAccess ? (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 justify-center w-8 h-8 p-0 rounded-full"
                        >
                          <Check className="h-4 w-4" />
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {resourcePerms?.includes('create') ||
                          resourcePerms?.includes('edit')
                            ? 'Full'
                            : 'View'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="w-8 h-8 flex items-center justify-center">
                          <X className="h-4 w-4 text-slate-300" />
                        </div>
                      </div>
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
