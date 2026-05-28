import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, DollarSign, Activity } from 'lucide-react'
import { useDbTranslations } from '@/hooks/use-db-translations'

export default function Dashboard() {
  const { t } = useDbTranslations()

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t('dashboard.title', 'Dashboard')}
        </h1>
        <p className="text-slate-500">
          {t('dashboard.subtitle', 'Welcome to Dashboard')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('dashboard.total_properties', 'Total Properties')}
            </CardTitle>
            <Building2 className="h-4 w-4 text-trust-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-slate-500 mt-1">
              {t('dashboard.properties_available', '5 available').replace(
                '{count}',
                '5',
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('dashboard.active_tenants', 'Active Tenants')}
            </CardTitle>
            <Users className="h-4 w-4 text-trust-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-green-600 mt-1">
              {t('dashboard.tenants_trend', '+2% from last month').replace(
                '{trend}',
                '+2',
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('dashboard.monthly_revenue', 'Monthly Revenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-trust-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-green-600 mt-1">
              {t('dashboard.revenue_trend', '+15% from last month').replace(
                '{trend}',
                '+15',
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('dashboard.occupancy_rate', 'Occupancy Rate')}
            </CardTitle>
            <Activity className="h-4 w-4 text-trust-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-slate-500 mt-1">
              {t('dashboard.healthy_range', 'Healthy range')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
