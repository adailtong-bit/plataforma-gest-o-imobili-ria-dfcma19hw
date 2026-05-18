import { useContext, useState } from 'react'
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
import { Invoice, InvoiceItem } from '@/lib/types'
import { InvoiceViewer } from '@/components/financial/InvoiceViewer'
import useAuthStore from '@/stores/useAuthStore'

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
  const ledgerEntries = context?.ledgerEntries || []
  const addInvoice = context?.addInvoice || (() => {})
  const updateInvoice = context?.updateInvoice || (() => {})
  const deleteInvoice = context?.deleteInvoice || (() => {})
  const updateLedgerEntry = context?.updateLedgerEntry || (() => {})
  const formatAppCurrency =
    context?.formatAppCurrency || ((v: number) => `$${v}`)

  const { toast } = useToast()
  const { currentUser, allUsers } = useAuthStore()

  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Invoice | null>(null)
  const [form, setForm] = useState<Partial<Invoice>>(emptyForm())

  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const invoiceList = Array.isArray(financials)
    ? financials
    : financials?.invoices || []

  const filteredInvoices = (invoiceList || []).filter(
    (inv: any) =>
      (inv?.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv?.toName || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv?.id || '').toLowerCase().includes(search.toLowerCase()),
  )

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
    setForm({ ...form, items: [...(form.items || []), newItem] })
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...(form.items || [])]
    newItems.splice(index, 1)
    calculateTotal(newItems)
  }

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: any,
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
        description: 'Billed To (Name) is required',
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
      deleteInvoice(deleteId)
      toast({ title: 'Success', description: 'Invoice deleted successfully' })
      setDeleteId(null)
    }
  }

  const handleMarkAsPaid = (inv: Invoice) => {
    updateInvoice({ ...inv, status: 'paid' } as Invoice)
    let updatedCount = 0
    ledgerEntries.forEach((entry: any) => {
      if (entry.referenceId === inv.id && entry.status === 'pending') {
        updateLedgerEntry({
          ...entry,
          status: 'cleared',
          paymentDate: new Date().toISOString(),
        })
        updatedCount++
      }
    })
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

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Invoices
          </h1>
          <p className="text-muted-foreground">
            Manage service invoices, fees, and maintenance with complete
            details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search invoices (Name, ID)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button
            onClick={openNewInvoice}
            className="bg-trust-blue gap-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Invoice
          </Button>

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
                      placeholder="E.g. Bi-weekly Invoice - May"
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
                          placeholder="Your Company LLC"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Email</Label>
                        <Input
                          value={form.fromEmail || ''}
                          onChange={(e) =>
                            setForm({ ...form, fromEmail: e.target.value })
                          }
                          placeholder="contact@company.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Phone</Label>
                        <Input
                          value={form.fromPhone || ''}
                          onChange={(e) =>
                            setForm({ ...form, fromPhone: e.target.value })
                          }
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Address</Label>
                        <Input
                          value={form.fromAddress || ''}
                          onChange={(e) =>
                            setForm({ ...form, fromAddress: e.target.value })
                          }
                          placeholder="123 Main St, FL"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border rounded-lg p-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-trust-blue" /> Billed
                        To (Client)
                      </h3>
                    </div>

                    <div className="space-y-3 mt-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Import from contacts
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
                            <SelectValue placeholder="Select Owner or Tenant..." />
                          </SelectTrigger>
                          <SelectContent>
                            {allUsers
                              .filter(
                                (u) =>
                                  u.role === 'property_owner' ||
                                  u.role === 'tenant',
                              )
                              .map((u) => (
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
                          placeholder="Owner or Tenant Name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Email</Label>
                        <Input
                          value={form.toEmail || ''}
                          onChange={(e) =>
                            setForm({ ...form, toEmail: e.target.value })
                          }
                          placeholder="client@email.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Phone</Label>
                        <Input
                          value={form.toPhone || ''}
                          onChange={(e) =>
                            setForm({ ...form, toPhone: e.target.value })
                          }
                          placeholder="+1 (555) 111-1111"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Address</Label>
                        <Input
                          value={form.toAddress || ''}
                          onChange={(e) =>
                            setForm({ ...form, toAddress: e.target.value })
                          }
                          placeholder="Client address"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-semibold text-slate-800">
                      Billed Items
                    </h3>
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
                                    placeholder="E.g. Management Fee 20%"
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
                                  {formatAppCurrency(item.total)}
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
                        No items added. Add the services or fees to be billed.
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

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes / Terms</Label>
                  <Textarea
                    value={form.notes || ''}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Payment terms, bank details, or additional messages..."
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
              {filteredInvoices.map((inv: any) => (
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
                          Invoice
                        </DropdownMenuItem>
                        {inv.status !== 'paid' && (
                          <DropdownMenuItem
                            onClick={() => handleMarkAsPaid(inv)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />{' '}
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingRecord(inv)
                            setForm({ ...emptyForm(), ...inv })
                            setIsAddOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2 text-slate-600" />{' '}
                          Edit Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => setDeleteId(inv.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Invoice
                        </DropdownMenuItem>
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
              be undone and the detailed data will be lost.
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
