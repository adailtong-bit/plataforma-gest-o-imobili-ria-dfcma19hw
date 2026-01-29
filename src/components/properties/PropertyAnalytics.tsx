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
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Property, LedgerEntry } from '@/lib/types'
import useFinancialStore from '@/stores/useFinancialStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { formatCurrency } from '@/lib/utils'
import {
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  format,
  addMonths,
} from 'date-fns'
import { TrendingUp, DollarSign, Percent, Activity } from 'lucide-react'

interface PropertyAnalyticsProps {
  property: Property
}

export function PropertyAnalytics({ property }: PropertyAnalyticsProps) {
  const { ledgerEntries } = useFinancialStore()
  const { language, t } = useLanguageStore()

  // 1. ROI & NOI Calculation (Last 12 Months)
  const financialMetrics = useMemo(() => {
    // Filter entries for this property
    const propEntries = ledgerEntries.filter(
      (e) => e.propertyId === property.id && e.status === 'cleared',
    )

    const totalIncome = propEntries
      .filter((e) => e.type === 'income')
      .reduce((acc, e) => acc + e.amount, 0)

    const totalExpenses = propEntries
      .filter((e) => e.type === 'expense')
      .reduce((acc, e) => acc + e.amount, 0)

    const noi = totalIncome - totalExpenses

    // Purchase price or estimated value (default to listing price * 100 or mock if missing)
    const propertyValue =
      property.purchasePrice || (property.listingPrice || 2000) * 150
    const roi = propertyValue > 0 ? (noi / propertyValue) * 100 : 0
    const capRate = propertyValue > 0 ? (noi / propertyValue) * 100 : 0

    return { totalIncome, totalExpenses, noi, roi, capRate, propertyValue }
  }, [ledgerEntries, property])

  // 2. Cash Flow Projection (Next 12 Months)
  const projections = useMemo(() => {
    const today = new Date()
    const next12Months = eachMonthOfInterval({
      start: today,
      end: addMonths(today, 11),
    })

    // Simple projection logic based on property type
    const monthlyRent =
      property.profileType === 'long_term'
        ? (property.inventory?.length || 0) > 0 // Mock check for tenant presence or use activeTenant from store if passed
          ? property.listingPrice || 2000
          : property.listingPrice || 2000
        : (property.listingPrice || 100) * 20 // Approx 20 days occupancy for STR

    const fixedMonthlyExpense =
      (property.fixedExpenses?.reduce((acc, e) => acc + e.amount, 0) || 0) +
      (property.hoaValue || 0)

    return next12Months.map((date) => {
      // Add some seasonality variance for STR
      let seasonalFactor = 1
      if (property.profileType === 'short_term') {
        const month = date.getMonth()
        if (month >= 5 && month <= 7) seasonalFactor = 1.2 // Summer high
        if (month === 11) seasonalFactor = 1.3 // December high
      }

      const projectedIncome = monthlyRent * seasonalFactor
      const projectedExpenses = fixedMonthlyExpense + projectedIncome * 0.1 // 10% maintenance/management

      return {
        month: format(date, 'MMM yy'),
        income: projectedIncome,
        expenses: projectedExpenses,
        net: projectedIncome - projectedExpenses,
      }
    })
  }, [property])

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              {t('analytics.noi')}
            </span>
            <span className="text-2xl font-bold">
              {formatCurrency(financialMetrics.noi, language)}
            </span>
            <span className="text-xs text-muted-foreground">
              Last 12 Months
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              {t('analytics.roi')}
            </span>
            <span className="text-2xl font-bold">
              {financialMetrics.roi.toFixed(2)}%
            </span>
            <span className="text-xs text-muted-foreground">
              Annualized Return
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Percent className="h-4 w-4 text-purple-600" />
              {t('analytics.cap_rate')}
            </span>
            <span className="text-2xl font-bold">
              {financialMetrics.capRate.toFixed(2)}%
            </span>
            <span className="text-xs text-muted-foreground">
              Market Capitalization
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-600" />
              {t('analytics.revenue_sqm')}
            </span>
            <span className="text-2xl font-bold">
              {formatCurrency(financialMetrics.totalIncome / 120, language)}
            </span>
            <span className="text-xs text-muted-foreground">
              Est. based on 120m²
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Projections Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.cash_flow_projection')}</CardTitle>
            <CardDescription>
              Projected Income vs. Expenses (12 Months)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  income: {
                    label: t('analytics.projected_income'),
                    color: '#22c55e',
                  },
                  expenses: {
                    label: t('analytics.projected_expenses'),
                    color: '#ef4444',
                  },
                }}
                className="h-full w-full"
              >
                <BarChart data={projections}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar
                    dataKey="income"
                    fill="#22c55e"
                    name={t('analytics.projected_income')}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    fill="#ef4444"
                    name={t('analytics.projected_expenses')}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.net_flow')}</CardTitle>
            <CardDescription>
              Projected Net Operating Income trend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  net: { label: t('analytics.net_flow'), color: '#3b82f6' },
                }}
                className="h-full w-full"
              >
                <LineChart data={projections}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name={t('analytics.net_flow')}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
