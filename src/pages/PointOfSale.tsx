import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import useLanguageStore from '@/stores/useLanguageStore'
import { format } from 'date-fns'

export default function PointOfSale() {
  const { posTransactions, formatAppCurrency } = useContext(AppContext)!
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('sidebar.pos')}
        </h1>
        <p className="text-muted-foreground">Manage POS transactions.</p>
      </div>
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posTransactions.slice(0, 50).map((trx) => (
                <TableRow key={trx.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {trx.id}
                  </TableCell>
                  <TableCell>
                    {trx.items.map((i) => i.name).join(', ')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(trx.timestamp), 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px]">
                      {trx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatAppCurrency(trx.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
              {posTransactions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {t('common.empty')}
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
