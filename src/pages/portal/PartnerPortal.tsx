import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'
import useAuthStore from '@/stores/useAuthStore'
import { PartnerStaff } from '@/components/partners/PartnerStaff'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ClipboardList, Users } from 'lucide-react'

export default function PartnerPortal() {
  const { partners, updatePartner, tasks } = useContext(AppContext)!
  const { currentUser, allUsers, simulationMode, simulationRole } =
    useAuthStore()

  if (!currentUser) return null

  let targetUserId = currentUser.id
  let targetUserRole = currentUser.role
  let displayName = currentUser.name

  if (
    simulationMode &&
    (simulationRole === 'partner' || simulationRole === 'partner_employee')
  ) {
    const firstPartner = allUsers.find((u) => u.role === simulationRole)
    if (firstPartner) {
      targetUserId = firstPartner.id
      targetUserRole = firstPartner.role
      displayName = `[Simulated] ${firstPartner.name}`
    } else {
      targetUserRole = simulationRole as any
    }
  }

  const isEmployee = targetUserRole === 'partner_employee'
  const partnerId = isEmployee
    ? (allUsers.find((u) => u.id === targetUserId) as any)?.parentPartnerId ||
      targetUserId
    : targetUserId

  const partner = partners.find((p) => p.id === partnerId)

  const partnerTasks = tasks.filter((t) =>
    isEmployee
      ? t.partnerEmployeeId === targetUserId
      : t.assigneeId === partnerId,
  )
  const pendingTasks = partnerTasks.filter(
    (t) => t.status === 'pending' || t.status === 'in_progress',
  )

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome, {displayName}
        </h1>
        <p className="text-muted-foreground">
          Manage your operations and team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-trust-blue" />
              Tasks & Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold mb-1">
              {pendingTasks.length} Active Tasks
            </div>
            <p className="text-sm text-slate-600 mb-6">
              View and manage the tasks assigned to your company or profile.
            </p>
            <Button asChild className="w-full bg-trust-blue text-white">
              <Link to="/tasks">Go to Tasks Board</Link>
            </Button>
          </CardContent>
        </Card>

        {!isEmployee && partner && partner.entityType === 'company' && (
          <Card className="md:col-span-2 border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-trust-blue" />
                Team Management
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <PartnerStaff
                partner={partner}
                onUpdate={updatePartner}
                canEdit={true}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
