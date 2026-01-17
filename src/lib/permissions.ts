import { User, UserRole, Resource, Action } from './types'

export const hasPermission = (
  user: User,
  resource: Resource,
  action: Action,
): boolean => {
  // 1. Platform Owner has full access
  if (user.role === 'platform_owner') return true

  // 2. Software Tenant has full access to their tenant scope (mocked as full access here)
  if (user.role === 'software_tenant') return true

  // 3. Internal User relies on permissions
  if (user.role === 'internal_user') {
    const permission = user.permissions?.find((p) => p.resource === resource)
    if (!permission) return false
    return permission.actions.includes(action)
  }

  // 4. Other roles (Owner, Partner, Tenant) - defaults
  // They generally don't access the dashboard admin features, but if they did:
  if (user.role === 'property_owner') {
    // Limited access example
    if (resource === 'messages' && action === 'view') return true
    if (resource === 'calendar' && action === 'view') return true
    // Owners might see their own properties (logic handled in component usually)
    return false
  }

  return false
}

export const canChat = (
  initiatorRole: UserRole,
  targetRole: UserRole,
): boolean => {
  if (initiatorRole === 'platform_owner') return true
  if (initiatorRole === 'software_tenant') return true
  if (initiatorRole === 'internal_user') return true

  // Basic rules for others
  const staffRoles = ['platform_owner', 'software_tenant', 'internal_user']
  if (staffRoles.includes(targetRole)) return true

  return false
}

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'platform_owner':
      return 'Dono da Plataforma'
    case 'software_tenant':
      return 'Locador (Cliente)'
    case 'internal_user':
      return 'Usuário Interno'
    case 'property_owner':
      return 'Proprietário'
    case 'partner':
      return 'Parceiro'
    case 'tenant':
      return 'Inquilino'
    default:
      return role
  }
}
