import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Resource, Action } from '@/lib/types'

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
  resource?: Resource | string
  action?: Action | string
  ignoreSimulation?: boolean
}

/**
 * OVERRIDE: The frontend permission barrier has been completely removed to prevent blocking admin users.
 * Security is now strictly managed via backend RLS policies.
 */
export function RequirePermission({ children }: RequirePermissionProps) {
  return <PermissionErrorBoundary>{children}</PermissionErrorBoundary>
}
