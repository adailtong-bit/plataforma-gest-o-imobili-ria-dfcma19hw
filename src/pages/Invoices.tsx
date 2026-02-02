import { useState, useContext } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  Search,
  Send,
  FileText,
  DollarSign,
  Plus,
  ArrowRight,
  Eye,
} from 'lucide-react'
import useFinancialStore from '@/stores/useFinancialStore'
import useAuthStore from '@/stores/useAuthStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { AppContext } from '@/stores/AppContext'
import { useToast } from '@/hooks/use-toast'
import { TaskInvoiceDialog } from '@/components/financial/TaskInvoiceDialog'
import { InvoiceViewer } from '@/components/financial/InvoiceViewer'
import { Invoice } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DataMask } from '@/components/DataMask'

export default function Invoices() {
  const { financials } = useFinancialStore()
  const { allUsers } = useAuthStore()
  const { t, language } = useLanguageStore()
  const context = useContext(AppContext)
  const selectedPropertyId = context?.selectedPropertyId || 'all'
  const { toast } = useToast()
  const [filter, setFilter] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Invoice Viewer State
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const invoices = financials.invoices

  const filteredInvoices = invoices
    .filter((inv) =>
      selectedPropertyId === 'all'
        ? true
        : inv.propertyId === selectedPropertyId,
    )
    .filter(
      (inv) =>
        inv.id.toLowerCase().includes(filter.toLowerCase()) ||
        inv.description.toLowerCase().includes(filter.toLowerCase()),
    )

  const resolveUserName = (id?: string) => {
    if (!id) return 'Unknown'
    const user = allUsers.find((u) => u.id === id)
    return user ? user.name : 'Unknown User'
  }

  const handleSendToPayer = (invoiceId: string, payerName: string) => {
    // Logic to send email/notification would go here
    toast({
      title: t('invoices.sent_success'),
      description: `Invoice ${invoiceId} sent to ${payerName}.`,
    })
  }

  const handleViewInvoice = (inv: Invoice) => {
    setSelectedInvoice(inv)
    setViewInvoiceOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300 font-bold hover:bg-green-100">
            {t('invoices.status_paid')}
          </Badge>
        )
      case 'pending':
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-300 font-bold hover:bg-yellow-100"
          >
            {t('invoices.status_pending')}
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-bold hover:bg-blue-100">
            {t('invoices.status_approved')}
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="border-slate-400 text-slate-800 font-medium"
          >
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {t('invoices.title')}
          </h1>
          <p className="text-slate-700 font-medium">{t('invoices.subtitle')}</p>
        </div>
        <Button
          className="bg-trust-blue gap-2"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" /> {t('invoices.create_new')}
        </Button>
      </div>

      <TaskInvoiceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <InvoiceViewer
        open={viewInvoiceOpen}
        onOpenChange={setViewInvoiceOpen}
        invoice={selectedInvoice}
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-slate-950">
              {t('invoices.title')}
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder={t('common.search')}
                className="pl-8 text-black"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-slate-950">
                  {t('invoices.invoice_id')}
                </TableHead>
                <TableHead className="font-bold text-slate-950">
                  {t('common.description')}
                </TableHead>
                <TableHead className="font-bold text-slate-950">
                  {t('common.date')}
                </TableHead>
                <TableHead className="font-bold text-slate-950">Flow</TableHead>
                <TableHead className="font-bold text-slate-950">
                  {t('invoices.amount')}
                </TableHead>
                <TableHead className="font-bold text-slate-950">
                  {t('common.status')}
                </TableHead>
                <TableHead className="text-right font-bold text-slate-950">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-slate-600 font-medium"
                  >
                    {t('invoices.no_invoices')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((inv) => {
                  const fromName = resolveUserName(inv.fromId)
                  const toName = resolveUserName(inv.toId)

                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-bold text-slate-950 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-800" />
                        <DataMask>{inv.id}</DataMask>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-slate-900 font-medium">
                        <DataMask>{inv.description}</DataMask>
                      </TableCell>
                      <TableCell className="text-slate-900">
                        <DataMask>{formatDate(inv.date, language)}</DataMask>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs text-slate-800 font-medium">
                          <span className="font-bold text-slate-950">
                            <DataMask>{fromName}</DataMask>
                          </span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="font-bold text-slate-950">
                            <DataMask>{toName}</DataMask>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-bold text-slate-950">
                          <DollarSign className="h-3 w-3 text-slate-700" />
                          <DataMask>
                            {formatCurrency(inv.amount, language)}
                          </DataMask>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(inv.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-slate-700"
                            onClick={() => handleViewInvoice(inv)}
                            title={t('invoices.view')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-2 text-blue-700 border-blue-200 hover:bg-blue-50 font-bold"
                            onClick={() => handleSendToPayer(inv.id, toName)}
                          >
                            <Send className="h-3 w-3" />
                            {t('invoices.send_to_payer')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
