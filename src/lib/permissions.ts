import { User, UserRole, Resource, Action } from './types'

export const hasPermission = (
  user: User,
  resource: Resource,
  action: Action,
): boolean => {
  // 1. Platform Owner has full access
  if (user.role === 'platform_owner') return true

  // 2. Check Granular Permissions first if they exist
  // This allows overriding default role behavior for any user with explicit skills assigned
  if (user.permissions && user.permissions.length > 0) {
    const permission = user.permissions.find((p) => p.resource === resource)

    // If the resource is explicitly managed in permissions
    if (permission) {
      return permission.actions.includes(action)
    }

    // If specific permissions exist but this resource isn't listed,
    // for Internal Users and Partner Employees, we usually deny access unless it falls back to a base role logic.
    // However, to keep it simple: explicit permissions take precedence.
    // If you have a permission set, and the resource isn't there, you probably shouldn't see it
    // UNLESS it's a basic feature like 'dashboard' or 'settings' which might be implicit.
    // For now, let's allow fall-through to role defaults for hybrid roles,
    // but strictly enforce for 'internal_user'.
    if (user.role === 'internal_user' && !user.mirrorAdmin) return false
  }

  // 3. Role-based Defaults (if no specific permission set matches or overrides)

  if (user.role === 'software_tenant') {
    // Restricted from master admin features if any
    if (resource === 'market_analysis' && action === 'delete') return false
    return true
  }

  if (user.role === 'internal_user') {
    // If mirroring admin, grant full access
    if (user.mirrorAdmin) return true
    // Otherwise, should have been caught by permissions check above.
    // If no permissions array and not mirror admin, deny.
    return false
  }

  if (user.role === 'property_owner') {
    if (resource === 'portal' && action === 'view') return true
    if (resource === 'messages' && action === 'view') return true
    if (resource === 'short_term' && action === 'view') return true
    if (resource === 'financial' && action === 'view') return true
    // Owners generally use the portal
    return false
  }

  if (user.role === 'partner') {
    if (resource === 'portal' && action === 'view') return true
    if (resource === 'messages' && action === 'view') return true
    if (resource === 'tasks' && (action === 'view' || action === 'edit'))
      return true
    if (resource === 'financial' && action === 'view') return true
    return false
  }

  if (user.role === 'partner_employee') {
    if (resource === 'portal' && action === 'view') return true
    if (resource === 'tasks' && action === 'view') return true // Can view assigned tasks
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
      return 'Locador (Gestor)'
    case 'internal_user':
      return 'Interno (Staff)'
    case 'property_owner':
      return 'Proprietário'
    case 'partner':
      return 'Parceiro (Fornecedor)'
    case 'partner_employee':
      return 'Equipe (Técnico)'
    case 'tenant':
      return 'Inquilino'
    default:
      return role
  }
}
