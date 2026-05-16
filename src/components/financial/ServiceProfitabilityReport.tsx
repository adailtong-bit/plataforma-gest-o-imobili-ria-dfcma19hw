import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import useManagementStore from '@/stores/useManagementStore'
import useFinancialStore from '@/stores/useFinancialStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { formatCurrency } from '@/lib/utils'

export function ServiceProfitabilityReport() {
  const { serviceOrders, guestServices } = useManagementStore()
  const { currency } = useFinancialStore()
  const { t } = useLanguageStore()

  // Aggregate data
  const data = guestServices
    .map((service) => {
      const orders = serviceOrders.filter(
        (o) => o.serviceId === service.id && o.status === 'delivered',
      )
      const revenue = orders.reduce((sum, o) => sum + o.price, 0)
      // Mock cost (e.g. 70% margin)
      const cost = revenue * 0.3
      const profit = revenue - cost

      return {
        name: service.name,
        revenue,
        cost,
        profit,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5) // Top 5

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {t('reports.service_profitability') || 'Rentabilidade de Serviços'}
          </CardTitle>
          <CardDescription>
            {t('reports.top_performing_services') ||
              'Serviços de hóspedes com melhor desempenho'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                revenue: {
                  label: t('common.revenue') || 'Receita',
                  color: '#3b82f6',
                },
                profit: {
                  label: t('common.profit') || 'Lucro',
                  color: '#10b981',
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: number) =>
                      formatCurrency(value, currency)
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name={t('common.revenue') || 'Receita'}
                  />
                  <Bar
                    dataKey="profit"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name={t('common.net_profit') || 'Lucro Líquido'}
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
