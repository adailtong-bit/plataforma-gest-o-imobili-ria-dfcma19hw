import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { format, differenceInDays } from 'date-fns'
import { DataMask } from '@/components/DataMask'
import { Search, Calendar, FileText } from 'lucide-react'

export default function Renewals() {
  const { tenants } = useTenantStore()
  const { properties } = usePropertyStore()
  const { t } = useLanguageStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const activeTenants = tenants.filter(
    (t) => t.status === 'active' && t.leaseEnd,
  )

  const filteredTenants = activeTenants
    .filter((tenant) => {
      const matchesSearch = tenant.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      let matchesStatus = true
      if (statusFilter !== 'all') {
        const daysLeft = differenceInDays(
          new Date(tenant.leaseEnd!),
          new Date(),
        )
        if (statusFilter === 'critical') matchesStatus = daysLeft <= 30
        if (statusFilter === 'warning')
          matchesStatus = daysLeft > 30 && daysLeft <= 60
        if (statusFilter === 'safe') matchesStatus = daysLeft > 60
      }

      return matchesSearch && matchesStatus
    })
    .sort(
      (a, b) =>
        new Date(a.leaseEnd!).getTime() - new Date(b.leaseEnd!).getTime(),
    )

  const getStatusBadge = (endDate: string) => {
    const daysLeft = differenceInDays(new Date(endDate), new Date())
    if (daysLeft <= 30)
      return (
        <Badge variant="destructive" className="font-bold">
          {daysLeft} days left
        </Badge>
      )
    if (daysLeft <= 60)
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300 font-bold">
          {daysLeft} days left
        </Badge>
      )
    return (
      <Badge
        variant="secondary"
        className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300 font-bold"
      >
        {daysLeft} days left
      </Badge>
    )
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-6rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('renewals.title')}
          </h1>
          <p className="text-muted-foreground">{t('renewals.subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('renewals.search_placeholder')}
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px] bg-white">
            <SelectValue placeholder={t('renewals.all_status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('renewals.all_status')}</SelectItem>
            <SelectItem value="critical">Critical (&le; 30 days)</SelectItem>
            <SelectItem value="warning">Warning (31 - 60 days)</SelectItem>
            <SelectItem value="safe">Safe (&gt; 60 days)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 bg-white shadow-sm border-slate-200">
        <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10">
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('common.property')}</TableHead>
                <TableHead>{t('renewals.current_value')}</TableHead>
                <TableHead>{t('common.end_date')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => {
                const property = properties.find(
                  (p) => p.id === tenant.propertyId,
                )
                return (
                  <TableRow key={tenant.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">
                      <DataMask>{tenant.name}</DataMask>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      <DataMask>{property?.name || tenant.propertyId}</DataMask>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${tenant.rentValue?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {format(new Date(tenant.leaseEnd!), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(tenant.leaseEnd!)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-slate-700 hover:text-slate-900"
                      >
                        <FileText className="h-4 w-4" />
                        {t('renewals.close_negotiation')}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredTenants.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    {t('renewals.no_results')}
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
