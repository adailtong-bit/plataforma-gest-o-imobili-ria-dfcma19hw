import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate, translateStatus } from '@/lib/utils'
import { useDbTranslations } from '@/hooks/use-db-translations'
import {
  Building2,
  Users,
  DollarSign,
  Calendar,
  Activity,
  ArrowUpRight,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const { t, locale } = useDbTranslations()
  const [stats, setStats] = useState({
    properties: 0,
    tenants: 0,
    bookings: 0,
    revenue: 0,
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function fetchData() {
      try {
        const [propsRes, profilesRes, bookingsRes, revenueRes] =
          await Promise.all([
            supabase.from('properties').select('id', { count: 'exact' }),
            supabase.from('profiles').select('id').eq('role', 'tenant'),
            supabase
              .from('bookings')
              .select('*, properties(name), guests(name)')
              .order('created_at', { ascending: false })
              .limit(5),
            supabase.from('invoices').select('amount').eq('status', 'paid'),
          ])

        if (!isMounted) return

        const totalRevenue =
          revenueRes.data?.reduce((acc, inv) => acc + (inv.amount || 0), 0) || 0

        setStats({
          properties: propsRes.count || 0,
          tenants: profilesRes.data?.length || 0,
          bookings: bookingsRes.data?.length || 0,
          revenue: totalRevenue,
        })

        setRecentBookings(bookingsRes.data || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in-up duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('dashboard.title', 'Dashboard')}
          </h1>
          <p className="text-slate-500">
            {t('dashboard.subtitle', 'Visão geral das suas operações')}
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('menu.properties', 'Propriedades')}
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-md">
              <Building2 className="h-4 w-4 text-trust-blue" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-slate-900">
                  {stats.properties}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('sidebar.tenants', 'Locatários')}
            </CardTitle>
            <div className="p-2 bg-green-50 rounded-md">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-slate-900">
                  {stats.tenants}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('sidebar.calendar', 'Reservas')}
            </CardTitle>
            <div className="p-2 bg-orange-50 rounded-md">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-slate-900">
                  {stats.bookings}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('menu.finances', 'Receita (Paga)')}
            </CardTitle>
            <div className="p-2 bg-emerald-50 rounded-md">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(stats.revenue, 'BRL')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Activity className="h-5 w-5 text-trust-blue" />
              {t('dashboard.recent_bookings', 'Reservas Recentes')}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-trust-blue hover:text-blue-700"
            >
              <Link to="/calendar" className="flex items-center gap-1">
                {t('common.view_all', 'Ver Todas')}{' '}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentBookings.length > 0 ? (
              <div className="divide-y">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50 transition-colors gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5 text-slate-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-sm text-slate-900">
                          {booking.properties?.name ||
                            t('common.unassigned', 'Não atribuído')}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {booking.guests?.name || 'Hóspede'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDate(booking.check_in, locale)} -{' '}
                          {formatDate(booking.check_out, locale)}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right space-y-2 ml-14 sm:ml-0">
                      <p className="font-bold text-sm text-slate-900">
                        {formatCurrency(booking.total_amount || 0, 'BRL')}
                      </p>
                      <div className="flex justify-start sm:justify-end">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-blue-100 text-blue-800">
                          {translateStatus(booking.status, t)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 text-slate-500 flex flex-col items-center">
                <Calendar className="h-12 w-12 text-slate-200 mb-4" />
                <p>{t('common.no_data', 'Nenhum dado disponível')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
