import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { marketAnalysisData } from '@/lib/mockData'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'

export default function MarketAnalysis() {
  const { t } = useLanguageStore()

  const chartConfig = {
    occupancy: {
      label: t('market_analysis.avg_occupancy'),
      color: 'hsl(var(--chart-1))',
    },
    rate: {
      label: t('market_analysis.avg_daily_rate'),
      color: 'hsl(var(--chart-2))',
    },
  }

  const trendsData = marketAnalysisData?.marketTrends || []
  const competitorsData = marketAnalysisData?.competitors || []
  const forecastData = marketAnalysisData?.demandForecast || []

  const safeTrendsData = trendsData.map((d) => ({
    month: d?.month || 'N/A',
    occupancy: d?.occupancy || 0,
    rate: d?.rate || 0,
  }))

  const safeCompetitorsData = competitorsData.map((d) => ({
    name: d?.name || 'Unknown',
    rate: d?.rate || 0,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          {t('market_analysis.title')}
        </h1>
        <p className="text-slate-700 font-medium">
          {t('analytics_page.benchmark_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('market_analysis.avg_occupancy')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              +5% {t('dashboard.from_last_month')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('market_analysis.avg_daily_rate')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$142.50</div>
            <p className="text-xs text-muted-foreground">+12% from last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('market_analysis.demand_index')}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {t('market_analysis.high')}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('market_analysis.peak_season')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('market_analysis.comp_set_rank')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#2</div>
            <p className="text-xs text-muted-foreground">
              {t('market_analysis.rank_desc')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('market_analysis.spending_trends')}</CardTitle>
            <CardDescription>
              {t('market_analysis.historical_view')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="min-h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={safeTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="hsl(var(--chart-1))"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="hsl(var(--chart-2))"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="occupancy"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name={t('market_analysis.avg_occupancy')}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name={t('market_analysis.avg_daily_rate')}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('market_analysis.competitor_pricing')}</CardTitle>
            <CardDescription>
              {t('market_analysis.avg_rate_comparison')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="min-h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safeCompetitorsData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="rate"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    name={t('market_analysis.avg_daily_rate')}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('market_analysis.demand_forecast')}</CardTitle>
          <CardDescription>
            {t('market_analysis.projected_demand')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {forecastData &&
            Array.isArray(forecastData) &&
            forecastData.length > 0 ? (
              forecastData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center p-4 border rounded-lg min-w-[120px]"
                >
                  <span className="text-sm font-medium text-slate-500">
                    {new Date(item.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span
                    className={`text-lg font-bold mt-1 ${
                      item.demand === 'High'
                        ? 'text-green-600'
                        : item.demand === 'Medium'
                          ? 'text-yellow-600'
                          : 'text-slate-600'
                    }`}
                  >
                    {item.demand === 'High'
                      ? t('market_analysis.high')
                      : item.demand === 'Medium'
                        ? t('market_analysis.medium')
                        : t('market_analysis.low')}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center w-full p-6 text-muted-foreground text-sm">
                {t('market_analysis.no_forecast')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
