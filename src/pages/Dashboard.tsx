import { useDbTranslations } from '@/hooks/use-db-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Building2, Users, DollarSign, Activity } from 'lucide-react'

export default function Dashboard() {
  const { t } = useDbTranslations()

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          {t('menu.dashboard', 'Dashboard')}
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          {t(
            'dashboard.welcome',
            'Welcome back! Here is an overview of your properties.',
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('menu.properties', 'Properties')}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 {t('dashboard.from_last_month', 'from last month')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('sidebar.tenants', 'Tenants')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">
              +4 {t('dashboard.from_last_month', 'from last month')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('market_analysis.avg_occupancy', 'Avg Occupancy')}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +5% {t('dashboard.from_last_month', 'from last month')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('menu.finances', 'Finances')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% {t('dashboard.from_last_month', 'from last month')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>
              {t('dashboard.recent_activity', 'Recent Activity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                    <Home className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      New Booking #{i}049
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Property A - {i} days ago
                    </p>
                  </div>
                  <div className="font-medium text-sm text-green-600">
                    +$1,250.00
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
