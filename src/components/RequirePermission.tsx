import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { hasPermission } from '@/lib/permissions'
import { Resource, Action, User } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'
import useLanguageStore from '@/stores/useLanguageStore'

interface RequirePermissionProps {
  children: JSX.Element
  resource: Resource
  action?: Action
}

export function RequirePermission({
  children,
  resource,
  action = 'view',
}: RequirePermissionProps) {
  const { currentUser, isAuthenticated } = useAuthStore()
  const location = useLocation()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const hasAccess =
    isAuthenticated &&
    currentUser &&
    hasPermission(currentUser as User, resource, action)

  useEffect(() => {
    if (isAuthenticated && !hasAccess) {
      toast({
        title: t('common.access_denied'),
        description: t('common.access_denied_desc'),
        variant: 'destructive',
      })
    }
  }, [hasAccess, isAuthenticated, resource, toast, t])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!hasAccess) {
    // Redirect logic for portals based on roles
    if (
      currentUser.role === 'tenant' ||
      currentUser.role === 'property_owner' ||
      currentUser.role === 'partner' ||
      currentUser.role === 'partner_employee'
    ) {
      const portalPath =
        currentUser.role === 'property_owner'
          ? '/portal/owner'
          : currentUser.role === 'partner' ||
              currentUser.role === 'partner_employee'
            ? '/portal/partner'
            : '/portal/tenant'

      // Check if current location IS NOT the portal path to prevent loops
      // Also ensure we are not already in a sub-route of the portal
      if (!location.pathname.startsWith(portalPath)) {
        return <Navigate to={portalPath} replace />
      }
    } else {
      // For Admin/Manager/Internal roles, redirect to root if not already there or allowed
      if (location.pathname !== '/') {
        return <Navigate to="/" replace />
      }
    }

    // Fallback if redirects didn't happen or we are at a route we shouldn't be but no specific redirect
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            {t('common.access_denied')}
          </h1>
          <p className="mt-2 text-gray-600">{t('common.access_denied_desc')}</p>
          <p className="text-sm text-gray-500 mt-1">
            {t('common.resource')}: {resource}
          </p>
        </div>
      </div>
    )
  }

  return children
}
