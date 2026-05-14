import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import useAuthStore from '@/stores/useAuthStore'
import { Resource, Action, User } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react'
import useLanguageStore from '@/stores/useLanguageStore'
import { ShieldX, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { hasPermission } from '@/lib/permissions'

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
            A component failed to render correctly. We applied a fallback so you
            can continue using the platform.
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
  ignoreSimulation?: boolean
}

export function RequirePermission({
  children,
  resource,
  action = 'view',
  ignoreSimulation = false,
}: RequirePermissionProps) {
  const {
    profile: currentUser,
    session,
    hasPermissionSync,
    loading: isAuthLoading,
  } = useAuth()
  const { simulationMode, simulationRole } = useAuthStore()
  const isAuthenticated = !!session
  const location = useLocation()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const [hasAlerted, setHasAlerted] = useState(false)

  // ENHANCED PERMISSION HANDLING: Testers/admins have unrestricted access to all modules during validation phase.
  const isDeveloperBypass =
    currentUser?.role === 'master' ||
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'platform_owner' ||
    currentUser?.role === 'admin'

  const effectiveUser =
    simulationMode && simulationRole && !ignoreSimulation && currentUser
      ? ({ ...currentUser, role: simulationRole, permissions: [] } as User)
      : (currentUser as User)

  const isSoftwareTenant = effectiveUser?.role === 'software_tenant'

  const isPortalUserRole = [
    'tenant',
    'property_owner',
    'partner',
    'partner_employee',
  ].includes(effectiveUser?.role || '')

  const isAlwaysAllowedResource =
    isPortalUserRole && (resource === 'messages' || resource === 'portal')

  const allowed = isDeveloperBypass
    ? true
    : isSoftwareTenant
      ? true
      : isAlwaysAllowedResource
        ? true
        : effectiveUser
          ? hasPermission(
              effectiveUser as any,
              resource as Resource,
              action as Action,
            )
          : false

  useEffect(() => {
    if (
      !allowed &&
      !hasAlerted &&
      !isDeveloperBypass &&
      !isAuthLoading &&
      isAuthenticated &&
      effectiveUser
    ) {
      const isPortalUser = [
        'tenant',
        'property_owner',
        'partner',
        'partner_employee',
      ].includes(effectiveUser?.role || '')

      if (!isPortalUser) {
        toast({
          title: t('common.access_denied') || 'Access Denied',
          description:
            t('common.access_denied_desc') ||
            'You do not have permission to view this page.',
          variant: 'destructive',
        })
        setHasAlerted(true)
      }
    }
  }, [
    allowed,
    hasAlerted,
    toast,
    t,
    effectiveUser,
    isAuthLoading,
    isAuthenticated,
    isDeveloperBypass,
  ])

  if (isDeveloperBypass) {
    return <PermissionErrorBoundary>{children}</PermissionErrorBoundary>
  }

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 gap-4 animate-in fade-in duration-500">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <h2 className="text-xl font-medium text-slate-700">
          {t('common.loading') || 'Loading...'}
        </h2>
      </div>
    )
  }
  if (!isAuthenticated || !effectiveUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const isPortalUser = [
    'tenant',
    'property_owner',
    'partner',
    'partner_employee',
  ].includes(effectiveUser?.role || '')

  if (isPortalUser) {
    const portalPath =
      effectiveUser.role === 'property_owner'
        ? '/portal/owner'
        : effectiveUser.role === 'partner' ||
            effectiveUser.role === 'partner_employee'
          ? '/portal/partner'
          : '/portal/tenant'

    const isAllowedPath =
      location.pathname.startsWith(portalPath) ||
      location.pathname.startsWith('/messages') ||
      location.pathname.startsWith('/help')

    if (!isAllowedPath) {
      return <Navigate to={portalPath} replace />
    }
  }

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 animate-in fade-in duration-500">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ShieldX className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {t('common.access_denied') || 'Access Denied'}
        </h1>
        <p className="text-muted-foreground max-w-md mb-6">
          {t('common.access_denied_desc') ||
            'You do not have permission to view this page.'}
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            {t('common.back') || 'Back'}
          </Button>
          <Button
            className="bg-primary text-primary-foreground"
            onClick={() => (window.location.href = '/')}
          >
            {t('common.return_home') || 'Return Home'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-8">
          {t('common.resource') || 'Resource'}: {resource} |{' '}
          {t('common.profile') || 'Profile'}:{' '}
          {effectiveUser
            ? t(`roles.${effectiveUser.role}`) || effectiveUser.role
            : t('common.unknown') || 'Unknown'}
        </p>
      </div>
    )
  }

  return <PermissionErrorBoundary>{children}</PermissionErrorBoundary>
}
