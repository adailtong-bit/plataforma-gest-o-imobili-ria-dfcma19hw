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

export default function Partners() {
  const { partners } = useContext(AppContext)!
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('common.partners')}
        </h1>
        <p className="text-muted-foreground">Manage your service partners.</p>
      </div>
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">
                  {t('common.status')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.slice(0, 50).map((partner) => (
                <TableRow key={partner.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {partner.name}
                  </TableCell>
                  <TableCell className="capitalize">{partner.type}</TableCell>
                  <TableCell>{partner.companyName}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        partner.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {partner.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {partners.length === 0 && (
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
