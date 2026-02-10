import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { hasPermission } from '@/lib/permissions'
import { Resource, Action, User } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'
import useLanguageStore from '@/stores/useLanguageStore'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

      // Allow if trying to access properties via direct link but check if it's their property
      // For now, if they are blocked from a resource, we show the denied screen or redirect to portal
      // The PERMISSIONS_MATRIX update should prevent this for valid resources.
      if (!location.pathname.startsWith(portalPath) && resource === 'portal') {
        return <Navigate to={portalPath} replace />
      }
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ShieldX className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {t('common.access_denied')}
        </h1>
        <p className="text-muted-foreground max-w-md mb-6">
          {t('common.access_denied_desc')}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            {t('common.back')}
          </Button>
          <Button
            className="bg-trust-blue"
            onClick={() => (window.location.href = '/')}
          >
            {t('common.return_home')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-8">
          {t('common.resource')}: {resource} | {t('common.role')}:{' '}
          {t(`roles.${currentUser.role}`)}
        </p>
      </div>
    )
  }

  return children
}
