import { useMemo, useContext, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { AppContext } from '@/stores/AppContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'

export default function Performance() {
  const { t, language } = useLanguageStore()
  const { advertisements } = usePublicityStore()
  const { feedbacks } = useContext(AppContext) || { feedbacks: [] }
  const [reviewsOpen, setReviewsOpen] = useState(false)

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

  const viewAllText =
    language === 'pt'
      ? 'Ver Todas as Avaliações'
      : language === 'es'
        ? 'Ver Todas las Reseñas'
        : 'View All Reviews'

  const reviewsTitleText =
    language === 'pt'
      ? 'Avaliações dos Hóspedes'
      : language === 'es'
        ? 'Reseñas de Huéspedes'
        : 'Guest Reviews'

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
                crossOrigin="anonymous"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg'
                  e.currentTarget.onerror = null
                }}
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
              {t('performance.based_on_reviews', { count: '328' })}
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
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('performance.guest_reviews')}
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-2xl font-bold">328</div>
            <p className="text-xs text-muted-foreground">+28 new this month</p>
          </CardContent>
          <CardFooter className="pt-0 pb-4">
            <Button
              variant="outline"
              className="w-full font-medium text-slate-800"
              onClick={() => setReviewsOpen(true)}
            >
              {viewAllText}
            </Button>
          </CardFooter>
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

      <Dialog open={reviewsOpen} onOpenChange={setReviewsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {reviewsTitleText}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {feedbacks && feedbacks.length > 0 ? (
              feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 border border-slate-200 rounded-lg bg-slate-50 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-900">
                      {fb.guestName}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {format(new Date(fb.date), 'PPP')}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < fb.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 font-medium">
                    {fb.comment}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No reviews found.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
