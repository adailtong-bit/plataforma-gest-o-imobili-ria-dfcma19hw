import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink, ClipboardList } from 'lucide-react'
import { Property, LedgerEntry, Task } from '@/lib/types'
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
  getYear,
  isWithinInterval,
} from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import useTaskStore from '@/stores/useTaskStore'
import { TaskDetailsSheet } from '@/components/tasks/TaskDetailsSheet'

interface OwnerStatementProps {
  ownerId: string
  properties: Property[]
  ledgerEntries: LedgerEntry[]
}

export function OwnerStatement({
  ownerId,
  properties,
  ledgerEntries,
}: OwnerStatementProps) {
  const { toast } = useToast()
  const { tasks } = useTaskStore()
  const [period, setPeriod] = useState('current') // current, last, last3, semester, year, prevYear
  const [selectedPropertyId, setSelectedPropertyId] = useState('all')
  const [viewingTask, setViewingTask] = useState<Task | null>(null)

  const ownerProperties = properties.filter((p) => p.ownerId === ownerId)
  const ownerPropertyIds = ownerProperties.map((p) => p.id)

  const getDateRange = () => {
    const now = new Date()
    if (period === 'current') {
      return { start: startOfMonth(now), end: endOfMonth(now) }
    } else if (period === 'last') {
      const last = subMonths(now, 1)
      return { start: startOfMonth(last), end: endOfMonth(last) }
    } else if (period === 'last3') {
      return { start: startOfMonth(subMonths(now, 3)), end: endOfMonth(now) }
    } else if (period === 'semester') {
      return { start: startOfMonth(subMonths(now, 6)), end: endOfMonth(now) }
    } else if (period === 'year') {
      return { start: startOfYear(now), end: endOfYear(now) }
    } else if (period === 'prevYear') {
      const prev = subYears(now, 1)
      return { start: startOfYear(prev), end: endOfYear(prev) }
    } else {
      return { start: startOfMonth(now), end: endOfMonth(now) }
    }
  }

  const range = getDateRange()

  const filteredEntries = ledgerEntries.filter((entry) => {
    const propertyMatch =
      selectedPropertyId === 'all'
        ? ownerPropertyIds.includes(entry.propertyId)
        : entry.propertyId === selectedPropertyId

    if (!propertyMatch) return false

    const date = new Date(entry.date)
    return date >= range.start && date <= range.end
  })

  const totalIncome = filteredEntries
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalExpenses = filteredEntries
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0)

  const netIncome = totalIncome - totalExpenses

  const handleDownload = () => {
    toast({
      title: 'Download iniciado',
      description: 'O extrato (PDF) está sendo gerado e baixado.',
    })
  }

  const currentYear = getYear(new Date())

  return (
    <Card>
      <TaskDetailsSheet
        task={viewingTask}
        open={!!viewingTask}
        onOpenChange={(open) => !open && setViewingTask(null)}
      />

      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
        <CardTitle>Extrato do Proprietário</CardTitle>
        <div className="flex gap-2 flex-wrap justify-end">
          <Select
            value={selectedPropertyId}
            onValueChange={setSelectedPropertyId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Propriedade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Propriedades</SelectItem>
              {ownerProperties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Este Mês</SelectItem>
              <SelectItem value="last">Mês Passado</SelectItem>
              <SelectItem value="last3">Últimos 3 Meses</SelectItem>
              <SelectItem value="semester">Semestre</SelectItem>
              <SelectItem value="year">Ano Atual ({currentYear})</SelectItem>
              <SelectItem value="prevYear">
                Ano Anterior ({currentYear - 1})
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-sm text-muted-foreground">Receita Bruta</p>
            <p className="text-2xl font-bold text-green-700">
              ${totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-sm text-muted-foreground">Despesas</p>
            <p className="text-2xl font-bold text-red-700">
              ${totalExpenses.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-muted-foreground">Líquido (Net)</p>
            <p className="text-2xl font-bold text-blue-700">
              ${netIncome.toFixed(2)}
            </p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Propriedade</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Nenhum lançamento no período.
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => {
                const prop = properties.find((p) => p.id === entry.propertyId)
                const associatedTask = tasks.find(
                  (t) => t.id === entry.referenceId,
                )

                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {format(new Date(entry.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {prop ? (
                        <Link
                          to={`/properties/${prop.id}`}
                          className="flex items-center gap-2 hover:text-blue-600 hover:underline"
                        >
                          {prop.name}
                          <ExternalLink className="h-3 w-3 opacity-50" />
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{entry.description}</span>
                        {associatedTask && (
                          <div
                            className="flex items-center gap-1 text-xs text-blue-600 cursor-pointer hover:text-blue-800 mt-0.5 w-fit"
                            onClick={() => setViewingTask(associatedTask)}
                          >
                            <ClipboardList className="h-3 w-3" />
                            Ver Tarefa
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{entry.category}</span>
                    </TableCell>
                    <TableCell>
                      {entry.status === 'cleared' ? (
                        <Badge className="bg-green-600">Pago</Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                      {entry.paymentDate && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {format(new Date(entry.paymentDate), 'dd/MM')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        entry.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {entry.type === 'income' ? '+' : '-'}$
                      {entry.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

