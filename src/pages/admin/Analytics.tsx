import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import useLanguageStore from '@/stores/useLanguageStore'
import { Activity, Users, DollarSign, TrendingUp } from 'lucide-react'

export default function Analytics() {
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('analytics.title', 'Advanced Analytics')}
        </h1>
        <p className="text-muted-foreground">
          {t('analytics.subtitle', 'Platform-wide insights and metrics.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.total_users', 'Total Users')}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">
              +12% {t('dashboard.from_last_month', 'from last month')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.active_properties', 'Active Properties')}
            </CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">486</div>
            <p className="text-xs text-muted-foreground">
              +4% {t('dashboard.from_last_month', 'from last month')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.total_revenue', 'Total Revenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$124,500</div>
            <p className="text-xs text-muted-foreground">
              +18% {t('dashboard.from_last_month', 'from last month')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.growth_rate', 'Growth Rate')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24%</div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.year_over_year', 'Year over year')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle>
            {t('analytics.revenue_chart', 'Revenue Overview')}
          </CardTitle>
          <CardDescription>
            {t(
              'analytics.revenue_desc',
              'Monthly revenue across all properties.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center text-muted-foreground h-[300px] border-t bg-slate-50/50">
          {t('analytics.chart_placeholder', 'Chart visualizer loading...')}
        </CardContent>
      </Card>
    </div>
  )
}
