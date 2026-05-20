import { useDbTranslations } from '@/hooks/use-db-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, DollarSign, Activity } from 'lucide-react'
import usePropertyStore from '@/stores/usePropertyStore'

export default function Dashboard() {
  const { t } = useDbTranslations()
  const { properties } = usePropertyStore()

  const availableProperties = properties.filter(
    (p) => p.status === 'available',
  ).length
  const totalProperties = properties.length

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('menu.dashboard', 'Dashboard')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t(
            'dashboard.welcome',
            'Welcome back to your real estate portfolio.',
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              {t('dashboard.total_properties', 'Total Properties')}
            </CardTitle>
            <Building2 className="h-4 w-4 text-trust-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            <p className="text-xs text-slate-400 mt-1">
              {availableProperties} {t('dashboard.available', 'available')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              {t('dashboard.active_tenants', 'Active Tenants')}
            </CardTitle>
            <Users className="h-4 w-4 text-trust-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-green-500 mt-1 flex items-center">
              +2% {t('common.from_last_month', 'from last month')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              {t('dashboard.revenue', 'Monthly Revenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-trust-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-green-500 mt-1 flex items-center">
              +15% {t('common.from_last_month', 'from last month')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              {t('dashboard.occupancy', 'Occupancy Rate')}
            </CardTitle>
            <Activity className="h-4 w-4 text-trust-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-slate-400 mt-1 flex items-center">
              {t('dashboard.healthy_range', 'Healthy range')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-slate-200 col-span-1 min-h-[300px] flex items-center justify-center bg-slate-50/50">
          <p className="text-slate-400 text-sm">
            {t('dashboard.charts_placeholder', 'Analytics ready to connect.')}
          </p>
        </Card>
        <Card className="shadow-sm border-slate-200 col-span-1 min-h-[300px] flex items-center justify-center bg-slate-50/50">
          <p className="text-slate-400 text-sm">
            {t(
              'dashboard.recent_activity',
              'Recent activities will appear here.',
            )}
          </p>
        </Card>
      </div>
    </div>
  )
}
