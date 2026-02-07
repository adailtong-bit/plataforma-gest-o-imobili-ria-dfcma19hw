import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { hasPermission } from '@/lib/permissions'
import { Resource, Action, User } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'

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

  const hasAccess =
    isAuthenticated &&
    currentUser &&
    hasPermission(currentUser as User, resource, action)

  useEffect(() => {
    if (isAuthenticated && !hasAccess) {
      toast({
        title: 'Access Denied',
        description: `You do not have permission to access ${resource}.`,
        variant: 'destructive',
      })
    }
  }, [hasAccess, isAuthenticated, resource, toast])

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
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            You do not have permission to view this page.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Required Resource: {resource}
          </p>
        </div>
      </div>
    )
  }

  return children
}
