import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import useLanguageStore from '@/stores/useLanguageStore'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { marketAnalysisData } from '@/lib/mockData'

export default function Analytics() {
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('common.advanced_analytics')}
        </h1>
        <p className="text-muted-foreground">
          Deep dive into performance metrics.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle>Market Trends & Occupancy</CardTitle>
          <CardDescription>
            Monthly view of average rates and occupancy metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ChartContainer
              config={{
                rate: { label: 'Avg Rate ($)', color: '#3b82f6' },
                occupancy: { label: 'Occupancy (%)', color: '#10b981' },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketAnalysisData.marketTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="rate"
                    fill="#3b82f6"
                    name="Avg Rate"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="occupancy"
                    fill="#10b981"
                    name="Occupancy"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
