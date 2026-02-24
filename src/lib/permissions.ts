import { User, UserRole, Resource, Action } from './types'

export const DEFAULT_PERMISSIONS_MATRIX: Record<
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
    hotels: ['view', 'create', 'edit', 'delete'],
    performance: ['view', 'create', 'edit', 'delete'],
    guest_services: ['view', 'create', 'edit', 'delete'],
    pos: ['view', 'create', 'edit', 'delete'],
    marketing: ['view', 'create', 'edit', 'delete'],
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
    users: ['view', 'create', 'edit', 'delete'],
    settings: ['view', 'edit'],
    audit_logs: ['view'],
    market_analysis: ['view'],
    workflows: ['view', 'create', 'edit'],
    renewals: ['view', 'create', 'edit'],
    short_term: ['view', 'create', 'edit', 'delete'],
    analytics: ['view'],
    reports: ['view'],
    visits: ['view', 'create', 'edit', 'delete'],
    migration: ['view', 'create'],
    automation: ['view', 'edit'],
    hotels: ['view', 'create', 'edit', 'delete'],
    performance: ['view', 'create', 'edit'],
    guest_services: ['view', 'create', 'edit', 'delete'],
    pos: ['view', 'create', 'edit', 'delete'],
    marketing: ['view', 'create', 'edit', 'delete'],
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
    hotels: ['view', 'create', 'edit'],
    users: ['view'],
    guest_services: ['view', 'edit'],
    pos: ['view', 'create'],
    financial: ['view', 'create', 'edit'],
    automation: ['view'],
  },
  partner: {
    dashboard: ['view'],
    portal: ['view'],
    tasks: ['view', 'edit'],
    messages: ['view', 'create'],
    financial: ['view'],
    properties: ['view'],
    automation: ['view'],
  },
  property_owner: {
    dashboard: ['view'],
    portal: ['view'],
    properties: ['view'],
    financial: ['view'],
    messages: ['view', 'create'],
    short_term: ['view'],
    tasks: ['view', 'create', 'edit'],
    users: ['view'],
    automation: ['view'],
  },
  tenant: {
    dashboard: ['view'],
    portal: ['view'],
    messages: ['view', 'create'],
    financial: ['view'],
    properties: ['view'],
    automation: ['view'],
  },
  partner_employee: {
    dashboard: ['view'],
    portal: ['view'],
    tasks: ['view', 'edit'],
    messages: ['view', 'create'],
    properties: ['view'],
    automation: ['view'],
  },
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
