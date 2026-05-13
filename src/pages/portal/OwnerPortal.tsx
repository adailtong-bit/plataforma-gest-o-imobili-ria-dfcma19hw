import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'
import useAuthStore from '@/stores/useAuthStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { OwnerProperties } from '@/components/owners/OwnerProperties'
import { OwnerTasks } from '@/components/owners/OwnerTasks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, ClipboardList } from 'lucide-react'

export default function OwnerPortal() {
  const { properties, tasks } = useContext(AppContext)!
  const { currentUser, allUsers, simulationMode, simulationRole } =
    useAuthStore()
  const { t } = useLanguageStore()

  if (!currentUser) return null

  let targetUserId = currentUser.id
  let displayName = currentUser.name

  if (simulationMode && simulationRole === 'property_owner') {
    const firstOwner = allUsers.find((u) => u.role === 'property_owner')
    if (firstOwner) {
      targetUserId = firstOwner.id
      displayName = `[Simulated] ${firstOwner.name}`
    }
  }

  const ownerProperties = properties.filter((p) => p.ownerId === targetUserId)
  const pendingTasks = tasks.filter(
    (t) =>
      ownerProperties.map((op) => op.id).includes(t.propertyId) &&
      t.status === 'pending_approval' &&
      t.approvalStatus === 'owner_pending',
  )

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('owner_portal.welcome') || 'Welcome'}, {displayName}
        </h1>
        <p className="text-muted-foreground">
          {t('owner_portal.subtitle') || 'Owner Asset Portal'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('owner_portal.registered_properties') ||
                'Registered Properties'}
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {ownerProperties.length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('owner_portal.pending_tasks') || 'Pending Task Approvals'}
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingTasks.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <OwnerProperties ownerId={targetUserId} properties={properties} />
      <OwnerTasks ownerId={targetUserId} properties={properties} />
    </div>
  )
}
