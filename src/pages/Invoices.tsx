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

export default function Invoices() {
  const { financials, formatAppCurrency } = useContext(AppContext)!
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('common.invoices')}
        </h1>
        <p className="text-muted-foreground">Manage generated invoices.</p>
      </div>
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financials.invoices.slice(0, 50).map((inv) => (
                <TableRow key={inv.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {inv.description}
                  </TableCell>
                  <TableCell>
                    {format(new Date(inv.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px]">
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatAppCurrency(inv.amount)}
                  </TableCell>
                </TableRow>
              ))}
              {financials.invoices.length === 0 && (
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
