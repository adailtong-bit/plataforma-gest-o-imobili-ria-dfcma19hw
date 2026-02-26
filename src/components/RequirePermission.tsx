import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { Resource, Action, User } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react'
import useLanguageStore from '@/stores/useLanguageStore'
import { ShieldX, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

class PermissionErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      'RequirePermission ErrorBoundary caught an error:',
      error,
      errorInfo,
    )
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
          <div className="bg-orange-50 p-4 rounded-full mb-4">
            <AlertTriangle className="h-12 w-12 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Display Error
          </h1>
          <p className="text-muted-foreground max-w-md mb-6">
            A component failed to render. We have applied a fallback so you can
            continue using the platform.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-trust-blue"
          >
            Reload Page
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}

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
  const [hasTimeout, setHasTimeout] = useState(false)

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const verifyAccess = async () => {
      setIsChecking(true)
      setHasTimeout(false)

      if (!isAuthenticated || !currentUser) {
        if (mounted) {
          setHasAccess(false)
          setIsChecking(false)
        }
        return
      }

      timeoutId = setTimeout(() => {
        if (mounted && isChecking) {
          setHasTimeout(true)
          setIsChecking(false)
        }
      }, 5000)

      try {
        const allowed = await checkPermission(
          currentUser as User,
          resource,
          action,
        )
        if (mounted) {
          setHasAccess(allowed)
          setIsChecking(false)
          clearTimeout(timeoutId)
        }
      } catch (error) {
        if (mounted) {
          setHasAccess(false)
          setIsChecking(false)
          clearTimeout(timeoutId)
        }
      }
    }

    verifyAccess()
    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [currentUser, isAuthenticated, resource, action, checkPermission])

  useEffect(() => {
    if (!isChecking && isAuthenticated && !hasAccess && !hasTimeout) {
      toast({
        title: t('common.access_denied') || 'Access Denied',
        description:
          t('common.access_denied_desc') ||
          'You do not have permission to view this page.',
        variant: 'destructive',
      })
    }
  }, [hasAccess, isAuthenticated, isChecking, hasTimeout, toast, t])

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

  if (hasTimeout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="bg-orange-50 p-4 rounded-full mb-4">
          <AlertTriangle className="h-12 w-12 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Loading Error
        </h1>
        <p className="text-muted-foreground max-w-md mb-6">
          The permission verification request timed out. Please check your
          connection and try again.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-trust-blue"
        >
          Reload Page
        </Button>
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
          {t('common.access_denied') || 'Access Denied'}
        </h1>
        <p className="text-muted-foreground max-w-md mb-6">
          {t('common.access_denied_desc') ||
            'You do not have permission to view this resource.'}
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            {t('common.back') || 'Go Back'}
          </Button>
          <Button
            className="bg-trust-blue"
            onClick={() => (window.location.href = '/')}
          >
            {t('common.return_home') || 'Return Home'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-8">
          Resource: {resource} | Role:{' '}
          {t(`roles.${currentUser.role}`) || currentUser.role}
        </p>
      </div>
    )
  }

  return <PermissionErrorBoundary>{children}</PermissionErrorBoundary>
}
