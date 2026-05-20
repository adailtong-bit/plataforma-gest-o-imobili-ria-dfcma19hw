import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, FileText } from 'lucide-react'
import usePublicityStore from '@/stores/usePublicityStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import useLanguageStore from '@/stores/useLanguageStore'

export function CampaignInvoices() {
  const { invoices, campaigns, advertisers } = usePublicityStore()
  const [searchTerm, setSearchTerm] = useState('')
  const { language } = useLanguageStore()

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.to_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getCampaignTitle = (bookingId?: string) => {
    if (!bookingId) return 'N/A'
    const camp = campaigns.find((c) => c.id === bookingId)
    return camp?.title || 'Unknown Campaign'
  }

  const getAdvertiserName = (bookingId?: string) => {
    if (!bookingId) return 'N/A'
    const camp = campaigns.find((c) => c.id === bookingId)
    if (!camp?.advertiser_id) return 'Unknown Advertiser'
    const adv = advertisers.find((a) => a.id === camp.advertiser_id)
    return adv?.name || 'Unknown Advertiser'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>Campaign Invoices</CardTitle>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Advertiser</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-muted-foreground"
                >
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      {inv.invoice_number || 'Pending'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(inv.date || inv.created_at, language)}
                  </TableCell>
                  <TableCell>
                    {inv.to_name || getAdvertiserName(inv.booking_id)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-slate-900">
                        {getCampaignTitle(inv.booking_id)}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {inv.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {formatCurrency(inv.amount || 0, 'USD')}
                  </TableCell>
                  <TableCell>
                    {inv.status === 'paid' ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-transparent">
                        Paid
                      </Badge>
                    ) : inv.status === 'pending' ? (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200"
                      >
                        Pending
                      </Badge>
                    ) : inv.status === 'overdue' ? (
                      <Badge variant="destructive">Overdue</Badge>
                    ) : (
                      <Badge variant="secondary" className="capitalize">
                        {inv.status || 'Draft'}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
