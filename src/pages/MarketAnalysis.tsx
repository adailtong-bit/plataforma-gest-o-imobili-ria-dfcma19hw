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
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Download, Search } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function MarketAnalysis() {
  const { toast } = useToast()
  const [filterRegion, setFilterRegion] = useState('all')
  const [compareMode, setCompareMode] = useState(false)

  // Comparison State
  const [compCity, setCompCity] = useState('')
  const [compSize, setCompSize] = useState('3bd')

  const filteredData = marketData.filter((d) => {
    if (filterRegion !== 'all' && !d.region.includes(filterRegion)) return false
    return true
  })

  // Mock trend data for charts
  const priceTrendData = [
    { month: 'Jan', avgPrice: 340000, competitors: 110 },
    { month: 'Feb', avgPrice: 342000, competitors: 112 },
    { month: 'Mar', avgPrice: 345000, competitors: 115 },
    { month: 'Apr', avgPrice: 348000, competitors: 118 },
    { month: 'May', avgPrice: 350000, competitors: 120 },
    { month: 'Jun', avgPrice: 355000, competitors: 125 },
  ]

  const handleExportPDF = () => {
    toast({
      title: 'Exportando Relatório',
      description: 'O relatório de mercado (PDF) está sendo gerado.',
    })
  }

  const handleCompare = () => {
    toast({
      title: 'Comparativo Gerado',
      description: `Comparando dados de ${compCity} para ${compSize}.`,
    })
    setCompareMode(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Análise de Mercado
          </h1>
          <p className="text-muted-foreground">
            Inteligência de mercado e dados comparativos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" /> PDF Report
          </Button>
        </div>
      </div>

      {/* Comparison Tool */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Ferramenta de Comparação</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div className="grid gap-2 w-full md:w-64">
            <Label>Região/Cidade</Label>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione Região" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Orlando">Orlando, FL</SelectItem>
                <SelectItem value="Miami">Miami, FL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 w-full md:w-48">
            <Label>Tamanho Imóvel</Label>
            <Select value={compSize} onValueChange={setCompSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2bd">2 Quartos</SelectItem>
                <SelectItem value="3bd">3 Quartos</SelectItem>
                <SelectItem value="4bd">4+ Quartos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCompare} className="bg-trust-blue">
            <Search className="mr-2 h-4 w-4" /> Comparar
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredData.map((data, idx) => (
          <Card key={idx} className="border-t-4 border-t-trust-blue">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex justify-between items-center">
                {data.region}
                {data.trend === 'up' && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <TrendingUp className="h-3 w-3 mr-1" /> Alta Demanda
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Dados consolidados do mercado</CardDescription>
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

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Índice de Saturação</span>
                  <span className="font-bold">{data.saturationIndex}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500"
                    style={{ width: `${data.saturationIndex}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-sm pt-2 border-t">
                <span className="text-muted-foreground">
                  Dias no Mercado: {data.averageDaysOnMarket}
                </span>
                <span className="text-muted-foreground">
                  Concorrentes: {data.competitorCount}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Preços</CardTitle>
            <CardDescription>Variação nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                avgPrice: { label: 'Preço Médio', color: '#2563eb' },
              }}
              className="h-[300px] w-full"
            >
              <LineChart data={priceTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="avgPrice"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crescimento da Concorrência</CardTitle>
            <CardDescription>Novas propriedades no mercado</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                competitors: { label: 'Novos Listings', color: '#dc2626' },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={priceTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="competitors"
                  fill="#dc2626"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
