import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { marketAnalysisData } from '@/lib/mockData'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react'

export default function MarketAnalysis() {
  const chartConfig = {
    occupancy: {
      label: 'Occupancy (%)',
      color: 'hsl(var(--chart-1))',
    },
    rate: {
      label: 'Avg Rate ($)',
      color: 'hsl(var(--chart-2))',
    },
  }

  // Fallback safe data access
  const trendsData = marketAnalysisData?.marketTrends || []
  const competitorsData = marketAnalysisData?.competitors || []
  const forecastData = marketAnalysisData?.demandForecast || []

  // Ensure data has necessary keys to prevent crashes
  const safeTrendsData = trendsData.map((d) => ({
    month: d?.month || 'N/A',
    occupancy: d?.occupancy || 0,
    rate: d?.rate || 0,
  }))

  const safeCompetitorsData = competitorsData.map((d) => ({
    name: d?.name || 'Unknown',
    rate: d?.rate || 0,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Market Analysis
        </h1>
        <p className="text-slate-700 font-medium">
          Insights into market trends, competitor analysis, and demand
          forecasts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Market Occupancy
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$142.50</div>
            <p className="text-xs text-muted-foreground">+12% from last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demand Index</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">High</div>
            <p className="text-xs text-muted-foreground">
              Peak season approaching
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comp Set Rank</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#2</div>
            <p className="text-xs text-muted-foreground">
              Out of 12 local hotels
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Occupancy & Rate Trends</CardTitle>
            <CardDescription>
              6-month historical view of market performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="min-h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={safeTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="hsl(var(--chart-1))"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="hsl(var(--chart-2))"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="occupancy"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name="Occupancy (%)"
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name="Rate ($)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Competitor Pricing</CardTitle>
            <CardDescription>Average daily rate comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="min-h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safeCompetitorsData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="rate"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    name="Avg Rate ($)"
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demand Forecast</CardTitle>
          <CardDescription>
            Projected demand levels for upcoming dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {forecastData &&
            Array.isArray(forecastData) &&
            forecastData.length > 0 ? (
              forecastData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center p-4 border rounded-lg min-w-[120px]"
                >
                  <span className="text-sm font-medium text-slate-500">
                    {new Date(item.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span
                    className={`text-lg font-bold mt-1 ${
                      item.demand === 'High'
                        ? 'text-green-600'
                        : item.demand === 'Medium'
                          ? 'text-yellow-600'
                          : 'text-slate-600'
                    }`}
                  >
                    {item.demand}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center w-full p-6 text-muted-foreground text-sm">
                No forecast data available at the moment.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
