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

export default function ServicePricing() {
  const { partners, formatAppCurrency } = useContext(AppContext)!
  const { t } = useLanguageStore()

  // Extract a flat list of all partner services for the catalog view
  const allServices = partners.flatMap(
    (p) => p.serviceRates?.map((sr) => ({ ...sr, partnerName: p.name })) || [],
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('common.service_pricing')}
        </h1>
        <p className="text-muted-foreground">
          Price catalog for partner services.
        </p>
      </div>
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Service Price</TableHead>
                <TableHead className="text-right">Product Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allServices.map((service, idx) => (
                <TableRow
                  key={`${service.id}-${idx}`}
                  className="hover:bg-slate-50"
                >
                  <TableCell className="font-medium text-slate-900">
                    {service.serviceName}
                  </TableCell>
                  <TableCell>{service.partnerName}</TableCell>
                  <TableCell>
                    {formatAppCurrency(service.servicePrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatAppCurrency(service.productPrice)}
                  </TableCell>
                </TableRow>
              ))}
              {allServices.length === 0 && (
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
