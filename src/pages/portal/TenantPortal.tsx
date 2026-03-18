import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'
import useAuthStore from '@/stores/useAuthStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home } from 'lucide-react'

export default function TenantPortal() {
  const { currentUser, allUsers, simulationMode, simulationRole } =
    useAuthStore()
  const { properties, tenants } = useContext(AppContext)!

  let targetUserId = currentUser?.id
  let displayName = currentUser?.name

  if (simulationMode && simulationRole === 'tenant') {
    const firstTenant = allUsers.find((u) => u.role === 'tenant')
    if (firstTenant) {
      targetUserId = firstTenant.id
      displayName = `[Simulated] ${firstTenant.name}`
    }
  }

  const activeTenant = tenants.find((t) => t.id === targetUserId)
  const property = properties.find((p) => p.id === activeTenant?.propertyId)

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome, {displayName}
        </h1>
        <p className="text-muted-foreground">Tenant Portal</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" /> Current Lease
          </CardTitle>
        </CardHeader>
        <CardContent>
          {property ? (
            <div>
              <p className="font-medium text-lg">{property.name}</p>
              <p className="text-slate-600">{property.address}</p>
              <p className="text-sm text-slate-500 mt-2">
                Rent: ${activeTenant?.rentValue} / month
              </p>
            </div>
          ) : (
            <p className="text-slate-600">
              You do not have an active lease at the moment.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
