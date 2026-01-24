import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AreaChart,
  Area,
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
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  DollarSign,
  Users,
  LineChart as ChartIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const predictionData = [
  { month: 'Jan', revenue: 4000, projected: 4200, occupancy: 80 },
  { month: 'Feb', revenue: 3000, projected: 3500, occupancy: 75 },
  { month: 'Mar', revenue: 5000, projected: 4800, occupancy: 85 },
  { month: 'Apr', revenue: 4500, projected: 5000, occupancy: 82 },
  { month: 'May', revenue: 6000, projected: 6200, occupancy: 90 },
  { month: 'Jun', revenue: 7000, projected: 7500, occupancy: 95 },
  { month: 'Jul', revenue: 8000, projected: 8200, occupancy: 98 },
  { month: 'Aug', revenue: null, projected: 8500, occupancy: 92 }, // Future
  { month: 'Sep', revenue: null, projected: 7800, occupancy: 88 }, // Future
]

const optimizationSuggestions = [
  {
    property: 'Oceanview Villa',
    currentPrice: 500,
    suggestedPrice: 550,
    reason: 'High demand in area',
    impact: '+10% Revenue',
  },
  {
    property: 'Downtown Condo',
    currentPrice: 200,
    suggestedPrice: 180,
    reason: 'Lower occupancy forecast',
    impact: '+15% Occupancy',
  },
]

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('6m')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Advanced Analytics
          </h1>
          <p className="text-muted-foreground">
            Predictive insights and performance optimization.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" /> Projected Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,500</div>
            <p className="text-xs text-muted-foreground">+12% vs last period</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" /> Forecasted Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              High season approaching
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" /> RevPAR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$185</div>
            <p className="text-xs text-muted-foreground">
              Revenue per available room
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Forecast</CardTitle>
            <CardDescription>Actual vs Projected Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  revenue: { label: 'Actual', color: '#2563eb' },
                  projected: { label: 'Projected', color: '#9333ea' },
                }}
                className="h-full w-full"
              >
                <AreaChart data={predictionData}>
                  <defs>
                    <linearGradient
                      id="fillRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="fillProjected"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend content={<ChartLegendContent />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    fillOpacity={1}
                    fill="url(#fillRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="projected"
                    stroke="#9333ea"
                    strokeDasharray="5 5"
                    fillOpacity={1}
                    fill="url(#fillProjected)"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price Optimization</CardTitle>
            <CardDescription>AI-driven pricing suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimizationSuggestions.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-semibold">{item.property}</p>
                    <div className="flex gap-2 text-sm mt-1">
                      <span className="text-muted-foreground line-through">
                        ${item.currentPrice}
                      </span>
                      <span className="font-bold text-green-600">
                        ${item.suggestedPrice}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      {item.impact}
                    </Badge>
                    <Button size="sm" className="mt-2 w-full">
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
