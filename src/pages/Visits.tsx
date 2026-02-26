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

export default function Visits() {
  const { visits } = useContext(AppContext)!
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('common.visits')}
        </h1>
        <p className="text-muted-foreground">
          Manage scheduled property visits.
        </p>
      </div>
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>{t('common.property')}</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">
                  {t('common.status')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.map((visit) => (
                <TableRow key={visit.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{visit.clientName}</DataMask>
                  </TableCell>
                  <TableCell>{visit.propertyName}</TableCell>
                  <TableCell>
                    {format(new Date(visit.date), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="capitalize">{visit.reason}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">{visit.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {visits.length === 0 && (
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
