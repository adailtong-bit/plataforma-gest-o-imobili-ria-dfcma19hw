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

// Mock Data for Comparative Analysis
const comparativeDataRaw = [
  {
    model: '2 Bed Condo',
    month: 'Jan',
    internalOcc: 85,
    marketOcc: 80,
    internalADR: 180,
    marketADR: 170,
  },
  {
    model: '2 Bed Condo',
    month: 'Feb',
    internalOcc: 82,
    marketOcc: 78,
    internalADR: 185,
    marketADR: 175,
  },
  {
    model: '2 Bed Condo',
    month: 'Mar',
    internalOcc: 88,
    marketOcc: 82,
    internalADR: 190,
    marketADR: 180,
  },
  {
    model: '3 Bed Villa',
    month: 'Jan',
    internalOcc: 75,
    marketOcc: 70,
    internalADR: 350,
    marketADR: 340,
  },
  {
    model: '3 Bed Villa',
    month: 'Feb',
    internalOcc: 78,
    marketOcc: 72,
    internalADR: 360,
    marketADR: 345,
  },
  {
    model: '3 Bed Villa',
    month: 'Mar',
    internalOcc: 80,
    marketOcc: 75,
    internalADR: 370,
    marketADR: 350,
  },
  {
    model: '4 Bed House',
    month: 'Jan',
    internalOcc: 90,
    marketOcc: 85,
    internalADR: 450,
    marketADR: 420,
  },
  {
    model: '4 Bed House',
    month: 'Feb',
    internalOcc: 92,
    marketOcc: 88,
    internalADR: 460,
    marketADR: 430,
  },
  {
    model: '4 Bed House',
    month: 'Mar',
    internalOcc: 95,
    marketOcc: 90,
    internalADR: 470,
    marketADR: 440,
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
            {t('analytics.benchmark_title') ||
              'Comparative Performance Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {t('analytics.benchmark_desc') ||
              'Compare internal performance against market benchmarks.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={houseModel} onValueChange={setHouseModel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder={t('analytics.house_model') || 'House Model'}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">
                {t('common.all') || 'All Models'}
              </SelectItem>
              {uniqueModels.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">{t('common.export_data')}</Button>
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
              {Math.round(
                filteredData.reduce((acc, curr) => acc + curr.internalOcc, 0) /
                  filteredData.length,
              )}
              %
            </div>
            <p className="text-xs text-blue-600 font-medium mt-1">
              vs{' '}
              {Math.round(
                filteredData.reduce((acc, curr) => acc + curr.marketOcc, 0) /
                  filteredData.length,
              )}
              % Market
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              {t('analytics.internal_perf')} (Avg ADR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              $
              {Math.round(
                filteredData.reduce((acc, curr) => acc + curr.internalADR, 0) /
                  filteredData.length,
              )}
            </div>
            <p className="text-xs text-green-600 font-medium mt-1">
              vs $
              {Math.round(
                filteredData.reduce((acc, curr) => acc + curr.marketADR, 0) /
                  filteredData.length,
              )}{' '}
              Market
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
            </div>
          </CardContent>
        </Card>

        {/* ADR Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.adr')}</CardTitle>
            <CardDescription>Average Daily Rate Comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  internalADR: {
                    label: t('analytics.internal_perf'),
                    color: '#16a34a',
                  },
                  marketADR: {
                    label: t('analytics.market_avg'),
                    color: '#9ca3af',
                  },
                }}
                className="h-full w-full"
              >
                <LineChart
                  data={filteredData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis unit="$" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="internalADR"
                    stroke="#16a34a"
                    strokeWidth={3}
                    name={t('analytics.internal_perf')}
                  />
                  <Line
                    type="monotone"
                    dataKey="marketADR"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name={t('analytics.market_avg')}
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
