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
import { Download } from 'lucide-react'
import { Property, LedgerEntry } from '@/lib/types'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

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
  const [period, setPeriod] = useState('current') // current, last, last3

  const ownerPropertyIds = properties
    .filter((p) => p.ownerId === ownerId)
    .map((p) => p.id)

  const getDateRange = () => {
    const now = new Date()
    if (period === 'current') {
      return { start: startOfMonth(now), end: endOfMonth(now) }
    } else if (period === 'last') {
      const last = subMonths(now, 1)
      return { start: startOfMonth(last), end: endOfMonth(last) }
    } else {
      // last3
      return { start: startOfMonth(subMonths(now, 3)), end: endOfMonth(now) }
    }
  }

  const range = getDateRange()

  const filteredEntries = ledgerEntries.filter((entry) => {
    if (!ownerPropertyIds.includes(entry.propertyId)) return false
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
      description: 'O extrato está sendo gerado e baixado.',
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Extrato do Proprietário</CardTitle>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Este Mês</SelectItem>
              <SelectItem value="last">Mês Passado</SelectItem>
              <SelectItem value="last3">Últimos 3 Meses</SelectItem>
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
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhum lançamento no período.
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => {
                const prop = properties.find((p) => p.id === entry.propertyId)
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {format(new Date(entry.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {prop?.name || 'N/A'}
                    </TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>
                      <span className="capitalize">{entry.category}</span>
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
