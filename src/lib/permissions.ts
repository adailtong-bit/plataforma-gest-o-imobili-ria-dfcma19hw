import { User, UserRole, Resource, Action } from './types'

export const hasPermission = (
  user: User,
  resource: Resource,
  action: Action,
): boolean => {
  // 1. Platform Owner has full access
  if (user.role === 'platform_owner') return true

  // 2. Software Tenant (PM) has full access to their tenant scope
  if (user.role === 'software_tenant') {
    // Restricted from master admin features
    if (resource === 'market_analysis' && action === 'delete') return false
    return true
  }

  // 3. Internal User (Staff) relies on permissions or mirrorAdmin
  if (user.role === 'internal_user') {
    // If mirroring admin, grant full access similar to PM
    if (user.mirrorAdmin) return true

    const permission = user.permissions?.find((p) => p.resource === resource)
    if (!permission) return false
    return permission.actions.includes(action)
  }

  // 4. Other roles
  if (user.role === 'property_owner') {
    if (resource === 'portal' && action === 'view') return true
    if (resource === 'messages' && action === 'view') return true
    if (resource === 'short_term' && action === 'view') return true
    // Owners usually don't have dashboard access in the main app, only portal
    return false
  }

  if (user.role === 'partner') {
    if (resource === 'portal' && action === 'view') return true
    if (resource === 'messages' && action === 'view') return true
    if (resource === 'tasks' && action === 'edit') return true // Can update status
    return false
  }

  if (user.role === 'partner_employee') {
    // Check specific permissions if defined, else defaults
    if (user.permissions && user.permissions.length > 0) {
      const permission = user.permissions?.find((p) => p.resource === resource)
      if (!permission) return false
      return permission.actions.includes(action)
    }

    // Default restricted access if no permissions defined
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
      return 'Internal User'
    case 'property_owner':
      return 'Proprietário'
    case 'partner':
      return 'Parceiro'
    case 'partner_employee':
      return 'Equipe (Staff)'
    case 'tenant':
      return 'Inquilino'
    default:
      return role
  }
}
