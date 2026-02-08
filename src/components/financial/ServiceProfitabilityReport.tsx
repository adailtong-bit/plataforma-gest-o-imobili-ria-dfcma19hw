import { useMemo } from 'react'
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
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useManagementStore from '@/stores/useManagementStore'
import { formatCurrency } from '@/lib/utils'

export function ServiceProfitabilityReport() {
  const { serviceOrders, promotions, guestServices } = useManagementStore()

  // Chart Data: Revenue by Service Category
  const chartData = useMemo(() => {
    const data: Record<string, number> = {}
    serviceOrders.forEach((order) => {
      const service = guestServices.find((s) => s.id === order.serviceId)
      if (service) {
        data[service.category] = (data[service.category] || 0) + order.price
      }
    })
    return Object.entries(data).map(([name, value]) => ({ name, value }))
  }, [serviceOrders, guestServices])

  // Promo Code Usage
  const promoData = useMemo(() => {
    return promotions.map((promo) => ({
      ...promo,
      roi: promo.totalDiscountApplied
        ? (promo.usageCount * 100) / promo.totalDiscountApplied // Simple mock ROI
        : 0,
    }))
  }, [promotions])

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Revenue by Category</CardTitle>
          <CardDescription>
            Breakdown of revenue from additional services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ChartContainer
              config={{
                revenue: { label: 'Revenue', color: '#8884d8' },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(val) => `$${val}`} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="value"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Promotional Code ROI</CardTitle>
          <CardDescription>
            Track the performance of your discount codes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Usage Count</TableHead>
                <TableHead>Total Discount Applied</TableHead>
                <TableHead>Estimated ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoData.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-mono font-bold">
                    {promo.code}
                  </TableCell>
                  <TableCell>{promo.usageCount}</TableCell>
                  <TableCell>
                    {formatCurrency(promo.totalDiscountApplied || 0)}
                  </TableCell>
                  <TableCell>{promo.roi.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
