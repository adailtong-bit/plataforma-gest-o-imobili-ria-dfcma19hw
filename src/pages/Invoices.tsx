import { useContext, useState, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  MoreHorizontal,
  CheckCircle2,
  FileText,
  PlusCircle,
  User as UserIcon,
  Calculator,
  Network,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { format, isValid } from 'date-fns'
import type { Invoice, InvoiceItem } from '@/lib/types'
import { InvoiceViewer } from '@/components/financial/InvoiceViewer'
import useAuthStore from '@/stores/useAuthStore'
import useBillingStore from '@/stores/useBillingStore'
import useShortTermStore from '@/stores/useShortTermStore'
import useTaskStore from '@/stores/useTaskStore'
import { supabase } from '@/lib/supabase/client'

const emptyForm = (): Partial<Invoice> => ({
  description: '',
  amount: 0,
  status: 'pending',
  date: new Date().toISOString().split('T')[0],
  dueDate: '',
  fromName: '',
  fromEmail: '',
  fromPhone: '',
  fromAddress: '',
  toName: '',
  toEmail: '',
  toPhone: '',
  toAddress: '',
  notes: '',
  items: [],
})

export default function Invoices() {
  const context = useContext(AppContext)
  const financials = context?.financials || { invoices: [] }
  const addInvoice = context?.addInvoice || (() => {})
  const updateInvoice = context?.updateInvoice || (() => {})
  const deleteInvoice = context?.deleteInvoice || (() => {})
  const formatAppCurrency =
    context?.formatAppCurrency || ((v: number) => `$${v}`)

  const { toast } = useToast()
  const { currentUser, allUsers } = useAuthStore()
  const { agreements } = useBillingStore()
  const { bookings } = useShortTermStore()
  const { tasks } = useTaskStore()

  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Invoice | null>(null)
  const [form, setForm] = useState<Partial<Invoice>>(emptyForm())

  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Auto Generate State with Hierarchy
  const [isAutoOpen, setIsAutoOpen] = useState(false)
  const [autoForm, setAutoForm] = useState({
    payeeId: '',
    payerId: '',
    startDate: '',
    endDate: '',
  })
  const [previewItems, setPreviewItems] = useState<InvoiceItem[]>([])
  const [previewTotal, setPreviewTotal] = useState(0)

  // Fetch properties lightly for mapping
  const [propertiesMap, setPropertiesMap] = useState<
    { id: string; pmId: string | null; ownerId: string | null }[]
  >([])
  useEffect(() => {
    supabase
      .from('properties')
      .select('id, pm_id, owner_id')
      .then(({ data }) => {
        if (data) {
          setPropertiesMap(
            data.map((p) => ({
              id: p.id,
              pmId: p.pm_id,
              ownerId: p.owner_id,
            })),
          )
        }
      })
  }, [])

  const invoiceList: Invoice[] = Array.isArray(financials)
    ? (financials as Invoice[])
    : financials?.invoices || []

  const filteredInvoices = invoiceList.filter(
    (inv: Invoice) =>
      (inv?.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv?.toName || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv?.id || '').toLowerCase().includes(search.toLowerCase()),
  )

  const handleAddItem = () => {
    setForm({
      ...form,
      items: [
        ...(form.items || []),
        { description: '', quantity: 1, unitPrice: 0, total: 0 },
      ],
    })
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...(form.items || [])]
    newItems.splice(index, 1)
    calculateTotal(newItems)
  }

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    const newItems = [...(form.items || [])]
    newItems[index] = { ...newItems[index], [field]: value }
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total =
        Number(newItems[index].quantity || 0) *
        Number(newItems[index].unitPrice || 0)
    }
    calculateTotal(newItems)
  }

  const calculateTotal = (items: InvoiceItem[]) => {
    const total = items.reduce((acc, item) => acc + (item.total || 0), 0)
    setForm((prev) => ({ ...prev, items, amount: total }))
  }

  const handleSave = () => {
    if (!form.toName) {
      toast({
        title: 'Attention',
        description: 'Billed To is required',
        variant: 'destructive',
      })
      return
    }

    if (editingRecord && editingRecord.status === 'paid') {
      toast({
        title: 'Action Not Allowed',
        description:
          'Paid invoices are locked for auditing and financial integrity.',
        variant: 'destructive',
      })
      return
    }

    if (editingRecord) {
      updateInvoice({ ...editingRecord, ...form } as Invoice)
      toast({ title: 'Success', description: 'Invoice updated successfully' })
    } else {
      addInvoice({ ...form, type: 'generic' } as Invoice)
      toast({ title: 'Success', description: 'Invoice created successfully' })
    }
    setIsAddOpen(false)
    setEditingRecord(null)
    setForm(emptyForm())
  }

  const handleDelete = () => {
    if (deleteId) {
      const inv = invoiceList.find((i: any) => i.id === deleteId)
      if (inv?.status === 'paid') {
        toast({
          title: 'Action Not Allowed',
          description:
            'Paid invoices are locked for auditing and financial integrity.',
          variant: 'destructive',
        })
        setDeleteId(null)
        return
      }
      deleteInvoice(deleteId)
      toast({ title: 'Success', description: 'Invoice deleted successfully' })
      setDeleteId(null)
    }
  }

  const handleMarkAsPaid = (inv: Invoice) => {
    updateInvoice({
      ...inv,
      status: 'paid',
      notes: `${inv.notes || ''}\n\n[Traceability Engine]: Marked as PAID and verified by ${currentUser?.name} on ${new Date().toISOString()}`,
    } as Invoice)
    toast({ title: 'Success', description: `Invoice marked as paid.` })
  }

  const formatDateSafe = (dateString?: string) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    return isValid(d) ? format(d, 'MM/dd/yyyy') : '-'
  }

  const openNewInvoice = () => {
    setEditingRecord(null)
    setForm({
      ...emptyForm(),
      fromName: currentUser?.companyName || currentUser?.name || '',
      fromEmail: currentUser?.email || '',
      fromPhone: currentUser?.phone || '',
      fromAddress: currentUser?.address || '',
    })
    setIsAddOpen(true)
  }

  const handlePreviewCalculation = () => {
    if (
      !autoForm.payeeId ||
      !autoForm.payerId ||
      !autoForm.startDate ||
      !autoForm.endDate
    ) {
      toast({
        title: 'Error',
        description: 'Please select Payee, Payer and Period',
        variant: 'destructive',
      })
      return
    }

    if (autoForm.payeeId === autoForm.payerId) {
      toast({
        title: 'Invalid Selection',
        description: 'Payee and Payer cannot be the same entity.',
        variant: 'destructive',
      })
      return
    }

    const payee = allUsers.find((u) => u.id === autoForm.payeeId)
    const payer = allUsers.find((u) => u.id === autoForm.payerId)
    if (!payee || !payer) return

    const applicableAgreements = agreements.filter((a) => {
      const matchSource =
        a.sourceId === payee.id ||
        a.sourceRole === payee.role ||
        (a.sourceRole === 'master' && payee.role === 'master')
      const matchTarget =
        a.targetId === payer.id ||
        a.targetRole === payer.role ||
        a.targetId === 'global'
      return matchSource && matchTarget
    })

    const pStart = new Date(autoForm.startDate).getTime()
    const pEnd = new Date(autoForm.endDate).getTime()

    const periodBookings = bookings.filter((b) => {
      const bStart = new Date(b.checkIn).getTime()
      return bStart >= pStart && bStart <= pEnd
    })

    const periodTasks = tasks.filter((t) => {
      if (!t.date) return false
      const tTime = new Date(t.date).getTime()
      return tTime >= pStart && tTime <= pEnd
    })

    const newItems: InvoiceItem[] = []

    applicableAgreements.forEach((agreement) => {
      if (agreement.type === 'software_fee_per_house') {
        const pmProps = propertiesMap.filter((p) => p.pmId === payer.id)
        if (pmProps.length > 0) {
          newItems.push({
            description: `${agreement.name} (${pmProps.length} properties managed)`,
            quantity: pmProps.length,
            unitPrice: agreement.value,
            total: pmProps.length * agreement.value,
          })
        }
      } else if (agreement.type === 'fixed_admin_fee') {
        newItems.push({
          description: `${agreement.name} - Period ${autoForm.startDate} to ${autoForm.endDate}`,
          quantity: 1,
          unitPrice: agreement.value,
          total: agreement.value,
        })
      } else if (agreement.type === 'booking_percentage') {
        const ownerProps = propertiesMap
          .filter((p) => p.ownerId === payer.id)
          .map((p) => p.id)
        const ownerBookings = periodBookings.filter((b) =>
          ownerProps.includes(b.propertyId),
        )
        ownerBookings.forEach((b) => {
          const amount = (b.totalAmount || 0) * (agreement.value / 100)
          if (amount > 0) {
            newItems.push({
              description: `${agreement.name} - Booking ${b.id.substring(0, 6)}`,
              quantity: 1,
              unitPrice: amount,
              total: amount,
            })
          }
        })
      } else if (agreement.type.startsWith('markup_')) {
        const ownerProps = propertiesMap
          .filter((p) => p.ownerId === payer.id)
          .map((p) => p.id)
        const ownerTasks = periodTasks.filter((t) =>
          ownerProps.includes(t.propertyId),
        )
        ownerTasks.forEach((t) => {
          if (
            (agreement.type === 'markup_cleaning' && t.type === 'cleaning') ||
            (agreement.type === 'markup_maintenance' &&
              t.type === 'maintenance') ||
            (agreement.type === 'markup_purchases' && t.type === 'purchase')
          ) {
            const cost = (t.price || 0) + (t.laborCost || 0)
            const amount =
              agreement.valueType === 'percentage'
                ? cost * (agreement.value / 100)
                : agreement.value
            if (amount > 0) {
              newItems.push({
                description: `${agreement.name} - Task: ${t.title}`,
                quantity: 1,
                unitPrice: amount,
                total: amount,
              })
            }
          }
        })
      } else if (agreement.type.startsWith('partner_')) {
        const partnerTasks = periodTasks.filter(
          (t) => t.assigneeId === payee.id || t.assignee === payee.name,
        )
        partnerTasks.forEach((t) => {
          if (
            (agreement.type === 'partner_cleaning_fee' &&
              t.type === 'cleaning') ||
            (agreement.type === 'partner_maintenance_fee' &&
              t.type === 'maintenance') ||
            (agreement.type === 'partner_parts_fee' && t.type === 'purchase')
          ) {
            const amount = t.laborCost || agreement.value
            if (amount > 0) {
              newItems.push({
                description: `${agreement.name} - Partner Service: ${t.title}`,
                quantity: 1,
                unitPrice: amount,
                total: amount,
              })
            }
          }
        })
      } else if (agreement.type.startsWith('team_')) {
        const teamTasks = periodTasks.filter(
          (t) => t.partnerEmployeeId === payee.id,
        )
        teamTasks.forEach((t) => {
          const amount = t.teamMemberPayout || agreement.value
          if (amount > 0) {
            newItems.push({
              description: `${agreement.name} - Team Payout: ${t.title}`,
              quantity: 1,
              unitPrice: amount,
              total: amount,
            })
          }
        })
      }
    })

    setPreviewItems(newItems)
    setPreviewTotal(newItems.reduce((acc, item) => acc + (item.total || 0), 0))
  }

  const handleCreateFromAuto = () => {
    if (previewItems.length === 0) {
      toast({
        title: 'Error',
        description: 'No items to invoice',
        variant: 'destructive',
      })
      return
    }

    const payee = allUsers.find((u) => u.id === autoForm.payeeId)
    const payer = allUsers.find((u) => u.id === autoForm.payerId)

    const newInvoice: Partial<Invoice> = {
      ...emptyForm(),
      fromName: payee?.companyName || payee?.name || '',
      fromEmail: payee?.email || '',
      fromPhone: payee?.phone || '',
      fromAddress: payee?.address || '',
      fromId: payee?.id,
      toName: payer?.companyName || payer?.name || '',
      toEmail: payer?.email || '',
      toPhone: payer?.phone || '',
      toAddress: payer?.address || '',
      toId: payer?.id,
      description: `Automated Billing - ${autoForm.startDate} to ${autoForm.endDate}`,
      date: new Date().toISOString().split('T')[0],
      items: previewItems,
      amount: previewTotal,
      status: 'pending',
      notes: `Traceability Engine:\nGenerated by ${currentUser?.name} via N-Tier Billing Rule Matrix.\nPeriod: ${autoForm.startDate} to ${autoForm.endDate}.`,
    }

    addInvoice({ ...newInvoice, type: 'automated' } as Invoice)
    toast({
      title: 'Success',
      description: 'Automated invoice created successfully.',
    })
    setIsAutoOpen(false)
    setPreviewItems([])
    setAutoForm({ payeeId: '', payerId: '', startDate: '', endDate: '' })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Invoices
          </h1>
          <p className="text-muted-foreground">
            Manage service invoices and billing hierarchy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button
            onClick={() => setIsAutoOpen(true)}
            variant="outline"
            className="gap-2 border-trust-blue text-trust-blue hover:bg-blue-50"
          >
            <Network className="h-4 w-4" /> N-Tier Auto-Generate
          </Button>
          <Button
            onClick={openNewInvoice}
            className="bg-trust-blue gap-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Invoice
          </Button>

          {/* N-Tier Auto Generate Dialog */}
          <Dialog
            open={isAutoOpen}
            onOpenChange={(v) => {
              setIsAutoOpen(v)
              if (!v) {
                setPreviewItems([])
                setAutoForm({
                  payeeId: '',
                  payerId: '',
                  startDate: '',
                  endDate: '',
                })
              }
            }}
          >
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Generate N-Tier Automated Invoice
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Calculate charges traversing the financial hierarchy rules.
                </p>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label className="text-blue-700 font-bold">
                      Billed By (Payee)
                    </Label>
                    <Select
                      value={autoForm.payeeId}
                      onValueChange={(val) =>
                        setAutoForm((prev) => ({
                          ...prev,
                          payeeId: val,
                          payerId: prev.payerId === val ? '' : prev.payerId,
                        }))
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select who is charging..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allUsers.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-700 font-bold">
                      Billed To (Payer)
                    </Label>
                    <Select
                      value={autoForm.payerId}
                      onValueChange={(val) =>
                        setAutoForm({ ...autoForm, payerId: val })
                      }
                      disabled={!autoForm.payeeId}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue
                          placeholder={
                            !autoForm.payeeId
                              ? 'Select Payee first...'
                              : 'Select who is paying...'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {allUsers
                          .filter((u) => u.id !== autoForm.payeeId)
                          .map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name} ({u.role})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Period Start Date</Label>
                    <Input
                      type="date"
                      className="bg-white"
                      value={autoForm.startDate}
                      onChange={(e) =>
                        setAutoForm({ ...autoForm, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Period End Date</Label>
                    <Input
                      type="date"
                      className="bg-white"
                      value={autoForm.endDate}
                      onChange={(e) =>
                        setAutoForm({ ...autoForm, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                {autoForm.payeeId &&
                  autoForm.payerId &&
                  autoForm.payeeId === autoForm.payerId && (
                    <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-200">
                      Error: Payee and Payer cannot be the same entity. Please
                      select different entities.
                    </div>
                  )}

                <div className="flex justify-end">
                  <Button
                    onClick={handlePreviewCalculation}
                    disabled={
                      autoForm.payeeId !== '' &&
                      autoForm.payerId !== '' &&
                      autoForm.payeeId === autoForm.payerId
                    }
                    className="gap-2 bg-slate-800 text-white hover:bg-slate-700"
                  >
                    <Calculator className="h-4 w-4" /> Calculate Rule Matrix
                  </Button>
                </div>

                {previewItems.length > 0 && (
                  <div className="space-y-4 border rounded-lg p-4 animate-in fade-in duration-300">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">
                      Line Items Extracted (Auditable)
                    </h3>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead>Rule & Data Source Map</TableHead>
                            <TableHead className="w-24">Qty</TableHead>
                            <TableHead className="w-32 text-right">
                              Total
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewItems.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="p-2 font-medium text-slate-700 text-xs">
                                {item.description}
                              </TableCell>
                              <TableCell className="p-2 text-center">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="p-2 text-right font-bold text-slate-800">
                                {formatAppCurrency(item.total || 0)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-end pt-2">
                      <div className="flex justify-between items-center w-64 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <span className="font-semibold text-slate-700">
                          Invoice Total
                        </span>
                        <span className="text-xl font-bold text-trust-blue">
                          {formatAppCurrency(previewTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {previewItems.length === 0 &&
                  autoForm.payeeId &&
                  autoForm.payerId &&
                  autoForm.startDate &&
                  autoForm.endDate && (
                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                      Click "Calculate Rule Matrix" to map dependencies and
                      generate line items.
                    </div>
                  )}
              </div>

              <DialogFooter className="sticky bottom-0 bg-white pt-4 pb-2 border-t mt-4">
                <Button variant="outline" onClick={() => setIsAutoOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateFromAuto}
                  disabled={previewItems.length === 0}
                  className="bg-trust-blue text-white hover:bg-blue-700"
                >
                  Consolidate & Issue Invoice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Manual Invoice Dialog */}
          <Dialog
            open={isAddOpen}
            onOpenChange={(v) => {
              setIsAddOpen(v)
              if (!v) {
                setEditingRecord(null)
                setForm(emptyForm())
              }
            }}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editingRecord
                    ? 'Edit Professional Invoice'
                    : 'New Professional Invoice'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-8 py-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label>Reference / Title</Label>
                    <Input
                      value={form.description || ''}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      placeholder="E.g. Bi-weekly Invoice"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issue Date</Label>
                    <Input
                      type="date"
                      value={form.date?.split('T')[0] || ''}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={form.dueDate?.split('T')[0] || ''}
                      onChange={(e) =>
                        setForm({ ...form, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Sender and Billed To */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 border rounded-lg p-4">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
                      <FileText className="h-4 w-4 text-trust-blue" /> Sender
                      Details (You)
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label>Name / Company</Label>
                        <Input
                          value={form.fromName || ''}
                          onChange={(e) =>
                            setForm({ ...form, fromName: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Email</Label>
                        <Input
                          value={form.fromEmail || ''}
                          onChange={(e) =>
                            setForm({ ...form, fromEmail: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Phone</Label>
                        <Input
                          value={form.fromPhone || ''}
                          onChange={(e) =>
                            setForm({ ...form, fromPhone: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Address</Label>
                        <Input
                          value={form.fromAddress || ''}
                          onChange={(e) =>
                            setForm({ ...form, fromAddress: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border rounded-lg p-4">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
                      <UserIcon className="h-4 w-4 text-trust-blue" /> Billed To
                      (Client)
                    </h3>
                    <div className="space-y-3 mt-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Import from hierarchy
                        </Label>
                        <Select
                          onValueChange={(val) => {
                            const user = allUsers.find((u) => u.id === val)
                            if (user) {
                              setForm((prev) => ({
                                ...prev,
                                toName: user.companyName || user.name || '',
                                toEmail: user.email || '',
                                toPhone: user.phone || '',
                                toAddress: user.address || '',
                                toId: user.id,
                              }))
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 bg-slate-50">
                            <SelectValue placeholder="Select target payer..." />
                          </SelectTrigger>
                          <SelectContent>
                            {allUsers.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.name} ({u.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Name / Company *</Label>
                        <Input
                          value={form.toName || ''}
                          onChange={(e) =>
                            setForm({ ...form, toName: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Email</Label>
                        <Input
                          value={form.toEmail || ''}
                          onChange={(e) =>
                            setForm({ ...form, toEmail: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Phone</Label>
                        <Input
                          value={form.toPhone || ''}
                          onChange={(e) =>
                            setForm({ ...form, toPhone: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Address</Label>
                        <Input
                          value={form.toAddress || ''}
                          onChange={(e) =>
                            setForm({ ...form, toAddress: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-semibold text-slate-800">Line Items</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddItem}
                      className="gap-2"
                    >
                      <PlusCircle className="h-4 w-4" /> Add Item
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {form.items && form.items.length > 0 ? (
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-50">
                            <TableRow>
                              <TableHead>Description</TableHead>
                              <TableHead className="w-24">Qty</TableHead>
                              <TableHead className="w-32">Unit Price</TableHead>
                              <TableHead className="w-32 text-right">
                                Total
                              </TableHead>
                              <TableHead className="w-12"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {form.items.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="p-2">
                                  <Input
                                    value={item.description}
                                    onChange={(e) =>
                                      handleItemChange(
                                        idx,
                                        'description',
                                        e.target.value,
                                      )
                                    }
                                    className="border-0 shadow-none focus-visible:ring-1 bg-transparent"
                                  />
                                </TableCell>
                                <TableCell className="p-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.quantity || ''}
                                    onChange={(e) =>
                                      handleItemChange(
                                        idx,
                                        'quantity',
                                        Number(e.target.value),
                                      )
                                    }
                                    className="border-0 shadow-none focus-visible:ring-1 bg-transparent text-center px-1"
                                  />
                                </TableCell>
                                <TableCell className="p-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unitPrice || ''}
                                    onChange={(e) =>
                                      handleItemChange(
                                        idx,
                                        'unitPrice',
                                        Number(e.target.value),
                                      )
                                    }
                                    className="border-0 shadow-none focus-visible:ring-1 bg-transparent text-right px-1"
                                  />
                                </TableCell>
                                <TableCell className="p-2 text-right font-medium text-slate-700 align-middle">
                                  {formatAppCurrency(item.total || 0)}
                                </TableCell>
                                <TableCell className="p-2 text-center align-middle">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveItem(idx)}
                                    className="h-8 w-8 text-slate-400 hover:text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500 border border-dashed rounded-lg bg-slate-50">
                        No items added. Add services or fees to be billed.
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <div className="w-64 bg-slate-50 p-4 rounded-lg flex justify-between items-center border border-slate-200 shadow-sm">
                      <span className="font-semibold text-slate-600">
                        Invoice Total
                      </span>
                      <span className="text-xl font-bold text-trust-blue">
                        {formatAppCurrency(form.amount || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes / Terms</Label>
                  <Textarea
                    value={form.notes || ''}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="sticky bottom-0 bg-white pt-4 pb-2 border-t mt-4">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-trust-blue text-white hover:bg-blue-700 min-w-32"
                >
                  Save Invoice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-24">Invoice No.</TableHead>
                <TableHead>Billed To</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((inv: Invoice) => (
                <TableRow key={inv.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-xs font-medium text-slate-600">
                    {inv.id ? inv.id.split('-')[0].substring(0, 8) : '-'}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {inv.toName || (
                      <span className="text-slate-400 italic">
                        Not provided
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className="text-slate-600 max-w-[200px] truncate"
                    title={inv.description}
                  >
                    {inv.description || '-'}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatDateSafe(inv.date)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`uppercase text-[10px] ${inv.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-700">
                    {formatAppCurrency(inv.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => {
                            setViewingInvoice(inv)
                            setViewerOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2 text-blue-600" /> View
                        </DropdownMenuItem>
                        {inv.status !== 'paid' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleMarkAsPaid(inv)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />{' '}
                              Mark as Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingRecord(inv)
                                setForm({ ...emptyForm(), ...inv })
                                setIsAddOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2 text-slate-600" />{' '}
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => setDeleteId(inv.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <FileText className="h-10 w-10 text-slate-300" />
                      <p>No invoices found based on your search.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openNewInvoice}
                      >
                        Create first invoice
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InvoiceViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        invoice={viewingInvoice}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
