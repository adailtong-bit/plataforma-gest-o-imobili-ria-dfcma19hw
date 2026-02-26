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
import { DataMask } from '@/components/DataMask'

export default function ShortTerm() {
  const { bookings, formatAppCurrency } = useContext(AppContext)!
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('common.short_term')}
        </h1>
        <p className="text-muted-foreground">Manage your vacation rentals.</p>
      </div>
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Guest Name</TableHead>
                <TableHead>{t('common.property')}</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{b.guestName}</DataMask>
                  </TableCell>
                  <TableCell>{b.propertyName}</TableCell>
                  <TableCell>
                    {format(new Date(b.checkIn), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(b.checkOut), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px]">
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatAppCurrency(b.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
