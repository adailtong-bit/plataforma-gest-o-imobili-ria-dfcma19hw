import { User, UserRole, Resource, Action } from './types'

// Define the standard permissions matrix for each role
export const PERMISSIONS_MATRIX: Record<
  UserRole,
  Partial<Record<Resource, Action[]>>
> = {
  platform_owner: {
    dashboard: ['view', 'create', 'edit', 'delete'],
    properties: ['view', 'create', 'edit', 'delete'],
    condominiums: ['view', 'create', 'edit', 'delete'],
    tenants: ['view', 'create', 'edit', 'delete'],
    owners: ['view', 'create', 'edit', 'delete'],
    partners: ['view', 'create', 'edit', 'delete'],
    calendar: ['view', 'create', 'edit', 'delete'],
    tasks: ['view', 'create', 'edit', 'delete'],
    financial: ['view', 'create', 'edit', 'delete'],
    messages: ['view', 'create', 'edit', 'delete'],
    users: ['view', 'create', 'edit', 'delete'],
    settings: ['view', 'create', 'edit', 'delete'],
    audit_logs: ['view'],
    market_analysis: ['view', 'create', 'edit', 'delete'],
    workflows: ['view', 'create', 'edit', 'delete'],
    renewals: ['view', 'create', 'edit', 'delete'],
    publicity: ['view', 'create', 'edit', 'delete'],
    short_term: ['view', 'create', 'edit', 'delete'],
    migration: ['view', 'create', 'edit', 'delete'],
    analytics: ['view'],
    automation: ['view', 'create', 'edit', 'delete'],
    reports: ['view'],
    visits: ['view', 'create', 'edit', 'delete'],
    portal: ['view'],
  },
  software_tenant: {
    dashboard: ['view'],
    properties: ['view', 'create', 'edit', 'delete'],
    condominiums: ['view', 'create', 'edit', 'delete'],
    tenants: ['view', 'create', 'edit', 'delete'],
    owners: ['view', 'create', 'edit', 'delete'],
    partners: ['view', 'create', 'edit', 'delete'],
    calendar: ['view', 'create', 'edit', 'delete'],
    tasks: ['view', 'create', 'edit', 'delete'],
    financial: ['view', 'create', 'edit', 'delete'],
    messages: ['view', 'create', 'edit', 'delete'],
    users: ['view', 'create', 'edit', 'delete'], // Can manage their own users
    settings: ['view', 'edit'],
    audit_logs: ['view'],
    market_analysis: ['view'],
    workflows: ['view', 'create', 'edit'],
    renewals: ['view', 'create', 'edit'],
    short_term: ['view', 'create', 'edit', 'delete'],
    analytics: ['view'],
    reports: ['view'],
    visits: ['view', 'create', 'edit', 'delete'],
    migration: ['view', 'create'], // Can import data
    automation: ['view', 'edit'],
  },
  internal_user: {
    dashboard: ['view'],
    properties: ['view', 'edit'],
    condominiums: ['view'],
    tenants: ['view', 'edit'],
    owners: ['view'],
    partners: ['view'],
    calendar: ['view', 'create', 'edit'],
    tasks: ['view', 'create', 'edit'],
    messages: ['view', 'create'],
    short_term: ['view', 'create', 'edit'],
    renewals: ['view', 'edit'],
    reports: ['view'],
    visits: ['view', 'create', 'edit'],
  },
  partner: {
    portal: ['view'],
    tasks: ['view', 'edit'], // Assigned tasks
    messages: ['view', 'create'],
    financial: ['view'], // Own financial data
  },
  property_owner: {
    portal: ['view'],
    properties: ['view'], // Own properties
    financial: ['view'], // Own statements
    messages: ['view', 'create'],
    short_term: ['view'], // Calendar availability
  },
  tenant: {
    portal: ['view'],
    messages: ['view', 'create'],
    financial: ['view'], // Own payments
  },
  partner_employee: {
    portal: ['view'],
    tasks: ['view', 'edit'], // Assigned tasks
    messages: ['view', 'create'],
  },
}

export const hasPermission = (
  user: User,
  resource: Resource,
  action: Action,
): boolean => {
  if (!user || !user.role) return false

  // 1. Check granular overrides first (if user has specific permission overrides)
  if (user.permissions && user.permissions.length > 0) {
    const override = user.permissions.find((p) => p.resource === resource)
    if (override) {
      return override.actions.includes(action)
    }
  }

  // 2. Check Role-based Matrix
  const rolePermissions = PERMISSIONS_MATRIX[user.role]
  if (!rolePermissions) return false

  const resourcePermissions = rolePermissions[resource]
  if (!resourcePermissions) return false

  return resourcePermissions.includes(action)
}

export const canChat = (
  initiatorRole: UserRole,
  targetRole: UserRole,
): boolean => {
  // Staff can chat with everyone
  if (
    ['platform_owner', 'software_tenant', 'internal_user'].includes(
      initiatorRole,
    )
  )
    return true

  // Everyone can chat with staff
  if (
    ['platform_owner', 'software_tenant', 'internal_user'].includes(targetRole)
  )
    return true

  // Partners can chat with Partner Employees (Teams)
  if (initiatorRole === 'partner' && targetRole === 'partner_employee')
    return true
  if (initiatorRole === 'partner_employee' && targetRole === 'partner')
    return true

  return false
}

export const getRoleLabel = (
  role: UserRole,
  t: (key: string) => string,
): string => {
  return t(`roles.${role}`)
}
