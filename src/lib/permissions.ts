import { User, UserRole, Resource, Action } from './types'

const FULL_ACCESS: Action[] = ['view', 'create', 'edit', 'delete']

export const DEFAULT_PERMISSIONS_MATRIX: Record<
  UserRole,
  Partial<Record<Resource, Action[]>>
> = {
  platform_owner: {
    dashboard: FULL_ACCESS,
    properties: FULL_ACCESS,
    condominiums: FULL_ACCESS,
    tenants: FULL_ACCESS,
    owners: FULL_ACCESS,
    partners: FULL_ACCESS,
    calendar: FULL_ACCESS,
    tasks: FULL_ACCESS,
    financial: FULL_ACCESS,
    messages: FULL_ACCESS,
    users: FULL_ACCESS,
    settings: FULL_ACCESS,
    audit_logs: ['view'],
    portal: ['view'],
    market_analysis: FULL_ACCESS,
    workflows: FULL_ACCESS,
    renewals: FULL_ACCESS,
    publicity: FULL_ACCESS,
    short_term: FULL_ACCESS,
    migration: FULL_ACCESS,
    analytics: FULL_ACCESS,
    automation: FULL_ACCESS,
    reports: FULL_ACCESS,
    visits: FULL_ACCESS,
    hotels: FULL_ACCESS,
    performance: FULL_ACCESS,
    guest_services: FULL_ACCESS,
    pos: FULL_ACCESS,
    marketing: FULL_ACCESS,
    service_pricing: FULL_ACCESS,
  },
  software_tenant: {
    dashboard: FULL_ACCESS,
    properties: FULL_ACCESS,
    condominiums: FULL_ACCESS,
    tenants: FULL_ACCESS,
    owners: FULL_ACCESS,
    partners: FULL_ACCESS,
    calendar: FULL_ACCESS,
    tasks: FULL_ACCESS,
    financial: FULL_ACCESS,
    messages: FULL_ACCESS,
    users: FULL_ACCESS,
    settings: FULL_ACCESS,
    audit_logs: ['view'],
    portal: ['view'],
    market_analysis: FULL_ACCESS,
    workflows: FULL_ACCESS,
    renewals: FULL_ACCESS,
    publicity: FULL_ACCESS,
    short_term: FULL_ACCESS,
    migration: FULL_ACCESS,
    analytics: FULL_ACCESS,
    automation: FULL_ACCESS,
    reports: FULL_ACCESS,
    visits: FULL_ACCESS,
    hotels: FULL_ACCESS,
    performance: FULL_ACCESS,
    guest_services: FULL_ACCESS,
    pos: FULL_ACCESS,
    marketing: FULL_ACCESS,
    service_pricing: FULL_ACCESS,
  },
  internal_user: {
    dashboard: ['view'],
    properties: FULL_ACCESS,
    condominiums: FULL_ACCESS,
    tenants: FULL_ACCESS,
    owners: FULL_ACCESS,
    partners: FULL_ACCESS,
    calendar: FULL_ACCESS,
    tasks: FULL_ACCESS,
    messages: FULL_ACCESS,
    short_term: FULL_ACCESS,
    renewals: FULL_ACCESS,
    reports: ['view'],
    visits: FULL_ACCESS,
    hotels: FULL_ACCESS,
    users: ['view'],
    guest_services: FULL_ACCESS,
    pos: FULL_ACCESS,
    financial: FULL_ACCESS,
    automation: ['view'],
    settings: ['view', 'edit'],
    service_pricing: FULL_ACCESS,
  },
  partner: {
    dashboard: ['view'],
    portal: ['view'],
    tasks: ['view', 'edit'],
    messages: ['view', 'create'],
    financial: ['view'],
    properties: ['view'],
    automation: ['view'],
    settings: ['view', 'edit'],
  },
  property_owner: {
    dashboard: ['view'],
    portal: ['view'],
    properties: ['view'],
    owners: ['view'],
    financial: ['view'],
    messages: ['view', 'create'],
    short_term: ['view'],
    tasks: ['view', 'create', 'edit'],
    users: ['view'],
    automation: ['view'],
    settings: ['view', 'edit'],
  },
  tenant: {
    dashboard: ['view'],
    portal: ['view'],
    messages: ['view', 'create'],
    financial: ['view'],
    properties: ['view'],
    automation: ['view'],
    settings: ['view', 'edit'],
  },
  partner_employee: {
    dashboard: ['view'],
    portal: ['view'],
    tasks: ['view', 'edit'],
    messages: ['view', 'create'],
    properties: ['view'],
    automation: ['view'],
    settings: ['view', 'edit'],
  },
}

export const hasPermission = (
  user: User | null | undefined,
  resource: Resource,
  action: Action,
): boolean => {
  if (!user || !user.role) return false

  if (user.permissions && user.permissions.length > 0) {
    const override = user.permissions.find((p) => p.resource === resource)
    if (override) {
      return override.actions.includes(action)
    }
  }

  const rolePerms = DEFAULT_PERMISSIONS_MATRIX[user.role]
  if (!rolePerms) return false

  const resourcePerms = rolePerms[resource]
  if (!resourcePerms) return false

  return resourcePerms.includes(action)
}

export const canChat = (initiator: User, target: User): boolean => {
  const initiatorRole = initiator.role
  const targetRole = target.role

  if (
    ['platform_owner', 'software_tenant', 'internal_user'].includes(
      initiatorRole,
    )
  ) {
    return true
  }

  if (
    ['platform_owner', 'software_tenant', 'internal_user'].includes(targetRole)
  ) {
    return true
  }

  if (initiatorRole === 'partner' && targetRole === 'partner_employee') {
    return target.parentPartnerId === initiator.id
  }

  if (initiatorRole === 'partner_employee' && targetRole === 'partner') {
    return initiator.parentPartnerId === target.id
  }

  return false
}

export const getRoleLabel = (
  role: UserRole,
  t: (key: string) => string,
): string => {
  return t(`roles.${role}`)
}
