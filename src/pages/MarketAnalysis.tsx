import { useState } from 'react'
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
  LineChart,
  Line,
  Legend,
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

export default function MarketAnalysis() {
  const { toast } = useToast()
  const { properties } = usePropertyStore()

  // State for Filters
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

  // Determine Sample Size Mock
  const sampleSize =
    filterBedrooms !== 'all' ? 45 : filterRegion !== 'all' ? 120 : 350

  // Mock Trend Data generator based on Timeframe
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
        adr: 180 + i * 5, // Average Daily Rate (STR)
        monthlyRent: 2200 + i * 20, // Monthly Rent (LTR)
      }
    })
  }

  const monthsToShow =
    filterTimeframe === '6m' ? 6 : filterTimeframe === '1y' ? 12 : 24
  const priceTrendData = generateTrendData(monthsToShow)

  const handleExportPDF = () => {
    const link = document.createElement('a')
    link.href = '#'
    link.setAttribute('download', 'market_analysis_report.pdf')
    document.body.appendChild(link)
    document.body.removeChild(link)

    toast({
      title: 'Exportando Relatório',
      description: 'O relatório de mercado (PDF) foi gerado e baixado.',
    })
  }

  const handleCompare = () => {
    toast({
      title: 'Dados Atualizados',
      description: `Comparativo atualizado. Amostra: ${sampleSize} imóveis.`,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Análise de Mercado Comparativa (CMA)
          </h1>
          <p className="text-muted-foreground">
            Inteligência de mercado e dados comparativos de Airbnb, Zillow e
            Realtor.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Parâmetros de Comparação</CardTitle>
          <CardDescription>
            Selecione uma propriedade base e filtros para ajustar a amostra de
            mercado.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="grid gap-2">
            <Label>Propriedade Base</Label>
            <Select
              value={selectedPropertyId}
              onValueChange={setSelectedPropertyId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Geral (Sem Vínculo)</SelectItem>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Região</Label>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Orlando">Orlando, FL</SelectItem>
                <SelectItem value="Miami">Miami, FL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Quartos</Label>
            <Select value={filterBedrooms} onValueChange={setFilterBedrooms}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="1">1 Quarto</SelectItem>
                <SelectItem value="2">2 Quartos</SelectItem>
                <SelectItem value="3">3 Quartos</SelectItem>
                <SelectItem value="4+">4+ Quartos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Banheiros</Label>
            <Select value={filterBathrooms} onValueChange={setFilterBathrooms}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="1">1 Banheiro</SelectItem>
                <SelectItem value="2">2 Banheiros</SelectItem>
                <SelectItem value="3+">3+ Banheiros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCompare} className="bg-trust-blue">
            <Search className="mr-2 h-4 w-4" /> Analisar
          </Button>
        </CardContent>
      </Card>

      {/* External Data Sources Summary */}
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
                  <CardTitle className="text-xl">{data.region}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Info className="h-3 w-3" /> Baseado em uma amostra de{' '}
                    {sampleSize} imóveis comparáveis.
                  </CardDescription>
                </div>
                {data.trend === 'up' && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <TrendingUp className="h-3 w-3 mr-1" /> Alta Demanda
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Preço Médio Venda
                  </span>
                  <div className="text-2xl font-bold">
                    ${data.averagePrice.toLocaleString()}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Preço/SqFt
                  </span>
                  <div className="text-2xl font-bold">${data.pricePerSqFt}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Diária Média (STR)
                  </span>
                  <div className="text-xl font-semibold text-green-600">
                    ${data.shortTermRate}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Aluguel Mensal (LTR)
                  </span>
                  <div className="text-xl font-semibold text-blue-600">
                    ${data.longTermRate}
                  </div>
                </div>
              </div>

              {/* Occupancy Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ocupação Média</span>
                  <span className="font-bold">{data.occupancyRate}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-trust-blue"
                    style={{ width: `${data.occupancyRate}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Historical Charts with Timeframe */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <CardTitle>Histórico de Tendências de Mercado</CardTitle>
                <CardDescription>
                  Análise de Preço, ADR, Aluguel Mensal, Ocupação e Saturação.
                </CardDescription>
              </div>
              <div className="flex items-center border rounded-md overflow-hidden">
                <button
                  onClick={() => setFilterTimeframe('6m')}
                  className={`px-3 py-1 text-sm ${filterTimeframe === '6m' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  6 Meses
                </button>
                <button
                  onClick={() => setFilterTimeframe('1y')}
                  className={`px-3 py-1 text-sm border-l border-r ${filterTimeframe === '1y' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  1 Ano
                </button>
                <button
                  onClick={() => setFilterTimeframe('2y')}
                  className={`px-3 py-1 text-sm ${filterTimeframe === '2y' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  2 Anos
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ChartContainer
                config={{
                  avgPrice: { label: 'Preço Médio ($)', color: '#2563eb' },
                  adr: { label: 'Diária Média (ADR)', color: '#9333ea' },
                  monthlyRent: { label: 'Aluguel (LTR)', color: '#0ea5e9' },
                  occupancy: { label: 'Ocupação (%)', color: '#16a34a' },
                  saturation: { label: 'Saturação', color: '#f97316' },
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
                    name="Preço Médio ($)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="adr"
                    stroke="#9333ea"
                    strokeWidth={2}
                    dot={false}
                    name="ADR ($)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="monthlyRent"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                    name="Aluguel ($)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#16a34a"
                    strokeWidth={2}
                    name="Ocupação (%)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="saturation"
                    stroke="#f97316"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    name="Saturação"
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
