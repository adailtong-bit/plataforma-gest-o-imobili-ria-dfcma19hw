import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  TrendingUp,
  Star,
  MessageSquare,
  DollarSign,
  Activity,
} from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'
import { useAdRotation } from '@/hooks/useAdRotation'
import usePublicityStore from '@/stores/usePublicityStore'
import { cn } from '@/lib/utils'

export default function Performance() {
  const { t } = useLanguageStore()
  const { advertisements } = usePublicityStore()

  const performanceAds = useMemo(
    () =>
      advertisements.filter((a) => a.active && a.placement === 'performance'),
    [advertisements],
  )
  const visibleAds = useAdRotation(performanceAds, 2, 8)

  // Mock data
  const performanceData = [
    { month: 'Jan', rating: 4.5, reviews: 45, revPar: 120, occupancy: 75 },
    { month: 'Feb', rating: 4.6, reviews: 52, revPar: 135, occupancy: 78 },
    { month: 'Mar', rating: 4.7, reviews: 48, revPar: 140, occupancy: 82 },
    { month: 'Apr', rating: 4.8, reviews: 61, revPar: 155, occupancy: 85 },
    { month: 'May', rating: 4.7, reviews: 55, revPar: 160, occupancy: 88 },
    { month: 'Jun', rating: 4.9, reviews: 67, revPar: 180, occupancy: 92 },
  ]

  const chartConfig = {
    rating: {
      label: t('performance.average_rating'),
      color: 'hsl(var(--chart-1))',
    },
    reviews: {
      label: t('performance.guest_reviews'),
      color: 'hsl(var(--chart-2))',
    },
    revPar: {
      label: 'RevPAR',
      color: 'hsl(var(--chart-3))',
    },
    occupancy: {
      label: t('market_analysis.avg_occupancy'),
      color: 'hsl(var(--chart-4))',
    },
  }

  return (
    <div className="flex flex-col gap-6">
      {visibleAds.length > 0 && (
        <div
          className={cn(
            'grid grid-cols-1 gap-4',
            visibleAds.length >= 2 ? 'md:grid-cols-2' : '',
          )}
        >
          {visibleAds.map((ad, idx) => (
            <a
              key={`${ad.id}-${idx}`}
              href={ad.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="block relative h-24 rounded-lg overflow-hidden border bg-muted group animate-in fade-in duration-500"
            >
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 p-4 flex flex-col justify-center">
                <span className="text-white text-[10px] font-bold uppercase tracking-wider mb-1 bg-black/60 w-fit px-1.5 py-0.5 rounded">
                  Sponsored
                </span>
                <h4 className="text-white font-bold truncate text-sm">
                  {ad.title}
                </h4>
                {ad.description && (
                  <p className="text-white/80 text-xs truncate mt-0.5">
                    {ad.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          {t('sidebar.performance')}
        </h1>
        <p className="text-slate-700 font-medium">
          {t('performance.guest_reviews')} & KPIs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('performance.average_rating')}
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7</div>
            <p className="text-xs text-muted-foreground">
              {t('performance.based_on_reviews', { count: 328 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('market_analysis.avg_occupancy')}
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +5% {t('dashboard.from_last_month')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RevPAR</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$148.33</div>
            <p className="text-xs text-muted-foreground">+12% vs last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('performance.guest_reviews')}
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">328</div>
            <p className="text-xs text-muted-foreground">+28 new this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('performance.rating_reviews_trend')}</CardTitle>
            <CardDescription>
              {t('performance.guest_satisfaction_evolution')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="min-h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis yAxisId="left" domain={[0, 5]} hide />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="rating"
                    stroke="var(--color-rating)"
                    strokeWidth={2}
                    name={t('performance.average_rating')}
                    dot={{ r: 4 }}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="reviews"
                    fill="var(--color-reviews)"
                    opacity={0.3}
                    name={t('performance.guest_reviews')}
                    barSize={20}
                    radius={[4, 4, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('performance.financial_performance')}</CardTitle>
            <CardDescription>{t('performance.revpar_trends')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="min-h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar
                    dataKey="revPar"
                    fill="var(--color-revPar)"
                    radius={[4, 4, 0, 0]}
                    name="RevPAR"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
