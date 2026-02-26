import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { Resource, Action, User } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react'
import useLanguageStore from '@/stores/useLanguageStore'
import { ShieldX, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
            A component failed to render correctly. We have applied a fallback
            so you can continue using the platform.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground"
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
  const { currentUser, isAuthenticated, hasPermissionSync, isAuthLoading } =
    useAuthStore()
  const location = useLocation()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const [hasAlerted, setHasAlerted] = useState(false)

  const allowed = hasPermissionSync(currentUser as User, resource, action)

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && !allowed && !hasAlerted) {
      toast({
        title: t('common.access_denied') || 'Access Denied',
        description:
          t('common.access_denied_desc') ||
          'You do not have permission to view this page.',
        variant: 'destructive',
      })
      setHasAlerted(true)
    }
  }, [isAuthLoading, isAuthenticated, allowed, hasAlerted, toast, t])

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 gap-4 animate-in fade-in duration-500">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <h2 className="text-xl font-medium text-slate-700">
          Verifying access...
        </h2>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!allowed) {
    if (
      currentUser?.role === 'tenant' ||
      currentUser?.role === 'property_owner' ||
      currentUser?.role === 'partner' ||
      currentUser?.role === 'partner_employee'
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 animate-in fade-in duration-500">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ShieldX className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {t('common.access_denied') || 'Acesso Negado'}
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
            className="bg-primary text-primary-foreground"
            onClick={() => (window.location.href = '/')}
          >
            {t('common.return_home') || 'Return to Dashboard'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-8">
          Resource: {resource} | Role:{' '}
          {currentUser
            ? t(`roles.${currentUser.role}`) || currentUser.role
            : 'Unknown'}
        </p>
      </div>
    )
  }

  return <PermissionErrorBoundary>{children}</PermissionErrorBoundary>
}
