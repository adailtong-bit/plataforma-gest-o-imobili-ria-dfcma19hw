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
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, Home } from 'lucide-react'
import { marketData } from '@/lib/mockData'

export default function MarketAnalysis() {
  // Mock trend data for charts
  const priceTrendData = [
    { month: 'Jan', avgPrice: 340000, competitors: 110 },
    { month: 'Feb', avgPrice: 342000, competitors: 112 },
    { month: 'Mar', avgPrice: 345000, competitors: 115 },
    { month: 'Apr', avgPrice: 348000, competitors: 118 },
    { month: 'May', avgPrice: 350000, competitors: 120 },
    { month: 'Jun', avgPrice: 355000, competitors: 125 },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          Análise de Mercado
        </h1>
        <p className="text-muted-foreground">
          Inteligência de mercado e dados comparativos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {marketData.map((data, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                {data.region}
                {data.trend === 'up' && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <TrendingUp className="h-3 w-3 mr-1" /> Alta
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Preço Médio
                </span>
                <span className="font-bold text-lg">
                  ${data.averagePrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Ocupação Média
                </span>
                <span className="font-bold text-lg">{data.occupancyRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Dias no Mercado
                </span>
                <span className="font-bold text-lg">
                  {data.averageDaysOnMarket}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Competidores
                </span>
                <span className="font-bold text-lg">
                  {data.competitorCount}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Preços</CardTitle>
            <CardDescription>Evolução do preço médio na região</CardDescription>
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
            <CardTitle>Competitividade</CardTitle>
            <CardDescription>
              Número de propriedades concorrentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                competitors: { label: 'Competidores', color: '#dc2626' },
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
