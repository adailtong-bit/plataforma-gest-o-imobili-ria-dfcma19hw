import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'
import useAuthStore from '@/stores/useAuthStore'
import usePublicityStore from '@/stores/usePublicityStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  Home,
  Percent,
  TrendingUp,
  Calendar as CalendarIcon,
  CheckSquare,
  Shield,
  Briefcase,
  Users,
  Building,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Index() {
  const { properties, bookings, tasks, financials, currency } =
    useContext(AppContext)!
  const {
    currentUser,
    simulationMode,
    simulationRole,
    setSimulationMode,
    setSimulationRole,
  } = useAuthStore()
  const navigate = useNavigate()

  const isRealAdmin =
    currentUser?.role === 'master' ||
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'platform_owner' ||
    currentUser?.role === 'software_tenant' ||
    currentUser?.role === 'internal_user'

  if (!isRealAdmin && !simulationMode) {
    if (currentUser?.role === 'property_owner')
      return <Navigate to="/portal/owner" replace />
    if (
      currentUser?.role === 'partner' ||
      currentUser?.role === 'partner_employee'
    )
      return <Navigate to="/portal/partner" replace />
    if (currentUser?.role === 'tenant')
      return <Navigate to="/portal/tenant" replace />
  }

  const handleSimulate = (role: string, path: string) => {
    if (role === 'admin') {
      setSimulationMode(false)
      setSimulationRole(null)
      navigate('/')
    } else {
      setSimulationMode(true)
      setSimulationRole(role as any)
      navigate(path)
    }
  }

  const totalRevenue = financials.invoices
    .filter((i) => i.status === 'paid')
    .reduce((acc, i) => acc + i.amount, 0)

  const occupancy =
    bookings.length > 0
      ? Math.min(
          100,
          Math.round((bookings.length / (properties.length || 1)) * 100),
        )
      : 0
  const adr =
    bookings.length > 0
      ? bookings.reduce((acc, b) => acc + (b.baseAmount || 0), 0) /
        bookings.length
      : 0
  const revPar = adr * (occupancy / 100)

  const { campaigns } = usePublicityStore()

  const pendingApprovals = tasks.filter((t) => t.status === 'pending_approval')

  const now = new Date()
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const expiringCampaigns = campaigns
    .filter((c) => {
      if (c.status !== 'active' || !c.end_date) return false
      const endDate = new Date(c.end_date)
      return endDate >= now && endDate <= next7Days
    })
    .sort(
      (a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime(),
    )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
      </div>

      {isRealAdmin && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Role Simulation & Access Points
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${!simulationMode ? 'ring-2 ring-trust-blue bg-blue-50/50' : 'bg-white border-slate-200'}`}
              onClick={() => handleSimulate('admin', '/')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div
                  className={`p-3 rounded-full ${!simulationMode ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}
                >
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Administrator</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Full platform access
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 group text-trust-blue"
                >
                  Access{' '}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${simulationMode && simulationRole === 'property_owner' ? 'ring-2 ring-trust-blue bg-blue-50/50' : 'bg-white border-slate-200'}`}
              onClick={() => handleSimulate('property_owner', '/portal/owner')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div
                  className={`p-3 rounded-full ${simulationMode && simulationRole === 'property_owner' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}
                >
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Owner Portal</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Asset & financial view
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 group text-trust-blue"
                >
                  Access{' '}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${simulationMode && simulationRole === 'partner' ? 'ring-2 ring-trust-blue bg-blue-50/50' : 'bg-white border-slate-200'}`}
              onClick={() => handleSimulate('partner', '/portal/partner')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div
                  className={`p-3 rounded-full ${simulationMode && simulationRole === 'partner' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}
                >
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Partner Portal</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Service & tasks view
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 group text-trust-blue"
                >
                  Access{' '}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${simulationMode && simulationRole === 'tenant' ? 'ring-2 ring-trust-blue bg-blue-50/50' : 'bg-white border-slate-200'}`}
              onClick={() => handleSimulate('tenant', '/portal/tenant')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div
                  className={`p-3 rounded-full ${simulationMode && simulationRole === 'tenant' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}
                >
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Tenant Portal</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Lease & payments view
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 group text-trust-blue"
                >
                  Access{' '}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {isRealAdmin && expiringCampaigns.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-800">
              Campaigns Expiring Soon
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiringCampaigns.map((camp) => {
              const endDate = new Date(camp.end_date)
              const timeDiff = endDate.getTime() - now.getTime()
              const hoursDiff = timeDiff / (1000 * 3600)
              const isUrgent = hoursDiff < 48

              return (
                <Card
                  key={camp.id}
                  className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-slate-900 truncate pr-2">
                        {camp.title}
                      </span>
                      <Badge
                        className={
                          isUrgent
                            ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200'
                        }
                      >
                        {isUrgent ? 'Urgent' : 'Warning'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-500">
                      <span>Expires: {formatDate(camp.end_date)}</span>
                      {isUrgent && (
                        <span className="font-medium text-red-600">
                          {Math.max(0, Math.floor(hoursDiff))}h left
                        </span>
                      )}
                    </div>
                    <Link to="/admin/publicity" className="mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8"
                      >
                        Manage Campaign
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Revenue
            </CardTitle>
            <div className="bg-blue-50 p-2 rounded-full">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalRevenue, currency)}
            </div>
            <p className="text-xs text-green-600 font-medium flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Occupancy Rate
            </CardTitle>
            <div className="bg-green-50 p-2 rounded-full">
              <Percent className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {occupancy}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Average across all properties
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              ADR (Avg Daily Rate)
            </CardTitle>
            <div className="bg-orange-50 p-2 rounded-full">
              <Home className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(adr, currency)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              For short-term rentals
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              RevPAR
            </CardTitle>
            <div className="bg-purple-50 p-2 rounded-full">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(revPar, currency)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Revenue Per Available Room
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50 pb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-trust-blue" />
              <CardTitle>Interactive Calendar</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex justify-center">
            <Calendar
              mode="single"
              className="rounded-md border shadow-sm w-full max-w-[350px]"
            />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-slate-200 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 pb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-orange-500" />
              <CardTitle>Pending Approvals</CardTitle>
            </div>
            {pendingApprovals.length > 0 && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 font-bold hover:bg-orange-200">
                {pendingApprovals.length} Action
                {pendingApprovals.length !== 1 ? 's' : ''} Needed
              </Badge>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-y-auto max-h-[350px]">
            <div className="divide-y divide-slate-100">
              {pendingApprovals.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-sm text-slate-900">
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {task.propertyName}
                    </p>
                  </div>
                  <Link to="/tasks">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-trust-blue border-blue-200 hover:bg-blue-50"
                    >
                      Review
                    </Button>
                  </Link>
                </div>
              ))}
              {pendingApprovals.length === 0 && (
                <div className="text-center text-slate-500 py-12 flex flex-col items-center">
                  <div className="bg-slate-100 p-3 rounded-full mb-3">
                    <CheckSquare className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="font-medium">All caught up!</p>
                  <p className="text-sm">No tasks pending approval.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
