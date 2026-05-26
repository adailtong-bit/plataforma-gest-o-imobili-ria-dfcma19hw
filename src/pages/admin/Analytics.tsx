import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Users, Building2, DollarSign, TrendingUp } from 'lucide-react'
import { useDbTranslations } from '@/hooks/use-db-translations'

export default function Analytics() {
  const { t } = useDbTranslations()

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t('analytics.title', 'Title')}
        </h1>
        <p className="text-slate-500">{t('analytics.subtitle', 'Subtitle')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('analytics.total_users', 'Total Users')}
            </CardTitle>
            <Users className="h-4 w-4 text-trust-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-slate-500 mt-1">
              +12% {t('analytics.of_last_month', 'of last month')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('analytics.active_properties', 'Active Properties')}
            </CardTitle>
            <Building2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">486</div>
            <p className="text-xs text-slate-500 mt-1">
              +4% {t('analytics.of_last_month', 'of last month')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('analytics.total_revenue', 'Total Revenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$124,500</div>
            <p className="text-xs text-slate-500 mt-1">
              +18% {t('analytics.of_last_month', 'of last month')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('analytics.growth_rate', 'Growth Rate')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24%</div>
            <p className="text-xs text-slate-500 mt-1">
              {t('analytics.yoy', 'Year Over Year')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.revenue_chart', 'Revenue Chart')}</CardTitle>
          <CardDescription>
            {t('analytics.revenue_desc', 'Revenue Desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-slate-50 rounded-md border flex items-center justify-center">
            <span className="text-muted-foreground">
              {t('analytics.chart_placeholder', 'Chart Area')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
