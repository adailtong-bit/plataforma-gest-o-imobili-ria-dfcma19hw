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
    // Redirect to dashboard or portal based on role if access denied
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

      // Avoid infinite redirect if checking access to the portal itself and failing (should not happen with correct matrix)
      if (location.pathname !== portalPath) {
        return <Navigate to={portalPath} replace />
      }
    }

    if (location.pathname !== '/') {
      return <Navigate to="/" replace />
    }

    // If at root and still no access (edge case), show simple message
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return children
}
