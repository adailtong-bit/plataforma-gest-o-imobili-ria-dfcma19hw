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
            Erro de Exibição
          </h1>
          <p className="text-muted-foreground max-w-md mb-6">
            Um componente falhou ao renderizar corretamente. Aplicamos um fallback para que você possa continuar usando a plataforma.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground"
          >
            Recarregar Página
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
    currentUser,
    isAuthenticated,
    hasPermissionSync,
    isAuthLoading,
    simulationMode,
    simulationRole,
  } = useAuthStore()
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

  const allowed = isDeveloperBypass
    ? true
    : isSoftwareTenant
      ? true
      : effectiveUser
        ? hasPermissionSync(effectiveUser, resource, action)
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
          title: t('common.access_denied') || 'Acesso Negado',
          description:
            t('common.access_denied_desc') ||
            'Você não tem permissão para acessar esta página.',
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
          Carregando permissões...
        </h2>
      </div>
    )
  }

  if (!isAuthenticated || !effectiveUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!allowed) {
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

      if (!location.pathname.startsWith(portalPath)) {
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
            'Você não tem permissão para acessar esta página.'}
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            {t('common.back') || 'Voltar'}
          </Button>
          <Button
            className="bg-primary text-primary-foreground"
            onClick={() => (window.location.href = '/')}
          >
            {t('common.return_home') || 'Voltar para o Painel'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-8">
          Recurso: {resource} | Perfil:{' '}
          {effectiveUser
            ? t(`roles.${effectiveUser.role}`) || effectiveUser.role
            : 'Desconhecido'}
        </p>
      </div>
    )
  }

  return <PermissionErrorBoundary>{children}</PermissionErrorBoundary>
}

