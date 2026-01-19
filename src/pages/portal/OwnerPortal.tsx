import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useAuthStore from '@/stores/useAuthStore'
import useOwnerStore from '@/stores/useOwnerStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useFinancialStore from '@/stores/useFinancialStore'
import useTaskStore from '@/stores/useTaskStore'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { format } from 'date-fns'

export default function OwnerPortal() {
  const { currentUser } = useAuthStore()
  const { owners } = useOwnerStore()
  const { properties } = usePropertyStore()
  const { ledgerEntries } = useFinancialStore()
  const { tasks } = useTaskStore()
  const navigate = useNavigate()

  const ownerRecord = owners.find(
    (o) => o.id === currentUser.id || o.email === currentUser.email,
  )

  if (!ownerRecord) {
    return <div className="p-8">Registro de proprietário não encontrado.</div>
  }

  const myProperties = properties.filter((p) => p.ownerId === ownerRecord.id)
  const myPropertyIds = myProperties.map((p) => p.id)

  const myTasks = tasks.filter((t) => myPropertyIds.includes(t.propertyId))
  const myFinancials = ledgerEntries.filter((e) =>
    myPropertyIds.includes(e.propertyId),
  )

  // Calculate totals
  const totalIncome = myFinancials
    .filter((e) => e.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0)
  const totalExpense = myFinancials
    .filter((e) => e.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0)
  const netIncome = totalIncome - totalExpense

  // Chart Data
  const chartData = myFinancials.reduce((acc, entry) => {
    const month = new Date(entry.date).toLocaleString('default', {
      month: 'short',
    })
    const existing = acc.find((d) => d.month === month)
    if (existing) {
      if (entry.type === 'income') existing.income += entry.amount
      else existing.expense += entry.amount
    } else {
      acc.push({
        month,
        income: entry.type === 'income' ? entry.amount : 0,
        expense: entry.type === 'expense' ? entry.amount : 0,
      })
    }
    return acc
  }, [] as any[])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          Portal do Proprietário
        </h1>
        <p className="text-muted-foreground">Olá, {ownerRecord.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalExpense.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${netIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Desempenho Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                income: { label: 'Income', color: '#22c55e' },
                expense: { label: 'Expense', color: '#ef4444' },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minhas Propriedades</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myProperties.map((prop) => (
                  <TableRow key={prop.id}>
                    <TableCell className="font-medium">{prop.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{prop.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/properties/${prop.id}`)}
                      >
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log de Manutenção</CardTitle>
          <CardDescription>Últimas tarefas realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Propriedade</TableHead>
                <TableHead>Tarefa</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myTasks.slice(0, 5).map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    {format(new Date(task.date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{task.propertyName}</TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{task.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {myTasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Nenhuma manutenção recente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
