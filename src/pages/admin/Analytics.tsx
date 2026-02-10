import { useState, useMemo } from 'react'
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
  ResponsiveContainer,
} from 'recharts'
import {
  ChartContainer,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import useLanguageStore from '@/stores/useLanguageStore'
import { Download, Eye, EyeOff } from 'lucide-react'
import { DataMask } from '@/components/DataMask'
import { formatCurrency } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

// Enhanced Mock Data including Revenue and Margin calculation base
const comparativeDataRaw = [
  {
    model: '2 Bed Condo',
    month: 'Jan',
    internalOcc: 85,
    marketOcc: 80,
    internalADR: 180,
    marketADR: 170,
    internalProfit: 2500,
    marketProfit: 2200,
  },
  {
    model: '2 Bed Condo',
    month: 'Feb',
    internalOcc: 82,
    marketOcc: 78,
    internalADR: 185,
    marketADR: 175,
    internalProfit: 2400,
    marketProfit: 2150,
  },
  {
    model: '2 Bed Condo',
    month: 'Mar',
    internalOcc: 88,
    marketOcc: 82,
    internalADR: 190,
    marketADR: 180,
    internalProfit: 2800,
    marketProfit: 2400,
  },
  {
    model: '3 Bed Villa',
    month: 'Jan',
    internalOcc: 75,
    marketOcc: 70,
    internalADR: 350,
    marketADR: 340,
    internalProfit: 4500,
    marketProfit: 4100,
  },
  {
    model: '3 Bed Villa',
    month: 'Feb',
    internalOcc: 78,
    marketOcc: 72,
    internalADR: 360,
    marketADR: 345,
    internalProfit: 4700,
    marketProfit: 4200,
  },
  {
    model: '3 Bed Villa',
    month: 'Mar',
    internalOcc: 80,
    marketOcc: 75,
    internalADR: 370,
    marketADR: 350,
    internalProfit: 4900,
    marketProfit: 4400,
  },
  {
    model: '4 Bed House',
    month: 'Jan',
    internalOcc: 90,
    marketOcc: 85,
    internalADR: 450,
    marketADR: 420,
    internalProfit: 6500,
    marketProfit: 5800,
  },
  {
    model: '4 Bed House',
    month: 'Feb',
    internalOcc: 92,
    marketOcc: 88,
    internalADR: 460,
    marketADR: 430,
    internalProfit: 6700,
    marketProfit: 6000,
  },
  {
    model: '4 Bed House',
    month: 'Mar',
    internalOcc: 89,
    marketOcc: 86,
    internalADR: 470,
    marketADR: 440,
    internalProfit: 6600,
    marketProfit: 5900,
  },
]

export default function Analytics() {
  const { t, language } = useLanguageStore()
  const [houseModel, setHouseModel] = useState('All')
  const [privacyMode, setPrivacyMode] = useState(false)

  const uniqueModels = Array.from(
    new Set(comparativeDataRaw.map((d) => d.model)),
  )

  const filteredData = useMemo(() => {
    let data = comparativeDataRaw
    if (houseModel !== 'All') {
      data = data.filter((d) => d.model === houseModel)
    }

    // Process data to aggregate by month and add Revenue/Margin calculations
    const months = Array.from(new Set(data.map((d) => d.month)))
    return months.map((m) => {
      const monthData = data.filter((d) => d.month === m)
      const count = monthData.length

      const avgInternalOcc =
        monthData.reduce((sum, curr) => sum + curr.internalOcc, 0) / count
      const avgMarketOcc =
        monthData.reduce((sum, curr) => sum + curr.marketOcc, 0) / count
      const avgInternalADR =
        monthData.reduce((sum, curr) => sum + curr.internalADR, 0) / count
      const avgMarketADR =
        monthData.reduce((sum, curr) => sum + curr.marketADR, 0) / count

      // Calculate Revenue: ADR * Occupancy% * 30 days
      const internalRevenue = avgInternalADR * (avgInternalOcc / 100) * 30
      const marketRevenue = avgMarketADR * (avgMarketOcc / 100) * 30

      const avgInternalProfit =
        monthData.reduce((sum, curr) => sum + curr.internalProfit, 0) / count
      const avgMarketProfit =
        monthData.reduce((sum, curr) => sum + curr.marketProfit, 0) / count

      return {
        month: m,
        internalOcc: Math.round(avgInternalOcc),
        marketOcc: Math.round(avgMarketOcc),
        internalADR: avgInternalADR,
        marketADR: avgMarketADR,
        internalRevenue: internalRevenue,
        marketRevenue: marketRevenue,
        internalProfit: avgInternalProfit,
        marketProfit: avgMarketProfit,
      }
    })
  }, [houseModel])

  // KPI Calculations (Averages across the visible period)
  const kpis = useMemo(() => {
    const count = filteredData.length
    if (count === 0)
      return {
        occ: 0,
        adr: 0,
        revenue: 0,
        profit: 0,
        mktOcc: 0,
        mktAdr: 0,
        mktRevenue: 0,
        mktProfit: 0,
      }

    return {
      occ:
        filteredData.reduce((acc, curr) => acc + curr.internalOcc, 0) / count,
      adr:
        filteredData.reduce((acc, curr) => acc + curr.internalADR, 0) / count,
      revenue:
        filteredData.reduce((acc, curr) => acc + curr.internalRevenue, 0) /
        count,
      profit:
        filteredData.reduce((acc, curr) => acc + curr.internalProfit, 0) /
        count,

      mktOcc:
        filteredData.reduce((acc, curr) => acc + curr.marketOcc, 0) / count,
      mktAdr:
        filteredData.reduce((acc, curr) => acc + curr.marketADR, 0) / count,
      mktRevenue:
        filteredData.reduce((acc, curr) => acc + curr.marketRevenue, 0) / count,
      mktProfit:
        filteredData.reduce((acc, curr) => acc + curr.marketProfit, 0) / count,
    }
  }, [filteredData])

  const chartConfig: ChartConfig = {
    internalOcc: {
      label: t('common.analytics.internal_perf'),
      color: 'hsl(var(--chart-1))',
    },
    marketOcc: {
      label: t('common.analytics.market_avg'),
      color: 'hsl(var(--chart-2))',
    },
    internalProfit: {
      label: t('common.profit'),
      color: 'hsl(var(--chart-3))',
    },
    internalRevenue: {
      label: t('common.revenue'),
      color: 'hsl(var(--chart-4))',
    },
  }

  return (
    <div className="flex flex-col gap-8 pb-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('common.analytics.benchmark_title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('common.analytics.benchmark_desc')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
          <div className="flex items-center space-x-2 mr-2">
            <Switch
              id="privacy-mode"
              checked={privacyMode}
              onCheckedChange={setPrivacyMode}
            />
            <Label
              htmlFor="privacy-mode"
              className="flex items-center gap-2 cursor-pointer"
            >
              {privacyMode ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                {t('common.analytics.privacy_mode')}
              </span>
            </Label>
          </div>
          <Select value={houseModel} onValueChange={setHouseModel}>
            <SelectTrigger className="w-[200px] shadow-sm">
              <SelectValue placeholder={t('common.analytics.house_model')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t('common.all')}</SelectItem>
              {uniqueModels.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 shadow-sm">
            <Download className="h-4 w-4" /> {t('common.export_data')}
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue KPI */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t('common.revenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              <DataMask blur={privacyMode}>
                {formatCurrency(kpis.revenue, language)}
              </DataMask>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              vs{' '}
              <span className="font-medium text-foreground">
                <DataMask blur={privacyMode}>
                  {formatCurrency(kpis.mktRevenue, language)}
                </DataMask>
              </span>{' '}
              {t('common.analytics.market_avg')}
            </p>
          </CardContent>
        </Card>

        {/* Profit (Net Margin) KPI */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t('common.profit')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <DataMask blur={privacyMode}>
                {formatCurrency(kpis.profit, language)}
              </DataMask>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              vs{' '}
              <span className="font-medium text-foreground">
                <DataMask blur={privacyMode}>
                  {formatCurrency(kpis.mktProfit, language)}
                </DataMask>
              </span>{' '}
              {t('common.analytics.market_avg')}
            </p>
          </CardContent>
        </Card>

        {/* Occupancy KPI */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t('common.analytics.occupancy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              <DataMask blur={privacyMode}>{Math.round(kpis.occ)}%</DataMask>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              vs{' '}
              <span className="font-medium text-foreground">
                <DataMask blur={privacyMode}>
                  {Math.round(kpis.mktOcc)}%
                </DataMask>
              </span>{' '}
              {t('common.analytics.market_avg')}
            </p>
          </CardContent>
        </Card>

        {/* ADR KPI */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t('common.analytics.adr')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              <DataMask blur={privacyMode}>
                {formatCurrency(kpis.adr, language)}
              </DataMask>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              vs{' '}
              <span className="font-medium text-foreground">
                <DataMask blur={privacyMode}>
                  {formatCurrency(kpis.mktAdr, language)}
                </DataMask>
              </span>{' '}
              {t('common.analytics.market_avg')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Profit Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>
              {t('common.revenue')} & {t('common.profit')}
            </CardTitle>
            <CardDescription>
              {t('common.analytics.internal_perf')} vs{' '}
              {t('common.analytics.market_avg')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        formatCurrency(value, language).split(/[\s,.]/)[0]
                      }
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm min-w-[150px]">
                              <div className="flex flex-col gap-2">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {label}
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      {t('common.revenue')}
                                    </span>
                                    <span className="font-bold text-foreground">
                                      <DataMask blur={privacyMode}>
                                        {formatCurrency(
                                          Number(payload[0].value),
                                          language,
                                        )}
                                      </DataMask>
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      {t('common.profit')}
                                    </span>
                                    <span className="font-bold text-foreground">
                                      <DataMask blur={privacyMode}>
                                        {formatCurrency(
                                          Number(payload[1].value),
                                          language,
                                        )}
                                      </DataMask>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="internalRevenue"
                      fill="var(--color-internalRevenue)"
                      name={t('common.revenue')}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="internalProfit"
                      fill="var(--color-internalProfit)"
                      name={t('common.profit')}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Occupancy Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{t('common.analytics.occupancy')}</CardTitle>
            <CardDescription>
              {t('common.analytics.internal_perf')} vs{' '}
              {t('common.analytics.market_avg')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                    />
                    <YAxis
                      unit="%"
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm min-w-[150px]">
                              <div className="flex flex-col gap-2">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {label}
                                </span>
                                <div className="flex flex-col gap-1">
                                  {payload.map((entry: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex justify-between items-center gap-2"
                                    >
                                      <span className="text-xs text-muted-foreground">
                                        {entry.name}:
                                      </span>
                                      <span className="font-bold text-foreground">
                                        <DataMask blur={privacyMode}>
                                          {entry.value}%
                                        </DataMask>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="internalOcc"
                      stroke="var(--color-internalOcc)"
                      strokeWidth={3}
                      name={t('common.analytics.internal_perf')}
                      dot={{ r: 4, fill: 'var(--color-internalOcc)' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="marketOcc"
                      stroke="var(--color-marketOcc)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name={t('common.analytics.market_avg')}
                      dot={{ r: 4, fill: 'var(--color-marketOcc)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
