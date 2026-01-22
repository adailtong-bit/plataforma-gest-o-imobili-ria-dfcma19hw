import { User, UserRole, Resource, Action } from './types'

export const hasPermission = (
  user: User,
  resource: Resource,
  action: Action,
): boolean => {
  // 1. Platform Owner has full access
  if (user.role === 'platform_owner') return true

  // 2. Software Tenant has full access to their tenant scope
  if (user.role === 'software_tenant') {
    // Restricted from master admin features
    if (resource === 'market_analysis' && action === 'delete') return false
    return true
  }

  // 3. Internal User relies on permissions
  if (user.role === 'internal_user') {
    const permission = user.permissions?.find((p) => p.resource === resource)
    if (!permission) return false
    return permission.actions.includes(action)
  }

  // 4. Other roles
  if (user.role === 'property_owner') {
    if (resource === 'portal' && action === 'view') return true
    if (resource === 'messages' && action === 'view') return true
    if (resource === 'short_term' && action === 'view') return true
    return false
  }

  if (user.role === 'partner') {
    if (resource === 'portal' && action === 'view') return true
    if (resource === 'messages' && action === 'view') return true
    if (resource === 'tasks' && action === 'edit') return true // Can update status
    return false
  }

  if (user.role === 'partner_employee') {
    if (resource === 'portal' && action === 'view') return true
    if (resource === 'tasks' && action === 'view') return true // Restricted view
    if (resource === 'tasks' && action === 'edit') return true // Can update status
    if (resource === 'messages' && action === 'view') return true
    return false
  }

  if (user.role === 'tenant') {
    if (resource === 'portal' && action === 'view') return true
    if (resource === 'messages' && action === 'view') return true
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

  // Tenants/Owners/Partners can chat with staff
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
    case 'partner_employee':
      return 'Membro da Equipe'
    case 'tenant':
      return 'Inquilino'
    default:
      return role
  }
}
