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

export default function GuestServices() {
  const { guestServices, formatAppCurrency } = useContext(AppContext)!
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('sidebar.guest_services')}
        </h1>
        <p className="text-muted-foreground">
          Manage services offered to guests.
        </p>
      </div>
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guestServices.map((service) => (
                <TableRow key={service.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {service.name}
                  </TableCell>
                  <TableCell className="capitalize">
                    {service.category}
                  </TableCell>
                  <TableCell>
                    <Badge variant={service.active ? 'default' : 'secondary'}>
                      {service.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatAppCurrency(service.price)}
                  </TableCell>
                </TableRow>
              ))}
              {guestServices.length === 0 && (
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
