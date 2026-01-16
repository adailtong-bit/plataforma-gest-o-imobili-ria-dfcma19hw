import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { financials } from '@/lib/mockData'
import { Badge } from '@/components/ui/badge'
import { Download, Filter, PlusCircle, Check, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'

export default function Financial() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Financeiro
          </h1>
          <p className="text-muted-foreground">
            Faturas, pagamentos e relatórios.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Exportar Relatório
          </Button>
          <Button className="bg-trust-blue">
            <PlusCircle className="h-4 w-4 mr-2" /> Nova Fatura
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Bruta (Ano)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$145,200.00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesas Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-$32,450.00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$112,750.00</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: { label: 'Receita', color: 'hsl(var(--primary))' },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financials.revenue}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
          <TabsTrigger value="utilities">Utilities</TabsTrigger>
          <TabsTrigger value="owners">Extrato Proprietários</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Faturas Recentes</CardTitle>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financials.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.id}
                      </TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>
                        {new Date(invoice.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === 'paid'
                              ? 'default'
                              : invoice.status === 'pending'
                                ? 'outline'
                                : 'secondary'
                          }
                          className={
                            invoice.status === 'pending'
                              ? 'border-orange-500 text-orange-600'
                              : invoice.status === 'paid'
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : ''
                          }
                        >
                          {invoice.status === 'pending'
                            ? 'Pendente'
                            : invoice.status === 'paid'
                              ? 'Pago'
                              : 'Aprovado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${invoice.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-green-600"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
