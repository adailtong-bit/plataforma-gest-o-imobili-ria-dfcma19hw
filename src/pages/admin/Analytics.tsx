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
} from 'recharts'
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
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
import { Download } from 'lucide-react'
import { DataMask } from '@/components/DataMask'

// Mock Data for Comparative Analysis
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
]

export default function Analytics() {
  const { t } = useLanguageStore()
  const [houseModel, setHouseModel] = useState('All')

  const uniqueModels = Array.from(
    new Set(comparativeDataRaw.map((d) => d.model)),
  )

  const filteredData = useMemo(() => {
    let data = comparativeDataRaw
    if (houseModel !== 'All') {
      data = data.filter((d) => d.model === houseModel)
    }
    // Aggregate if 'All' is selected
    if (houseModel === 'All') {
      const months = Array.from(new Set(data.map((d) => d.month)))
      return months.map((m) => {
        const monthData = data.filter((d) => d.month === m)
        const count = monthData.length
        return {
          model: 'All',
          month: m,
          internalOcc:
            monthData.reduce((sum, curr) => sum + curr.internalOcc, 0) / count,
          marketOcc:
            monthData.reduce((sum, curr) => sum + curr.marketOcc, 0) / count,
          internalADR:
            monthData.reduce((sum, curr) => sum + curr.internalADR, 0) / count,
          marketADR:
            monthData.reduce((sum, curr) => sum + curr.marketADR, 0) / count,
          internalProfit:
            monthData.reduce((sum, curr) => sum + curr.internalProfit, 0) /
            count,
          marketProfit:
            monthData.reduce((sum, curr) => sum + curr.marketProfit, 0) / count,
        }
      })
    }
    return data
  }, [houseModel])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('analytics.benchmark_title')}
          </h1>
          <p className="text-muted-foreground">
            {t('analytics.benchmark_desc')}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={houseModel} onValueChange={setHouseModel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('analytics.house_model')} />
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
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> {t('common.export_data')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              {t('analytics.internal_perf')} (Avg Occ)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              <DataMask>
                {Math.round(
                  filteredData.reduce(
                    (acc, curr) => acc + curr.internalOcc,
                    0,
                  ) / filteredData.length,
                )}
                %
              </DataMask>
            </div>
            <p className="text-xs text-blue-600 font-medium mt-1">
              vs{' '}
              <DataMask>
                {Math.round(
                  filteredData.reduce((acc, curr) => acc + curr.marketOcc, 0) /
                    filteredData.length,
                )}
                % {t('analytics.market_avg')}
              </DataMask>
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              {t('analytics.internal_perf')} (Avg Profit)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              <DataMask>
                $
                {Math.round(
                  filteredData.reduce(
                    (acc, curr) => acc + curr.internalProfit,
                    0,
                  ) / filteredData.length,
                ).toLocaleString()}
              </DataMask>
            </div>
            <p className="text-xs text-green-600 font-medium mt-1">
              <DataMask>
                vs $
                {Math.round(
                  filteredData.reduce(
                    (acc, curr) => acc + curr.marketProfit,
                    0,
                  ) / filteredData.length,
                ).toLocaleString()}{' '}
                {t('analytics.market_avg')}
              </DataMask>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.occupancy')}</CardTitle>
            <CardDescription>
              {t('analytics.internal_perf')} vs {t('analytics.market_avg')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <DataMask className="w-full h-full block">
                <ChartContainer
                  config={{
                    internalOcc: {
                      label: t('analytics.internal_perf'),
                      color: '#2563eb',
                    },
                    marketOcc: {
                      label: t('analytics.market_avg'),
                      color: '#9ca3af',
                    },
                  }}
                  className="h-full w-full"
                >
                  <BarChart
                    data={filteredData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis unit="%" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="internalOcc"
                      fill="#2563eb"
                      name={t('analytics.internal_perf')}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="marketOcc"
                      fill="#9ca3af"
                      name={t('analytics.market_avg')}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </DataMask>
            </div>
          </CardContent>
        </Card>

        {/* Profitability Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.profitability_title')}</CardTitle>
            <CardDescription>
              {t('analytics.profitability_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <DataMask className="w-full h-full block">
                <ChartContainer
                  config={{
                    internalProfit: {
                      label: t('analytics.profit_internal'),
                      color: '#16a34a',
                    },
                    marketProfit: {
                      label: t('analytics.profit_market'),
                      color: '#9ca3af',
                    },
                  }}
                  className="h-full w-full"
                >
                  <BarChart
                    data={filteredData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis unit="$" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="internalProfit"
                      fill="#16a34a"
                      name={t('analytics.profit_internal')}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="marketProfit"
                      fill="#9ca3af"
                      name={t('analytics.profit_market')}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </DataMask>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
