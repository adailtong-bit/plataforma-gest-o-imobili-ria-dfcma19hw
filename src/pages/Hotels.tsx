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
import useLanguageStore from '@/stores/useLanguageStore'
import { DataMask } from '@/components/DataMask'

export default function Hotels() {
  const { hotels } = useContext(AppContext)!
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('hotels.title')}
        </h1>
        <p className="text-muted-foreground">Manage your hotel properties.</p>
      </div>
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('common.address')}</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>{t('common.phone')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotels.map((h) => (
                <TableRow key={h.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{h.name}</DataMask>
                  </TableCell>
                  <TableCell>
                    {h.city}, {h.state}
                  </TableCell>
                  <TableCell>{h.managerName}</TableCell>
                  <TableCell>
                    <DataMask>{h.managerPhone}</DataMask>
                  </TableCell>
                </TableRow>
              ))}
              {hotels.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
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
