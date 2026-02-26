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
import { DataMask } from '@/components/DataMask'

export default function Owners() {
  const { owners } = useContext(AppContext)!
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('sidebar.owners')}
        </h1>
        <p className="text-muted-foreground">Manage your property owners.</p>
      </div>
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>{t('common.phone')}</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">
                  {t('common.status')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.map((owner) => (
                <TableRow key={owner.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{owner.name}</DataMask>
                  </TableCell>
                  <TableCell>
                    <DataMask>{owner.email}</DataMask>
                  </TableCell>
                  <TableCell>
                    <DataMask>{owner.phone}</DataMask>
                  </TableCell>
                  <TableCell>
                    {owner.city ? `${owner.city}, ${owner.state}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        owner.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {owner.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {owners.length === 0 && (
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
