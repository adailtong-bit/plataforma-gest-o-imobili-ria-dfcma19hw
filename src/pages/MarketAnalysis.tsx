import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import useLanguageStore from '@/stores/useLanguageStore'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

export default function MarketAnalysis() {
  const { t } = useLanguageStore()

  const data = [
    { name: 'Jan', avgRate: 150, ourRate: 140 },
    { name: 'Feb', avgRate: 155, ourRate: 150 },
    { name: 'Mar', avgRate: 165, ourRate: 160 },
    { name: 'Apr', avgRate: 180, ourRate: 175 },
    { name: 'May', avgRate: 200, ourRate: 190 },
    { name: 'Jun', avgRate: 220, ourRate: 210 },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('market_analysis.title')}
        </h1>
        <p className="text-muted-foreground">{t('market_analysis.subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('market_analysis.demand_index')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {t('market_analysis.high')}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('market_analysis.peak_season')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('market_analysis.comp_set_rank')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#3</div>
            <p className="text-xs text-muted-foreground">
              {t('market_analysis.rank_desc')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('market_analysis.avg_daily_rate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$175</div>
            <p className="text-xs text-muted-foreground">
              +12% vs {t('common.last_month')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('market_analysis.avg_rate_comparison')}</CardTitle>
          <CardDescription>
            {t('market_analysis.historical_view')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ChartContainer
              config={{
                avgRate: { label: t('common.market_avg'), color: '#94a3b8' },
                ourRate: { label: t('common.internal_perf'), color: '#3b82f6' },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="avgRate"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    name={t('common.market_avg')}
                  />
                  <Line
                    type="monotone"
                    dataKey="ourRate"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name={t('common.internal_perf')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
