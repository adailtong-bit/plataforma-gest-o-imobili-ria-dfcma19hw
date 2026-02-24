import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { Resource, Action, User } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { useEffect, useState } from 'react'
import useLanguageStore from '@/stores/useLanguageStore'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

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
  const { currentUser, isAuthenticated, checkPermission } = useAuthStore()
  const location = useLocation()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const [isChecking, setIsChecking] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    let mounted = true
    const verifyAccess = async () => {
      setIsChecking(true)
      if (!isAuthenticated || !currentUser) {
        if (mounted) {
          setHasAccess(false)
          setIsChecking(false)
        }
        return
      }

      try {
        const allowed = await checkPermission(
          currentUser as User,
          resource,
          action,
        )
        if (mounted) {
          setHasAccess(allowed)
          setIsChecking(false)
        }
      } catch (error) {
        if (mounted) {
          setHasAccess(false)
          setIsChecking(false)
        }
      }
    }

    verifyAccess()
    return () => {
      mounted = false
    }
  }, [currentUser, isAuthenticated, resource, action, checkPermission])

  useEffect(() => {
    if (!isChecking && isAuthenticated && !hasAccess) {
      toast({
        title: t('common.access_denied'),
        description: t('common.access_denied_desc'),
        variant: 'destructive',
      })
    }
  }, [hasAccess, isAuthenticated, isChecking, toast, t])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    )
  }

  if (!hasAccess) {
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
