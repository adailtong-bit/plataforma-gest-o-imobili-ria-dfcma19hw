import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  LineChart,
  Line,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Download, Search, Info } from 'lucide-react'
import { marketData } from '@/lib/mockData'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'
import usePropertyStore from '@/stores/usePropertyStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { formatCurrency } from '@/lib/utils'
import { DataMask } from '@/components/DataMask'

export default function MarketAnalysis() {
  const { toast } = useToast()
  const { properties } = usePropertyStore()
  const { t, language } = useLanguageStore()

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all')
  const [filterRegion, setFilterRegion] = useState('all')
  const [filterBedrooms, setFilterBedrooms] = useState('all')
  const [filterBathrooms, setFilterBathrooms] = useState('all')
  const [filterTimeframe, setFilterTimeframe] = useState<'6m' | '1y' | '2y'>(
    '1y',
  )

  const filteredData = marketData.filter((d) => {
    if (filterRegion !== 'all' && !d.region.includes(filterRegion)) return false
    return true
  })

  const sampleSize =
    filterBedrooms !== 'all' ? 45 : filterRegion !== 'all' ? 120 : 350

  const generateTrendData = (months: number) => {
    return Array.from({ length: months }).map((_, i) => {
      const monthLabel = `M-${months - i}`
      const basePrice = 340000 + i * 1000
      return {
        month: monthLabel,
        avgPrice: basePrice,
        occupancy: 70 + Math.random() * 20,
        competitors: 100 + i * 2,
        saturation: 50 + i,
        adr: 180 + i * 5,
        monthlyRent: 2200 + i * 20,
      }
    })
  }

  const monthsToShow =
    filterTimeframe === '6m' ? 6 : filterTimeframe === '1y' ? 12 : 24
  const priceTrendData = generateTrendData(monthsToShow)

  const handleExportPDF = () => {
    toast({
      title: 'Exporting Report',
      description:
        'The market analysis report (PDF) has been generated and downloaded.',
    })
  }

  const handleCompare = () => {
    toast({
      title: 'Data Updated',
      description: `Comparison updated. Sample: ${sampleSize} properties.`,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('market.title')}
          </h1>
          <p className="text-muted-foreground">{t('market.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" /> {t('market.export_pdf')}
          </Button>
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">
            {t('market.comparison_params')}
          </CardTitle>
          <CardDescription>{t('market.comparison_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="grid gap-2">
            <Label>{t('market.base_property')}</Label>
            <Select
              value={selectedPropertyId}
              onValueChange={setSelectedPropertyId}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('market.select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('market.general')}</SelectItem>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <DataMask>{p.name}</DataMask>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>{t('market.region')}</Label>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger>
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="Orlando">Orlando, FL</SelectItem>
                <SelectItem value="Miami">Miami, FL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>{t('market.bedrooms')}</Label>
            <Select value={filterBedrooms} onValueChange={setFilterBedrooms}>
              <SelectTrigger>
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="1">1 {t('market.bedrooms')}</SelectItem>
                <SelectItem value="2">2 {t('market.bedrooms')}</SelectItem>
                <SelectItem value="3">3 {t('market.bedrooms')}</SelectItem>
                <SelectItem value="4+">4+ {t('market.bedrooms')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>{t('market.bathrooms')}</Label>
            <Select value={filterBathrooms} onValueChange={setFilterBathrooms}>
              <SelectTrigger>
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="1">1 {t('market.bathrooms')}</SelectItem>
                <SelectItem value="2">2 {t('market.bathrooms')}</SelectItem>
                <SelectItem value="3+">3+ {t('market.bathrooms')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCompare} className="bg-trust-blue">
            <Search className="mr-2 h-4 w-4" /> {t('market.analyze')}
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-4 overflow-x-auto pb-2">
        <Badge variant="outline" className="px-3 py-1 bg-white border-blue-200">
          <img
            src="https://img.usecurling.com/i?q=airbnb&color=red"
            className="w-4 h-4 mr-2"
            alt="Airbnb"
          />
          Airbnb Data Connected
        </Badge>
        <Badge variant="outline" className="px-3 py-1 bg-white border-blue-200">
          <img
            src="https://img.usecurling.com/i?q=zillow&color=blue"
            className="w-4 h-4 mr-2"
            alt="Zillow"
          />
          Zillow Data Connected
        </Badge>
        <Badge variant="outline" className="px-3 py-1 bg-white border-blue-200">
          <img
            src="https://img.usecurling.com/i?q=house&color=black"
            className="w-4 h-4 mr-2"
            alt="Realtor"
          />
          Realtor Data Connected
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredData.map((data, idx) => (
          <Card key={idx} className="border-t-4 border-t-trust-blue">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    <DataMask>{data.region}</DataMask>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Info className="h-3 w-3" /> Based on a sample of{' '}
                    <DataMask>{sampleSize}</DataMask> comparable properties.
                  </CardDescription>
                </div>
                {data.trend === 'up' && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <TrendingUp className="h-3 w-3 mr-1" /> High Demand
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {t('market.avg_sale_price')}
                  </span>
                  <div className="text-2xl font-bold">
                    <DataMask>
                      {formatCurrency(data.averagePrice, language)}
                    </DataMask>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {t('market.price_sqft')}
                  </span>
                  <div className="text-2xl font-bold">
                    <DataMask>
                      {formatCurrency(data.pricePerSqFt, language)}
                    </DataMask>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {t('market.avg_daily_rate')}
                  </span>
                  <div className="text-xl font-semibold text-green-600">
                    <DataMask>
                      {formatCurrency(data.shortTermRate, language)}
                    </DataMask>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {t('market.monthly_rent')}
                  </span>
                  <div className="text-xl font-semibold text-blue-600">
                    <DataMask>
                      {formatCurrency(data.longTermRate, language)}
                    </DataMask>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('market.avg_occupancy')}</span>
                  <span className="font-bold">
                    <DataMask>{data.occupancyRate}%</DataMask>
                  </span>
                </div>
                <DataMask className="w-full h-2 block rounded-full bg-secondary">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-trust-blue"
                      style={{ width: `${data.occupancyRate}%` }}
                    />
                  </div>
                </DataMask>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <CardTitle>{t('market.historical_trends')}</CardTitle>
                <CardDescription>{t('market.trends_desc')}</CardDescription>
              </div>
              <div className="flex items-center border rounded-md overflow-hidden">
                <button
                  onClick={() => setFilterTimeframe('6m')}
                  className={`px-3 py-1 text-sm ${filterTimeframe === '6m' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  6 Months
                </button>
                <button
                  onClick={() => setFilterTimeframe('1y')}
                  className={`px-3 py-1 text-sm border-l border-r ${filterTimeframe === '1y' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  1 Year
                </button>
                <button
                  onClick={() => setFilterTimeframe('2y')}
                  className={`px-3 py-1 text-sm ${filterTimeframe === '2y' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  2 Years
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <DataMask className="w-full h-full block">
                <ChartContainer
                  config={{
                    avgPrice: {
                      label: t('market.avg_sale_price'),
                      color: '#2563eb',
                    },
                    adr: {
                      label: t('market.avg_daily_rate'),
                      color: '#9333ea',
                    },
                    monthlyRent: {
                      label: t('market.monthly_rent'),
                      color: '#0ea5e9',
                    },
                    occupancy: {
                      label: t('market.avg_occupancy'),
                      color: '#16a34a',
                    },
                    saturation: { label: 'Saturation', color: '#f97316' },
                  }}
                  className="h-full w-full"
                >
                  <LineChart data={priceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend content={<ChartLegendContent />} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="avgPrice"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name={t('market.avg_sale_price')}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="adr"
                      stroke="#9333ea"
                      strokeWidth={2}
                      dot={false}
                      name={t('market.avg_daily_rate')}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="monthlyRent"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={false}
                      name={t('market.monthly_rent')}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="occupancy"
                      stroke="#16a34a"
                      strokeWidth={2}
                      name={t('market.avg_occupancy')}
                    />
                  </LineChart>
                </ChartContainer>
              </DataMask>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
