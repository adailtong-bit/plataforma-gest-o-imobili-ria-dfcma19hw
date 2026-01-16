import { UserRole } from './types'

export const canChat = (
  initiatorRole: UserRole,
  targetRole: UserRole,
): boolean => {
  // App Owner Rules
  if (initiatorRole === 'app_owner') {
    // Can view/msg Platform Tenants (Owner, Manager, Staff)
    // Cannot msg Property Owners or Partners directly
    return [
      'platform_owner',
      'platform_manager',
      'platform_staff_long',
      'platform_staff_short',
    ].includes(targetRole)
  }

  // Platform Tenant Rules (Company)
  if (initiatorRole === 'platform_owner') {
    // Can msg everyone
    return true
  }

  if (initiatorRole === 'platform_manager') {
    // Can msg everyone
    return true
  }

  if (
    initiatorRole === 'platform_staff_long' ||
    initiatorRole === 'platform_staff_short'
  ) {
    // Can msg Platform Owner/Manager, Property Owners, Partners
    // Cannot msg App Owner directly (usually only Platform Owner does this, but for simplicity let's say they can't)
    return [
      'platform_owner',
      'platform_manager',
      'platform_staff_long',
      'platform_staff_short',
      'property_owner',
      'partner',
      'tenant',
    ].includes(targetRole)
  }

  // Property Owner Rules
  if (initiatorRole === 'property_owner') {
    // Can msg Platform Tenant's employees
    // PROHIBITED: Partners, App Owner, Other Property Owners (privacy)
    return [
      'platform_owner',
      'platform_manager',
      'platform_staff_long',
      'platform_staff_short',
    ].includes(targetRole)
  }

  // Partner Rules
  if (initiatorRole === 'partner') {
    // Can msg Platform Tenant's employees
    // PROHIBITED: Property Owners, App Owner
    return [
      'platform_owner',
      'platform_manager',
      'platform_staff_long',
      'platform_staff_short',
    ].includes(targetRole)
  }

  // Tenant (Renter) Rules
  if (initiatorRole === 'tenant') {
    // Can msg Platform Tenant's employees
    return [
      'platform_owner',
      'platform_manager',
      'platform_staff_long',
      'platform_staff_short',
    ].includes(targetRole)
  }

  return false
}

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'app_owner':
      return 'Admin do Sistema'
    case 'platform_owner':
      return 'Dono da Empresa'
    case 'platform_manager':
      return 'Gerente'
    case 'platform_staff_long':
      return 'Staff (Fixo)'
    case 'platform_staff_short':
      return 'Staff (Temp)'
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
