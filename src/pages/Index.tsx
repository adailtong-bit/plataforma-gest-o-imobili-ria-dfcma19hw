import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'
import useAuthStore from '@/stores/useAuthStore'
import { formatCurrency } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  Home,
  Percent,
  TrendingUp,
  Calendar as CalendarIcon,
  CheckSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Index() {
  const { properties, bookings, tasks, financials, currency } =
    useContext(AppContext)!
  const { currentUser, simulationMode, simulationRole } = useAuthStore()

  const effectiveRole =
    simulationMode && simulationRole ? simulationRole : currentUser?.role

  if (effectiveRole === 'property_owner') {
    return <Navigate to="/portal/owner" replace />
  }
  if (effectiveRole === 'partner' || effectiveRole === 'partner_employee') {
    return <Navigate to="/portal/partner" replace />
  }
  if (effectiveRole === 'tenant') {
    return <Navigate to="/portal/tenant" replace />
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

  const pendingApprovals = tasks.filter((t) => t.status === 'pending_approval')

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
      </div>

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
