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

export default function PublicityAdmin() {
  const { advertisements, formatAppCurrency } = useContext(AppContext)!
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('sidebar.publicity_admin')}
        </h1>
        <p className="text-muted-foreground">
          Manage platform advertisements and sponsors.
        </p>
      </div>
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Ad Title</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead>Link</TableHead>
                <TableHead className="text-right">
                  {t('common.status')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advertisements.map((ad) => (
                <TableRow key={ad.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {ad.title}
                  </TableCell>
                  <TableCell className="capitalize">
                    {ad.placement?.replace('_', ' ') || 'Global'}
                  </TableCell>
                  <TableCell>
                    <a
                      href={ad.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline line-clamp-1 max-w-[200px]"
                    >
                      {ad.linkUrl}
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={ad.active ? 'default' : 'secondary'}>
                      {ad.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {advertisements.length === 0 && (
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
